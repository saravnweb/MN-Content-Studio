import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import DealsFilters from '@/components/DealsFilters'
import PublicDealCard from '@/components/PublicDealCard'
import Footer from '@/components/Footer'
import AuthButton from '@/components/AuthButton'
import GoogleOneTap from '@/components/GoogleOneTap'
import ThemeToggle from '@/components/ThemeToggle'
import NotificationBell from '@/components/NotificationBell'

export const revalidate = 0

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

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createClient()

  // ── Parse filters ──────────────────────────────────────────────
  const query     = searchParams.q?.trim() ?? ''
  const niches    = searchParams.niches ? searchParams.niches.split(',').filter(Boolean) : []
  const platform  = searchParams.platform ?? ''
  const budgetMin = searchParams.budget_min ? parseInt(searchParams.budget_min) : null
  const budgetMax = searchParams.budget_max ? parseInt(searchParams.budget_max) : null
  const sort      = searchParams.sort ?? 'newest'

  // ── Roles & Auth ─────────────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser()
  
  let role: string | null = null
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    role = profile?.role ?? null
  }
  const isCreator = role === 'creator'

  // ── Base query ─────────────────────────────────────────────────
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

  // Sort
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
    default: // newest
      campaignsQuery = campaignsQuery.order('created_at', { ascending: false })
  }

  // Bookmarks (only for logged in creators)
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
      {!user && <GoogleOneTap />}
      <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-base tracking-tight text-gray-100">MW Content Studio</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isCreator && user ? (
            <NotificationBell userId={user.id} href="/notifications" />
          ) : !user ? (
            <AuthButton 
              label="Get Started"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-1.5 rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
              showIcon={false}
            />
          ) : null}
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pb-16">
        <div className="pt-10 pb-8 text-center text-gray-50">
          <div className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-4 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            India&apos;s Creator Fulfillment Network
          </div>
          <h1 className="text-3xl font-bold leading-tight text-gray-100">
            Brand orders,<br />
            <span className="text-indigo-500">delivered to you</span>
          </h1>
          <p className="text-sm mt-3 leading-relaxed text-gray-400">
            Browse live orders from top brands. Get started to claim your next deal.
          </p>
        </div>

        {/* Filter bar (client component) */}
        <Suspense fallback={<FilterSkeleton />}>
          <DealsFilters
            totalCount={totalActive ?? 0}
            filteredCount={list.length}
            bookmarkCount={bookmarkCount}
            hideTabs={true}
          />
        </Suspense>

        {/* Main Feed */}
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

        {/* Bottom CTA */}
        {list.length > 0 && !user && (
          <div className="mt-8 bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
            
            <h3 className="font-bold text-xl text-gray-100">Ready to claim your next deal?</h3>
            <p className="text-sm mt-2 mb-6 text-gray-400 max-w-xs mx-auto">
              Join Indian creators landing orders from top brands today.
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
