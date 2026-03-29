import { useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

declare global {
  interface Window {
    google: any
  }
}

async function generateNonce(): Promise<[string, string]> {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  const nonce = btoa(String.fromCharCode(...Array.from(array)))
  const encoded = new TextEncoder().encode(nonce)
  const hash = await crypto.subtle.digest('SHA-256', encoded)
  const hashedNonce = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
  return [nonce, hashedNonce]
}

export function useGoogleOneTap(onStart?: () => void, onError?: (msg: string) => void) {
  const supabase = createClient()
  const nonceRef = useRef('')

  const handleOneTapResponse = useCallback(async (response: { credential: string }) => {
    onStart?.()
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: response.credential,
      nonce: nonceRef.current,
    })

    if (error || !data.user) {
      onError?.(error?.message ?? 'Sign-in failed')
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, niches, platform_url')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      onError?.('Could not fetch user profile')
      return
    }

    if (profile?.role === 'admin') {
      window.location.href = '/admin'
    } else if (!profile?.niches?.length || !profile?.platform_url) {
      window.location.href = '/onboarding'
    } else {
      window.location.href = '/deals'
    }
  }, [supabase, onStart, onError])

  const initOneTap = useCallback(async () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId || !window.google) return

    const [nonce, hashedNonce] = await generateNonce()
    nonceRef.current = nonce

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleOneTapResponse,
      nonce: hashedNonce,
      auto_select: true,
      cancel_on_tap_outside: true,
    })
    window.google.accounts.id.prompt()
  }, [handleOneTapResponse])

  return { initOneTap }
}
