'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Menu } from 'lucide-react'
import CreatorSideMenu from '@/app/(creator)/CreatorSideMenu'
import CreatorBottomNav from '@/app/(creator)/CreatorBottomNav'

export function GuestHamburger({ isGuest = true }: { isGuest?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <button
        className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition-colors mr-2"
        onClick={() => setMenuOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>
      {mounted && createPortal(
        <CreatorSideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} isGuest={isGuest} />,
        document.body
      )}
    </>
  )
}

export function GuestBottomNav({ isGuest = true }: { isGuest?: boolean }) {
  return <CreatorBottomNav isGuest={isGuest} />
}
