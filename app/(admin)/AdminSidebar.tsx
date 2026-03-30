'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Megaphone, ClipboardList, FileCheck, User, Tag, Banknote, type LucideIcon } from 'lucide-react'
import BrandLogo from '@/components/BrandLogo'

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/admin/applications', label: 'Applications', icon: ClipboardList },
  { href: '/admin/submissions', label: 'Submissions', icon: FileCheck },
  { href: '/admin/creators', label: 'Creators', icon: User },
  { href: '/admin/brands', label: 'Brands', icon: Tag },
  { href: '/admin/payouts', label: 'Payouts', icon: Banknote },
]

export default function AdminSidebar({
  name,
  isOpen,
  onClose,
}: {
  name: string
  isOpen?: boolean
  onClose?: () => void
}) {
  const pathname = usePathname()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <aside className={`w-64 fixed inset-y-0 left-0 z-30 bg-gray-900 border-r border-gray-800 flex flex-col transition-transform duration-200 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      <div className="px-6 py-5 border-b border-gray-800">
        <BrandLogo size={24} textClassName="text-gray-100 font-bold text-base" />
        <p className="text-gray-400 text-xs mt-0.5">Admin Control</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
              }`}>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-800">
        <p className="text-gray-400 text-xs px-2 mb-2 truncate">{name}</p>
        <button onClick={signOut}
          className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-800 transition-colors">
          Sign out
        </button>
      </div>
    </aside>
  )
}
