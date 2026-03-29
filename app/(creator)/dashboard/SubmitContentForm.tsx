'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SubmitContentFormProps {
  applicationId: string
  existingUrl: string
}

export default function SubmitContentForm({ applicationId, existingUrl }: SubmitContentFormProps) {
  const [url, setUrl] = useState(existingUrl)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const trimmed = url.trim()
    if (!trimmed) {
      setError('Please enter a content URL')
      return
    }
    try { new URL(trimmed) }
    catch { setError('Please enter a valid URL (e.g. https://...)'); return }

    startTransition(async () => {
      const supabase = createClient()
      const { data, error: dbError } = await supabase
        .from('applications')
        .update({
          submission_url: trimmed,
          submission_status: 'submitted',
          submission_submitted_at: new Date().toISOString(),
        })
        .eq('id', applicationId)
        .select()

      if (dbError) {
        console.error('Submission error:', dbError)
        setError('Something went wrong. Please try again.')
        return
      }

      if (!data || data.length === 0) {
        console.warn('No rows updated. Check RLS policies.')
        setError('You do not have permission to submit content for this deal.')
        return
      }

      console.log('Submission result:', data)
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-gray-300 text-xs font-medium">Submit your content link</p>
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://instagram.com/p/..."
          className="flex-1 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shrink-0"
        >
          {isPending ? 'Sending…' : existingUrl ? 'Resubmit' : 'Submit'}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </form>
  )
}
