import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import RoleSelector from '@/components/landing/RoleSelector'
import ActivityTicker from '@/components/landing/ActivityTicker'
import ScrollHint from '@/components/landing/ScrollHint'
import CreatorMarquee from '@/components/landing/CreatorMarquee'
import BrandLogo from '@/components/BrandLogo'


export const metadata = {
  title: "MN Content Studio — Crafting Creative Legacies",
  description: "The premier network for Tamil Nadu's elite creators and visionary brands. Join a community dedicated to professional excellence and distinguished creative partnerships.",
}

const STATS = [
  { value: '246',   label: 'Creators' },
  { value: '16',    label: 'Niches' },
  { value: '100%',  label: 'Verified Brands' },
]

export default async function LandingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()



  const { count: liveCount } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  return (
    <div className="bg-gray-950 text-gray-100 relative overflow-x-hidden">


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
      <header className="sticky top-0 z-30 bg-gray-950/90 backdrop-blur-md border-b border-gray-800 px-5 py-3 flex items-center justify-between">
        <BrandLogo />
        <div className="flex items-center gap-3">
          <Link href="/explore" className="text-sm text-gray-400 hover:text-gray-100 transition-colors hidden sm:block">
            Browse Deals
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* ══════════════════════════════════
          HERO  — targets one viewport tall
      ══════════════════════════════════ */}
      <main id="main-content">
      <section aria-label="Hero" className="relative z-10 min-h-[calc(100svh-52px)] flex flex-col items-center justify-center px-5 pt-6 pb-14 sm:pt-10 sm:pb-20 gap-3 sm:gap-6">

        {/* Live pill */}
        <div
          className="flex items-center gap-2 bg-gray-900/90 border border-gray-800 rounded-full px-3.5 py-1.5 backdrop-blur-sm shadow-sm"
          aria-live="polite"
          aria-atomic="true"
        >
          {/* Animated pulse dot — decorative */}
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-sm text-gray-500 font-medium tracking-tight">
            {(liveCount ?? 0) > 0
              ? <><span className="text-emerald-600 dark:text-emerald-400 font-bold">{liveCount}</span> live campaigns right now</>
              : <>New campaigns dropping soon</>}
          </span>
        </div>

        {/* Headline */}
        <div className="text-center max-w-2xl mb-2 sm:mb-6">
          <h1 className="text-4xl sm:text-7xl font-bold tracking-tight leading-[1.02] mb-4 sm:mb-10">
            <span className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent drop-shadow-sm">
              Crafting Legacies
            </span>
            <br />
            <span className="text-gray-100">through Excellence.</span>
          </h1>
          <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl mx-auto font-medium px-4">
            The premier network connecting distinguished creators with iconic brands. 
            Built for those who value artistry and the pursuit of a lasting legacy.
          </p>
        </div>

        {/* Role cards */}
        <RoleSelector />

        {/* Stats */}
        <dl className="flex items-center gap-6 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <dt className="text-xs text-gray-500 font-medium order-last tracking-[0.05em] uppercase">{label}</dt>
              <dd className="text-base sm:text-lg font-bold text-gray-100">{value}</dd>
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
      <section aria-label="Creator network" className="relative z-10 pb-16 pt-4">
        {/* Fade edges — decorative */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-gray-950 to-transparent z-10" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-gray-950 to-transparent z-10" aria-hidden="true" />

        <div className="text-center mb-6 px-5">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-2">Creator network</p>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-100">Tamil Nadu&apos;s top creators, all in one place</h2>
          <p className="text-sm text-gray-400 mt-1.5">Fitness · Tech · Food · Beauty · Travel · Finance · Gaming · and more</p>
        </div>

        <CreatorMarquee />

        <div className="text-center mt-10">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl text-base transition-all hover:scale-[1.02] shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
          >
            Browse Live Deals
          </Link>
        </div>
      </section>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-gray-900/60 px-5 py-4 flex items-center justify-center gap-5">
        <Link href="/terms"   className="text-xs text-gray-400 hover:text-gray-200 transition-colors">Terms</Link>
        <Link href="/privacy" className="text-xs text-gray-400 hover:text-gray-200 transition-colors">Privacy</Link>
        <Link href="/help"    className="text-xs text-gray-400 hover:text-gray-200 transition-colors">Help</Link>
        <a href="https://wa.me/918428601947" target="_blank" rel="noopener noreferrer"
          className="text-xs text-[#25D366] hover:brightness-110 transition-all">
          WhatsApp
        </a>
      </footer>
    </div>
  )
}
