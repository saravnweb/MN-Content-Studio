import { createClient, createAdminClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'

import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import RoleSelector from '@/components/landing/RoleSelector'
import ActivityTicker from '@/components/landing/ActivityTicker'
import ScrollHint from '@/components/landing/ScrollHint'
import CreatorMarquee from '@/components/landing/CreatorMarquee'
import CreatorVideoGrid, { FeaturedVideo } from '@/components/landing/CreatorVideoGrid'
import BrandLogo from '@/components/BrandLogo'



export const metadata = {
  title: "Tamil Nadu's Top Creator Network",
  description: "Connecting Tamil Nadu's elite creators with visionary brands. Join MW Content Studio for exclusive brand orders, professional partnerships, and premium creative opportunities.",
  alternates: {
    canonical: '/',
  },
}

const STATS = [
  { value: '246',   label: 'Creators' },
  { value: '16',    label: 'Niches' },
  { value: '100%',  label: 'Verified Brands' },
]

export const revalidate = 3600 // Cache for 1 hour

// Cached function to fetch admin-curated showcase videos
const getFeaturedVideos = unstable_cache(
  async (): Promise<FeaturedVideo[]> => {
    const adminSupabase = createAdminClient()
    const { data } = await adminSupabase
      .from('showcase_videos')
      .select('id, video_url, file_url, creator_name, niche, brand_name, platform')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (!data) return []

    return data.map((row: any) => {
      const name: string = row.creator_name ?? 'Creator'
      const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
      return {
        id: row.id,
        video_url: row.video_url ?? null,
        file_url: row.file_url ?? null,
        platform: row.platform ?? (row.video_url?.includes('youtube.com') || row.video_url?.includes('youtu.be') ? 'youtube' : 'instagram'),
        creator_name: name,
        creator_niche: row.niche ?? null,
        brand_name: row.brand_name ?? '',
        avatar_initials: initials,
      }
    })
  },
  ['featured-videos'],
  { revalidate: 3600, tags: ['featured-videos'] }
)

// Cached function to get campaign count to avoid database hits on every request
const getLiveCampaignCount = unstable_cache(
  async () => {
    const adminSupabase = createAdminClient()
    const { count } = await adminSupabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
    return count ?? 0
  },
  ['live-campaign-count'],
  { revalidate: 3600, tags: ['campaigns'] }
)

export default async function LandingPage() {
  const [liveCount, featuredVideos] = await Promise.all([
    getLiveCampaignCount(),
    getFeaturedVideos(),
  ])


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
          <span className="text-sm text-gray-400 font-medium tracking-tight">
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
          <p className="text-sm sm:text-lg text-gray-400 leading-relaxed max-w-xl mx-auto font-medium px-4">
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
              <dt className="text-xs text-gray-400 font-medium order-last tracking-[0.05em] uppercase">{label}</dt>
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
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-400 mb-2">Creator network</p>
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

      {/* ══════════════════════════════════
          CREATOR VIDEO SHOWCASE
      ══════════════════════════════════ */}
      {featuredVideos.length > 0 && (
        <section aria-label="Creator work showcase" className="relative z-10 py-12 px-5 max-w-5xl mx-auto">
          <CreatorVideoGrid videos={featuredVideos} />
          
          <div className="mt-8 text-center">
            <Link 
              href="/showcase" 
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors group"
            >
              View all creator videos
              <svg 
                className="w-4 h-4 transition-transform group-hover:translate-x-0.5" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </section>
      )}
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
