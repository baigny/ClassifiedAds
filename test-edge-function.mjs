// No auth needed — JWT verification disabled on this function
const SUPABASE_URL = 'https://eucjgaotitktharsllws.supabase.co'

const ANON_KEY = 'sb_publishable_fYRoG1Y7TuVYuiggcF8Hkw_K97fq-2V'

const res = await fetch(`${SUPABASE_URL}/functions/v1/search-listings`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ANON_KEY}`,
    'apikey': ANON_KEY,
  },
 body: JSON.stringify({ query: 'maternity hospital', limit: 3 }),

})

const { data, error } = { data: await res.json(), error: res.ok ? null : res.statusText }

if (error) {
  console.error('Error:', error)
} else {
  console.log('Total results:', data.total)
  console.log('Listings:')
  data.listings?.forEach((l, i) => {
    console.log(`  ${i + 1}. ${l.title} — ₹${l.price}`)
  })
}
