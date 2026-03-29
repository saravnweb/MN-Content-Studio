'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Status = 'pending' | 'accepted' | 'rejected' | 'negotiating'

const ACTIONS: { label: string; status: Status; cls: string }[] = [
  { label: 'Accept', status: 'accepted', cls: 'bg-green-600 hover:bg-green-700 text-white' },
  { label: 'Negotiate', status: 'negotiating', cls: 'bg-blue-600 hover:bg-blue-700 text-white' },
  { label: 'Reject', status: 'rejected', cls: 'bg-red-600/20 hover:bg-red-600/30 text-red-400' },
]

export default function ApplicationActions({
  applicationId,
  currentStatus,
}: {
  applicationId: string
  currentStatus: string
}) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<Status | null>(null)
  const [activeStatus, setActiveStatus] = useState(currentStatus)

  async function updateStatus(status: Status) {
    setLoading(status)
    const { error } = await supabase.from('applications').update({ status }).eq('id', applicationId)
    if (!error) setActiveStatus(status)
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
