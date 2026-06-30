export interface Profile {
  id: string
  name: string
  username: string
  email: string
  phone?: string
  avatar_url?: string
  role: 'seller' | 'buyer'
  city?: string
  website?: string
  created_at: string
}

export interface Listing {
  id: string
  user_id: string
  title: string
  body: string
  price: number
  category: string
  condition: 'New' | 'Like New' | 'Good' | 'Fair' | 'For Parts'
  status: 'active' | 'sold'
  images: string[]
  maps_url?: string   // stored in DB after enrich-listing runs
  place_id?: string   // Google Place ID stored in DB
  created_at: string
  profiles?: Profile
  // Runtime fields added by the search-listings edge function response
  _source?: 'db' | 'google'
  _mapsUrl?: string
}

export interface Inquiry {
  id: string
  listing_id: string
  name: string
  email: string
  body: string
  created_at: string
}

export interface SearchParams {
  q?: string
  category?: string
  role?: 'all' | 'seller' | 'buyer'
  sort?: 'newest' | 'oldest' | 'price-asc' | 'price-desc'
  status?: 'all' | 'active' | 'sold'
  page?: number
  pageSize?: number
}

export interface SearchResult {
  listings: Listing[]
  total: number
}
