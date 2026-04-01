'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { NICHES, NICHE_SET } from '@/lib/constants'
import { updateCreatorNiches } from './actions'

import { Pencil } from 'lucide-react'

export default function AdminNicheEditor({ creatorId, initialNiches }: { creatorId: string; initialNiches: string[] }) {
  const [niches, setNiches] = useState<string[]>(initialNiches ?? [])
  const [editing, setEditing] = useState(false)
  const router = useRouter()
  const [isTransitionPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const legacyNiches = niches.filter((n) => !NICHES.includes(n as any))

  function toggleNiche(n: string) {
    setNiches((p) => p.includes(n) ? p.filter((x) => x !== n) : [...p, n])
  }

  function save() {
    setError('')
    startTransition(async () => {
      try {
        await updateCreatorNiches(creatorId, niches)
        setSaved(true)
        setEditing(false)
        router.refresh()
        setTimeout(() => setSaved(false), 2500)
      } catch (err: any) {
        setError(err.message || 'Save failed. Please check your connection.')
      }
    })
  }

  if (!editing) {
    return (
      <div className="group">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Expertise</p>
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-[10px] font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-md transition-all"
          >
            <Pencil className="w-2.5 h-2.5" />
            {saved ? 'Saved' : 'Edit'}
          </button>
        </div>
        {niches.length > 0 ? (
          <div className="flex gap-2 flex-wrap">
            {niches.map((n) => (
              <span key={n} className="text-[10px] font-bold bg-indigo-500/10 text-indigo-300 px-3 py-1.5 rounded-lg capitalize border border-indigo-500/10 shadow-sm transition-all hover:bg-indigo-500/20 active:scale-95 cursor-default">
                {n}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-xs italic">No niches specified</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          Expertise <span className="text-indigo-400 normal-case font-medium ml-1">({niches.length})</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setNiches(initialNiches); setEditing(false); setError('') }}
            className="text-[10px] font-bold text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={isTransitionPending}
            className="text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
            {isTransitionPending ? 'Saving…' : 'Apply'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {NICHES.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => toggleNiche(n)}
            className={`text-xs px-2.5 py-1 rounded-full capitalize border transition-all ${
              niches.includes(n)
                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                : 'bg-gray-800/40 border-gray-700 text-gray-400 hover:text-gray-300 hover:border-gray-600'
            }`}
          >
            {n}
          </button>
        ))}

        {/* Legacy niches (not in current master list) */}
        {legacyNiches.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => toggleNiche(n)}
            className="text-xs px-2.5 py-1 rounded-full capitalize border bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-1"
            title="Legacy niche (click to remove)"
          >
            {n}
            <span className="opacity-60">✕</span>
          </button>
        ))}
      </div>

      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  )
}
