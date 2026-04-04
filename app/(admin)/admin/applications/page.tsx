'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const STATUS_FILTERS = ['all', 'pending', 'accepted', 'negotiating', 'rejected'] as const
type StatusFilter = typeof STATUS_FILTERS[number]

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending')

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('applications')
      .select('id, status, created_at, creator:profiles(full_name, platform), campaign:campaigns(id, title, brand_name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setApplications(data)
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    let result = applications
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((a) =>
        (a.creator?.full_name ?? '').toLowerCase().includes(q) ||
        (a.campaign?.title ?? '').toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') {
      result = result.filter((a) => a.status === statusFilter)
    }
    return result
  }, [applications, search, statusFilter])

  const counts = useMemo(() => ({
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
    negotiating: applications.filter((a) => a.status === 'negotiating').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  }), [applications])

  if (loading) return <p className="text-gray-400 text-sm">Loading…</p>

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-100">Applications Queue</h2>
        <p className="text-gray-400 text-sm mt-1">{counts.pending} pending · {counts.all} total · Open a campaign to manage</p>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by creator or campaign…"
          className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === f
                  ? 'bg-gray-800 text-gray-100 border border-gray-700'
                  : 'bg-gray-900 text-gray-400 border border-gray-800 hover:text-gray-300'
              }`}>
              {f}
              {counts[f] > 0 && <span className="text-[10px] opacity-70">({counts[f]})</span>}
            </button>
          ))}
        </div>
      </div>

      {!applications.length ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400 text-sm">No applications yet</p>
        </div>
      ) : !filtered.length ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400 text-sm">No applications match your search</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
          {filtered.map((app) => (
            <Link key={app.id} href={`/admin/campaigns/${app.campaign?.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-800/50 transition-colors">
              <div>
                <p className="text-gray-100 text-sm font-medium">{app.creator?.full_name ?? '—'}</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  {app.campaign?.brand_name} · {app.campaign?.title}
                  {app.creator?.platform ? ` · ${app.creator.platform}` : ''}
                </p>
              </div>
              <StatusBadge status={app.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const s: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400',
    accepted: 'bg-green-500/10 text-green-400',
    rejected: 'bg-red-500/10 text-red-400',
    negotiating: 'bg-blue-500/10 text-blue-400',
  }
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${s[status] ?? 'bg-gray-800 text-gray-400'}`}>{status}</span>
}
