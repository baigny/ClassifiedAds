import { supabase } from './supabase'
import type { Inquiry } from '../types'

export const inquiriesApi = {
  getByListing: async (listingId: string): Promise<Inquiry[]> => {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .eq('listing_id', listingId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return (data as Inquiry[]) ?? []
  },

  create: async ({ listingId, name, email, body }: {
    listingId: string
    name: string
    email: string
    body: string
  }): Promise<Inquiry> => {
    const { data, error } = await supabase
      .from('inquiries')
      .insert({ listing_id: listingId, name, email, body })
      .select()
      .single()
    if (error) throw error
    return data as Inquiry
  },
}
