'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ReviewSubmissionProps {
  applicationId: string
  submissionUrl: string
  currentStatus: string
  budgetMin?: number | null
}

export default function ReviewSubmission({ applicationId, submissionUrl, currentStatus, budgetMin }: ReviewSubmissionProps) {
  const [note, setNote] = useState('')
  const [showRevisionBox, setShowRevisionBox] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [activeStatus, setActiveStatus] = useState(currentStatus)
  const router = useRouter()

  async function updateSubmission(status: 'approved' | 'revision_requested') {
    startTransition(async () => {
      const supabase = createClient()
      const updateData: Record<string, unknown> = {
        submission_status: status,
        admin_submission_note: status === 'revision_requested' ? note.trim() : null,
      }
      if (status === 'approved') {
        updateData.payout_status = 'processing'
        if (budgetMin) updateData.payout_amount = budgetMin
        updateData.payout_date = new Date().toISOString()
      }
      const { error } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', applicationId)
      if (!error) setActiveStatus(status)
      setShowRevisionBox(false)
      setNote('')
      router.refresh()
    })
  }

  if (activeStatus === 'approved') {
    return (
      <div className="flex items-center gap-1.5 mt-2">
        <span className="text-emerald-400 text-xs font-medium">✓ Content approved</span>
        <a href={submissionUrl} target="_blank" rel="noopener noreferrer"
          className="text-indigo-400 text-xs hover:underline truncate max-w-[200px]">
          View →
        </a>
      </div>
    )
  }

  return (
    <div className="mt-3 space-y-2">
      {/* Submission URL preview */}
      <div className="flex items-center gap-2 bg-gray-800/60 rounded-lg px-3 py-2">
        <span className="text-gray-400 text-xs shrink-0">📎 Submission:</span>
        <a href={submissionUrl} target="_blank" rel="noopener noreferrer"
          className="text-indigo-400 text-xs hover:underline truncate">
          {submissionUrl}
        </a>
      </div>

      {/* Revision note input */}
      {showRevisionBox && (
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Describe what needs to be changed…"
          rows={2}
          className="w-full bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 placeholder-gray-600 focus:outline-none focus:border-orange-500 resize-none transition-colors"
        />
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => updateSubmission('approved')}
          disabled={isPending}
          className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-medium py-2 rounded-lg border border-emerald-600/30 hover:border-emerald-500/50 transition-colors disabled:opacity-50"
        >
          {isPending ? '…' : '✓ Approve'}
        </button>
        {!showRevisionBox ? (
          <button
            onClick={() => setShowRevisionBox(true)}
            disabled={isPending}
            className="flex-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs font-medium py-2 rounded-lg border border-orange-500/20 hover:border-orange-500/40 transition-colors disabled:opacity-50"
          >
            ↩ Request Revision
          </button>
        ) : (
          <>
            <button
              onClick={() => updateSubmission('revision_requested')}
              disabled={isPending || !note.trim()}
              className="flex-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-xs font-medium py-2 rounded-lg border border-orange-500/30 transition-colors disabled:opacity-50"
            >
              Send Revision
            </button>
            <button
              onClick={() => { setShowRevisionBox(false); setNote('') }}
              className="px-3 py-2 text-gray-400 hover:text-gray-300 text-xs rounded-lg border border-gray-700 transition-colors"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  )
}
