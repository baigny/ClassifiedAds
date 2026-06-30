// @ts-nocheck — Deno runtime: URL imports and Deno.* globals are valid here
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GooglePlace {
  id: string
  displayName?: { text: string }
  formattedAddress?: string
  nationalPhoneNumber?: string
  googleMapsUri?: string
}

// Fetch up to maxCount Google Places results for a text query.
async function searchGooglePlaces(query: string, maxCount: number) {
  const key = Deno.env.get('GOOGLE_PLACES_API_KEY')
  if (!key) return []

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.googleMapsUri',
      },
      body: JSON.stringify({ textQuery: query, maxResultCount: maxCount, languageCode: 'en' }),
    })
    const json = await res.json()
    return ((json.places ?? []) as GooglePlace[]).map(p => ({
      id:         p.id,
      title:      p.displayName?.text ?? '',
      body:       p.formattedAddress ?? '',
      price:      0,
      category:   'services',
      condition:  'New',
      status:     'active',
      images:     [],
      created_at: new Date().toISOString(),
      profiles:   { name: '', phone: p.nationalPhoneNumber ?? '', city: '' },
      _source:    'google' as const,
      _mapsUrl:   p.googleMapsUri ?? '',
    }))
  } catch {
    return []
  }
}

serve(async (req: any) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const intent  = (body.intent  || 'search').toLowerCase()
    // Normalise JID: WhatsApp multi-device can flip between @c.us and @lid for
    // the same user. Always store/look up with @c.us so sessions are consistent.
    const userJid = (body.userId  || '').trim().replace(/@lid$/, '@c.us')
    const chatId  = (body.chatId  || '').trim()
    const limit   = parseInt(body.limit ?? 3, 10)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // ── STOP ─────────────────────────────────────────────────────────────────
    if (intent === 'stop') {
      if (userJid) {
        await supabase
          .from('whatsapp_search_sessions')
          .delete()
          .eq('user_jid', userJid)
      }
      return new Response(
        JSON.stringify({ stopped: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── MORE ──────────────────────────────────────────────────────────────────
    if (intent === 'more') {
      if (!userJid) {
        return new Response(
          JSON.stringify({ error: 'no_session' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: session, error: sessionErr } = await supabase
        .from('whatsapp_search_sessions')
        .select('*')
        .eq('user_jid', userJid)
        .single()

      if (sessionErr || !session) {
        const detail = sessionErr?.message ?? 'row not found'
        return new Response(
          JSON.stringify({ error: 'no_session', detail }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // ── Session TTL: expire if no reply within 15 seconds ─────────────────
      const SESSION_TTL_MS = 15_000
      const sessionAge = Date.now() - new Date(session.updated_at).getTime()
      if (sessionAge > SESSION_TTL_MS) {
        await supabase
          .from('whatsapp_search_sessions')
          .delete()
          .eq('user_jid', userJid)
        return new Response(
          JSON.stringify({ error: 'session_expired' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const offset      = session.next_offset as number
      const allListings = (session.all_listings as any[]) || []
      const listings    = allListings.slice(offset, offset + limit)
      const newOffset   = offset + limit
      const hasMore     = newOffset < allListings.length

      // Advance the cursor for this user's session
      await supabase
        .from('whatsapp_search_sessions')
        .update({ next_offset: newOffset, updated_at: new Date().toISOString() })
        .eq('user_jid', userJid)

      return new Response(
        JSON.stringify({ listings, hasMore, query: session.query }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── SEARCH (new query) ────────────────────────────────────────────────────
    const query = (body.query ?? '').toString().trim()
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const STOP_WORDS = new Set([
      'in','near','at','the','a','an','for','of','to','and','or',
      'is','are','any','me','my','i','we','us','some','good','best',
      'nearby','please','help','want','need','find','get','looking',
    ])
    const keywords = query.split(/\s+/)
      .map(w => w.toLowerCase().replace(/[^a-z0-9]/g, ''))
      .filter(w => w.length > 1 && !STOP_WORDS.has(w))

    // Fetch all matching DB listings (capped at 50 to keep session JSONB small)
    let dbQuery = supabase
      .from('listings')
      .select(
        `id, title, body, price, category, condition, status, maps_url, place_id, created_at,
         profiles!user_id(name, phone, city)`
      )
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50)

    for (const kw of keywords) {
      dbQuery = dbQuery.or(`title.ilike.%${kw}%,body.ilike.%${kw}%`)
    }

    const { data: dbData } = await dbQuery

    const dbListings = (dbData ?? []).map((l: any) => ({
      ...l,
      _source:  'db' as const,
      _mapsUrl: l.maps_url ?? undefined,
    }))

    // Fetch up to 20 Google Places results (API max for searchText)
    const googleAll = await searchGooglePlaces(query, 20)

    // Merge: DB first (richer data), then Google results that aren't already
    // represented by a DB listing (matched by Google place_id stored on DB row).
    const dbPlaceIds = new Set(dbListings.map((l: any) => l.place_id).filter(Boolean))
    const uniqueGoogle = googleAll.filter((g: any) => !dbPlaceIds.has(g.id))
    const allListings = [...dbListings, ...uniqueGoogle]

    // Persist the full result set so subsequent "Yes / more" pages don't need
    // extra DB/Google calls and are fully deterministic per-user.
    if (userJid) {
      const { error: upsertErr } = await supabase.from('whatsapp_search_sessions').upsert({
        user_jid:     userJid,
        chat_id:      chatId,
        query,
        all_listings: allListings,
        next_offset:  limit,          // next page starts here
        updated_at:   new Date().toISOString(),
      })
      if (upsertErr) {
        // Log but don't block — user still gets their first results
        console.error('Session upsert failed:', upsertErr.message)
      }
    }

    const listings = allListings.slice(0, limit)
    const hasMore  = allListings.length > limit

    return new Response(
      JSON.stringify({ listings, hasMore, query }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
