const NICHE_COLORS: Record<string, string> = {
  Tech:      'bg-blue-500/15 text-blue-400 border-blue-500/20',
  Fitness:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  Food:      'bg-amber-500/15 text-amber-400 border-amber-500/20',
  Finance:   'bg-violet-500/15 text-violet-400 border-violet-500/20',
  Beauty:    'bg-rose-500/15 text-rose-400 border-rose-500/20',
  Travel:    'bg-sky-500/15 text-sky-400 border-sky-500/20',
  Lifestyle: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  Gaming:    'bg-purple-500/15 text-purple-400 border-purple-500/20',
  Fashion:   'bg-pink-500/15 text-pink-400 border-pink-500/20',
  Health:    'bg-teal-500/15 text-teal-400 border-teal-500/20',
  Education: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  Sports:    'bg-lime-500/15 text-lime-400 border-lime-500/20',
}

const ROW_1 = [
  { name: 'Karthik Raja',   niche: 'Tech',      platform: 'YouTube',   followers: '125K', rating: 4.8, initial: 'K', bg: 'bg-indigo-600' },
  { name: 'Priya Mani',     niche: 'Fitness',   platform: 'Instagram', followers: '89K',  rating: 4.9, initial: 'P', bg: 'bg-emerald-600' },
  { name: 'Anjali Devi',    niche: 'Food',      platform: 'Instagram', followers: '210K', rating: 4.7, initial: 'A', bg: 'bg-amber-600' },
  { name: 'Vignesh K.',     niche: 'Finance',   platform: 'YouTube',   followers: '180K', rating: 4.8, initial: 'V', bg: 'bg-violet-600' },
  { name: 'Selvi Selvam',   niche: 'Beauty',    platform: 'Instagram', followers: '95K',  rating: 4.9, initial: 'S', bg: 'bg-rose-600' },
  { name: 'Madhavan R.',    niche: 'Travel',    platform: 'YouTube',   followers: '150K', rating: 4.6, initial: 'M', bg: 'bg-sky-600' },
]

const ROW_2 = [
  { name: 'Kausalya G.',    niche: 'Lifestyle', platform: 'Instagram', followers: '67K',  rating: 4.7, initial: 'K', bg: 'bg-orange-600' },
  { name: 'Goutham J.',     niche: 'Gaming',    platform: 'YouTube',   followers: '320K', rating: 4.8, initial: 'G', bg: 'bg-purple-600' },
  { name: 'Ramya Ram',      niche: 'Fashion',   platform: 'Instagram', followers: '145K', rating: 4.9, initial: 'R', bg: 'bg-pink-600' },
  { name: 'Dinesh Kumar',   niche: 'Health',    platform: 'YouTube',   followers: '98K',  rating: 4.7, initial: 'D', bg: 'bg-teal-600' },
  { name: 'Shalini S.',     niche: 'Education', platform: 'YouTube',   followers: '230K', rating: 4.8, initial: 'S', bg: 'bg-cyan-600' },
  { name: 'Suresh Raina',   niche: 'Sports',    platform: 'Instagram', followers: '175K', rating: 4.6, initial: 'S', bg: 'bg-lime-700' },
]

// Platform badge colours
const YT_BADGE  = 'bg-red-500/15 text-red-400'
const IG_BADGE  = 'bg-pink-500/15 text-pink-400'

function CreatorCard({ name, niche, platform, followers, rating, initial, bg }: typeof ROW_1[0]) {
  const nicheStyle = NICHE_COLORS[niche] ?? 'bg-gray-700/40 text-gray-400'
  const platformStyle = platform === 'YouTube' ? YT_BADGE : IG_BADGE

  return (
    <div className="w-56 shrink-0 bg-gray-900 border border-gray-800/60 rounded-2xl p-4 mx-2 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center text-sm font-bold text-gray-100 shrink-0 shadow-inner`}>
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-100 truncate">{name}</p>
          <p className="text-xs text-gray-400">{followers} followers</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border border-current/10 ${nicheStyle}`}>{niche}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${platformStyle}`}>{platform}</span>
        <span className="ml-auto text-[10px] text-yellow-400 font-bold">★ {rating}</span>
      </div>
    </div>
  )
}

function MarqueeRow({ items, direction }: { items: typeof ROW_1; direction: 'left' | 'right' }) {
  // Duplicate for seamless loop
  const doubled = [...items, ...items]
  const anim = direction === 'left'
    ? 'marquee-left 28s linear infinite'
    : 'marquee-right 32s linear infinite'

  return (
    <div className="overflow-hidden">
      <div className="flex" style={{ animation: anim }}>
        {doubled.map((c, i) => (
          <CreatorCard key={`${c.name}-${i}`} {...c} />
        ))}
      </div>
    </div>
  )
}

export default function CreatorMarquee() {
  return (
    <div>
      {/* Screen-reader summary — the animated marquee is hidden from AT */}
      <p className="sr-only">
        Our creator network includes niches such as Tech, Fitness, Food, Finance, Beauty, Travel,
        Lifestyle, Gaming, Fashion, Health, Education, and Sports — across YouTube and Instagram.
      </p>
      <div className="space-y-3" aria-hidden="true">
        <MarqueeRow items={ROW_1} direction="left" />
        <MarqueeRow items={ROW_2} direction="right" />
      </div>
    </div>
  )
}
