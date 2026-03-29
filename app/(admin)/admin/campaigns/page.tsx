'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

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

export default function CampaignsPage() {
  const supabase = createClient()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('campaigns')
      .select('id, title, brand_name, status, slots_filled, slots_total, deadline, niches, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setCampaigns(data)
        setLoading(false)
      })
  }, [])

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Campaigns</h2>
          <p className="text-gray-400 text-sm mt-1">{campaigns.length} total</p>
        </div>
        <Link href="/admin/campaigns/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">
          + New Campaign
        </Link>
      </div>

      {!campaigns.length ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400 font-medium">No campaigns yet</p>
          <Link href="/admin/campaigns/new" className="inline-block mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">
            Create Campaign
          </Link>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
          {campaigns.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-800/50 transition-colors group">
              <Link href={`/admin/campaigns/${c.id}`} className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white font-medium text-sm">{c.title}</p>
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
                <span className="text-gray-400 text-sm">→</span>
                <button
                  onClick={(e) => handleDelete(e, c.id)}
                  disabled={deletingId === c.id}
                  title="Delete campaign"
                  className="text-gray-400 hover:text-red-400 disabled:opacity-30 text-sm transition-colors"
                >
                  {deletingId === c.id ? '…' : '✕'}
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
