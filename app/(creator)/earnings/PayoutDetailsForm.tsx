'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Details = {
  account_holder_name: string
  bank_name: string
  account_number: string
  ifsc_code: string
  upi_id: string
}

export default function PayoutDetailsForm({ userId, initial }: { userId: string; initial: Details }) {
  const [form, setForm] = useState<Details>(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function set(field: keyof Details, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  async function save() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('profiles').update(form).eq('id', userId)
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className="border rounded-2xl p-4 space-y-3"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        Add your bank or UPI details so we can process your payouts.
      </p>

      {[
        { field: 'account_holder_name' as const, label: 'Account Holder Name' },
        { field: 'bank_name' as const, label: 'Bank Name' },
        { field: 'account_number' as const, label: 'Account Number' },
        { field: 'ifsc_code' as const, label: 'IFSC Code' },
        { field: 'upi_id' as const, label: 'UPI ID' },
      ].map(({ field, label }) => (
        <div key={field}>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
            {label}
          </label>
          <input
            type="text"
            value={form[field]}
            onChange={(e) => set(field, e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            style={{
              backgroundColor: 'var(--color-surface-alt)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>
      ))}

      <button
        onClick={save}
        disabled={saving}
        className="w-full py-2 rounded-xl text-sm font-bold text-white btn-accent disabled:opacity-50 transition-all mt-1"
      >
        {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Details'}
      </button>
    </div>
  )
}
