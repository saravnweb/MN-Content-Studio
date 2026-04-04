'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Check, Clock } from 'lucide-react'

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
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
          <Check className="w-3 h-3" /> Paid{currentAmount ? ` ${fmt(currentAmount)}` : ''}
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
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-full">
          <Clock className="w-3 h-3" /> Processing
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

      if (dbErr) {
        toast.error(dbErr.message)
        return
      }
      toast.success('Payout recorded')
      setOpen(false)
      router.refresh()
    })
  }

  // ── Form — shown immediately for unpaid, or when editing ────
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
            className="w-full bg-gray-900 border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gray-500 transition-colors"
          />
        </div>

        {/* Status */}
        <div>
          <label htmlFor="payout-status" className="text-[10px] text-gray-400 uppercase tracking-wide mb-1 block">Status</label>
          <select
            id="payout-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'unpaid' | 'processing' | 'paid')}
            className="w-full bg-gray-900 border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gray-500 transition-colors"
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
          className="w-full bg-gray-900 border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gray-500 transition-colors font-mono"
        />
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <div className="flex gap-2 pt-1">
        {open && (
          <button
            onClick={() => { setOpen(false); setError('') }}
            className="px-3 py-2 text-xs text-gray-400 hover:text-gray-300 border border-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={save}
          disabled={isPending}
          className="flex-1 bg-gray-100 hover:bg-gray-100 disabled:opacity-50 text-gray-900 text-xs font-semibold py-2 rounded-lg transition-colors"
        >
          {isPending ? 'Saving…' : 'Save Payout'}
        </button>
      </div>
    </div>
  )
}
