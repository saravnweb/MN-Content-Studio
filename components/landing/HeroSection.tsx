import Link from 'next/link'
import AuthButton from '@/components/AuthButton'

// Hardcoded placeholder deal cards — no DB fetch needed
const PREVIEW_CARDS = [
  {
    brand: 'NutriBrand India',
    niche: '💪 Fitness',
    budget: '₹8k – ₹15k',
    platform: 'Instagram',
    slots: '3 spots left',
  },
  {
    brand: 'GadgetCo',
    niche: '💻 Tech',
    budget: '₹20k – ₹35k',
    platform: 'YouTube',
    slots: '5 spots left',
  },
]

export default function HeroSection({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  return (
    <section className="relative overflow-hidden pt-16 pb-12 px-4 sm:pt-24 sm:pb-20">
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-xl mx-auto relative">
        {/* Eyebrow */}
        <div className="flex justify-center mb-5">
          <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
            India&apos;s Influencer Marketplace
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-gray-100 text-center mb-5">
          Get paid to create.<br />
          <span className="text-indigo-400">Brands need you.</span>
        </h1>

        {/* Sub */}
        <p className="text-base text-gray-400 leading-relaxed max-w-sm mx-auto text-center mb-8">
          Browse live campaigns from Indian brands. Claim a spot, create content, get paid. No cold emails. No pitching.
        </p>

        {/* CTAs */}
        {isLoggedIn ? (
          <div className="flex justify-center mb-3">
            <Link
              href="/deals"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3.5 rounded-xl text-sm shadow-lg shadow-indigo-600/20 transition-colors"
            >
              Go to My Deals →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-3">
            <AuthButton
              label="Start Earning — It's Free"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3.5 rounded-xl text-sm shadow-lg shadow-indigo-600/20 transition-colors"
              showIcon={false}
            />
            <Link
              href="/explore"
              className="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-gray-100 font-medium px-8 py-3.5 rounded-xl text-sm transition-colors"
            >
              Browse Live Deals →
            </Link>
          </div>
        )}

        {/* Trust line */}
        {!isLoggedIn && (
          <p className="text-xs text-gray-500 text-center mb-12">
            Free to join · No subscription · Google sign-in
          </p>
        )}

        {/* Floating deal cards */}
        <div className="flex gap-4 justify-center mt-4">
          {PREVIEW_CARDS.map((card, i) => (
            <div
              key={card.brand}
              className={`bg-gray-900 border border-gray-800 rounded-2xl p-4 w-44 shrink-0 shadow-xl shadow-black/30 ${
                i === 0 ? '-rotate-2' : 'rotate-1 mt-4'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                  {card.brand[0]}
                </div>
                <p className="text-xs font-semibold text-gray-200 leading-tight truncate">{card.brand}</p>
              </div>
              <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700 mb-2">
                {card.niche}
              </span>
              <p className="text-sm font-bold text-gray-100 mb-1">{card.budget}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500">{card.platform}</span>
                <span className="text-[10px] text-emerald-400">{card.slots}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
