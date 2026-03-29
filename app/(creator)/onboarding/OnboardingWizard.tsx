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

  const inp = "w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-4 px-2">

      {/* Header section */}
      <div className="mb-8 text-center px-4">
        <h2 className="text-xl font-black text-white tracking-tight">Complete Your Profile</h2>
        <p className="text-xs mt-1.5 text-gray-500 font-bold uppercase tracking-widest">3 Quick Steps</p>
      </div>

      {/* Step indicator */}
      <div className="w-full max-w-sm mb-10 relative mx-auto px-4">
        {/* Background track */}
        <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-800/50 -z-10 rounded-full" />
        
        {/* Progress bar */}
        <div 
          className="absolute top-4 left-0 h-0.5 bg-indigo-500 transition-all duration-500 ease-in-out -z-10 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
          style={{ width: `${(Math.max(0, step - 1)) / (steps.length - 1) * 100}%` }}
        />
        
        <div className="flex justify-between items-start">
          {steps.map((s) => (
            <div key={s.n} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ring-4 ring-gray-950 ${
                step > s.n 
                  ? 'bg-emerald-500 text-white' 
                  : step === s.n 
                    ? 'bg-indigo-600 text-white ring-indigo-500/20 scale-110 shadow-lg shadow-indigo-600/30' 
                    : 'bg-gray-800 text-gray-500'
              }`}>
                {step > s.n ? '✓' : s.n}
              </div>
              <p className={`text-[10px] mt-3 font-bold uppercase tracking-widest ${
                step >= s.n ? 'text-gray-200' : 'text-gray-600'
              }`}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md rounded-3xl border border-white/[0.05] bg-gray-900/50 backdrop-blur-sm p-8 shadow-2xl relative group overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />
        
        {/* ── Step 1 ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                Welcome! <span className="animate-bounce-short">👋</span>
              </h2>
              <p className="text-sm mt-2 text-gray-400 leading-relaxed">Tell us a bit about yourself to get started.</p>
            </div>

            <div className="space-y-5">
              <Field label="Your Full Name *">
                <input value={fullName} onChange={(e) => setFullName(e.target.value)}
                  placeholder="Rahul Sharma" className={inp} autoFocus />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Age">
                  <input type="number" min={13} max={100} value={age}
                    onChange={(e) => setAge(e.target.value)} placeholder="25" className={inp} />
                </Field>
                <Field label="Gender">
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className={`${inp} cursor-pointer`}>
                    <option value="">Select…</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </Field>
              </div>

              <Field label="Phone (optional)">
                <div className="flex group/phone focus-within:ring-1 focus-within:ring-indigo-500 rounded-xl overflow-hidden transition-all">
                  <span className="bg-gray-800/80 border-r border-gray-700/50 px-4 flex items-center text-sm font-semibold text-gray-400">+91</span>
                  <input type="tel" inputMode="numeric" value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210" className={`${inp} rounded-l-none border-0 focus:ring-0`} />
                </div>
              </Field>
            </div>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                Your Platform 📱
              </h2>
              <p className="text-sm mt-2 text-gray-400">Where do you create content?</p>
            </div>

            <div className="space-y-5">
              <Field label="Platform *">
                <div className="grid grid-cols-3 gap-2">
                  {(['youtube', 'instagram', 'both'] as const).map((p) => (
                    <button key={p} type="button" onClick={() => setPlatform(p)}
                      className={`py-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                        platform === p 
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                          : 'bg-gray-800/40 border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-700'
                      }`}>
                      {p === 'both' ? 'Both' : p === 'youtube' ? 'YouTube' : 'Instagram'}
                    </button>
                  ))}
                </div>
              </Field>

              <div className="space-y-4">
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
              </div>

              <Field label="Followers / Subscribers">
                <div className="relative">
                  <input type="number" value={followersCount}
                    onChange={(e) => setFollowersCount(e.target.value)}
                    placeholder="e.g. 50000" className={inp} />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                     <span className="text-xs font-bold text-gray-600">Total Followers</span>
                  </div>
                </div>
              </Field>
            </div>
          </div>
        )}

        {/* ── Step 3 ── */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                Your Niches 🎯
              </h2>
              <p className="text-sm mt-2 text-gray-400 leading-relaxed">
                Pick your content categories — we&apos;ll match you to relevant brand deals.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {NICHES.map((n) => (
                <button key={n} type="button" onClick={() => toggleNiche(n)}
                  className={`px-4 py-2.5 rounded-2xl text-xs capitalize font-bold transition-all border ${
                    selectedNiches.includes(n)
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20 scale-105' 
                      : 'bg-gray-800/40 border-gray-800 text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                  }`}>
                  {n}
                </button>
              ))}
            </div>

            {selectedNiches.length > 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-white font-bold">✓</div>
                <p className="text-xs font-bold text-emerald-400">
                  {selectedNiches.length} niches selected — great choices!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
            <span className="text-red-400 text-sm">⚠️</span>
            <p className="text-xs font-semibold text-red-400">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <button onClick={() => { setStep((s) => (s - 1) as Step); setError('') }}
              className="px-6 py-4 rounded-2xl text-sm font-bold border border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
              Back
            </button>
          )}
          {step < 3 ? (
            <button onClick={nextStep}
              className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-indigo-600/25 active:scale-95">
              Continue →
            </button>
          ) : (
            <button onClick={finish} disabled={isPending}
              className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-black transition-all disabled:opacity-60 shadow-lg shadow-indigo-600/25 active:scale-95">
              {isPending ? 'Saving…' : '🚀 Start Exploring Deals'}
            </button>
          )}
        </div>
      </div>

    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="w-full">
      <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-gray-500 pl-1">{label}</label>
      {children}
    </div>
  )
}
