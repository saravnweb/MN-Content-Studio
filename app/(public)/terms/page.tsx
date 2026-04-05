import Link from 'next/link'
import Footer from '@/components/Footer'
import WhatsAppCTA from '@/components/WhatsAppCTA'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 selection:bg-indigo-500/30">
      <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-base tracking-tight text-gray-100">MW Content Studio</Link>
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-100 transition-colors">Back to Home</Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-400 italic">Last Updated: March 2026</p>
        </div>

        <div className="space-y-8 text-sm text-gray-400 [&_h2]:text-gray-100 [&_h2]:mb-3 [&_strong]:text-indigo-400">
          <section>
            <h2 className="text-xl font-semibold">1. Our Role</h2>
            <p>
              MW Content Studio acts as a curated fulfillment network. We connect brands with Tamil Nadu creators to execute specific content orders (the &quot;Deals&quot;). We are an intermediary platform as defined under the Information Technology Act, 2000.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Respect & Honesty</h2>
            <p>
              We believe in simple, kind, and honest dealings. 
              Creators agree to provide authentic content. Brands agree to provide clear briefs and fair budgets. We do not tolerate fake followers, manipulated engagement, or late payments.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Fulfillment & Payments</h2>
            <p>
              Once a Deal is claimed and completed according to the brand&apos;s specifications, payment is processed. We aim for 100% transparency in our payout cycles. All commercials are inclusive of applicable Indian taxes unless stated otherwise.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Compliance with Indian Law</h2>
            <p>
              This platform operates in compliance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021. Any content uploaded must not violate Indian laws or the rights of third parties.
            </p>
          </section>

          <section className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl border-l-4 border-l-indigo-500">
            <h2 className="text-lg font-bold text-gray-100 mb-4">Grievance Redressal</h2>
            <p className="text-sm mb-4">
              In accordance with the IT Rules 2021, if you have any complaints regarding content or service, please contact our Grievance Officer:
            </p>
            <div className="text-xs space-y-1 font-mono uppercase tracking-tight text-gray-300">
              <p>Officer: Suburaj</p>
              <p>Email: legal@mwcontentstudio.in</p>
              <p>Address: Chennai, Tamil Nadu, India</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold font-serif italic text-indigo-300">&quot;Kindness is the ultimate sophistication.&quot;</h2>
            <p>
              By using this platform, you join a community that values craft over clout. Let&apos;s build something honest together.
            </p>
          </section>
        </div>

        <WhatsAppCTA 
          className="mt-16"
          title="Questions about our terms?"
          description="If you need clarification on any of our terms or legal policies, chat with us on WhatsApp."
        />
      </main>

      <Footer />
    </div>
  )
}
