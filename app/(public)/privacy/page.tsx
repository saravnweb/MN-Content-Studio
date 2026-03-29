import Link from 'next/link'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 selection:bg-indigo-500/30">
      <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-base tracking-tight text-gray-100">MW Content Studio</Link>
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-100 transition-colors">Back to Home</Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-400 italic">Last Updated: March 2026</p>
        </div>

        <div className="space-y-8 prose prose-invert prose-sm max-w-none prose-p:text-gray-400 prose-headings:text-gray-100 prose-strong:text-indigo-400">
          <section>
            <h2 className="text-xl font-semibold">1. We Collect Only What's Needed</h2>
            <p>
              We don't believe in unnecessary data hoarding. We collect your Google name, email, and social handles only for:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Identifying you for brand deals and fulfillment orders.</li>
              <li>Processing your payouts and tracking your fulfillment status.</li>
              <li>Sending you real-time notifications about new deals in your niche.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Respect for Your Privacy</h2>
            <p>
              Your data is yours. We do not sell your data to third parties. We share it ONLY with the brands you choose to interact with for successful deal fulfillment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Security is Paramount</h2>
            <p>
              We use Supabase and Google OAuth for industry-standard security. Your connection to MW Content Studio is encrypted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Compliance with Indian Information Technology Act, 2000</h2>
            <p>
              We adhere to the provisions of the Information Technology Act, 2000 and the Rules framed thereunder. We recognize your right to access, update, or delete your personal data.
            </p>
          </section>

          <section className="p-6 bg-gray-900 border border-gray-800 rounded-2xl border-l-4 border-l-indigo-500">
            <h2 className="text-lg font-bold text-gray-100 mb-4 italic">Kindness first. No lies.</h2>
            <p className="text-sm mb-4">
              If you ever feel uncomfortable about how your data is being used, just reach out to us. We'll listen and fix it.
            </p>
            <div className="text-xs space-y-1 font-mono uppercase tracking-tight text-gray-300">
              <p>Email: privacy@mwcontentstudio.in</p>
              <p>Subject: Privacy Inquiry</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
