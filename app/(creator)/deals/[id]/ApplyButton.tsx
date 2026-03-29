'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const STATUS_CONFIG: Record<string, { emoji: string; label: string; color: string; border: string }> = {
  pending:     { emoji: '⏳', label: 'Application Pending',   color: '#eab308', border: 'rgba(234, 179, 8, 0.2)' },
  accepted:    { emoji: '✅', label: 'Application Accepted',  color: '#22c55e', border: 'rgba(34, 197, 94, 0.2)' },
  rejected:    { emoji: '❌', label: 'Application Rejected',  color: '#ef4444', border: 'rgba(239, 104, 104, 0.2)' },
  negotiating: { emoji: '💬', label: 'In Negotiation',        color: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' },
}

export default function ApplyButton({
  campaignId,
  creatorId,
  alreadyApplied,
  applicationStatus,
  profileComplete,
  slotsFull,
}: {
  campaignId: string
  creatorId: string
  alreadyApplied: boolean
  applicationStatus?: string
  profileComplete: boolean
  slotsFull: boolean
}) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  // ── Already applied ──────────────────────────────────────
  if (alreadyApplied && applicationStatus) {
    const cfg = STATUS_CONFIG[applicationStatus]
    return (
      <div className="rounded-2xl border bg-gray-900 px-5 py-4 text-center shadow-lg"
        style={{ borderColor: cfg?.border ?? '#1f2937' }}>
        <p className="text-base font-bold" style={{ color: cfg?.color ?? '#f9fafb' }}>
          {cfg?.emoji} {cfg?.label ?? applicationStatus}
        </p>
        <p className="text-xs mt-1 text-gray-400">
          You&apos;ve already applied to this campaign.
        </p>
      </div>
    )
  }

  // ── Slots full ───────────────────────────────────────────
  if (slotsFull) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-gray-900 px-5 py-4 text-center">
        <p className="text-sm font-semibold text-gray-400">
          All spots filled — applications closed
        </p>
      </div>
    )
  }

  // ── Profile incomplete ───────────────────────────────────
  // (handled in page.tsx with warning banner — button still hidden here)
  if (!profileComplete) return null

  // ── Apply form ───────────────────────────────────────────
  async function handleApply() {
    setError('')
    startTransition(async () => {
      const supabase = createClient()
      const { error: dbError } = await supabase.from('applications').insert({
        campaign_id: campaignId,
        creator_id: creatorId,
        message: message.trim() || null,
      })
      if (dbError) {
        setError(dbError.message.includes('unique') ? 'You have already applied.' : 'Something went wrong. Try again.')
        return
      }
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'new_application', campaign_id: campaignId }),
      })
      router.refresh()
    })
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="mx-auto block px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-semibold text-white transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98]"
      >
        Apply for This Deal
      </button>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 space-y-3 shadow-xl">
      <p className="font-semibold text-sm text-gray-100">
        Your pitch <span className="font-normal text-gray-400">(optional)</span>
      </p>
      <textarea
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Why are you a great fit? Any relevant past brand deals?"
        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder:text-gray-400 resize-none focus:outline-none focus:border-indigo-500 transition-colors"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2.5 pt-1">
        <button
          onClick={() => { setShowForm(false); setError('') }}
          className="px-4 py-3 bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 rounded-xl text-sm font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleApply}
          disabled={isPending}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-lg active:scale-[0.98]"
        >
          {isPending ? 'Submitting…' : 'Submit Application'}
        </button>
      </div>
    </div>
  )
}
