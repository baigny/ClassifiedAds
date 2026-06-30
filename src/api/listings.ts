import { supabase } from './supabase'
import type { Listing, SearchParams, SearchResult } from '../types'

const PROFILE_FIELDS = 'id, name, username, avatar_url, role, city, email, phone, website'

export const listingsApi = {
  search: async ({
    q        = '',
    category = '',
    role     = 'all',
    status   = 'all',
    sort     = 'newest',
    page     = 1,
    pageSize = 12,
  }: SearchParams = {}): Promise<SearchResult> => {
    let query = supabase
      .from('listings')
      .select(`*, profiles!user_id!inner(${PROFILE_FIELDS})`, { count: 'exact' })

    if (q)              query = query.or(`title.ilike.%${q}%,body.ilike.%${q}%`)
    if (category)       query = query.eq('category', category)
    if (status !== 'all') query = query.eq('status', status)
    if (role !== 'all') query = query.eq('profiles.role', role)

    const ascending = sort === 'price-asc' || sort === 'oldest'
    const orderCol  = sort.startsWith('price') ? 'price' : 'created_at'
    query = query.order(orderCol, { ascending })

    const p  = page ?? 1
    const ps = pageSize ?? 12
    const from = (p - 1) * ps
    query = query.range(from, from + ps - 1)

    const { data, error, count } = await query
    if (error) throw error
    return { listings: (data as Listing[]) ?? [], total: count ?? 0 }
  },

  getOne: async (id: string): Promise<Listing> => {
    const { data, error } = await supabase
      .from('listings')
      .select(`*, profiles!user_id(${PROFILE_FIELDS})`)
      .eq('id', id)
      .single()
    if (error) throw error
    return data as Listing
  },

  getRelated: async (id: string, category: string, limit = 4): Promise<Listing[]> => {
    const { data, error } = await supabase
      .from('listings')
      .select(`*, profiles!user_id(${PROFILE_FIELDS})`)
      .eq('category', category)
      .eq('status', 'active')
      .neq('id', id)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data as Listing[]) ?? []
  },

  getFeatured: async (limit = 4): Promise<Listing[]> => {
    const { data, error } = await supabase
      .from('listings')
      .select(`*, profiles!user_id!inner(${PROFILE_FIELDS})`)
      .eq('status', 'active')
      .eq('profiles.role', 'seller')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data as Listing[]) ?? []
  },

  getRecent: async (limit = 8): Promise<Listing[]> => {
    const { data, error } = await supabase
      .from('listings')
      .select(`*, profiles!user_id(${PROFILE_FIELDS})`)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data as Listing[]) ?? []
  },

  getByProfile: async (profileId: string): Promise<Listing[]> => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', profileId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data as Listing[]) ?? []
  },

  create: async (listing: Omit<Partial<Listing>, 'user_id'> & { user_id: string }): Promise<Listing> => {
    const { data, error } = await supabase
      .from('listings')
      .insert(listing)
      .select()
      .single()
    if (error) throw error
    return data as Listing
  },
}
