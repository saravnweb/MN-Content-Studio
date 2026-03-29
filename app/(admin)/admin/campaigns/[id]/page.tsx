import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ApplicationActions from './ApplicationActions'
import ReviewSubmission from './ReviewSubmission'
import MarkPaid from './MarkPaid'
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
    .select('id, creator_id, status, message, admin_note, created_at, submission_url, submission_status, payout_status, payout_amount, payout_ref, payout_date, creator:profiles(full_name, platform, platform_url, followers_count, niches)')
    .eq('campaign_id', params.id)
    .order('created_at', { ascending: false })

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

  return (
    <div className="max-w-4xl">
      {/* Back */}
      <Link href="/admin/campaigns" className="text-gray-400 text-sm hover:text-gray-300 mb-6 inline-block">← Campaigns</Link>

      {/* Campaign header */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">{campaign.title}</h2>
            <p className="text-gray-400 text-sm mt-1">{campaign.brand_name}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href={`/admin/campaigns/${campaign.id}/edit`}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
              ✏️ Edit
            </Link>
            <StatusPill status={campaign.status} />
          </div>
        </div>

        <p className="text-gray-300 text-sm mt-4 leading-relaxed">{campaign.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {campaign.budget_min && (
            <Stat label="Budget" value={`${fmt(campaign.budget_min)} – ${fmt(campaign.budget_max ?? campaign.budget_min)}`} />
          )}
          <Stat label="Slots" value={`${campaign.slots_filled}/${campaign.slots_total}`} />
          {campaign.deadline && <Stat label="Deadline" value={new Date(campaign.deadline).toLocaleDateString('en-IN')} />}
          {campaign.deliverables && <Stat label="Deliverables" value={campaign.deliverables} />}
        </div>

        <div className="flex gap-1.5 mt-4 flex-wrap">
          {campaign.niches?.map((n: string) => (
            <span key={n} className="text-xs bg-indigo-600/10 text-indigo-400 px-2.5 py-1 rounded-full capitalize">{n}</span>
          ))}
        </div>
      </div>

      {/* Applications */}
      <div>
        <h3 className="text-white font-semibold mb-4">Applications ({applications?.length ?? 0})</h3>
        {!applications?.length ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-400 text-sm">No applications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app: any) => (
              <div key={app.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-white font-medium text-sm">{app.creator?.full_name}</p>
                    <p className="text-gray-400 text-xs mt-0.5 capitalize">
                      {app.creator?.platform}
                      {app.creator?.followers_count ? ` · ${app.creator.followers_count.toLocaleString('en-IN')} followers` : ''}
                    </p>
                    {app.creator?.platform_url && (
                      <a href={app.creator.platform_url} target="_blank" rel="noopener noreferrer"
                        className="text-indigo-400 text-xs hover:underline mt-0.5 block truncate max-w-xs">
                        {app.creator.platform_url}
                      </a>
                    )}
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {app.creator?.niches?.map((n: string) => (
                        <span key={n} className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded capitalize">{n}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/admin/creators/${app.creator_id}`}
                      className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                      View Profile →
                    </Link>
                    <StatusBadge status={app.status} />
                  </div>
                </div>
                {app.message && (
                  <p className="text-gray-400 text-sm mt-3 bg-gray-800 rounded-lg p-3 leading-relaxed">{app.message}</p>
                )}
                <div className="mt-4">
                  <ApplicationActions applicationId={app.id} currentStatus={app.status} />
                </div>
                {/* Submission review — only show if creator has submitted content */}
                {app.status === 'accepted' && app.submission_url && app.submission_status !== 'not_submitted' && (
                  <ReviewSubmission
                    applicationId={app.id}
                    submissionUrl={app.submission_url}
                    currentStatus={app.submission_status ?? 'submitted'}
                    budgetMin={campaign.budget_min}
                  />
                )}
                {/* Payout — show once content is approved */}
                {app.status === 'accepted' && app.submission_status === 'approved' && (
                  <MarkPaid
                    applicationId={app.id}
                    budgetMin={campaign.budget_min}
                    budgetMax={campaign.budget_max}
                    currentStatus={app.payout_status ?? 'unpaid'}
                    currentAmount={app.payout_amount}
                    currentRef={app.payout_ref}
                    currentDate={app.payout_date}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-400 text-xs mb-0.5">{label}</p>
      <p className="text-white text-sm font-medium">{value}</p>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const s: Record<string, string> = {
    active: 'bg-green-500/10 text-green-400',
    paused: 'bg-yellow-500/10 text-yellow-400',
    closed: 'bg-gray-700 text-gray-400',
  }
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${s[status] ?? 'bg-gray-700 text-gray-400'}`}>{status}</span>
}

function StatusBadge({ status }: { status: string }) {
  const s: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400',
    accepted: 'bg-green-500/10 text-green-400',
    rejected: 'bg-red-500/10 text-red-400',
    negotiating: 'bg-blue-500/10 text-blue-400',
  }
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize shrink-0 ${s[status] ?? 'bg-gray-800 text-gray-400'}`}>{status}</span>
}
