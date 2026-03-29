'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { toggleBookmark } from '@/app/(creator)/deals/actions'
import { Share2, Bookmark } from 'lucide-react'

type Campaign = {
  id: string
  title: string
  brand_name: string
  brand_logo_url: string | null
  description: string
  budget_min: number | null
  budget_max: number | null
  niches: string[] | null
  platforms: string[] | null
  deadline: string | null
  slots_filled: number
  slots_total: number
  deliverables: string | null
}

export default function DealCard({
  campaign: c,
  status,
  isBookmarked = false,
}: {
  campaign: Campaign
  status: string | undefined
  isBookmarked?: boolean
}) {
  const [bookmarked, setBookmarked] = useState(isBookmarked)
  const [pending, startTransition] = useTransition()

  const initials = c.brand_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="relative bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Brand row */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-gray-800 flex items-center justify-center">
          {c.brand_logo_url ? (
            <img src={c.brand_logo_url} alt={c.brand_name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-bold text-xs text-gray-400">
              {initials}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm leading-tight text-gray-100">
            {c.brand_name}
          </p>
          {c.platforms && c.platforms.length > 0 && (
            <p className="text-xs capitalize text-gray-400">
              {c.platforms.join(' · ')}
            </p>
          )}
        </div>
        {status && <AppliedBadge status={status} />}
        <span className="text-[10px] px-2 py-1 rounded-full font-medium shrink-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">Live</span>
      </div>

      {/* Niche tags */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {c.niches?.slice(0, 4).map((n) => (
          <span
            key={n}
            className="text-[11px] px-2.5 py-0.5 rounded-full capitalize font-medium bg-indigo-500/10 text-indigo-400"
          >
            {n}
          </span>
        ))}
      </div>

      {/* Title & description */}
      <p className="font-semibold text-base leading-snug text-gray-100">
        {c.title}
      </p>
      <p className="text-sm mt-1.5 line-clamp-2 leading-relaxed text-gray-400">
        {c.description}
      </p>

      {/* Stats Row */}
      <div className="flex items-center gap-4 mt-4 text-xs">
        <div className="flex flex-col">
          <p className="text-gray-400 mb-0.5">Budget</p>
          <p className="font-semibold text-gray-200">
            {c.budget_min || c.budget_max
              ? <>₹{(c.budget_min ?? c.budget_max)!.toLocaleString('en-IN')}{c.budget_max && c.budget_max !== c.budget_min ? `–₹${c.budget_max.toLocaleString('en-IN')}` : ''}</>
              : 'Not specified'}
          </p>
        </div>
        <div className="w-px h-6 bg-gray-800" />
        <div className="flex flex-col">
          <p className="text-gray-400 mb-0.5">Spots Left</p>
          <p className="font-semibold text-gray-200">
            {c.slots_total - c.slots_filled} / {c.slots_total}
          </p>
        </div>
        <div className="ml-auto flex flex-col items-end">
          <p className="text-gray-400 mb-0.5">End Date</p>
          <p className="font-semibold text-gray-200">
            {c.deadline
              ? new Date(c.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
              : 'N/A'}
          </p>
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex items-center gap-2 mt-4">
        <Link
          href={`/deals/${c.id}`}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 rounded-xl text-center transition-colors"
        >
          View Full Details
        </Link>
        <button
          disabled={pending}
          onClick={() => {
            setBookmarked((b) => !b)
            startTransition(() => toggleBookmark(c.id, bookmarked))
          }}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-800 bg-gray-800/50 transition-colors shrink-0 active:scale-95 disabled:opacity-60"
          aria-label="Bookmark deal"
        >
          <Bookmark className={`w-4 h-4 transition-colors ${bookmarked ? 'text-indigo-400 fill-current' : 'text-gray-400 hover:text-gray-300'}`} />
        </button>
        <button
          onClick={() => {
            const url = `${window.location.origin}/deals/${c.id}`
            if (navigator.share) {
              navigator.share({ title: c.title, url }).catch(() => {})
            } else {
              navigator.clipboard.writeText(url)
              alert('Link copied to clipboard!')
            }
          }}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-800 bg-gray-800/50 text-gray-400 hover:text-gray-300 transition-colors shrink-0 active:scale-95"
          aria-label="Share order"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function AppliedBadge({ status }: { status: string }) {
  const s: Record<string, string> = {
    pending:     'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400',
    accepted:    'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
    rejected:    'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
    negotiating: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  }
  const cls = s[status] ?? 'bg-gray-100 text-gray-400 dark:bg-gray-500/10 dark:text-gray-400'
  return (
    <span className={`text-[10px] font-medium px-2 py-1 rounded-full capitalize shrink-0 ${cls}`}>
      {status}
    </span>
  )
}
