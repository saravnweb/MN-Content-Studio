'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Tag, BarChart2, User, type LucideIcon } from 'lucide-react'

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/deals', label: 'Deals', icon: Tag },
  { href: '/dashboard', label: 'Status', icon: BarChart2 },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function CreatorBottomNav({ isGuest = false }: { isGuest?: boolean }) {
  const pathname = usePathname()
  const supabase = createClient()

  async function handleGoogleAuth() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: `${window.location.origin}/api/auth/callback` 
      },
    })
  }

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-gray-950/80 backdrop-blur-md border-t border-gray-800 pb-safe">
      <div className="max-w-lg mx-auto flex">
        {NAV.map(({ href, label, icon: Icon }) => {
          const isDeals = href === '/deals'
          const isProtected = href === '/dashboard' || href === '/profile'
          const active = (isGuest && isDeals && pathname.startsWith('/explore')) || (!isGuest && pathname.startsWith(href))
          
          if (isGuest && isProtected) {
            return (
              <button
                key={href}
                onClick={handleGoogleAuth}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-label text-gray-400 hover:text-gray-300 transition-colors`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            )
          }

          const finalHref = isGuest && isDeals ? '/explore' : href
          
          return (
            <Link key={href} href={finalHref}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-label transition-colors ${
                active ? 'text-indigo-400' : 'text-gray-400 hover:text-gray-300'
              }`}>
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
