'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Tag, BarChart2, User, type LucideIcon } from 'lucide-react'

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/deals', label: 'Deals', icon: Tag },
  { href: '/dashboard', label: 'My Deals', icon: BarChart2 },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function CreatorBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-gray-950/80 backdrop-blur-md border-t border-gray-800 pb-safe">
      <div className="max-w-lg mx-auto flex">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link key={href} href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${
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
