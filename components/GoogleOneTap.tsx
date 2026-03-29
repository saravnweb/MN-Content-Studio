'use client'

import { useEffect, useRef, useCallback } from 'react'
import Script from 'next/script'
import { createClient } from '@/lib/supabase/client'

import { useGoogleOneTap } from '@/lib/hooks/useGoogleOneTap'

export default function GoogleOneTap() {
  const { initOneTap } = useGoogleOneTap(
    () => {},
    (msg) => console.error('One Tap error:', msg)
  )

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="lazyOnload"
      onLoad={initOneTap}
    />
  )
}
