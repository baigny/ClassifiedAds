import { supabase } from './supabase'
import type { Profile } from '../types'

export const profilesApi = {
  getAll: async (): Promise<Profile[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) throw error
    return (data as Profile[]) ?? []
  },

  getOne: async (id: string): Promise<Profile> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as Profile
  },

  getSellers: async (): Promise<Profile[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'seller')
      .order('created_at', { ascending: true })
    if (error) throw error
    return (data as Profile[]) ?? []
  },

  getBuyers: async (): Promise<Profile[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'buyer')
      .order('created_at', { ascending: true })
    if (error) throw error
    return (data as Profile[]) ?? []
  },
}
