'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleBookmark(campaignId: string, currentlyBookmarked: boolean) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  if (currentlyBookmarked) {
    await supabase
      .from('bookmarks')
      .delete()
      .eq('creator_id', user.id)
      .eq('campaign_id', campaignId)
  } else {
    await supabase
      .from('bookmarks')
      .insert({ creator_id: user.id, campaign_id: campaignId })
  }

  revalidatePath('/deals')
}
