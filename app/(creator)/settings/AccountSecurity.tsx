'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AccountSecurity({ email }: { email: string }) {
  const [newEmail, setNewEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function changeEmail() {
    if (!newEmail || !newEmail.includes('@')) {
      setEmailError('Enter a valid email address')
      return
    }
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    if (error) {
      setEmailError(error.message)
    } else {
      setEmailSent(true)
      setEmailError('')
      setNewEmail('')
    }
  }

  async function signOutAll() {
    const supabase = createClient()
    await supabase.auth.signOut({ scope: 'global' })
    window.location.href = '/'
  }

  async function deleteAccount() {
    setDeleting(true)
    const res = await fetch('/api/account/delete', { method: 'DELETE' })
    if (res.ok) {
      window.location.href = '/'
    } else {
      setDeleting(false)
    }
  }

  return (
    <div className="border rounded-2xl overflow-hidden"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>

      {/* Current email */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Current Email</p>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{email}</p>
      </div>

      {/* Change email */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Change Email</p>
        {emailSent ? (
          <p className="text-xs text-green-400">Confirmation sent to {newEmail || 'new email'}. Check your inbox.</p>
        ) : (
          <div className="flex gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => { setNewEmail(e.target.value); setEmailError('') }}
              placeholder="New email address"
              className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-w-0"
              style={{
                backgroundColor: 'var(--color-surface-alt)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
            <button
              onClick={changeEmail}
              className="px-3 py-2 rounded-lg text-xs font-bold text-white btn-accent shrink-0"
            >
              Update
            </button>
          </div>
        )}
        {emailError && <p className="text-xs text-red-400 mt-1">{emailError}</p>}
      </div>

      {/* Sign out all devices */}
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Sign Out Everywhere</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Sign out from all devices</p>
        </div>
        <button
          onClick={signOutAll}
          className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors hover:bg-gray-800"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
        >
          Sign out all
        </button>
      </div>

      {/* Delete account */}
      <div className="px-4 py-3">
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-sm text-red-500 hover:text-red-400 transition-colors"
          >
            Delete account
          </button>
        ) : (
          <div>
            <p className="text-sm font-medium text-red-400 mb-2">Are you sure? This cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={deleteAccount}
                disabled={deleting}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 transition-colors"
              >
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors hover:bg-gray-800"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
