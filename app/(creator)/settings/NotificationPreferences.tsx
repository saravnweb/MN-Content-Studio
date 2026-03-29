'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Prefs = {
  new_deals: boolean
  status_updates: boolean
  payout_updates: boolean
}

const OPTIONS: { key: keyof Prefs; label: string; description: string }[] = [
  { key: 'new_deals', label: 'New Campaign Deals', description: 'Notified when new brand deals are posted' },
  { key: 'status_updates', label: 'Application Status', description: 'Updates when your application is accepted, rejected, or in negotiation' },
  { key: 'payout_updates', label: 'Payout Updates', description: 'Notified when a payment is processed or completed' },
]

export default function NotificationPreferences({ userId, initial }: { userId: string; initial: Prefs }) {
  const [prefs, setPrefs] = useState<Prefs>(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function toggle(key: keyof Prefs) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
    setSaved(false)
  }

  async function save() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('profiles').update({ notification_preferences: prefs }).eq('id', userId)
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className="border rounded-2xl overflow-hidden"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      {OPTIONS.map(({ key, label, description }, i) => (
        <div key={key}
          className={`flex items-center justify-between px-4 py-3 gap-4 ${i < OPTIONS.length - 1 ? 'border-b' : ''}`}
          style={{ borderColor: 'var(--color-border)' }}>
          <div className="min-w-0">
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{label}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{description}</p>
          </div>
          <button
            role="switch"
            aria-checked={prefs[key]}
            onClick={() => toggle(key)}
            className={`relative shrink-0 w-10 h-6 rounded-full transition-colors ${prefs[key] ? 'bg-indigo-600' : 'bg-gray-700'}`}
          >
            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${prefs[key] ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
        </div>
      ))}
      <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <button
          onClick={save}
          disabled={saving}
          className="w-full py-2 rounded-xl text-sm font-bold text-white btn-accent disabled:opacity-50 transition-all"
        >
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Preferences'}
        </button>
      </div>
    </div>
  )
}
