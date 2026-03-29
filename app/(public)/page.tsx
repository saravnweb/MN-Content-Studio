import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import DealsFilters from '@/components/DealsFilters'
import PublicDealCard from '@/components/PublicDealCard'
import Footer from '@/components/Footer'
import AuthButton from '@/components/AuthButton'
import GoogleOneTap from '@/components/GoogleOneTap'
import ThemeToggle from '@/components/ThemeToggle'
import NotificationBell from '@/components/NotificationBell'
import { GuestHamburger, GuestBottomNav } from '@/components/GuestMenu'

export const revalidate = 60

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
        <div className="flex items-center">
          <GuestHamburger isGuest={!user} />
          <span className="font-bold text-base tracking-tight text-gray-100">MW Content Studio</span>
        </div>
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

      <main className="max-w-xl mx-auto px-4 pb-24">
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
          {!user && (
            <div className="mt-6">
              <AuthButton
                label="Sign Up as Creator"
                className="mx-auto bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
                showIcon={false}
              />
              <p className="text-xs text-gray-500 mt-2">Free to join · No subscription</p>
              <a
                href="https://wa.me/918428601947"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#25D366] hover:text-[#1ebe5d] mt-3 transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Prefer WhatsApp? Chat with us
              </a>
            </div>
          )}
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
            
            <h2 className="font-bold text-xl text-gray-100">Ready to claim your next deal?</h2>
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
