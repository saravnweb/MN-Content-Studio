'use client'

import { useState } from 'react'
import Link from 'next/link'
import ApplicationList from './ApplicationList'
import CampaignSubmissions from './CampaignSubmissions'
import CampaignPayouts from './CampaignPayouts'
import Linkify from '@/components/Linkify'
import { Pencil } from 'lucide-react'

type TabKey = 'overview' | 'applications' | 'submissions' | 'payouts'

export default function CampaignTabs({
  campaign,
  applications,
}: {
  campaign: any
  applications: any[]
}) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  const submissionNeedsReview = applications.filter(
    (a) => a.submission_status === 'submitted'
  ).length

  const payoutProcessing = applications.filter(
    (a) => a.payout_status === 'processing'
  ).length

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'applications', label: 'Applications', count: applications.length },
    { key: 'submissions', label: 'Submissions', count: submissionNeedsReview },
    { key: 'payouts', label: 'Payouts', count: payoutProcessing },
  ]

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-0 border-b border-gray-800 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-white text-white'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-500'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          {campaign.description && (
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap mb-6">
              <Linkify text={campaign.description} />
            </p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {campaign.budget_min && (
              <Stat
                label="Budget"
                value={`${fmt(campaign.budget_min)} – ${fmt(campaign.budget_max ?? campaign.budget_min)}`}
              />
            )}
            <Stat label="Slots" value={`${campaign.slots_filled}/${campaign.slots_total}`} />
            {campaign.deadline && (
              <Stat label="Deadline" value={new Date(campaign.deadline).toLocaleDateString('en-IN')} />
            )}
            {campaign.deliverables && (
              <Stat label="Deliverables" value={campaign.deliverables} />
            )}
          </div>

          {campaign.niches?.length > 0 && (
            <div className="flex gap-1.5 mt-4 flex-wrap">
              {campaign.niches.map((n: string) => (
                <span key={n} className="text-xs bg-gray-800 text-gray-400 px-2.5 py-1 rounded-full capitalize">
                  {n}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6">
            <Link
              href={`/admin/campaigns/${campaign.id}/edit`}
              className="inline-flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit Campaign
            </Link>
          </div>
        </div>
      )}

      {/* Applications */}
      {activeTab === 'applications' && (
        <ApplicationList applications={applications} />
      )}

      {/* Submissions */}
      {activeTab === 'submissions' && (
        <CampaignSubmissions
          applications={applications}
          campaignBudgetMin={campaign.budget_min}
        />
      )}

      {/* Payouts */}
      {activeTab === 'payouts' && (
        <CampaignPayouts
          applications={applications}
          campaignBudgetMin={campaign.budget_min}
          campaignBudgetMax={campaign.budget_max}
        />
      )}
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
