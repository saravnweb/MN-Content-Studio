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
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Submissions Queue</h2>
        <p className="text-gray-400 text-sm mt-1">
          {counts.submitted} needs review · {counts.revision_requested} revision requested · {counts.approved} approved · Open a campaign to manage
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto">
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
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400 text-sm">No content submissions yet</p>
        </div>
      ) : !filtered.length ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400 text-sm">No submissions in this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const submittedAt = s.submission_submitted_at
              ? new Date(s.submission_submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : null

            return (
              <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-white font-medium text-sm">{s.creator?.full_name ?? '—'}</p>
                    <p className="text-gray-400 text-xs mt-0.5 capitalize">
                      {s.creator?.platform}
                      {s.creator?.followers_count ? ` · ${s.creator.followers_count.toLocaleString('en-IN')} followers` : ''}
                    </p>
                    {s.creator?.platform_url && (
                      <a href={s.creator.platform_url} target="_blank" rel="noopener noreferrer"
                        className="text-indigo-400 text-xs hover:underline mt-0.5 block truncate max-w-xs">
                        {s.creator.platform_url}
                      </a>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <Link href={`/admin/campaigns/${s.campaign?.id}`}
                      className="text-indigo-400 text-xs hover:underline font-medium">
                      {s.campaign?.brand_name} · {s.campaign?.title}
                    </Link>
                    {submittedAt && (
                      <p className="text-gray-400 text-xs mt-0.5">{submittedAt}</p>
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
