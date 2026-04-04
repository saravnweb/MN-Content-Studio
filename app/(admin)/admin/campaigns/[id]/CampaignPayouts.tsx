'use client'

import Link from 'next/link'
import MarkPaid from './MarkPaid'
import { ChevronRight } from 'lucide-react'

export default function CampaignPayouts({
  applications,
  campaignBudgetMin,
  campaignBudgetMax,
}: {
  applications: any[]
  campaignBudgetMin?: number | null
  campaignBudgetMax?: number | null
}) {
  const accepted = applications.filter((a) => a.status === 'accepted')

  if (!accepted.length) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
        <p className="text-gray-400 text-sm">No accepted creators yet</p>
        <p className="text-gray-500 text-xs mt-1">Accept applications first to manage payouts here</p>
      </div>
    )
  }

  const paidCount = accepted.filter((a) => a.payout_status === 'paid').length
  const processingCount = accepted.filter((a) => a.payout_status === 'processing').length
  const unpaidCount = accepted.filter((a) => !a.payout_status || a.payout_status === 'unpaid').length

  return (
    <div>
      {/* Summary row */}
      <div className="flex gap-5 mb-5 text-sm">
        <span className="text-gray-400">
          <span className="text-green-400 font-semibold">{paidCount}</span> paid
        </span>
        <span className="text-gray-400">
          <span className="text-yellow-400 font-semibold">{processingCount}</span> processing
        </span>
        <span className="text-gray-400">
          <span className="text-gray-300 font-semibold">{unpaidCount}</span> unpaid
        </span>
      </div>

      <div className="space-y-3">
        {accepted.map((app) => (
          <div key={app.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-gray-100 font-medium text-sm">{app.creator?.full_name ?? '—'}</p>
                <p className="text-gray-400 text-xs mt-0.5 capitalize">
                  {app.creator?.platform}
                  {app.creator?.followers_count
                    ? ` · ${app.creator.followers_count.toLocaleString('en-IN')} followers`
                    : ''}
                </p>
              </div>
              <Link
                href={`/admin/creators/${app.creator_id}`}
                className="inline-flex items-center gap-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-gray-100 px-3 py-1.5 rounded-lg transition-colors shrink-0"
              >
                View Profile <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <MarkPaid
              applicationId={app.id}
              budgetMin={campaignBudgetMin}
              budgetMax={campaignBudgetMax}
              currentStatus={app.payout_status ?? 'unpaid'}
              currentAmount={app.payout_amount}
              currentRef={app.payout_ref}
              currentDate={app.payout_date}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
