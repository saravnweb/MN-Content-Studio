const TESTIMONIALS = [
  {
    quote: "Finally a platform that shows me real budgets upfront. No more back-and-forth negotiating. I landed three deals in my first month.",
    name: 'Meera R.',
    handle: '@meerafitlife',
    niche: 'Fitness Creator',
  },
  {
    quote: "The deal cards show exactly what the brand wants, what they pay, and how many slots are left. It feels like a proper marketplace, not a random WhatsApp group.",
    name: 'Arjun S.',
    handle: '@techwitharjun',
    niche: 'Tech Creator',
  },
  {
    quote: "I was skeptical but the payout actually came through within days of approval. MN Content Studio is the real deal for Indian creators.",
    name: 'Priya K.',
    handle: '@priyaeats',
    niche: 'Food Creator',
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3 text-center">
          Creator stories
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-10 text-center">
          What creators are saying
        </h2>

        <div className="space-y-4">
          {TESTIMONIALS.map(({ quote, name, handle, niche }) => (
            <div key={handle} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <p className="text-sm text-gray-300 leading-relaxed mb-5">
                &ldquo;{quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400">
                  {name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-100">{name}</p>
                  <p className="text-xs text-gray-500">{handle} · {niche}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
