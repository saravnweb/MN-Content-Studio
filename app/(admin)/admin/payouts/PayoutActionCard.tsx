'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface PayoutActionCardProps {
  applicationId: string
  creatorName: string
  upiId?: string | null
  bankName?: string | null
  accountNumber?: string | null
  amount: number
  campaignTitle: string
  requestedAt: string
}

export default function PayoutActionCard({
  applicationId,
  creatorName,
  upiId,
  bankName,
  accountNumber,
  amount,
  campaignTitle,
  requestedAt,
}: PayoutActionCardProps) {
  const [utr, setUtr] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

  function markPaid() {
    if (!utr.trim()) { setError('Enter UTR / Transaction ID'); return }
    setError('')
    startTransition(async () => {
      const supabase = createClient()
      const { error: dbErr } = await supabase
        .from('applications')
        .update({
          payout_status: 'paid',
          payout_amount: amount,
          payout_ref: utr.trim(),
          payout_date: new Date().toISOString(),
        })
        .eq('id', applicationId)
      if (dbErr) {
        toast.error('Payment record failed. Try again.')
        return
      }
      toast.success(`Marked as paid — ${fmt(amount)} to ${creatorName}`)
      router.refresh()
    })
  }

  function resetToPending() {
    startTransition(async () => {
      const supabase = createClient()
      const { error: dbErr } = await supabase
        .from('applications')
        .update({ payout_status: 'unpaid', payout_ref: null })
        .eq('id', applicationId)
      if (dbErr) {
        toast.error('Failed to reset status.')
        return
      }
      toast.success('Reset to pending')
      router.refresh()
    })
  }

  const paymentLabel = upiId ?? (accountNumber ? `${bankName ?? ''} ···${accountNumber.slice(-4)}` : 'No payment details')

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      {/* Creator row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-gray-100 font-semibold text-sm">{creatorName}</p>
          <p className="text-indigo-400 text-xs mt-0.5 font-mono">{paymentLabel}</p>
          <p className="text-gray-400 text-xs mt-0.5 truncate max-w-[200px]">{campaignTitle}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-gray-400 mb-1">
            {new Date(requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Payout Amount</p>
          <p className="text-2xl font-bold text-gray-100">{fmt(amount)}</p>
        </div>
      </div>

      {/* UTR input + actions */}
      <div className="flex gap-2 items-start">
        <input
          type="text"
          value={utr}
          onChange={(e) => { setUtr(e.target.value); setError('') }}
          placeholder="UTR / Trans. ID"
          className="flex-1 bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
        />
        <button
          onClick={markPaid}
          disabled={isPending}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shrink-0"
        >
          ✓ Mark Paid
        </button>
        <button
          onClick={resetToPending}
          disabled={isPending}
          title="Remove from payment queue and reset status to unpaid"
          className="flex items-center gap-1.5 border border-gray-600 hover:border-gray-500 text-gray-400 hover:text-gray-300 disabled:opacity-50 text-xs font-semibold px-4 py-2 rounded-lg transition-colors shrink-0"
        >
          Reset
        </button>
      </div>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      <p className="text-gray-600 text-[10px] mt-2">&ldquo;Reset&rdquo; removes from payment queue and sets status back to unpaid</p>
    </div>
  )
}
