'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Building2 } from 'lucide-react'

export default function RoleSelector() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleCreator() {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: `${window.location.origin}/api/auth/callback`,
        queryParams: { prompt: 'select_account' }
      },
    })
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-[420px]">

      {/* Creator card */}
      <button
        onClick={handleCreator}
        disabled={loading}
        className="group relative bg-gray-900 border border-gray-700/50 dark:border-gray-800/60 hover:border-indigo-500/60 rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:shadow-indigo-600/10 active:scale-[0.98] disabled:opacity-60 backdrop-blur-sm shadow-sm"
      >
        {/* Top accent line on hover — decorative */}
        <div className="absolute top-0 inset-x-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-indigo-500/0 to-transparent group-hover:via-indigo-500/60 transition-all duration-500" aria-hidden="true" />

        {/* Icon — decorative */}
        <div className="w-12 h-12 rounded-2xl mb-2 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-600/40 group-hover:shadow-indigo-600/60 group-hover:scale-105 transition-all duration-300" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>

        <p className="font-bold text-gray-100 text-sm sm:text-base mb-0.5 sm:mb-1">
          {loading ? 'Connecting…' : "I'm a Creator"}
        </p>
        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
          Join an elite network of professional creators
        </p>

        {/* Google Sign-In button — brand-approved style, decorative (outer button is the action) */}
        {!loading && (
          <div className="mt-3 w-full flex justify-center" aria-hidden="true">
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-md w-auto justify-center">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-[13px] font-medium text-[#3c4043] tracking-tight">Sign in with Google</span>
            </div>
          </div>
        )}
      </button>

      {/* Brand card */}
      <Link
        href="/brands/signup"
        className="group relative bg-gray-900 border border-gray-700/50 dark:border-gray-800/60 hover:border-pink-500/60 rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/10 active:scale-[0.98] backdrop-blur-sm shadow-sm"
      >
        {/* Top accent line on hover — decorative */}
        <div className="absolute top-0 inset-x-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-pink-500/0 to-transparent group-hover:via-pink-500/60 transition-all duration-500" aria-hidden="true" />

        {/* Icon — decorative */}
        <div className="w-12 h-12 rounded-2xl mb-2 flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-600/40 group-hover:shadow-pink-600/60 group-hover:scale-105 transition-all duration-300" aria-hidden="true">
          <Building2 className="w-6 h-6 text-white" strokeWidth={1.8} />
        </div>

        <p className="font-bold text-gray-100 text-sm sm:text-base mb-0.5 sm:mb-1">I&apos;m a Brand</p>
        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
          Discover India&apos;s most distinguished creative talent
        </p>

        <div className="mt-3 w-full flex justify-center" aria-hidden="true">
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 rounded-full px-4 py-1.5 w-auto justify-center transition-all duration-200 shadow-sm">
            <span className="text-[13px] font-bold text-white tracking-wide">Post a Campaign</span>
          </div>
        </div>
      </Link>

    </div>
  )
}
