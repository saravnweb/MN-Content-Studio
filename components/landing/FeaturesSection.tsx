import { ShieldCheck, IndianRupee, Play, Zap, Tag, Banknote } from 'lucide-react'

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Verified Brand Campaigns',
    desc: 'Every campaign is reviewed by our team before it goes live.',
  },
  {
    icon: IndianRupee,
    title: 'Transparent INR Payouts',
    desc: 'The budget range you see is what you earn. No hidden cuts.',
  },
  {
    icon: Play,
    title: 'YouTube + Instagram',
    desc: 'Campaigns for Reels, long-form videos, posts, and integrations.',
  },
  {
    icon: Zap,
    title: 'No Cold Pitching',
    desc: 'Brands come to us. You browse and claim what fits you.',
  },
  {
    icon: Tag,
    title: 'Niche Matching',
    desc: 'Filter by your niche — beauty, tech, fitness, food, and 12 more.',
  },
  {
    icon: Banknote,
    title: 'Direct to Bank',
    desc: 'Approved content triggers automatic payout to your registered account.',
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3 text-center">
          Why creators choose us
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-10 text-center">
          Everything you need, nothing you don&apos;t
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-indigo-400" />
              </div>
              <p className="font-semibold text-gray-100 text-sm mb-1">{title}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
