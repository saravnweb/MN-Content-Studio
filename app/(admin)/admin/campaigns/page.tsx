'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ChevronRight, Trash2 } from 'lucide-react'

type Campaign = {
  id: string
  title: string
  brand_name: string
  status: string
  slots_filled: number
  slots_total: number
  deadline: string | null
  niches: string[]
  created_at: string
}

const STATUS_FILTERS = ['all', 'active', 'paused', 'closed'] as const
type StatusFilter = typeof STATUS_FILTERS[number]

export default function CampaignsPage() {
  const supabase = createClient()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  useEffect(() => {
    supabase
      .from('campaigns')
      .select('id, title, brand_name, status, slots_filled, slots_total, deadline, niches, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setCampaigns(data)
        setLoading(false)
      })
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    let result = campaigns
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((c) =>
        c.title.toLowerCase().includes(q) || c.brand_name.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter)
    }
    return result
  }, [campaigns, search, statusFilter])

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Delete this campaign? This cannot be undone.')) return

    setDeletingId(id)
    const res = await fetch('/api/admin/campaigns', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    if (res.ok) {
      setCampaigns((prev) => prev.filter((c) => c.id !== id))
    } else {
      const data = await res.json()
      alert('Delete failed: ' + data.error)
    }
    setDeletingId(null)
  }

  if (loading) return <p className="text-gray-400 text-sm">Loading…</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Campaigns</h2>
          <p className="text-gray-400 text-sm mt-1">{campaigns.length} total</p>
        </div>
        <Link href="/admin/campaigns/new"
          className="bg-gray-100 hover:bg-gray-100 text-gray-900 font-medium px-4 py-2 rounded-lg text-sm transition-colors">
          + New Campaign
        </Link>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or brand…"
          className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
        />
        <div className="flex gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === f
                  ? 'bg-gray-700 text-gray-100 border border-gray-600'
                  : 'bg-gray-900 text-gray-400 border border-gray-800 hover:text-gray-300'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {!campaigns.length ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400 font-medium">No campaigns yet</p>
          <Link href="/admin/campaigns/new" className="inline-block mt-4 bg-gray-100 hover:bg-gray-100 text-gray-900 px-4 py-2 rounded-lg text-sm transition-colors">
            Create Campaign
          </Link>
        </div>
      ) : !filtered.length ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400 text-sm">No campaigns match your search</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
          {filtered.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-800/50 transition-colors group">
              <Link href={`/admin/campaigns/${c.id}`} className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-gray-100 font-medium text-sm">{c.title}</p>
                  <StatusPill status={c.status} />
                </div>
                <p className="text-gray-400 text-xs mt-0.5">
                  {c.brand_name} · {c.slots_filled}/{c.slots_total} slots
                  {c.deadline ? ` · Due ${new Date(c.deadline).toLocaleDateString('en-IN')}` : ''}
                </p>
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {c.niches?.slice(0, 4).map((n: string) => (
                    <span key={n} className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded capitalize">{n}</span>
                  ))}
                </div>
              </Link>
              <div className="flex items-center gap-3 ml-4 shrink-0">
                <ChevronRight className="w-4 h-4 text-gray-600" />
                <button
                  onClick={(e) => handleDelete(e, c.id)}
                  disabled={deletingId === c.id}
                  title="Delete campaign"
                  className="text-gray-500 hover:text-red-400 disabled:opacity-30 transition-colors p-0.5"
                >
                  {deletingId === c.id ? '…' : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
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
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${s[status] ?? 'bg-gray-700 text-gray-400'}`}>
      {status}
    </span>
  )
}
