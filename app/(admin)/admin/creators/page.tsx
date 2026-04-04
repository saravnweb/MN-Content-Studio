'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Video, Camera, X, Phone, MessageCircle, Users, Settings2, ChevronDown, Check } from 'lucide-react'

import { NICHES, NICHE_SET } from '@/lib/constants'

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Other/Private' },
]

const AGE_RANGES = [
  { label: 'Under 18', min: 13, max: 17 },
  { label: '18-24', min: 18, max: 24 },
  { label: '25-34', min: 25, max: 34 },
  { label: '35+', min: 35, max: 100 },
]

const FOLLOWERS_PRESETS = [
  { label: '10k+', value: 10_000 },
  { label: '50k+', value: 50_000 },
  { label: '100k+', value: 100_000 },
  { label: '500k+', value: 500_000 },
  { label: '1M+', value: 1_000_000 },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'followers_desc', label: 'Most followers' },
  { value: 'followers_asc', label: 'Least followers' },
  { value: 'oldest', label: 'Oldest first' },
]

function formatFollowers(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`
  return n.toString()
}

function getInitials(name: string | null) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

const PLATFORM_FILTERS = ['all', 'youtube', 'instagram'] as const
type PlatformFilter = typeof PLATFORM_FILTERS[number]

export default function CreatorsPage() {
  const [creators, setCreators] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Filters
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all')
  const [genderFilter, setGenderFilter] = useState<string>('all')
  const [ageRange, setAgeRange] = useState<string>('all')
  const [selectedNiches, setSelectedNiches] = useState<string[]>([])
  const [minFollowers, setMinFollowers] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<string>('newest')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('profiles')
      .select('*')
      .eq('role', 'creator')
      .order('created_at', { ascending: false })
      .then(async ({ data, error }) => {
        const { data: { user } } = await supabase.auth.getUser()
        console.log('User:', user?.id, 'Creators found length:', data?.length)
        if (error) {
          console.error('Error fetching creators:', error)
          setError(error.message)
          setCreators([])
        } else if (data) {
          setCreators(data)
          setError(null)
        }
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    let result = [...creators]

    // 1. Platform
    if (platformFilter === 'youtube') result = result.filter((c) => !!c.youtube_url)
    if (platformFilter === 'instagram') result = result.filter((c) => !!c.instagram_url)

    // 2. Gender
    if (genderFilter !== 'all') result = result.filter((c) => c.gender === genderFilter)

    // 3. Age
    if (ageRange !== 'all') {
      const range = AGE_RANGES.find(r => r.label === ageRange)
      if (range) {
        result = result.filter((c) => c.age >= range.min && c.age <= range.max)
      }
    }

    // 4. Niches (OR logic: results match ANY of selected niches)
    if (selectedNiches.length > 0) {
      result = result.filter((c) => 
        c.niches?.some((n: string) => selectedNiches.includes(n))
      )
    }

    // 5. Followers
    if (minFollowers !== null) {
      result = result.filter((c) => (c.followers_count ?? 0) >= minFollowers)
    }

    // 6. Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((c) =>
        (c.full_name ?? '').toLowerCase().includes(q) ||
        (c.username ?? '').toLowerCase().includes(q)
      )
    }

    // 7. Sort
    result.sort((a, b) => {
      if (sortBy === 'followers_desc') return (b.followers_count ?? 0) - (a.followers_count ?? 0)
      if (sortBy === 'followers_asc') return (a.followers_count ?? 0) - (b.followers_count ?? 0)
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      // Default: newest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return result
  }, [creators, search, platformFilter, genderFilter, ageRange, selectedNiches, minFollowers, sortBy])

  const activeFilterCount = [
    platformFilter !== 'all',
    genderFilter !== 'all',
    ageRange !== 'all',
    selectedNiches.length > 0,
    minFollowers !== null,
  ].filter(Boolean).length

  function toggleNiche(n: string) {
    setSelectedNiches(prev => 
      prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]
    )
  }

  function clearAll() {
    setPlatformFilter('all')
    setGenderFilter('all')
    setAgeRange('all')
    setSelectedNiches([])
    setMinFollowers(null)
    setSortBy('newest')
  }

  if (loading) return <p className="text-gray-400 text-sm">Loading…</p>

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-100">Creators</h2>
        <p className="text-gray-400 text-sm mt-0.5">
          {activeFilterCount > 0 || search ? (
            <><span className="text-gray-100 font-semibold">{filtered.length}</span> of <span className="text-gray-100">{creators.length}</span> registered</>
          ) : (
            <><span className="text-gray-100 font-semibold">{creators.length}</span> registered</>
          )}
        </p>
      </div>

      {/* Search + filter toggle */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or username…"
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            showFilters || activeFilterCount > 0
              ? 'bg-blue-500/10 border-blue-500 text-blue-400'
              : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-300'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-blue-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Platform */}
            <FilterSection label="Platform">
              <div className="flex gap-2">
                {PLATFORM_FILTERS.map(f => (
                  <FilterBtn key={f} active={platformFilter === f} onClick={() => setPlatformFilter(f)} label={f} capitalize />
                ))}
              </div>
            </FilterSection>

            {/* Gender */}
            <FilterSection label="Gender">
              <div className="flex flex-wrap gap-2">
                <FilterBtn active={genderFilter === 'all'} onClick={() => setGenderFilter('all')} label="All" />
                {GENDERS.map(g => (
                  <FilterBtn key={g.value} active={genderFilter === g.value} onClick={() => setGenderFilter(g.value)} label={g.label} />
                ))}
              </div>
            </FilterSection>

            {/* Age Range */}
            <FilterSection label="Age Range">
              <div className="flex flex-wrap gap-2">
                <FilterBtn active={ageRange === 'all'} onClick={() => setAgeRange('all')} label="All" />
                {AGE_RANGES.map(r => (
                  <FilterBtn key={r.label} active={ageRange === r.label} onClick={() => setAgeRange(r.label)} label={r.label} />
                ))}
              </div>
            </FilterSection>

            {/* Followers */}
            <FilterSection label="Followers">
              <div className="flex flex-wrap gap-2">
                <FilterBtn active={minFollowers === null} onClick={() => setMinFollowers(null)} label="Any" />
                {FOLLOWERS_PRESETS.map(p => (
                  <FilterBtn key={p.value} active={minFollowers === p.value} onClick={() => setMinFollowers(p.value)} label={p.label} />
                ))}
              </div>
            </FilterSection>

            {/* Sort By */}
            <FilterSection label="Sort By" id="sort-by">
              <select 
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-gray-500 transition-colors appearance-none cursor-pointer"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </FilterSection>
          </div>

          {/* Niches */}
          <FilterSection label="Niches">
            <div className="flex flex-wrap gap-1.5">
              {NICHES.map(n => (
                <button
                  key={n}
                  onClick={() => toggleNiche(n)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all border ${
                    selectedNiches.includes(n)
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </FilterSection>

          <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
            <p className="text-[11px] text-gray-500">Showing {filtered.length} creators</p>
            <button onClick={clearAll} className="text-xs text-gray-400 hover:text-blue-400 transition-colors">
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Active Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {platformFilter !== 'all' && <FilterChip label={`Platform: ${platformFilter}`} onRemove={() => setPlatformFilter('all')} />}
          {genderFilter !== 'all' && <FilterChip label={`Gender: ${GENDERS.find(g => g.value === genderFilter)?.label || genderFilter}`} onRemove={() => setGenderFilter('all')} />}
          {ageRange !== 'all' && <FilterChip label={`Age: ${ageRange}`} onRemove={() => setAgeRange('all')} />}
          {minFollowers !== null && <FilterChip label={`Followers: ${FOLLOWERS_PRESETS.find(p => p.value === minFollowers)?.label || minFollowers}`} onRemove={() => setMinFollowers(null)} />}
          {selectedNiches.map(n => (
            <FilterChip key={n} label={n} onRemove={() => toggleNiche(n)} />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
          <p className="text-red-400 text-sm font-semibold">Error loading creators:</p>
          <p className="text-red-300 text-xs mt-1">{error}</p>
        </div>
      )}

      {!creators.length && !loading ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-gray-600" />
          </div>
          <p className="text-gray-300 font-medium">No creators yet</p>
          <p className="text-gray-400 text-sm mt-1">Creators will appear here once they sign up</p>
        </div>
      ) : !filtered.length ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
          <p className="text-gray-400 text-sm">No creators match your search</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((c) => {
            const initials = getInitials(c.full_name)
            const hasSocials = c.youtube_url || c.instagram_url || c.twitter_url
            const hasContact = c.phone || c.whatsapp
            const hasName = !!c.full_name

            return (
              <Link
                key={c.id}
                href={`/admin/creators/${c.id}`}
                className="block bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-gray-700 hover:bg-[#111118] transition-all group"
              >
                {/* Top: Avatar + Info + Date */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gray-700 flex items-center justify-center text-gray-200 text-sm font-bold shrink-0">
                    {initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-semibold text-sm truncate transition-colors ${hasName ? 'text-gray-100 group-hover:text-gray-100' : 'text-gray-400 italic'}`}>
                        {c.full_name ?? 'No name provided'}
                      </p>
                      <p className="text-gray-400 text-[11px] shrink-0 mt-0.5">
                        {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </p>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {c.gender && (
                        <span className="text-[11px] text-gray-400 capitalize">{c.gender.replace('_', ' ')}</span>
                      )}
                      {c.age && c.gender && <span className="text-gray-400 text-[11px]">·</span>}
                      {c.age && (
                        <span className="text-[11px] text-gray-400">{c.age} yrs</span>
                      )}
                      {c.followers_count && (c.gender || c.age) && <span className="text-gray-400 text-[11px]">·</span>}
                      {c.followers_count && (
                        <span className="text-[11px] text-gray-200 font-medium">
                          {formatFollowers(c.followers_count)} followers
                        </span>
                      )}
                      {!c.gender && !c.age && !c.followers_count && (
                        <span className="text-[11px] text-gray-400">Profile incomplete</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Social links */}
                {hasSocials && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {c.youtube_url && (
                      <span className="flex items-center gap-1 text-[11px] bg-gray-800 text-gray-300 px-2.5 py-0.5 rounded-full">
                        <Video className="w-3 h-3" /> YouTube
                      </span>
                    )}
                    {c.instagram_url && (
                      <span className="flex items-center gap-1 text-[11px] bg-gray-800 text-gray-300 px-2.5 py-0.5 rounded-full">
                        <Camera className="w-3 h-3" /> Instagram
                      </span>
                    )}
                    {c.twitter_url && (
                      <span className="flex items-center gap-1 text-[11px] bg-gray-800 text-gray-300 px-2.5 py-0.5 rounded-full">
                        <X className="w-3 h-3" /> Twitter
                      </span>
                    )}
                  </div>
                )}

                {/* Bottom: Niches + Contact */}
                {(c.niches?.length > 0 || hasContact) && (
                  <div className="flex items-end justify-between gap-2 flex-wrap mt-3">
                    {/* Niches */}
                    {c.niches?.length > 0 ? (
                      <div className="flex gap-1 flex-wrap">
                        {c.niches.filter((n: string) => NICHE_SET.has(n as any)).map((n: string) => (
                          <span key={n} className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full capitalize border border-gray-700">
                            {n}
                          </span>
                        ))}
                      </div>
                    ) : <div />}

                    {/* Contact */}
                    <div className="flex items-center gap-1.5 ml-auto relative z-10">
                      {c.phone && (
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.location.href = `tel:${c.phone}`;
                          }}
                          className="flex items-center gap-1 text-[11px] text-gray-400 bg-gray-800 hover:bg-gray-700 hover:text-gray-100 px-2.5 py-0.5 rounded-full transition-colors cursor-pointer"
                        >
                          <Phone className="w-3 h-3" /> {c.phone}
                        </button>
                      )}
                      {c.whatsapp && (
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(`https://wa.me/${c.whatsapp.replace(/\D/g, '')}`, '_blank');
                          }}
                          className="flex items-center gap-1 text-[11px] text-gray-400 bg-gray-800 hover:bg-green-500/20 hover:text-green-400 px-2.5 py-0.5 rounded-full transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-3 h-3" /> WA
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function FilterSection({ id, label, children }: { id?: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <label htmlFor={id} className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

function FilterBtn({ active, onClick, label, capitalize }: { active: boolean; onClick: () => void; label: string; capitalize?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all border ${
        active
          ? 'bg-blue-600 border-blue-500 text-white'
          : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200'
      } ${capitalize ? 'capitalize' : ''}`}
    >
      {label}
    </button>
  )
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1.5 pl-3 pr-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[11px] text-blue-400 capitalize">
      {label}
      <button onClick={onRemove} className="hover:text-blue-200 p-0.5">
        <X className="w-3 h-3" />
      </button>
    </span>
  )
}
