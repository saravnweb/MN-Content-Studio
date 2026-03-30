import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const ADMIN_PATHS = ['/admin']
const CREATOR_PATHS = ['/dashboard', '/notifications', '/profile', '/deals', '/onboarding', '/settings', '/earnings']
const PUBLIC_ONLY = ['/login', '/admin-login']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const { supabaseResponse, user, supabase } = await updateSession(request)

  const isAdminLogin = pathname === '/admin-login'
  const isAdminPath = !isAdminLogin && ADMIN_PATHS.some((p) => pathname.startsWith(p))
  const isCreatorPath = CREATOR_PATHS.some((p) => pathname.startsWith(p))
  const isProtected = isAdminPath || isCreatorPath
  const isPublicOnly = PUBLIC_ONLY.some((p) => pathname === p)

  if (!user && isProtected) {
    const dest = isAdminPath ? '/admin-login' : '/'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  // Fetch role for paths that need extra checks
  if (user && (isPublicOnly || isProtected)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, niches, platform_url')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'
    const isIncomplete = !profile?.niches?.length || !profile?.platform_url

    // Redirect logged-in users away from login/signup to their home
    if (isPublicOnly) {
      if (isAdminLogin) {
        return isAdmin
          ? NextResponse.redirect(new URL('/admin', request.url))
          : supabaseResponse
      }
      return NextResponse.redirect(new URL(isAdmin ? '/admin' : '/deals', request.url))
    }

    // Block non-admins from /admin at middleware level
    if (isAdminPath && !isAdmin) {
      return NextResponse.redirect(new URL('/deals', request.url))
    }

    // Force onboarding for incomplete creator profiles
    // But don't redirect if already on onboarding or sign-out
    if (isCreatorPath && isIncomplete && !isAdmin && pathname !== '/onboarding') {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|sw.js|workbox-.*\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
