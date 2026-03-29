'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface MarkPaidProps {
  applicationId: string
  budgetMin?: number | null
  budgetMax?: number | null
  currentStatus: string        // 'unpaid' | 'processing' | 'paid'
  currentAmount?: number | null
  currentRef?: string | null
  currentDate?: string | null
}

export default function MarkPaid({
  applicationId,
  budgetMin,
  budgetMax,
  currentStatus,
  currentAmount,
  currentRef,
  currentDate,
}: MarkPaidProps) {
  const defaultAmount = currentAmount ?? budgetMin ?? budgetMax ?? 0
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(String(defaultAmount || ''))
  const [ref, setRef] = useState(currentRef ?? '')
  const [status, setStatus] = useState<'unpaid' | 'processing' | 'paid'>(
    (currentStatus as 'unpaid' | 'processing' | 'paid') ?? 'unpaid'
  )
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

  // ── Already paid ────────────────────────────────────────────
  if (currentStatus === 'paid' && !open) {
    return (
      <div className="mt-3 flex items-center gap-3 flex-wrap">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
          ✓ Paid{currentAmount ? ` ${fmt(currentAmount)}` : ''}
        </span>
        {currentRef && (
          <span className="text-xs text-gray-400 font-mono">Ref: {currentRef}</span>
        )}
        {currentDate && (
          <span className="text-xs text-gray-400">
            {new Date(currentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )}
        <button onClick={() => setOpen(true)} className="text-xs text-gray-400 hover:text-gray-400 underline">Edit</button>
      </div>
    )
  }

  // ── Processing ───────────────────────────────────────────────
  if (currentStatus === 'processing' && !open) {
    return (
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full">
          ⏳ Processing
        </span>
        <button onClick={() => setOpen(true)} className="text-xs text-gray-400 hover:text-gray-400 underline">Update</button>
      </div>
    )
  }

  async function save() {
    const parsed = parseInt(amount)
    if (!parsed || parsed <= 0) { setError('Enter a valid amount'); return }
    setError('')

    startTransition(async () => {
      const supabase = createClient()
      const { error: dbErr } = await supabase
        .from('applications')
        .update({
          payout_status: status,
          payout_amount: parsed,
          payout_ref: ref.trim() || null,
          payout_date: (status === 'paid' || status === 'processing') ? (currentDate || new Date().toISOString()) : null,
        })
        .eq('id', applicationId)

      if (dbErr) { setError('Failed to save. Try again.'); return }
      setOpen(false)
      router.refresh()
    })
  }

  // ── Unpaid / form open ───────────────────────────────────────
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 text-xs font-medium text-gray-400 hover:text-indigo-400 border border-dashed border-gray-700 hover:border-indigo-500/50 px-3 py-1.5 rounded-lg transition-colors"
      >
        + Record Payout
      </button>
    )
  }

  return (
    <div className="mt-3 bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-3">
      <p className="text-xs font-semibold text-gray-300">Record Payout</p>

      <div className="grid grid-cols-2 gap-2.5">
        {/* Amount */}
        <div>
          <label className="text-[10px] text-gray-400 uppercase tracking-wide mb-1 block">Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={budgetMin ? String(budgetMin) : '0'}
            className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Status */}
        <div>
          <label className="text-[10px] text-gray-400 uppercase tracking-wide mb-1 block">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'unpaid' | 'processing' | 'paid')}
            className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="processing">Processing</option>
            <option value="paid">Paid ✓</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* UTR / Ref */}
      <div>
        <label className="text-[10px] text-gray-400 uppercase tracking-wide mb-1 block">UTR / Reference (optional)</label>
        <input
          type="text"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          placeholder="e.g. HDFC0012345678"
          className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
        />
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => { setOpen(false); setError('') }}
          className="px-3 py-2 text-xs text-gray-400 hover:text-gray-300 border border-gray-700 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={save}
          disabled={isPending}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
        >
          {isPending ? 'Saving…' : 'Save Payout'}
        </button>
      </div>
    </div>
  )
}
