'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { NICHES } from '@/lib/constants'
import CityAutocomplete from '@/components/ui/CityAutocomplete'

type Step = 1 | 2 | 3

export default function OnboardingWizard({ userId, name }: { userId: string; name: string }) {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  // Step 1 — Identity
  const [fullName, setFullName] = useState(name ?? '')
  const [age, setAge] = useState('')
  const [city, setCity] = useState('')
  const [gender, setGender] = useState('')
  const [isWhatsapp, setIsWhatsapp] = useState(false)

  // Step 2 — Platform
  const [platform, setPlatform] = useState<'youtube' | 'instagram' | 'both'>('youtube')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [followersCount, setFollowersCount] = useState('')
  const [ytFetching, setYtFetching] = useState(false)
  const [ytPreview, setYtPreview] = useState<{ name: string; thumbnail?: string } | null>(null)
  const [ytError, setYtError] = useState('')

  // Step 3 — Niches & contact
  const [selectedNiches, setSelectedNiches] = useState<string[]>([])
  const [phone, setPhone] = useState('')

  const MAX_NICHES = 1

  async function fetchYoutubeStats(url: string) {
    if (!url.trim()) return
    setYtFetching(true)
    setYtError('')
    setYtPreview(null)
    try {
      const res = await fetch(`/api/social/youtube?url=${encodeURIComponent(url.trim())}`)
      const data = await res.json()
      if (!res.ok) { setYtError(data.error ?? 'Could not fetch channel info'); return }
      setYtPreview({ name: data.name, thumbnail: data.thumbnail })
      if (data.subscribers) setFollowersCount(String(data.subscribers))
    } catch {
      setYtError('Network error — please check the URL')
    } finally {
      setYtFetching(false)
    }
  }

  function toggleNiche(n: string) {
    if (selectedNiches.includes(n)) {
      // Always allow deselecting
      setSelectedNiches((p) => p.filter((x) => x !== n))
    } else if (selectedNiches.length < MAX_NICHES) {
      // Only allow selecting if under limit
      setSelectedNiches((p) => [...p, n])
    }
  }

  function nextStep() {
    setError('')
    if (step === 1) {
      if (!fullName.trim()) { setError('Please enter your name'); return }
      if (!city.trim()) { setError('Please enter the city you live in'); return }
      if (!age) { setError('Please enter your age'); return }
      if (!gender) { setError('Please select your gender'); return }
      if (phone.replace(/\D/g, '').length !== 10) { setError('Please enter a valid 10-digit phone number'); return }
      setStep(2)
    } else if (step === 2) {
      const hasUrl = (platform === 'youtube' || platform === 'both') ? !!youtubeUrl.trim() :
        platform === 'instagram' ? !!instagramUrl.trim() : false
      if (!hasUrl) { setError('Please add your social media URL'); return }
      setStep(3)
    }
  }

  async function finish() {
    if (selectedNiches.length === 0) { setError('Please pick a topic'); return }
    setError('')
    setIsSaving(true)

    try {
      const supabase = createClient()
      const platformUrl = platform === 'instagram' ? instagramUrl : youtubeUrl

      const { data, error: dbError } = await supabase.from('profiles').update({
        full_name: fullName.trim(),
        platform,
        platform_url: platformUrl || null,
        youtube_url: youtubeUrl || null,
        instagram_url: instagramUrl || null,
        followers_count: followersCount ? parseInt(followersCount) : null,
        niches: selectedNiches,
        phone: phone.replace(/\D/g, '').slice(0, 10) || null,
        whatsapp: isWhatsapp ? phone.replace(/\D/g, '').slice(0, 10) : null,
        city: city.trim() || null,
        age: age ? parseInt(age) : null,
        gender: gender || null,
      }).eq('id', userId).select()

      if (dbError) {
        console.error('Onboarding save error:', dbError)
        setError(dbError.message)
        setIsSaving(false)
        return
      }

      console.log('Onboarding saved successfully:', data)
      router.push('/deals')
      router.refresh()
    } catch (err: any) {
      console.error('Unexpected onboarding error:', err)
      setError(err.message || 'An unexpected error occurred')
      setIsSaving(false)
    }
  }

  const steps = [
    { n: 1, label: 'About You' },
    { n: 2, label: 'Your Platform' },
    { n: 3, label: 'Your Topic' },
  ]

  const inp = "w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 placeholder:font-light focus:outline-none focus:border-indigo-500 transition-colors"

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-4 px-2">

      {/* Header section */}
      <div className="mb-8 text-center px-4">
        <h2 className="text-xl font-black text-gray-100 tracking-tight">Complete Your Profile</h2>
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
                    : 'bg-gray-800 text-gray-400'
              }`}>
                {step > s.n ? '✓' : s.n}
              </div>
              <p className={`text-[10px] mt-3 font-bold uppercase tracking-widest ${
                step >= s.n ? 'text-gray-100' : 'text-gray-500'
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
              <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                Welcome! <span className="animate-bounce-short">👋</span>
              </h2>
              <p className="text-sm mt-2 text-gray-400 leading-relaxed">Tell us a bit about yourself to get started.</p>
            </div>

            <div className="space-y-5">
              <Field label="Your Full Name *">
                <div className="relative">
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder="Karthik Raja" className={inp} autoFocus />
                  {name && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-indigo-400/70 pointer-events-none">
                      from Google
                    </span>
                  )}
                </div>
              </Field>

              <Field label="City *">
                <CityAutocomplete 
                  value={city} 
                  onChange={(val) => setCity(val)}
                  placeholder="chennai"
                  error={!!error && !city}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Age *">
                  <input type="number" min={13} max={100} value={age}
                    onChange={(e) => setAge(e.target.value)} placeholder="25" className={inp} />
                </Field>
                <Field label="Gender *">
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className={`${inp} cursor-pointer`}>
                    <option value="">Select…</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </Field>
              </div>

              <Field label="Phone Number *">
                <div className="flex group/phone focus-within:ring-1 focus-within:ring-indigo-500 rounded-xl overflow-hidden transition-all">
                  <span className="bg-gray-800/80 border-r border-gray-700/50 px-4 flex items-center text-sm font-semibold text-gray-400">+91</span>
                  <input type="tel" inputMode="numeric" value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210" className={`${inp} rounded-l-none border-0 focus:ring-0`} />
                </div>
                <label className="flex items-center gap-2.5 mt-3 cursor-pointer select-none w-fit">
                  <div onClick={() => setIsWhatsapp(v => !v)}
                    className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all flex-shrink-0 ${
                      isWhatsapp ? 'bg-emerald-500 border-emerald-500' : 'bg-gray-800 border-gray-600'
                    }`}>
                    {isWhatsapp && <span className="text-white text-[10px] font-bold leading-none">✓</span>}
                  </div>
                  <span className="text-xs text-gray-400 font-medium">This is my WhatsApp number</span>
                </label>
              </Field>
            </div>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
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
                    <input
                      value={youtubeUrl}
                      onChange={(e) => { setYoutubeUrl(e.target.value); setYtPreview(null); setYtError('') }}
                      onBlur={() => fetchYoutubeStats(youtubeUrl)}
                      placeholder="youtube.com/@yourchannel"
                      className={inp}
                    />
                    {ytFetching && (
                      <p className="text-[11px] text-indigo-400 mt-2 pl-1 flex items-center gap-1.5">
                        <span className="inline-block w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        Fetching channel info…
                      </p>
                    )}
                    {ytPreview && !ytFetching && (
                      <div className="mt-2 flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                        {ytPreview.thumbnail && (
                          <Image
                            src={ytPreview.thumbnail}
                            alt=""
                            width={28}
                            height={28}
                            className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                            unoptimized
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-emerald-400 truncate">{ytPreview.name}</p>
                          <p className="text-[10px] text-emerald-600">Subscriber count auto-filled</p>
                        </div>
                      </div>
                    )}
                    {ytError && !ytFetching && (
                      <p className="text-[11px] text-amber-400 mt-2 pl-1">{ytError} — enter count manually below</p>
                    )}
                  </Field>
                )}
                {(platform === 'instagram' || platform === 'both') && (
                  <Field label="Instagram Profile URL *">
                    <input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="instagram.com/yourhandle" className={inp} />
                    <p className="text-[10px] text-gray-600 mt-1.5 pl-1">
                      Instagram doesn&apos;t allow public follower lookups — enter count manually below.
                    </p>
                  </Field>
                )}
              </div>

              <Field label={platform === 'youtube' ? 'Subscribers' : platform === 'instagram' ? 'Followers' : 'Total Followers'}>
                <div className="relative">
                  <input type="number" value={followersCount}
                    onChange={(e) => setFollowersCount(e.target.value)}
                    placeholder="e.g. 50000" className={inp} />
                  {ytPreview && platform !== 'instagram' && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <span className="text-[10px] font-bold text-emerald-500">auto-filled</span>
                    </div>
                  )}
                </div>
              </Field>
            </div>
          </div>
        )}

        {/* ── Step 3 ── */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                What do you post about? 🎯
              </h2>
              <p className="text-sm mt-2 text-gray-400 leading-relaxed">
                Pick the one topic that best describes your content.
              </p>
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2.5">
                  <span className="text-amber-400 text-sm mt-0.5 shrink-0">⚠</span>
                  <p className="text-xs text-amber-300/80 leading-relaxed">
                    <span className="font-bold text-amber-300">This cannot be changed later.</span> Choose carefully — your niche determines which brand deals you see.
                  </p>
                </div>
                <div className="flex items-start gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-3 py-2.5">
                  <span className="text-indigo-400 text-sm mt-0.5 shrink-0">ℹ️</span>
                  <p className="text-xs text-indigo-300/80 leading-relaxed">
                    Admin can add two or more niches to your profile. Please contact admin for that.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {NICHES.map((n) => (
                <button key={n} type="button" 
                  onClick={() => toggleNiche(n)}
                  disabled={selectedNiches.length >= MAX_NICHES && !selectedNiches.includes(n)}
                  className={`px-4 py-2.5 rounded-2xl text-xs capitalize font-bold transition-all border ${
                    selectedNiches.includes(n)
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20 scale-105' 
                      : selectedNiches.length >= MAX_NICHES && !selectedNiches.includes(n)
                        ? 'bg-gray-800/20 border-gray-800 text-gray-600 cursor-not-allowed opacity-50'
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
                  {selectedNiches[0]} — selected!
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
              className="px-6 py-4 rounded-2xl text-sm font-bold border border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-gray-100 transition-all">
              Back
            </button>
          )}
          {step < 3 ? (
            <button onClick={nextStep}
              className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-indigo-600/25 active:scale-95">
              Continue →
            </button>
          ) : (
            <button onClick={finish} disabled={isSaving}
              className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-black transition-all disabled:opacity-60 shadow-lg shadow-indigo-600/25 active:scale-95">
              {isSaving ? 'Saving…' : '🚀 Start Exploring Deals'}
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
