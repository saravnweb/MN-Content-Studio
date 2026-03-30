import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import DealsFilters from '@/components/DealsFilters'
import PublicDealCard from '@/components/PublicDealCard'
import Footer from '@/components/Footer'
import AuthButton from '@/components/AuthButton'
import ThemeToggle from '@/components/ThemeToggle'
import NotificationBell from '@/components/NotificationBell'
import { GuestHamburger, GuestBottomNav } from '@/components/GuestMenu'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import BrandLogo from '@/components/BrandLogo'

export const revalidate = 60

export const metadata = {
  title: 'Live Brand Campaigns — MN Content Studio',
  description: 'Browse active brand campaigns on MN Content Studio. Filter by niche, platform, and budget.',
}

interface SearchParams {
  tab?: string
  q?: string
  niches?: string
  platform?: string
  budget?: string
  budget_min?: string
  budget_max?: string
  sort?: string
}

export default async function ExplorePage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createClient()

  const query     = searchParams.q?.trim() ?? ''
  const niches    = searchParams.niches ? searchParams.niches.split(',').filter(Boolean) : []
  const platform  = searchParams.platform ?? ''
  const budgetMin = searchParams.budget_min ? parseInt(searchParams.budget_min) : null
  const budgetMax = searchParams.budget_max ? parseInt(searchParams.budget_max) : null
  const sort      = searchParams.sort ?? 'newest'

  const { data: { user } } = await supabase.auth.getUser()

  let role: string | null = null
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    role = profile?.role ?? null
  }
  const isCreator = role === 'creator'

  let campaignsQuery = supabase
    .from('campaigns')
    .select('id, title, brand_name, brand_logo_url, description, budget_min, budget_max, niches, platforms, deadline, slots_filled, slots_total, deliverables')
    .eq('status', 'active')

  if (query) {
    campaignsQuery = campaignsQuery.or(`title.ilike.%${query}%,brand_name.ilike.%${query}%,description.ilike.%${query}%`)
  }
  if (niches.length > 0) {
    campaignsQuery = campaignsQuery.overlaps('niches', niches)
  }
  if (platform) {
    campaignsQuery = campaignsQuery.contains('platforms', [platform])
  }
  if (budgetMin !== null) {
    campaignsQuery = campaignsQuery.or(`budget_max.gte.${budgetMin},budget_max.is.null`)
  }
  if (budgetMax !== null) {
    campaignsQuery = campaignsQuery.lte('budget_min', budgetMax)
  }

  switch (sort) {
    case 'budget_high':
      campaignsQuery = campaignsQuery.order('budget_max', { ascending: false, nullsFirst: false })
      break
    case 'deadline':
      campaignsQuery = campaignsQuery.order('deadline', { ascending: true, nullsFirst: false })
      break
    case 'slots':
      campaignsQuery = campaignsQuery.order('slots_total', { ascending: false })
      break
    default:
      campaignsQuery = campaignsQuery.order('created_at', { ascending: false })
  }

  let bookmarkCount = 0
  let bookmarkSet = new Set<string>()
  if (isCreator && user) {
    const { data: bookmarks } = await supabase.from('bookmarks').select('campaign_id').eq('creator_id', user.id)
    bookmarkCount = bookmarks?.length ?? 0
    bookmarkSet = new Set(bookmarks?.map(b => b.campaign_id) ?? [])
  }

  const [{ data: campaigns }, { data: brands }, { count: totalActive }] = await Promise.all([
    campaignsQuery,
    supabase.from('brands').select('name, logo_url'),
    supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('status', 'active'),
  ])

  const brandLogoMap = new Map((brands ?? []).map((b) => [b.name.toLowerCase(), b.logo_url]))

  const list = (campaigns ?? []).map((c) => ({
    ...c,
    brand_logo_url: c.brand_logo_url || brandLogoMap.get(c.brand_name.toLowerCase()) || null,
  }))
  const hasActiveFilters = !!(query || niches.length || platform || budgetMin || budgetMax)

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <GuestHamburger isGuest={!user} />
          <BrandLogo withLink={true} size={28} textClassName="font-bold text-base tracking-tight text-gray-100 transition-colors" />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isCreator && user ? (
            <NotificationBell userId={user.id} href="/notifications" />
          ) : !user ? (
            <AuthButton
              label="Join Free"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-1.5 rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
              showIcon={false}
            />
          ) : null}
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pb-24">
        <div className="pt-8 pb-5">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-4">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to home
          </Link>
          <h1 className="text-2xl font-bold text-gray-100">Browse Live Deals</h1>
          <p className="text-sm text-gray-400 mt-1">Real campaigns from Tamil Nadu brands, updated continuously.</p>
        </div>

        <Suspense fallback={<FilterSkeleton />}>
          <DealsFilters
            totalCount={totalActive ?? 0}
            filteredCount={list.length}
            bookmarkCount={bookmarkCount}
            hideTabs={true}
          />
        </Suspense>

        {list.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 flex flex-col items-center text-center mt-2">
            {hasActiveFilters ? (
              <>
                <p className="text-2xl mb-3">🔍</p>
                <p className="font-medium text-gray-100">No deals match your filters</p>
                <p className="text-sm mt-1 text-gray-400">Try adjusting your search or clearing some filters</p>
              </>
            ) : (
              <>
                <p className="text-2xl mb-3">📭</p>
                <p className="font-medium text-gray-100">No live deals right now</p>
                <p className="text-sm mt-1 text-gray-400">Join our network to be notified when new campaigns launch</p>
                <AuthButton
                  label="Join Now"
                  className="mt-5 inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
                  showIcon={false}
                />
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((c) => (
              <PublicDealCard key={c.id} campaign={c as any} isCreator={isCreator} />
            ))}
          </div>
        )}

        {list.length > 0 && !user && (
          <div className="mt-8 bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
            <h2 className="font-bold text-xl text-gray-100">Ready to claim your next deal?</h2>
            <p className="text-sm mt-2 mb-6 text-gray-400 max-w-xs mx-auto">
              Join Tamil Nadu creators landing orders from top brands today.
            </p>
            <AuthButton
              label="Get Started Now"
              className="inline-block px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-600/25"
              showIcon={false}
            />
          </div>
        )}
      </main>

      <Footer />
      <GuestBottomNav isGuest={!user} />
    </div>
  )
}

function FilterSkeleton() {
  return (
    <div className="flex gap-2 mb-4 items-center animate-pulse">
      <div className="flex-1 h-10 rounded-xl bg-gray-900 border border-gray-800" />
      <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800" />
    </div>
  )
}
