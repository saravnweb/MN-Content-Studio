'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Banknote, Settings, LogOut, X, type LucideIcon } from 'lucide-react'

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/earnings', label: 'Earnings & Payouts', icon: Banknote },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function CreatorSideMenu({
  isOpen,
  onClose,
  name,
}: {
  isOpen: boolean
  onClose: () => void
  name?: string
}) {
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60"
          onClick={onClose}
        />
      )}
      <aside className={`w-64 fixed inset-y-0 left-0 z-30 bg-gray-900 border-r border-gray-800 flex flex-col transition-transform duration-200 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="px-4 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-gray-100 font-bold text-sm">MW Content Studio</p>
            {name && <p className="text-gray-400 text-xs mt-0.5 truncate">{name}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition-colors shrink-0 ml-2"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-800">
          <button onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-800 transition-colors">
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
