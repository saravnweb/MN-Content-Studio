'use client'

import { useState } from 'react'
import ReviewSubmission from './ReviewSubmission'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'submitted', label: 'Needs Review' },
  { key: 'revision_requested', label: 'Revision Requested' },
  { key: 'approved', label: 'Approved' },
] as const

type Tab = typeof TABS[number]['key']

export default function CampaignSubmissions({
  applications,
  campaignBudgetMin,
}: {
  applications: any[]
  campaignBudgetMin?: number | null
}) {
  const [activeTab, setActiveTab] = useState<Tab>('all')

  const withSubmissions = applications.filter(
    (a) => a.submission_url && a.submission_status && a.submission_status !== 'not_submitted'
  )

  if (!withSubmissions.length) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
        <p className="text-gray-400 text-sm">No submissions yet</p>
        <p className="text-gray-500 text-xs mt-1">Accepted creators will submit their content here</p>
      </div>
    )
  }

  const counts = {
    all: withSubmissions.length,
    submitted: withSubmissions.filter((a) => a.submission_status === 'submitted').length,
    revision_requested: withSubmissions.filter((a) => a.submission_status === 'revision_requested').length,
    approved: withSubmissions.filter((a) => a.submission_status === 'approved').length,
  }

  const filtered = activeTab === 'all'
    ? withSubmissions
    : withSubmissions.filter((a) => a.submission_status === activeTab)

  return (
    <div>
      <div className="flex gap-1.5 mb-4 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-gray-800 text-gray-100 border border-gray-700'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
            }`}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-gray-700 text-gray-100' : 'bg-gray-700 text-gray-400'
              }`}>
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {!filtered.length ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-400 text-sm">No submissions in this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
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
                  {app.creator?.platform_url && (
                    <a
                      href={app.creator.platform_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 text-xs hover:underline mt-0.5 block truncate max-w-xs"
                    >
                      {app.creator.platform_url}
                    </a>
                  )}
                </div>
                {app.submission_submitted_at && (
                  <p className="text-gray-400 text-xs shrink-0">
                    {new Date(app.submission_submitted_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>

              <ReviewSubmission
                applicationId={app.id}
                submissionUrl={app.submission_url}
                currentStatus={app.submission_status}
                budgetMin={campaignBudgetMin}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
