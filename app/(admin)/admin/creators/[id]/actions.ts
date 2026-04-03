'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Update creator niches using service role to bypass RLS.
 * This is an admin-only action.
 */
export async function updateCreatorNiches(creatorId: string, niches: string[]) {
  const supabase = createAdminClient()

  // 1. Perform update using the service role client (bypasses RLS)
  const { data, error } = await supabase
    .from('profiles')
    .update({ niches })
    .eq('id', creatorId)
    .select('id')
    .single()

  if (error) {
    console.error('Error updating niches:', error)
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error('No row found to update.')
  }

  // 2. Revalidate the page to show fresh data
  revalidatePath(`/admin/creators/${creatorId}`)
  
  return { success: true }
}

/**
 * Toggle whether an approved submission appears in the homepage "Live View" grid.
 */
export async function toggleHomepageFeature(applicationId: string, featured: boolean) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('applications')
    .update({ is_homepage_featured: featured })
    .eq('id', applicationId)

  if (error) throw new Error(error.message)

  revalidateTag('featured-videos')
  revalidatePath('/')
}
