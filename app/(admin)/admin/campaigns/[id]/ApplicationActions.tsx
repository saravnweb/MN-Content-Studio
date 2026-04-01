'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateApplicationStatus } from './actions'

type Status = 'pending' | 'accepted' | 'rejected' | 'negotiating'

const ACTIONS: { label: string; status: Status; cls: string }[] = [
  { label: 'Accept', status: 'accepted', cls: 'border border-green-700 text-green-400 hover:bg-green-900/20 bg-transparent' },
  { label: 'Negotiate', status: 'negotiating', cls: 'border border-yellow-700 text-yellow-400 hover:bg-yellow-900/20 bg-transparent' },
  { label: 'Reject', status: 'rejected', cls: 'border border-red-800 text-red-400 hover:bg-red-900/20 bg-transparent' },
]

export default function ApplicationActions({
  applicationId,
  currentStatus,
}: {
  applicationId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<Status | null>(null)
  const [activeStatus, setActiveStatus] = useState(currentStatus)

  async function updateStatus(status: Status) {
    if (status === 'rejected') {
      if (!confirm('Reject this application? The creator will be notified via push if subscribed.')) return
    }
    setLoading(status)
    try {
      await updateApplicationStatus(applicationId, status)
      setActiveStatus(status)
      toast.success(`Application ${status}`)
    } catch {
      toast.error('Failed to update status. Please try again.')
    }
    setLoading(null)
    router.refresh()
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {ACTIONS.map(({ label, status, cls }) => (
        <button
          key={status}
          onClick={() => updateStatus(status)}
          disabled={!!loading || activeStatus === status}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 ${cls}`}
        >
          {loading === status ? '…' : label}
        </button>
      ))}
    </div>
  )
}
