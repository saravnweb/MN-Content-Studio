'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect, useCallback, useTransition } from 'react'
import Link from 'next/link'

const NICHES = [
  'fitness', 'food', 'tech', 'fashion', 'travel', 'beauty',
  'gaming', 'finance', 'lifestyle', 'wellness', 'education', 'entertainment',
  'sports', 'parenting', 'automotive', 'home-decor',
]

const PLATFORMS = [
  { value: '', label: 'All' },
  { value: 'youtube', label: '▶ YouTube' },
  { value: 'instagram', label: '◈ Instagram' },
]

const BUDGET_PRESETS = [
  { label: 'Any', min: '', max: '' },
  { label: 'Under ₹10k', min: '', max: '10000' },
  { label: '₹10k–25k', min: '10000', max: '25000' },
  { label: '₹25k–50k', min: '25000', max: '50000' },
  { label: '₹50k+', min: '50000', max: '' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'budget_high', label: 'Highest budget' },
  { value: 'deadline', label: 'Deadline soon' },
  { value: 'slots', label: 'Most spots' },
]

interface DealsFiltersProps {
  totalCount: number
  filteredCount: number
  bookmarkCount: number
  hideTabs?: boolean
}

export default function DealsFilters({ totalCount, filteredCount, bookmarkCount, hideTabs }: DealsFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [showFilters, setShowFilters] = useState(false)

  // Local state — mirrors URL
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [selectedNiches, setSelectedNiches] = useState<string[]>(
    searchParams.get('niches') ? searchParams.get('niches')!.split(',') : []
  )
  const [platform, setPlatform] = useState(searchParams.get('platform') ?? '')
  const [budgetPreset, setBudgetPreset] = useState(searchParams.get('budget') ?? '')
  const [sort, setSort] = useState(searchParams.get('sort') ?? 'newest')
  const tab = searchParams.get('tab') ?? 'all'

  // Count active filters (excluding tab and sort)
  const activeFilterCount = [
    query.trim() !== '',
    selectedNiches.length > 0,
    platform !== '',
    budgetPreset !== '',
  ].filter(Boolean).length

  // Push to URL
  const pushParams = useCallback((overrides: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) params.set(k, v)
      else params.delete(k)
    })
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }, [searchParams, pathname, router])

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => pushParams({ q: query }), 350)
    return () => clearTimeout(t)
  }, [query]) // eslint-disable-line

  function toggleNiche(n: string) {
    const next = selectedNiches.includes(n)
      ? selectedNiches.filter((x) => x !== n)
      : [...selectedNiches, n]
    setSelectedNiches(next)
    pushParams({ niches: next.join(',') })
  }

  function setPlatformFilter(p: string) {
    setPlatform(p)
    pushParams({ platform: p })
  }

  function setBudget(preset: string) {
    setBudgetPreset(preset)
    const found = BUDGET_PRESETS.find((b) => b.label === preset)
    pushParams({
      budget: preset,
      budget_min: found?.min ?? '',
      budget_max: found?.max ?? '',
    })
  }

  function setSort2(s: string) {
    setSort(s)
    pushParams({ sort: s })
  }

  function clearAll() {
    setQuery('')
    setSelectedNiches([])
    setPlatform('')
    setBudgetPreset('')
    setSort('newest')
    startTransition(() => {
      router.replace(`${pathname}${tab !== 'all' ? '?tab=' + tab : ''}`, { scroll: false })
    })
  }

  return (
    <div>
      {/* ── Tab bar + search row ── */}
      <div className="flex gap-2 mb-4 items-center">
        {/* Tab switcher */}
        {!hideTabs && (
          <div className="flex gap-0.5 p-1 rounded-xl bg-gray-900 border border-gray-800 shrink-0" role="tablist" aria-label="Campaign view">
            <TabBtn label="All" active={tab === 'all'} href={buildHref(pathname, searchParams, 'tab', '')} />
            <TabBtn
              label={bookmarkCount > 0 ? `Saved (${bookmarkCount})` : 'Saved'}
              active={tab === 'saved'}
              href={buildHref(pathname, searchParams, 'tab', 'saved')}
            />
          </div>
        )}

        {/* Search */}
        <div className="relative flex-1">
          {/* Search icon — decorative */}
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400" aria-hidden="true">🔍</span>
          <label htmlFor="campaign-search" className="sr-only">Search campaigns</label>
          <input
            id="campaign-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search campaigns…"
            className="w-full pl-8 pr-3 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500/50 text-gray-100 transition-colors"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); pushParams({ q: '' }) }}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-1.5 py-0.5 rounded text-gray-400 hover:text-gray-100"
            >
              <span aria-hidden="true">✕</span>
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          aria-label={showFilters ? 'Close filters' : `Open filters${activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ''}`}
          aria-expanded={showFilters}
          aria-controls="filter-panel"
          className={`relative shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
            showFilters || activeFilterCount > 0
              ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
              : 'bg-gray-900 border-gray-800 text-gray-400'
          }`}>
          <span aria-hidden="true">⚙</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center bg-indigo-500" aria-hidden="true">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Filter panel ── */}
      {showFilters && (
        <div id="filter-panel" className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Platform */}
          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-wider mb-2 text-gray-400">Platform</legend>
            <div className="flex gap-2 flex-wrap">
              {PLATFORMS.map((p) => (
                <button key={p.value} onClick={() => setPlatformFilter(p.value)}
                  aria-pressed={platform === p.value}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    platform === p.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-gray-100'
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Budget */}
          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-wider mb-2 text-gray-400">Budget</legend>
            <div className="flex gap-2 flex-wrap">
              {BUDGET_PRESETS.map((b) => (
                <button key={b.label} onClick={() => setBudget(b.label === 'Any' ? '' : b.label)}
                  aria-pressed={budgetPreset === (b.label === 'Any' ? '' : b.label)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    budgetPreset === (b.label === 'Any' ? '' : b.label)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-gray-100'
                  }`}>
                  {b.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Niches */}
          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-wider mb-2 text-gray-400">Niches</legend>
            <div className="flex flex-wrap gap-1.5">
              {NICHES.map((n) => (
                <button key={n} onClick={() => toggleNiche(n)}
                  aria-pressed={selectedNiches.includes(n)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                    selectedNiches.includes(n)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-gray-100'
                  }`}>
                  {n}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Sort */}
          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-wider mb-2 text-gray-400">Sort by</legend>
            <div className="flex gap-2 flex-wrap">
              {SORT_OPTIONS.map((s) => (
                <button key={s.value} onClick={() => setSort2(s.value)}
                  aria-pressed={sort === s.value}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    sort === s.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-gray-100'
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Clear */}
          {activeFilterCount > 0 && (
            <button onClick={clearAll}
              className="text-xs text-gray-400 hover:text-indigo-400 underline underline-offset-2 transition-colors">
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Active filter chips */}
      {activeFilterCount > 0 && !showFilters && (
        <div className="flex flex-wrap gap-2 mb-3" role="group" aria-label="Active filters">
          {query && <ActiveChip label={`"${query}"`} onRemove={() => { setQuery(''); pushParams({ q: '' }) }} removeLabel={`Remove search filter: ${query}`} />}
          {platform && <ActiveChip label={platform} onRemove={() => setPlatformFilter('')} removeLabel={`Remove platform filter: ${platform}`} />}
          {budgetPreset && <ActiveChip label={budgetPreset} onRemove={() => setBudget('')} removeLabel={`Remove budget filter: ${budgetPreset}`} />}
          {selectedNiches.map((n) => (
            <ActiveChip key={n} label={n} onRemove={() => toggleNiche(n)} removeLabel={`Remove niche filter: ${n}`} />
          ))}
        </div>
      )}

      {/* Results count + loading */}
      <div className="flex items-center justify-between mb-3 text-xs text-gray-400" role="status" aria-live="polite" aria-atomic="true">
        <p>
          {isPending ? 'Filtering…' : (
            activeFilterCount > 0 || query
              ? <>{filteredCount} of {totalCount} campaigns</>
              : <>{filteredCount} campaigns</>
          )}
        </p>
        {isPending && (
          <span className="animate-spin text-indigo-400" aria-hidden="true">↻</span>
        )}
      </div>
    </div>
  )
}

function TabBtn({ label, active, href }: { label: string; active: boolean; href: string }) {
  return (
    <Link href={href}
      role="tab"
      aria-selected={active}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
        active ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
      }`}>
      {label}
    </Link>
  )
}

function ActiveChip({ label, onRemove, removeLabel }: { label: string; onRemove: () => void; removeLabel: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
      {label}
      <button onClick={onRemove} aria-label={removeLabel} className="opacity-60 hover:opacity-100 leading-none">
        <span aria-hidden="true">✕</span>
      </button>
    </span>
  )
}

function buildHref(pathname: string, searchParams: URLSearchParams, key: string, value: string) {
  const params = new URLSearchParams(searchParams.toString())
  if (value) params.set(key, value)
  else params.delete(key)
  const str = params.toString()
  return str ? `${pathname}?${str}` : pathname
}
