import Link from 'next/link'
import Footer from '@/components/Footer'
import AuthButton from '@/components/AuthButton'
import WhatsAppCTA from '@/components/WhatsAppCTA'
import BrandLogo from '@/components/BrandLogo'

export const metadata = {
  title: 'For Creators — MW Content Studio',
  description: 'Browse real brand campaigns, claim deals, and get paid for your content.',
}

export default function ForCreatorsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-indigo-500/30">
      <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <BrandLogo withLink={true} size={28} textClassName="font-bold text-base tracking-tight text-gray-100" />
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-100 transition-colors">Back to Home</Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-16">

        {/* Hero */}
        <div className="mb-14">
          <div className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-4 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            For Creators
          </div>
          <h1 className="text-3xl font-bold text-gray-100 mb-4 leading-tight">
            Real brand orders,<br />delivered to you.
          </h1>
          <p className="text-gray-400 leading-relaxed">
            MW Content Studio connects Tamil Nadu content creators with brands that need real content. You browse live campaigns, claim a spot, create the content, and get paid. No pitching, no chasing.
          </p>
        </div>

        {/* How it works */}
        <div className="mb-14">
          <h2 className="text-lg font-bold text-gray-100 mb-6">How it works</h2>
          <div className="space-y-6">
            <Step number="1" title="Sign in with Google">
              One click, no forms. Your account is ready immediately and you can start browsing deals right away.
            </Step>
            <Step number="2" title="Browse live campaigns">
              Filter by niche (Beauty, Fashion, Tech, Lifestyle, and more) and by platform (Instagram, YouTube). Each listing shows the brand, budget range, slots available, and deadline — everything upfront.
            </Step>
            <Step number="3" title="Claim your spot">
              When a deal fits you, claim it. Slots are limited per campaign, so available spots are real.
            </Step>
            <Step number="4" title="Create and submit">
              Each campaign specifies exactly what is needed — Reels, videos, posts. You create it, submit it, and the brand reviews it.
            </Step>
            <Step number="5" title="Get paid">
              Once your content is approved, your payout is queued automatically. Payment goes directly to your registered bank account. The budget range you saw on the listing is what you actually earn — no surprise deductions.
            </Step>
          </div>
        </div>

        {/* Honest note */}
        <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl mb-14">
          <h3 className="font-semibold text-gray-100 mb-2">A quick honest note</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            We are a growing platform. The number of live campaigns will vary week to week — some weeks are busier than others. We are working to bring more brands on board steadily. We would rather be honest about that than oversell.
          </p>
        </div>

        {/* CTA */}
        <div className="p-8 bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          <h2 className="text-xl font-bold text-gray-100 mb-2">Ready to get started?</h2>
          <p className="text-sm text-gray-400 mb-6">
            Sign in takes 10 seconds. Browse current deals right after.
          </p>
          <AuthButton
            label="Join as a Creator"
            className="mx-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-600/25 transition-colors"
            showIcon={false}
          />
        </div>

        <WhatsAppCTA 
          className="mt-14" 
          title="Questions about work?" 
          description="Speak with our team on WhatsApp for any help with your creator account or campaigns."
        />

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
