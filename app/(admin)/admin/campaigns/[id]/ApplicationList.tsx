'use client'

import { useState } from 'react'
import Link from 'next/link'
import ApplicationActions from './ApplicationActions'
import Linkify from '@/components/Linkify'
import { ChevronRight } from 'lucide-react'
import { NICHE_SET } from '@/lib/constants'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'negotiating', label: 'Negotiating' },
  { key: 'rejected', label: 'Rejected' },
] as const

type Tab = typeof TABS[number]['key']

export default function ApplicationList({
  applications,
}: {
  applications: any[]
}) {
  const [activeTab, setActiveTab] = useState<Tab>('all')

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
    negotiating: applications.filter((a) => a.status === 'negotiating').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  }

  const filtered = activeTab === 'all' ? applications : applications.filter((a) => a.status === activeTab)

  return (
    <div>
      {/* Status tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-gray-700 text-gray-100'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
            }`}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-gray-600 text-gray-100' : 'bg-gray-800 text-gray-500'
              }`}>
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {!filtered.length ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-400 text-sm">
            {applications.length === 0 ? 'No applications yet' : `No ${activeTab} applications`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app: any) => (
            <div key={app.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-gray-100 font-medium text-sm">{app.creator?.full_name}</p>
                  <p className="text-gray-400 text-xs mt-0.5 capitalize">
                    {app.creator?.platform}
                    {app.creator?.followers_count ? ` · ${app.creator.followers_count.toLocaleString('en-IN')} followers` : ''}
                  </p>
                  {app.creator?.platform_url && (
                    <a href={app.creator.platform_url} target="_blank" rel="noopener noreferrer"
                      className="text-gray-400 text-xs hover:text-gray-200 hover:underline mt-0.5 block truncate max-w-xs">
                      {app.creator.platform_url}
                    </a>
                  )}
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {app.creator?.niches?.filter((n: string) => NICHE_SET.has(n as any)).map((n: string) => (
                      <span key={n} className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded capitalize">{n}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/admin/creators/${app.creator_id}`}
                    className="inline-flex items-center gap-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-gray-100 px-3 py-1.5 rounded-lg transition-colors">
                    View Profile <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <StatusBadge status={app.status} />
                </div>
              </div>
              {app.message && (
                <p className="text-gray-400 text-sm mt-3 bg-gray-800 rounded-lg p-3 leading-relaxed whitespace-pre-wrap"><Linkify text={app.message} /></p>
              )}
              <div className="mt-4">
                <ApplicationActions applicationId={app.id} currentStatus={app.status} />
              </div>
            </div>
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
    negotiating: 'bg-yellow-500/10 text-yellow-400',
  }
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize shrink-0 ${s[status] ?? 'bg-gray-800 text-gray-400'}`}>{status}</span>
}
