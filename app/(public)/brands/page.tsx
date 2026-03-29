import Link from 'next/link'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'For Brands — MW Content Studio',
  description: 'List your campaign and get real content from Indian creators.',
}

export default function ForBrandsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 selection:bg-indigo-500/30">
      <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-base tracking-tight text-gray-100">MW Content Studio</Link>
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-100 transition-colors">Back to Home</Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-16">

        {/* Hero */}
        <div className="mb-14">
          <div className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-4 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            For Brands
          </div>
          <h1 className="text-3xl font-bold text-gray-100 mb-4 leading-tight">
            Get real content<br />from real creators.
          </h1>
          <p className="text-gray-400 leading-relaxed">
            MW Content Studio is a fulfillment network for Indian brands. You tell us what you need, we connect you with creators who match your niche, and they deliver the content. Simple, direct, no agency overhead.
          </p>
        </div>

        {/* How it works */}
        <div className="mb-14">
          <h2 className="text-lg font-bold text-gray-100 mb-6">How it works</h2>
          <div className="space-y-6">
            <Step number="1" title="You brief us">
              Tell us about your campaign — the product, the niche, which platforms, what deliverables you need (Reels, videos, posts), the budget, and the timeline.
            </Step>
            <Step number="2" title="We list your campaign">
              Our team creates and publishes your campaign on the platform. Creators who match your niche can browse it and claim a spot.
            </Step>
            <Step number="3" title="Creators deliver">
              Claimed creators produce the content and submit it for your review. You approve what you are happy with.
            </Step>
            <Step number="4" title="You pay for what you approve">
              Payouts only go to creators whose content you approved. Budget ranges are set by you upfront, so there are no surprises.
            </Step>
          </div>
        </div>

        {/* Honest note */}
        <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl mb-14">
          <h3 className="font-semibold text-gray-100 mb-2">Being upfront with you</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            We are an early-stage platform. We do not have thousands of creators yet, and we will not pretend otherwise. What we do have is a focused, growing network of creators who are serious about fulfillment. We are selective on both sides — brands and creators — because quality matters more to us than volume right now.
          </p>
        </div>

        {/* CTA */}
        <div className="p-8 bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          <h2 className="text-xl font-bold text-gray-100 mb-2">Interested in listing a campaign?</h2>
          <p className="text-sm text-gray-400 mb-6">
            Reach out and we will get back to you within 24 hours to discuss your campaign requirements.
          </p>
          <a
            href="mailto:brands@mwcontentstudio.in"
            className="inline-block px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-600/25 transition-colors"
          >
            Get in Touch
          </a>
        </div>

      </main>

      <Footer />
    </div>
  )
}

function Step({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400">
        {number}
      </div>
      <div>
        <h3 className="font-semibold text-gray-100 mb-1">{title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{children}</p>
      </div>
    </div>
  )
}
