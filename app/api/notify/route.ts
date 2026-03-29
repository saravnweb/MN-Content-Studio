import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { type, campaign_id, creator_id } = body

  try {
    if (type === 'new_application') {
      // Get campaign details
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('title, brand_name, created_by')
        .eq('id', campaign_id)
        .single()

      if (!campaign) return NextResponse.json({ ok: false }, { status: 404 })

      // Notify admin (campaign creator)
      await supabase.from('notifications').insert({
        user_id: campaign.created_by,
        type: 'new_application',
        title: 'New application received',
        body: `A creator applied to your campaign: ${campaign.title}`,
        payload: { campaign_id },
      })
    }

    if (type === 'new_campaign') {
      // Fan-out notification to all creators matching campaign niches
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('id, title, brand_name, niches')
        .eq('id', campaign_id)
        .single()

      if (!campaign) return NextResponse.json({ ok: false }, { status: 404 })

      // Find matching creators
      const { data: creators } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'creator')
        .overlaps('niches', campaign.niches ?? [])

      if (creators && creators.length > 0) {
        const notifications = creators.map((c) => ({
          user_id: c.id,
          type: 'new_campaign',
          title: `New deal: ${campaign.brand_name}`,
          body: campaign.title,
          payload: { campaign_id: campaign.id },
        }))
        await supabase.from('notifications').insert(notifications)
      }
    }

    if (type === 'status_change' && creator_id) {
      const { data: application } = await supabase
        .from('applications')
        .select('status, campaigns(title, brand_name)')
        .eq('campaign_id', campaign_id)
        .eq('creator_id', creator_id)
        .single()

      if (application) {
        const status = application.status
        const campaign = (application.campaigns as any) as { title: string; brand_name: string } | null
        const accepted = status === 'accepted'
        await supabase.from('notifications').insert({
          user_id: creator_id,
          type: accepted ? 'application_accepted' : 'application_rejected',
          title: accepted ? 'Application Accepted!' : 'Application Update',
          body: accepted
            ? `Your application for ${campaign?.title} was accepted. Check your email for next steps.`
            : `Your application for ${campaign?.title} was not selected this time.`,
          payload: { campaign_id, creator_id },
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[notify]', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
