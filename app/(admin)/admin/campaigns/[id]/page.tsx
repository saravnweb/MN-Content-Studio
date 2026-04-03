import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CampaignTabs from './CampaignTabs'
import Link from 'next/link'

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!campaign) notFound()

  const { data: applications } = await supabase
    .from('applications')
    .select('id, creator_id, status, message, admin_note, created_at, submission_url, submission_status, submission_submitted_at, payout_status, payout_amount, payout_ref, payout_date, creator:profiles(full_name, platform, platform_url, followers_count, niches)')
    .eq('campaign_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl w-full min-w-0">
      <Link href="/admin/campaigns" className="text-gray-400 text-sm hover:text-gray-300 mb-6 inline-block">
        ← Campaigns
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{campaign.title}</h2>
          <p className="text-gray-400 text-sm mt-1">{campaign.brand_name}</p>
        </div>
        <StatusPill status={campaign.status} />
      </div>

      <CampaignTabs campaign={campaign} applications={applications ?? []} />
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const s: Record<string, string> = {
    active: 'bg-green-500/10 text-green-400',
    paused: 'bg-yellow-500/10 text-yellow-400',
    closed: 'bg-gray-700 text-gray-400',
  }
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize shrink-0 ${s[status] ?? 'bg-gray-700 text-gray-400'}`}>
      {status}
    </span>
  )
}
