import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import DealCard from '@/components/DealCard'
import DealsFilters from '@/components/DealsFilters'
import { Bookmark, Search, Inbox } from 'lucide-react'

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

export default async function DealsPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // ── Parse filters ──────────────────────────────────────────────
  const tab       = searchParams.tab === 'saved' ? 'saved' : 'all'
  const query     = searchParams.q?.trim() ?? ''
  const niches    = searchParams.niches ? searchParams.niches.split(',').filter(Boolean) : []
  const platform  = searchParams.platform ?? ''
  const budgetMin = searchParams.budget_min ? parseInt(searchParams.budget_min) : null
  const budgetMax = searchParams.budget_max ? parseInt(searchParams.budget_max) : null
  const sort      = searchParams.sort ?? 'newest'

  // ── Base query ─────────────────────────────────────────────────
  // RLS policies will automatically filter based on visibility and user's niches
  let campaignsQuery = supabase
    .from('campaigns')
    .select('id, title, brand_name, brand_logo_url, description, budget_min, budget_max, niches, platforms, deadline, slots_filled, slots_total, deliverables, visibility, visible_to')
    .eq('status', 'active')

  // Search across title, brand_name, description
  if (query) {
    campaignsQuery = campaignsQuery.or(
      `title.ilike.%${query}%,brand_name.ilike.%${query}%,description.ilike.%${query}%`
    )
  }

  // Niche filter — campaign must contain at least one selected niche
  if (niches.length > 0) {
    campaignsQuery = campaignsQuery.overlaps('niches', niches)
  }

  // Platform filter — campaign must contain the platform
  if (platform) {
    campaignsQuery = campaignsQuery.contains('platforms', [platform])
  }

  // Budget filters — show campaigns whose range overlaps the filter range
  if (budgetMin !== null) {
    // campaign's budget_max >= filter budgetMin  (or no budget_max set)
    campaignsQuery = campaignsQuery.or(`budget_max.gte.${budgetMin},budget_max.is.null`)
  }
  if (budgetMax !== null) {
    // campaign's budget_min <= filter budgetMax
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
      // can't sort on computed (slots_total - slots_filled) directly, sort by slots_total proxy
      campaignsQuery = campaignsQuery.order('slots_total', { ascending: false })
      break
    default: // newest
      campaignsQuery = campaignsQuery.order('created_at', { ascending: false })
  }

  const [{ data: campaigns }, { data: myApps }, { data: brands }, { data: bookmarks }, { count: totalActive }] =
    await Promise.all([
      campaignsQuery,
      supabase.from('applications').select('campaign_id, status').eq('creator_id', user!.id),
      supabase.from('brands').select('name, logo_url'),
      supabase.from('bookmarks').select('campaign_id').eq('creator_id', user!.id),
      supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    ])

  const appliedMap = new Map(myApps?.map((a) => [a.campaign_id, a.status]) ?? [])
  const brandLogoMap = new Map((brands ?? []).map((b) => [b.name.toLowerCase(), b.logo_url]))
  const bookmarkSet = new Set(bookmarks?.map((b) => b.campaign_id) ?? [])

  const enriched = (campaigns ?? []).map((c) => ({
    ...c,
    brand_logo_url: c.brand_logo_url ?? brandLogoMap.get(c.brand_name.toLowerCase()) ?? null,
  }))

  // Apply saved tab filter (client-side since bookmarks are separate)
  const displayed = tab === 'saved'
    ? enriched.filter((c) => bookmarkSet.has(c.id))
    : enriched

  const hasActiveFilters = !!(query || niches.length || platform || budgetMin || budgetMax)

  return (
    <div className="bg-gray-950 min-h-screen">
      <div className="pt-8 pb-6 text-center text-gray-50">
        <div className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-4 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Curated Just for You
        </div>
        <h1 className="text-3xl font-bold leading-tight text-gray-100">
          Your niche,<br />
          <span className="text-indigo-500">your deals</span>
        </h1>
        <p className="text-sm mt-3 leading-relaxed text-gray-400">
          We&apos;ve carefully selected brand partnerships that match your interests and audience. No noise, only relevant opportunities.
        </p>
      </div>

      {/* Filter bar (client component) */}
      <Suspense fallback={<FilterSkeleton />}>
        <DealsFilters
          totalCount={totalActive ?? 0}
          filteredCount={displayed.length}
          bookmarkCount={bookmarkSet.size}
          hideTabs={true}
        />
      </Suspense>

      {/* Results */}
      {!displayed.length ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center mt-2">
          {tab === 'saved' ? (
            <>
              <Bookmark className="w-8 h-8 mx-auto mb-3 text-gray-400" />
              <p className="font-medium text-gray-100">No saved deals yet</p>
              <p className="text-sm mt-1 text-gray-400">Tap the bookmark icon on any deal to save it</p>
            </>
          ) : hasActiveFilters ? (
            <>
              <Search className="w-8 h-8 mx-auto mb-3 text-gray-400" />
              <p className="font-medium text-gray-100">No deals match your filters</p>
              <p className="text-sm mt-1 text-gray-400">Try adjusting your search or clearing some filters</p>
            </>
          ) : (
            <>
              <Inbox className="w-8 h-8 mx-auto mb-3 text-gray-400" />
              <p className="font-medium text-gray-100">No deals right now</p>
              <p className="text-sm mt-1 text-gray-400">Check back soon — new campaigns are posted regularly</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((c) => (
            <DealCard key={c.id} campaign={c} status={appliedMap.get(c.id)} isBookmarked={bookmarkSet.has(c.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterSkeleton() {
  return (
    <div className="flex gap-2 mb-4 items-center animate-pulse">
      <div className="w-20 h-10 rounded-xl bg-gray-900 border border-gray-800" />
      <div className="flex-1 h-10 rounded-xl bg-gray-900 border border-gray-800" />
      <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800" />
    </div>
  )
}
