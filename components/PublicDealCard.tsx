'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Bookmark, Share2 } from 'lucide-react'

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
}

export default function PublicDealCard({ 
  campaign: c, 
  isCreator 
}: { 
  campaign: Campaign
  isCreator: boolean 
}) {
  const initials = (c.brand_name || '??').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  const handleShare = () => {
    const url = `${window.location.origin}/deals/${c.id}`
    if (navigator.share) {
      navigator.share({ title: c.title, url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Brand row */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-gray-800 flex items-center justify-center">
          {c.brand_logo_url
            ? <Image src={c.brand_logo_url} alt={c.brand_name} fill className="object-cover" />
            : <span className="font-bold text-xs text-gray-400">{initials}</span>
          }
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-base leading-tight text-gray-100">{c.brand_name}</p>
          {c.platforms && c.platforms.length > 0 && (
            <p className="text-sm capitalize text-gray-400">{c.platforms.join(' · ')}</p>
          )}
        </div>
        <span className="text-xs px-2 py-1 rounded-full font-medium shrink-0 bg-emerald-500/10 text-emerald-400">Live</span>
      </div>

      {/* Niche tags */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {c.niches?.slice(0, 4).map((n: string) => (
          <span key={n} className="text-xs px-2.5 py-0.5 rounded-full capitalize font-medium bg-indigo-500/10 text-indigo-400">{n}</span>
        ))}
      </div>

      {/* Title & description */}
      <p className="font-semibold text-lg leading-snug text-gray-100">{c.title}</p>
      <p className="text-base mt-1.5 line-clamp-2 leading-relaxed text-gray-400">{c.description}</p>

      {/* Stats Row */}
      <div className="grid grid-cols-3 divide-x divide-gray-800 rounded-xl mt-4 text-sm overflow-hidden border border-gray-800">
        <div className="px-3 py-2.5">
          <p className="text-gray-400 mb-0.5">Budget</p>
          <p className="font-semibold text-gray-200">
            {(c.budget_min || c.budget_max)
              ? <>₹{(c.budget_min ?? c.budget_max)!.toLocaleString('en-IN')}{c.budget_max && c.budget_max !== c.budget_min ? `–₹${c.budget_max.toLocaleString('en-IN')}` : ''}</>
              : 'Not specified'}
          </p>
        </div>
        <div className="px-3 py-2.5">
          <p className="text-gray-400 mb-0.5">Spots Left</p>
          <p className="font-semibold text-gray-200">{c.slots_total - c.slots_filled} / {c.slots_total}</p>
        </div>
        <div className="px-3 py-2.5">
          <p className="text-gray-400 mb-0.5">End Date</p>
          <p className="font-semibold text-gray-200">
            {c.deadline
              ? new Date(c.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
              : 'Not specified'}
          </p>
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex items-center gap-2 mt-4">
        <Link href={`/deals/${c.id}`}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-medium py-2.5 rounded-xl text-center transition-colors shadow-lg shadow-indigo-900/20">
          View Full Details
        </Link>
        <button
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-800 bg-gray-800/50 text-gray-400 hover:text-gray-100 transition-colors shrink-0"
          aria-label="Bookmark order"
          onClick={() => {
            if (!isCreator) {
              window.location.href = '/'
            }
          }}
        >
          <Bookmark className="w-5 h-5" />
        </button>
        <button
          onClick={handleShare}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-800 bg-gray-800/50 text-gray-400 hover:text-gray-100 transition-colors shrink-0 active:scale-95"
          aria-label="Share order"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
