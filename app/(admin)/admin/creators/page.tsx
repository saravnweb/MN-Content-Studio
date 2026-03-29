import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

function formatFollowers(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`
  return n.toString()
}

function getInitials(name: string | null) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

const AVATAR_GRADIENTS = [
  'from-violet-500 to-purple-700',
  'from-blue-500 to-indigo-700',
  'from-emerald-500 to-teal-700',
  'from-rose-500 to-pink-700',
  'from-amber-500 to-orange-700',
  'from-cyan-500 to-sky-700',
]

export default async function CreatorsPage() {
  const supabase = createClient()
  const { data: creators } = await supabase
    .from('profiles')
    .select('id, full_name, phone, whatsapp, youtube_url, instagram_url, twitter_url, followers_count, niches, gender, age, created_at')
    .eq('role', 'creator')
    .order('created_at', { ascending: false })

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Creators</h2>
        <p className="text-gray-500 text-sm mt-0.5">
          <span className="text-indigo-400 font-semibold">{creators?.length ?? 0}</span> registered
        </p>
      </div>

      {!creators?.length ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4 text-2xl">👤</div>
          <p className="text-gray-300 font-medium">No creators yet</p>
          <p className="text-gray-600 text-sm mt-1">Creators will appear here once they sign up</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {creators.map((c, i) => {
            const initials = getInitials(c.full_name)
            const gradient = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]
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
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-lg`}>
                    {initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-semibold text-sm truncate transition-colors ${hasName ? 'text-white group-hover:text-indigo-300' : 'text-gray-600 italic'}`}>
                        {c.full_name ?? 'No name provided'}
                      </p>
                      <p className="text-gray-600 text-[11px] shrink-0 mt-0.5">
                        {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </p>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {c.gender && (
                        <span className="text-[11px] text-gray-500 capitalize">{c.gender.replace('_', ' ')}</span>
                      )}
                      {c.age && c.gender && <span className="text-gray-700 text-[11px]">·</span>}
                      {c.age && (
                        <span className="text-[11px] text-gray-500">{c.age} yrs</span>
                      )}
                      {c.followers_count && (c.gender || c.age) && <span className="text-gray-700 text-[11px]">·</span>}
                      {c.followers_count && (
                        <span className="text-[11px] text-indigo-400 font-medium">
                          {formatFollowers(c.followers_count)} followers
                        </span>
                      )}
                      {!c.gender && !c.age && !c.followers_count && (
                        <span className="text-[11px] text-gray-700">Profile incomplete</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Social links */}
                {hasSocials && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {c.youtube_url && (
                      <span className="flex items-center gap-1 text-[11px] bg-red-500/10 text-red-400 px-2.5 py-0.5 rounded-full">
                        <span>▶</span> YouTube
                      </span>
                    )}
                    {c.instagram_url && (
                      <span className="flex items-center gap-1 text-[11px] bg-pink-500/10 text-pink-400 px-2.5 py-0.5 rounded-full">
                        <span>◈</span> Instagram
                      </span>
                    )}
                    {c.twitter_url && (
                      <span className="flex items-center gap-1 text-[11px] bg-sky-500/10 text-sky-400 px-2.5 py-0.5 rounded-full">
                        <span className="font-bold">𝕏</span> Twitter
                      </span>
                    )}
                  </div>
                )}

                {/* Bottom: Niches + Contact */}
                {(c.niches?.length > 0 || hasContact) && (
                  <div className={`flex items-end justify-between gap-2 flex-wrap ${hasSocials || (c.gender || c.age || c.followers_count) ? 'mt-3' : 'mt-3'}`}>
                    {/* Niches */}
                    {c.niches?.length > 0 ? (
                      <div className="flex gap-1 flex-wrap">
                        {c.niches.map((n: string) => (
                          <span key={n} className="text-[10px] bg-indigo-600/15 text-indigo-400 px-2 py-0.5 rounded-full capitalize border border-indigo-600/20">
                            {n}
                          </span>
                        ))}
                      </div>
                    ) : <div />}

                    {/* Contact */}
                    <div className="flex items-center gap-1.5 ml-auto">
                      {c.phone && (
                        <span className="flex items-center gap-1 text-[11px] text-gray-400 bg-gray-800 px-2.5 py-0.5 rounded-full">
                          <span className="text-[10px]">📞</span> {c.phone}
                        </span>
                      )}
                      {c.whatsapp && (
                        <span className="flex items-center gap-1 text-[11px] text-green-400 bg-green-500/10 px-2.5 py-0.5 rounded-full border border-green-500/20">
                          <span className="text-[10px]">💬</span> WA
                        </span>
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
