import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, niches, platform_url')
          .eq('id', user.id)
          .single()

        if (profileError) {
          return NextResponse.redirect(`${origin}/login?error=profile_fetch_failed`)
        }

        if (profile?.role === 'admin') {
          return NextResponse.redirect(`${origin}/admin`)
        }

        // Creator: if onboarding incomplete, go to onboarding wizard
        if (!profile?.niches?.length || !profile?.platform_url) {
          return NextResponse.redirect(`${origin}/onboarding`)
        }

        return NextResponse.redirect(`${origin}/deals`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
