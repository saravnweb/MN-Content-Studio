import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

const BENEFITS = [
  'Curated creator shortlist for your niche',
  'Content delivered on your timeline',
  'Pay only for approved work',
]

export default function ForBrandsSection() {
  return (
    <section className="py-20 px-4 bg-gray-900/30">
      <div className="max-w-xl mx-auto">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

          <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
            For Brands
          </span>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-3">
            Need content from Indian creators?
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-6">
            Tell us what you need. We match you with creators who fit your niche and platform. You set the budget, review the content, and pay only for what you approve.
          </p>

          <ul className="space-y-3 mb-8">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                {b}
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/brands/signup"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-lg shadow-indigo-600/20 text-center"
            >
              List Your Campaign
            </Link>
            <Link
              href="/brands"
              className="inline-block text-sm text-gray-400 hover:text-gray-100 transition-colors px-6 py-3 text-center"
            >
              Learn how it works →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
