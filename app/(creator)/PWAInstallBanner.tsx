'use client'

import { useEffect, useState } from 'react'

export default function PWAInstallBanner() {
  const [prompt, setPrompt] = useState<any>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setPrompt(e); setVisible(true) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function install() {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-indigo-600 text-white px-4 pt-3-safe pb-3 flex items-center justify-between gap-4 max-w-lg mx-auto">
      <p className="text-sm font-medium">Add MW Content Studio to your home screen</p>
      <div className="flex gap-2 shrink-0">
        <button onClick={() => setVisible(false)} className="text-xs text-indigo-200 hover:text-white">Later</button>
        <button onClick={install} className="text-xs bg-white text-indigo-600 font-semibold px-3 py-1 rounded-lg">Install</button>
      </div>
    </div>
  )
}
