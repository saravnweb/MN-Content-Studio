'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import HeaderNotificationBell from './HeaderNotificationBell'
import CreatorSideMenu from './CreatorSideMenu'
import CreatorBottomNav from './CreatorBottomNav'
import Footer from '@/components/Footer'
import PWAInstallBanner from './PWAInstallBanner'
import BrandLogo from '@/components/BrandLogo'

export default function CreatorShell({
  children,
  userId,
  name,
}: {
  children: React.ReactNode
  userId: string
  name?: string
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <PWAInstallBanner />
      <CreatorSideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} name={name} />
      <header className="sticky top-0 z-10 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-lg mx-auto h-12 flex items-center px-4 gap-2">
          <button
            className="p-1.5 text-gray-400 hover:text-gray-100 rounded-md hover:bg-gray-800 transition-colors"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <BrandLogo size={20} textClassName="font-semibold text-sm text-gray-100" />
          <div className="flex-1" />
          <ThemeToggle />
          <HeaderNotificationBell userId={userId} />
        </div>
      </header>
      <main className="max-w-lg mx-auto w-full flex-1 flex flex-col px-4 pt-4 pb-24">
        {children}
      </main>
      <Footer />
      <CreatorBottomNav />
    </div>
  )
}
