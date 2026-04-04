'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Check, ExternalLink, RotateCcw } from 'lucide-react'

interface ReviewSubmissionProps {
  applicationId: string
  submissionUrl: string
  currentStatus: string
  budgetMin?: number | null
}

export default function ReviewSubmission({ applicationId, submissionUrl, currentStatus, budgetMin }: ReviewSubmissionProps) {
  const [note, setNote] = useState('')
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
      if (error) {
        toast.error('Failed to update. Please try again.')
        return
      }
      setActiveStatus(status)
      setNote('')
      toast.success(status === 'approved' ? 'Content approved — payout set to processing' : 'Revision requested')
      router.refresh()
    })
  }

  if (activeStatus === 'approved') {
    return (
      <div className="flex items-center gap-1.5 mt-2">
        <span className="flex items-center gap-1 text-green-400 text-xs font-medium"><Check className="w-3 h-3" /> Content approved</span>
        <a href={submissionUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-gray-400 text-xs hover:text-gray-200 hover:underline truncate max-w-[200px]">
          View <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    )
  }

  return (
    <div className="mt-3 space-y-2">
      {/* Submission URL preview */}
      <div className="flex items-center gap-2 bg-gray-800/60 rounded-lg px-3 py-2">
        <ExternalLink className="w-3.5 h-3.5 text-gray-500 shrink-0" />
        <a href={submissionUrl} target="_blank" rel="noopener noreferrer"
          className="text-gray-400 text-xs hover:text-gray-200 hover:underline truncate">
          {submissionUrl}
        </a>
      </div>

      {/* Revision note — always visible */}
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Revision notes (required to request changes)…"
        rows={2}
        className="w-full bg-gray-800 border border-gray-700 text-gray-100 text-xs rounded-lg px-3 py-2 placeholder-gray-600 focus:outline-none focus:border-gray-500 resize-none transition-colors"
      />

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => updateSubmission('approved')}
          disabled={isPending}
          className="flex-1 inline-flex items-center justify-center gap-1.5 border border-green-700 text-green-400 hover:bg-green-900/20 bg-transparent text-xs font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          <Check className="w-3.5 h-3.5" />{isPending ? '…' : 'Approve'}
        </button>
        <button
          onClick={() => updateSubmission('revision_requested')}
          disabled={isPending || !note.trim()}
          className="flex-1 inline-flex items-center justify-center gap-1.5 border border-yellow-700 text-yellow-400 hover:bg-yellow-900/20 bg-transparent text-xs font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />{isPending ? '…' : 'Request Revision'}
        </button>
      </div>
    </div>
  )
}
