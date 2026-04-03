'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ReviewSubmission from '../campaigns/[id]/ReviewSubmission'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'submitted', label: 'Needs Review' },
  { key: 'revision_requested', label: 'Revision Requested' },
  { key: 'approved', label: 'Approved' },
] as const

type Tab = typeof TABS[number]['key']

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('submitted')

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('applications')
      .select(`
        id, submission_url, submission_status, admin_submission_note, submission_submitted_at,
        creator:profiles(full_name, platform, followers_count, platform_url),
        campaign:campaigns(id, title, brand_name)
      `)
      .neq('submission_status', 'not_submitted')
      .order('submission_submitted_at', { ascending: false })
      .then(({ data }) => {
        if (data) setSubmissions(data)
        setLoading(false)
      })
  }, [])

  const counts = useMemo(() => ({
    all: submissions.length,
    submitted: submissions.filter((s) => s.submission_status === 'submitted').length,
    revision_requested: submissions.filter((s) => s.submission_status === 'revision_requested').length,
    approved: submissions.filter((s) => s.submission_status === 'approved').length,
  }), [submissions])

  const filtered = useMemo(() => {
    if (activeTab === 'all') return submissions
    return submissions.filter((s) => s.submission_status === activeTab)
  }, [submissions, activeTab])

  if (loading) return <p className="text-gray-400 text-sm">Loading…</p>

  return (
    <div className="w-full max-w-4xl">
      <div className="mb-6 space-y-2">
        <h2 className="heading-page">Submissions Queue</h2>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-meta">
          <span className="whitespace-nowrap">{counts.submitted} needs review</span>
          <span className="text-gray-700">·</span>
          <span className="whitespace-nowrap">{counts.revision_requested} revision requested</span>
          <span className="text-gray-700">·</span>
          <span className="whitespace-nowrap">{counts.approved} approved</span>
          <span className="hidden sm:inline text-gray-700">·</span>
          <span className="text-gray-500 text-[10px] sm:text-xs">Open a campaign to manage</span>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide sm:mx-0 sm:px-0">
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-gray-900 text-gray-400 border border-gray-800 hover:text-gray-300'
            }`}>
            {tab.label}
            {counts[tab.key] > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-indigo-600/30 text-indigo-300' : 'bg-gray-700 text-gray-400'
              }`}>
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {!submissions.length ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 sm:p-12 text-center">
          <p className="text-gray-400 text-sm">No content submissions yet</p>
        </div>
      ) : !filtered.length ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 sm:p-12 text-center">
          <p className="text-gray-400 text-sm">No submissions in this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const submittedAt = s.submission_submitted_at
              ? new Date(s.submission_submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : null

            return (
              <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{s.creator?.full_name ?? '—'}</p>
                    <p className="text-meta mt-0.5 capitalize">
                      {s.creator?.platform}
                      {s.creator?.followers_count ? ` · ${s.creator.followers_count.toLocaleString('en-IN')} followers` : ''}
                    </p>
                    {s.creator?.platform_url && (
                      <a href={s.creator.platform_url} target="_blank" rel="noopener noreferrer"
                        className="text-indigo-400 text-[10px] sm:text-xs hover:underline mt-1 block truncate">
                        {s.creator.platform_url}
                      </a>
                    )}
                  </div>
                  <div className="sm:text-right shrink-0 border-t border-gray-800 sm:border-t-0 pt-3 sm:pt-0">
                    <Link href={`/admin/campaigns/${s.campaign?.id}`}
                      className="text-indigo-400 text-xs hover:underline font-medium block">
                      {s.campaign?.brand_name} · {s.campaign?.title}
                    </Link>
                    {submittedAt && (
                      <p className="text-meta mt-0.5">{submittedAt}</p>
                    )}
                  </div>
                </div>

                <ReviewSubmission
                  applicationId={s.id}
                  submissionUrl={s.submission_url}
                  currentStatus={s.submission_status}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
