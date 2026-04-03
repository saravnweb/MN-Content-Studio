'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'

type AddPayload = {
  video_url: string | null
  file_url: string | null
  platform: 'instagram' | 'youtube'
  creator_name: string
  niche: string | null
  brand_name: string | null
  display_order: number
}

export async function addShowcaseVideo(payload: AddPayload) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('showcase_videos')
    .insert(payload)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidateTag('featured-videos')
  revalidatePath('/')
  return data
}

export async function deleteShowcaseVideo(id: string, fileUrl: string | null) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('showcase_videos')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)

  // Remove file from storage if it was an upload
  if (fileUrl) {
    const path = fileUrl.split('/campaign-assets/')[1]
    if (path) await supabase.storage.from('campaign-assets').remove([path])
  }

  revalidateTag('featured-videos')
  revalidatePath('/')
}
