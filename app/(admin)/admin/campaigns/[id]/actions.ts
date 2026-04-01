'use server'

import { createClient } from '@/lib/supabase/server'

export async function updateApplicationStatus(applicationId: string, status: string) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')

  const { error } = await supabase.from('applications').update({ status }).eq('id', applicationId)
  if (error) throw new Error(error.message)

  const { data: app } = await supabase
    .from('applications')
    .select('creator_id, campaign_id, campaigns(title, brand_name)')
    .eq('id', applicationId)
    .single()

  if (app?.creator_id) {
    const campaignList = app.campaigns as unknown as { title: string; brand_name: string }[] | null
    const campaign = campaignList?.[0]
    const isAccepted = status === 'accepted'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    fetch(`${appUrl}/api/push/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': process.env.INTERNAL_API_SECRET!,
      },
      body: JSON.stringify({
        title: isAccepted ? '🎉 Application Accepted!' : 'Application Update',
        body: isAccepted
          ? `Your application for ${campaign?.title} was accepted!`
          : `Your application for ${campaign?.title} has been updated.`,
        url: `/deals/${app.campaign_id}`,
        creatorId: app.creator_id,
      }),
    }).catch(() => {})
  }
}
