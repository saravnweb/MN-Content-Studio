import Link from 'next/link'
import AuthButton from '@/components/AuthButton'
import PublicDealCard from '@/components/PublicDealCard'

interface Campaign {
  id: string
  title: string
  brand_name: string
  brand_logo_url: string | null
  description: string | null
  budget_min: number | null
  budget_max: number | null
  niches: string[]
  platforms: string[]
  deadline: string | null
  slots_filled: number
  slots_total: number
  deliverables: string[] | null
}

interface Props {
  deals: Campaign[]
}

export default function LiveDealsPreview({ deals }: Props) {
  if (deals.length === 0) return null

  return (
    <section className="py-20 px-4 bg-gray-900/30">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-100">Live Right Now</h2>
          <Link
            href="/explore"
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View all →
          </Link>
        </div>
        <p className="text-sm text-gray-400 mb-8">
          Real campaigns from real brands, updated continuously.
        </p>

        <div className="space-y-4">
          {deals.map((c) => (
            <PublicDealCard key={c.id} campaign={c as any} isCreator={false} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <AuthButton
            label="See All Live Deals →"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl text-sm shadow-lg shadow-indigo-600/20 transition-colors"
            showIcon={false}
          />
        </div>
      </div>
    </section>
  )
}
