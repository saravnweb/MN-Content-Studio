'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NICHES = [
  'fitness', 'food', 'tech', 'fashion', 'travel', 'beauty',
  'gaming', 'finance', 'lifestyle', 'wellness', 'education', 'entertainment',
]

type Step = 1 | 2 | 3

export default function OnboardingWizard({ userId, name }: { userId: string; name: string }) {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  // Step 1 — Identity
  const [fullName, setFullName] = useState(name ?? '')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')

  // Step 2 — Platform
  const [platform, setPlatform] = useState<'youtube' | 'instagram' | 'both'>('youtube')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [followersCount, setFollowersCount] = useState('')

  // Step 3 — Niches & contact
  const [selectedNiches, setSelectedNiches] = useState<string[]>([])
  const [phone, setPhone] = useState('')

  function toggleNiche(n: string) {
    setSelectedNiches((p) => p.includes(n) ? p.filter((x) => x !== n) : [...p, n])
  }

  function nextStep() {
    setError('')
    if (step === 1) {
      if (!fullName.trim()) { setError('Please enter your name'); return }
      setStep(2)
    } else if (step === 2) {
      const hasUrl = (platform === 'youtube' || platform === 'both') ? !!youtubeUrl.trim() :
        platform === 'instagram' ? !!instagramUrl.trim() : false
      if (!hasUrl) { setError('Please add your social media URL'); return }
      setStep(3)
    }
  }

  async function finish() {
    if (selectedNiches.length === 0) { setError('Pick at least one niche'); return }
    setError('')

    startTransition(async () => {
      const supabase = createClient()
      const platformUrl = platform === 'instagram' ? instagramUrl : youtubeUrl

      const { error: dbError } = await supabase.from('profiles').update({
        full_name: fullName.trim(),
        platform,
        platform_url: platformUrl || null,
        youtube_url: youtubeUrl || null,
        instagram_url: instagramUrl || null,
        followers_count: followersCount ? parseInt(followersCount) : null,
        niches: selectedNiches,
        phone: phone.replace(/\D/g, '').slice(0, 10) || null,
        age: age ? parseInt(age) : null,
        gender: gender || null,
      }).eq('id', userId)

      if (dbError) { setError(dbError.message); return }
      router.push('/deals')
      router.refresh()
    })
  }

  const steps = [
    { n: 1, label: 'About You' },
    { n: 2, label: 'Your Platform' },
    { n: 3, label: 'Your Niches' },
  ]

  const inp = "w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-12">

      {/* Logo / brand */}
      <div className="mb-8 text-center">
        <p className="font-bold text-xl text-white">MW Content Studio</p>
        <p className="text-sm mt-1 text-gray-500">Let&apos;s set up your creator profile</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8 w-full max-w-sm">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step > s.n ? 'bg-emerald-600 text-white' : step === s.n ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}>
                {step > s.n ? '✓' : s.n}
              </div>
              <p className={`text-[10px] mt-1 font-medium whitespace-nowrap ${
                step >= s.n ? 'text-gray-300' : 'text-gray-500'
              }`}>{s.label}</p>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 ${
                step > s.n ? 'bg-emerald-600' : 'bg-gray-800'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-xl">

        {/* ── Step 1 ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white">Welcome! 👋</h2>
              <p className="text-sm mt-1 text-gray-500">Tell us a bit about yourself to get started.</p>
            </div>

            <Field label="Your Full Name *">
              <input value={fullName} onChange={(e) => setFullName(e.target.value)}
                placeholder="Rahul Sharma" className={inp} autoFocus />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Age">
                <input type="number" min={13} max={100} value={age}
                  onChange={(e) => setAge(e.target.value)} placeholder="25" className={inp} />
              </Field>
              <Field label="Gender">
                <select value={gender} onChange={(e) => setGender(e.target.value)} className={inp}>
                  <option value="">Select…</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </Field>
            </div>

            <Field label="Phone (optional)">
              <div className="flex">
                <span className="bg-gray-800 border-gray-800 border border-r-0 rounded-l-lg px-3 flex items-center text-sm text-gray-500">+91</span>
                <input type="tel" inputMode="numeric" value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210" className={`${inp} rounded-l-none`} />
              </div>
            </Field>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white">Your Platform 📱</h2>
              <p className="text-sm mt-1 text-gray-500">Where do you create content?</p>
            </div>

            <Field label="Platform *">
              <div className="flex gap-2">
                {(['youtube', 'instagram', 'both'] as const).map((p) => (
                  <button key={p} type="button" onClick={() => setPlatform(p)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                      platform === p 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}>
                    {p === 'both' ? 'Both' : p === 'youtube' ? '▶ YouTube' : '◈ Instagram'}
                  </button>
                ))}
              </div>
            </Field>

            {(platform === 'youtube' || platform === 'both') && (
              <Field label="YouTube Channel URL *">
                <input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="youtube.com/c/yourchannel" className={inp} />
              </Field>
            )}
            {(platform === 'instagram' || platform === 'both') && (
              <Field label="Instagram Profile URL *">
                <input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="instagram.com/yourhandle" className={inp} />
              </Field>
            )}

            <Field label="Followers / Subscribers">
              <input type="number" value={followersCount}
                onChange={(e) => setFollowersCount(e.target.value)}
                placeholder="e.g. 50000" className={inp} />
            </Field>
          </div>
        )}

        {/* ── Step 3 ── */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white">Your Niches 🎯</h2>
              <p className="text-sm mt-1 text-gray-500">
                Pick your content categories — we&apos;ll match you to relevant brand deals.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {NICHES.map((n) => (
                <button key={n} type="button" onClick={() => toggleNiche(n)}
                  className={`px-3 py-2 rounded-full text-sm capitalize font-medium transition-all ${
                    selectedNiches.includes(n)
                      ? 'bg-indigo-600 text-white scale-105' 
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}>
                  {n}
                </button>
              ))}
            </div>

            {selectedNiches.length > 0 && (
              <p className="text-xs font-medium text-indigo-400">
                ✓ {selectedNiches.length} selected — great!
              </p>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm mt-3 text-red-400">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button onClick={() => { setStep((s) => (s - 1) as Step); setError('') }}
              className="px-4 py-3 rounded-xl text-sm font-medium border border-gray-700 text-gray-400 hover:bg-gray-800 transition-colors">
              Back
            </button>
          )}
          {step < 3 ? (
            <button onClick={nextStep}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors">
              Continue →
            </button>
          ) : (
            <button onClick={finish} disabled={isPending}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60 shadow-lg shadow-indigo-600/20">
              {isPending ? 'Saving…' : '🚀 Start Exploring Deals'}
            </button>
          )}
        </div>
      </div>

      {/* Skip */}
      <button onClick={() => { router.push('/deals') }}
        className="mt-4 text-xs text-gray-500 underline underline-offset-2 hover:text-gray-300 transition-colors">
        Skip for now
      </button>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5 text-gray-500">{label}</label>
      {children}
    </div>
  )
}
