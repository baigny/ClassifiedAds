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
  googleMapsUri?: string
}

// Returns true when two business names are likely the same place
function isSimilarName(a: string, b: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
  const na = norm(a)
  const nb = norm(b)
  if (!na || !nb) return false
  if (na === nb || na.includes(nb) || nb.includes(na)) return true
  const wordsA = na.split(/\s+/).filter(w => w.length > 2)
  const wordsB = nb.split(/\s+/).filter(w => w.length > 2)
  if (!wordsA.length || !wordsB.length) return false
  const common = wordsA.filter(w => wordsB.includes(w))
  return common.length >= Math.min(2, Math.min(wordsA.length, wordsB.length))
}

serve(async (req: any) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY')
  if (!apiKey) {
    return new Response(
      JSON.stringify({ ok: false, reason: 'GOOGLE_PLACES_API_KEY not configured' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const { listingId } = await req.json()
    if (!listingId) {
      return new Response(
        JSON.stringify({ error: 'listingId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!  // service role bypasses RLS to allow UPDATE
    )

    // Fetch listing title (that's all we need for the Places lookup)
    const { data: listing, error: fetchErr } = await supabase
      .from('listings')
      .select('id, title, maps_url')
      .eq('id', listingId)
      .single()

    if (fetchErr || !listing) {
      return new Response(
        JSON.stringify({ error: 'listing not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Already enriched — nothing to do
    if (listing.maps_url) {
      return new Response(
        JSON.stringify({ ok: true, reason: 'already enriched', maps_url: listing.maps_url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Search Google Places for this business name
    const placesRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.googleMapsUri',
      },
      body: JSON.stringify({
        textQuery: listing.title,
        maxResultCount: 3,
        languageCode: 'en',
      }),
    })

    const placesJson = await placesRes.json()
    const places = (placesJson.places ?? []) as GooglePlace[]

    // Find the first result whose name is similar to our listing title
    const match = places.find(p => isSimilarName(p.displayName?.text ?? '', listing.title))

    if (!match || !match.googleMapsUri) {
      return new Response(
        JSON.stringify({ ok: false, reason: 'no matching Google Place found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Persist the enrichment data back to the listing row
    const { error: updateErr } = await supabase
      .from('listings')
      .update({ maps_url: match.googleMapsUri, place_id: match.id })
      .eq('id', listingId)

    if (updateErr) throw updateErr

    return new Response(
      JSON.stringify({ ok: true, maps_url: match.googleMapsUri, place_id: match.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
