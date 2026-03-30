export default function HowItWorks() {
  const steps = [
    {
      title: 'Sign in with Google',
      desc: 'One click. No forms. Your account is ready in 30 seconds.',
    },
    {
      title: 'Browse live campaigns',
      desc: 'Filter by your niche, platform (YouTube / Instagram), and budget. Every deal shows the brand, payout range, and open slots — upfront.',
    },
    {
      title: 'Claim your spot',
      desc: 'Found a match? Claim it. Slots are capped per campaign, so you know availability is real.',
    },
    {
      title: 'Create, submit, get paid',
      desc: 'Deliver the content, the brand approves it, payout goes directly to your bank.',
    },
  ]

  return (
    <section className="py-20 px-4">
      <div className="max-w-xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3 text-center">
          How it works
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-12 text-center">
          From signup to payment in 4 steps
        </h2>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-[17px] top-9 bottom-9 w-px bg-gray-800" />

          <div className="space-y-0">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-4 pb-8 last:pb-0">
                <div className="shrink-0 w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-400 z-10">
                  {i + 1}
                </div>
                <div className="pt-1.5 pb-2">
                  <p className="font-semibold text-gray-100 text-sm mb-1">{step.title}</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
