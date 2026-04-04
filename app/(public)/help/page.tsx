import React from 'react'
import Link from 'next/link'
import Footer from '@/components/Footer'
import { Hand, Target, Banknote, AlarmClock } from 'lucide-react'
import WhatsAppCTA from '@/components/WhatsAppCTA'

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-indigo-500/30">
      <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-base tracking-tight text-gray-100">MW Content Studio</Link>
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-100 transition-colors">Back to Home</Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-100 mb-2 underline decoration-indigo-500/30 decoration-4 underline-offset-8">Help Center</h1>
          <p className="text-sm mt-4 text-gray-400">Everything you need to know to get started and succeed with MW Content Studio.</p>
        </div>

        <div className="space-y-8">
          <Section icon={<Hand className="w-5 h-5" />} title="How to Join">
            To join, simply click on the &quot;Get Started&quot; button on the home page. You&apos;ll log in securely using Google OAuth. It&apos;s fast, simple, and you&apos;ll be ready to browse deals in seconds.
          </Section>

          <Section icon={<Target className="w-5 h-5" />} title="How to Claim a Deal">
            Browse our list of live campaigns. When you see a deal that matches your niche (e.g., Beauty, Fashion, Tech) and platform (Instagram, YouTube), click &quot;View Full Details&quot; and then claim your spot. We follow a direct fulfillment model—no long approval wait times for active spots.
          </Section>

          <Section icon={<Banknote className="w-5 h-5" />} title="Payouts & Commercials">
            Each campaign has a clearly listed budget range. Once your content is live and approved by the brand, your payout is automatically queued. We process payments directly to your registered bank account. We value honesty—no hidden fees, no unnecessary deductions. 
          </Section>

          <Section icon={<AlarmClock className="w-5 h-5" />} title="Deadlines & Fulfillment">
            Each deal has an end date. Ensure you upload your deliverables (e.g., Reels, Videos) before the deadline to ensure smooth payment processing. If you run into issues, just communicate with us—we&apos;re human.
          </Section>

          <WhatsAppCTA 
            className="mt-12"
            title="Need more help?"
            description="Our support team is here for you on WhatsApp. We aim to respond to all inquiries as quickly as possible."
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string, children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-gray-400">{icon}</span>
        <h2 className="text-xl font-bold text-gray-100">{title}</h2>
      </div>
      <p className="text-sm text-gray-400 leading-relaxed pl-8">
        {children}
      </p>
    </section>
  )
}
