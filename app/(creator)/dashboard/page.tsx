import { createClient } from '@/lib/supabase/server'
import Linkify from '@/components/Linkify'
import Link from 'next/link'
import SubmitContentForm from './SubmitContentForm'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: applications } = await supabase
    .from('applications')
    .select('id, status, created_at, message, submission_status, submission_url, admin_submission_note, payout_status, payout_amount, payout_date, campaign:campaigns(id, title, brand_name, budget_min, budget_max, deadline)')
    .eq('creator_id', user!.id)
    .order('created_at', { ascending: false })

  const counts = {
    pending: applications?.filter((a) => a.status === 'pending').length ?? 0,
    accepted: applications?.filter((a) => a.status === 'accepted').length ?? 0,
    negotiating: applications?.filter((a) => a.status === 'negotiating').length ?? 0,
  }

  const earnings = {
    total: applications?.filter((a: any) => a.payout_status === 'paid').reduce((s: number, a: any) => s + (a.payout_amount ?? 0), 0) ?? 0,
    processing: applications?.filter((a: any) => a.payout_status === 'processing').reduce((s: number, a: any) => s + (a.payout_amount ?? 0), 0) ?? 0,
    paidCount: applications?.filter((a: any) => a.payout_status === 'paid').length ?? 0,
  }

  return (
    <div>
      <div className="mb-6 pt-2">
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Dashboard</h1>
      </div>

      {/* Earnings summary */}
      {(earnings.total > 0 || earnings.processing > 0) && (
        <div className="rounded-2xl border my-5 overflow-hidden"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-alt)' }}>
            <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>💸 Earnings</p>
          </div>
          <div className="grid grid-cols-2 divide-x" style={{ borderColor: 'var(--color-border)' }}>
            <div className="px-4 py-4">
              <p className="text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>Total Earned</p>
              <p className="text-xl font-bold" style={{ color: 'var(--color-accent)' }}>₹{earnings.total.toLocaleString('en-IN')}</p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{earnings.paidCount} payout{earnings.paidCount !== 1 ? 's' : ''}</p>
            </div>
            {earnings.processing > 0 && (
              <div className="px-4 py-4">
                <p className="text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>Processing</p>
                <p className="text-xl font-bold" style={{ color: '#2563EB' }}>₹{earnings.processing.toLocaleString('en-IN')}</p>
                <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>on its way</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      {(applications?.length ?? 0) > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-8 mt-5">
          <StatCard label="Pending" value={counts.pending} colorHex="#D97706" />
          <StatCard label="Accepted" value={counts.accepted} colorHex="#16A34A" />
          <StatCard label="Negotiating" value={counts.negotiating} colorHex="#2563EB" />
        </div>
      )}

      {/* Orders Header */}
      <div className="mb-4">
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>My Orders</h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{applications?.length ?? 0} total</p>
      </div>

      {!applications?.length ? (
        <div className="border rounded-xl p-10 text-center mt-4"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-2xl mb-3">📋</p>
          <p className="font-medium text-gray-100">No orders yet</p>
          <p className="text-sm mt-1 mb-4" style={{ color: 'var(--color-text-muted)' }}>Browse available orders to get started</p>
          <Link href="/deals" className="text-white px-4 py-2 rounded-lg text-sm btn-accent">Browse Orders</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app: any) => {
            const isAccepted = app.status === 'accepted'
            const subStatus: string = app.submission_status ?? 'not_submitted'
            const showForm = isAccepted && (subStatus === 'not_submitted' || subStatus === 'revision_requested')

            return (
              <div key={app.id} className="border rounded-xl p-4"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Link href={`/deals/${app.campaign?.id}`}
                      className="font-medium text-sm transition-colors"
                      style={{ color: 'var(--color-text-primary)' }}>
                      {app.campaign?.title}
                    </Link>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{app.campaign?.brand_name}</p>
                    {app.campaign?.budget_min && (
                      <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                        ₹{app.campaign.budget_min.toLocaleString('en-IN')}
                        {app.campaign.budget_max ? `–${app.campaign.budget_max.toLocaleString('en-IN')}` : ''}
                      </p>
                    )}
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      Applied {new Date(app.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <StatusBadge status={app.status} />
                    {isAccepted && subStatus !== 'not_submitted' && (
                      <SubmissionBadge status={subStatus} />
                    )}
                    {isAccepted && app.payout_status && app.payout_status !== 'unpaid' && (
                      <PayoutBadge status={app.payout_status} amount={app.payout_amount} />
                    )}
                  </div>
                </div>

                {showForm && (
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    {subStatus === 'revision_requested' && app.admin_submission_note && (
                      <div className="mb-3 p-3 rounded-lg border"
                        style={{ backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }}>
                        <p className="text-xs font-medium mb-1" style={{ color: '#C2410C' }}>Revision requested</p>
                        <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--color-text-secondary)' }}>
                          <Linkify text={app.admin_submission_note} />
                        </p>
                      </div>
                    )}
                    <SubmitContentForm
                      applicationId={app.id}
                      existingUrl={app.submission_url ?? ''}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, colorHex }: { label: string; value: number; colorHex: string }) {
  return (
    <div className="border rounded-xl p-3 text-center"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <p className="text-2xl font-bold" style={{ color: colorHex }}>{value}</p>
      <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const s: Record<string, { bg: string; color: string }> = {
    pending: { bg: '#FEF9C3', color: '#854D0E' },
    accepted: { bg: '#DCFCE7', color: '#166534' },
    rejected: { bg: '#FEE2E2', color: '#991B1B' },
    negotiating: { bg: '#DBEAFE', color: '#1E40AF' },
  }
  const style = s[status] ?? { bg: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }
  return (
    <span className="text-xs font-medium px-2 py-1 rounded-full capitalize shrink-0"
      style={{ backgroundColor: style.bg, color: style.color }}>
      {status}
    </span>
  )
}

function SubmissionBadge({ status }: { status: string }) {
  const s: Record<string, { bg: string; color: string }> = {
    submitted: { bg: '#DBEAFE', color: '#1D4ED8' },
    approved: { bg: '#D1FAE5', color: '#065F46' },
    revision_requested: { bg: '#FFEDD5', color: '#9A3412' },
  }
  const labels: Record<string, string> = {
    submitted: 'Under Review',
    approved: 'Approved ✓',
    revision_requested: 'Revision Needed',
  }
  const style = s[status] ?? { bg: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }
  return (
    <span className="text-xs font-medium px-2 py-1 rounded-full shrink-0"
      style={{ backgroundColor: style.bg, color: style.color }}>
      {labels[status] ?? status}
    </span>
  )
}

function PayoutBadge({ status, amount }: { status: string; amount?: number | null }) {
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`
  if (status === 'paid') {
    return (
      <span className="text-xs font-semibold px-2 py-1 rounded-full shrink-0"
        style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>
        Paid {amount ? fmt(amount) : '✓'}
      </span>
    )
  }
  return (
    <span className="text-xs font-medium px-2 py-1 rounded-full shrink-0"
      style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8' }}>
      Payment Processing
    </span>
  )
}
