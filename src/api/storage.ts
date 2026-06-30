import { supabase } from './supabase'

/**
 * Uploads an array of File objects to the listing-images bucket.
 * Returns an array of public URLs.
 */
export async function uploadListingImages(files: File[]): Promise<string[]> {
  const urls: string[] = []
  for (const file of files) {
    const ext  = file.name.split('.').pop()
    const path = `listings/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error } = await supabase.storage
      .from('listing-images')
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('listing-images')
      .getPublicUrl(data.path)

    urls.push(publicUrl)
  }
  return urls
}
