import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'
import GoogleOneTap from '@/components/GoogleOneTap'
import RoleSelector from '@/components/landing/RoleSelector'
import ActivityTicker from '@/components/landing/ActivityTicker'
import CreatorMarquee from '@/components/landing/CreatorMarquee'
import BrandLogo from '@/components/BrandLogo'
import ScrollHint from '@/components/landing/ScrollHint'

export const metadata = {
  title: "MN Content Studio — Crafting Creative Legacies",
  description: "The premier network for India's elite creators and visionary brands. Join a community dedicated to professional excellence and distinguished creative partnerships.",
}

const STATS = [
  { value: '246',   label: 'Creators' },
  { value: '16',    label: 'Niches' },
  { value: '100%',  label: 'Verified Brands' },
]

export default async function LandingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = profile?.role
    if (role === 'admin') redirect('/admin')
    if (role === 'creator') redirect('/deals')
  }

  const { count: liveCount } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  return (
    <div className="bg-gray-950 text-gray-100 relative overflow-x-hidden">
      <GoogleOneTap />

      {/* ── Background orbs — decorative, hidden from AT ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute top-[-5%] left-[-10%] w-80 h-80 rounded-full bg-indigo-600/15 blur-3xl"
          style={{ animation: 'float-orb-1 16s ease-in-out infinite' }} />
        <div className="absolute top-[40%] right-[-15%] w-96 h-96 rounded-full bg-violet-600/12 blur-3xl"
          style={{ animation: 'float-orb-2 20s ease-in-out infinite' }} />
        <div className="absolute bottom-[10%] left-[30%] w-64 h-64 rounded-full bg-amber-500/8 blur-3xl"
          style={{ animation: 'float-orb-3 13s ease-in-out infinite' }} />
      </div>

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-30 bg-gray-950/70 backdrop-blur border-b border-gray-900/60 px-5 py-3 flex items-center justify-between">
        <BrandLogo />
        <div className="flex items-center gap-3">
          <Link href="/explore" className="text-xs text-gray-400 hover:text-gray-300 transition-colors hidden sm:block">
            Browse Deals
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* ══════════════════════════════════
          HERO  — targets one viewport tall
      ══════════════════════════════════ */}
      <main id="main-content">
      <section aria-label="Hero" className="relative z-10 min-h-[calc(100svh-52px)] flex flex-col items-center justify-center px-5 py-10 gap-5">

        {/* Live pill */}
        <div
          className="flex items-center gap-2 bg-gray-900/80 border border-gray-800 rounded-full px-3.5 py-1.5 backdrop-blur-sm"
          aria-live="polite"
          aria-atomic="true"
        >
          {/* Animated pulse dot — decorative */}
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="text-xs text-gray-400">
            {(liveCount ?? 0) > 0
              ? <><span className="text-emerald-400 font-semibold">{liveCount}</span> live campaigns right now</>
              : <>New campaigns dropping soon</>}
          </span>
        </div>

        {/* Headline */}
        <div className="text-center max-w-lg">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-6">
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-400 bg-clip-text text-transparent animate-gradient-text">
              Crafting Legacies
            </span>
            <br />
            <span className="text-gray-100">through Creative Excellence.</span>
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed max-w-md mx-auto">
            India&apos;s most refined network connecting distinguished creators with iconic brands. 
            Built for those who value artistry, professionalism, and the pursuit of a lasting legacy.
          </p>
        </div>

        {/* Role cards */}
        <RoleSelector />

        {/* Stats */}
        <dl className="flex items-center gap-8 text-center pt-2">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <dt className="text-xs text-gray-400 font-medium mb-0.5">{label}</dt>
              <dd className="text-xl font-bold text-gray-100">{value}</dd>
            </div>
          ))}
        </dl>

        {/* Activity ticker */}
        <ActivityTicker />

        <ScrollHint />
      </section>

      {/* ══════════════════════════════════
          CREATOR SHOWCASE
      ══════════════════════════════════ */}
      <section
        id="showcase"
        aria-label="Creator network"
        className="relative z-10 pb-20 pt-8"
      >
        {/* Fade edges — decorative */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-gray-950 to-transparent z-10" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-gray-950 to-transparent z-10" aria-hidden="true" />

        <div className="text-center mb-6 px-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-1">Creator network</p>
          <h2 className="text-xl font-bold text-gray-100">India&apos;s top creators, all in one place</h2>
          <p className="text-xs text-gray-400 mt-1">Fitness · Tech · Food · Beauty · Travel · Finance · Gaming · and more</p>
        </div>

        <CreatorMarquee />

        <div className="text-center mt-8">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-indigo-600/20"
          >
            Browse Live Deals
          </Link>
        </div>
      </section>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-gray-900/60 px-5 py-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
        <Link href="/terms"   className="text-xs text-gray-400 hover:text-gray-100 transition-colors py-2 px-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded">Terms</Link>
        <Link href="/privacy" className="text-xs text-gray-400 hover:text-gray-100 transition-colors py-2 px-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded">Privacy</Link>
        <Link href="/help"    className="text-xs text-gray-400 hover:text-gray-100 transition-colors py-2 px-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded">Help</Link>
        <a href="https://wa.me/918428601947" target="_blank" rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-[#25D366] transition-colors py-2 px-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded">
          WhatsApp
        </a>
      </footer>
    </div>
  )
}
