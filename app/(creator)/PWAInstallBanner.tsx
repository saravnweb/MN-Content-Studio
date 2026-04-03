'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

type BannerMode = 'android' | 'ios' | null

export default function PWAInstallBanner() {
  const [mode, setMode] = useState<BannerMode>(null)
  const [androidPrompt, setAndroidPrompt] = useState<any>(null)

  useEffect(() => {
    // Don't show if already installed (running as standalone PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    if (isStandalone) return

    // Don't show if user dismissed recently
    const dismissed = localStorage.getItem('pwa-banner-dismissed')
    if (dismissed) return

    const ua = navigator.userAgent
    const isIos = /iphone|ipad|ipod/i.test(ua)
    // Safari on iOS — Chrome/Firefox on iOS can't install PWAs
    const isSafari = /safari/i.test(ua) && !/chrome|crios|fxios|opios/i.test(ua)

    if (isIos && isSafari) {
      setMode('ios')
      return
    }

    // Android / Chrome desktop — wait for the browser's install event
    const handler = (e: any) => {
      e.preventDefault()
      setAndroidPrompt(e)
      setMode('android')
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    localStorage.setItem('pwa-banner-dismissed', '1')
    setMode(null)
  }

  async function installAndroid() {
    if (!androidPrompt) return
    androidPrompt.prompt()
    const { outcome } = await androidPrompt.userChoice
    if (outcome === 'accepted') setMode(null)
  }

  if (!mode) return null

  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-indigo-600 text-white px-4 pt-3-safe pb-3 max-w-lg mx-auto shadow-xl">
      {mode === 'android' ? (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium">Add to your home screen for the best experience</p>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={dismiss} className="text-xs text-indigo-200 hover:text-white">Later</button>
            <button
              onClick={installAndroid}
              className="text-xs bg-white text-indigo-600 font-semibold px-3 py-1 rounded-lg"
            >
              Install
            </button>
          </div>
        </div>
      ) : (
        /* iOS: can't trigger install programmatically — show manual steps */
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold mb-1">Install on your iPhone</p>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Tap the{' '}
              {/* iOS Share icon */}
              <span className="inline-flex items-center align-middle mx-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                  <polyline points="16 6 12 2 8 6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
              </span>{' '}
              Share button, then <strong>&ldquo;Add to Home Screen&rdquo;</strong>
            </p>
          </div>
          <button onClick={dismiss} className="shrink-0 text-indigo-200 hover:text-white mt-0.5" aria-label="Dismiss">
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
