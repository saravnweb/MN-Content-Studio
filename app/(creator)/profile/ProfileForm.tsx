'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const NICHES = ['fitness', 'food', 'tech', 'fashion', 'travel', 'beauty', 'gaming', 'finance']

type Profile = {
  full_name: string | null
  platform: string | null
  platform_url: string | null
  youtube_url: string | null
  instagram_url: string | null
  followers_count: number | null
  niches: string[] | null
  phone: string | null
  whatsapp: string | null
  age: number | null
  gender: string | null
}

export default function ProfileForm({ profile, userId }: { profile: Profile; userId: string }) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [fullName, setFullName] = useState(profile.full_name ?? '')
  const [platform, setPlatform] = useState<'youtube' | 'instagram' | 'both'>(
    (profile.platform as any) ?? 'youtube'
  )
  const [youtubeUrl, setYoutubeUrl] = useState(profile.youtube_url ?? profile.platform_url ?? '')
  const [instagramUrl, setInstagramUrl] = useState(
    profile.instagram_url ?? (profile.platform === 'instagram' ? profile.platform_url : '') ?? ''
  )
  const [followersCount, setFollowersCount] = useState(profile.followers_count?.toString() ?? '')
  const [niches, setNiches] = useState<string[]>(profile.niches ?? [])
  const [phone, setPhone] = useState(profile.phone ?? '')
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp ?? '')
  const [sameAsPhone, setSameAsPhone] = useState(
    !!(profile.phone && profile.whatsapp && profile.phone === profile.whatsapp)
  )
  const [age, setAge] = useState(profile.age?.toString() ?? '')
  const [gender, setGender] = useState(profile.gender ?? '')

  function toggleNiche(n: string) {
    setNiches((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]))
  }

  function handlePhone(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 10)
    setPhone(digits)
    if (sameAsPhone) setWhatsapp(digits)
  }

  function handleSameAsPhone(checked: boolean) {
    setSameAsPhone(checked)
    if (checked) setWhatsapp(phone)
  }

  const platformUrlMet =
    platform === 'youtube' ? !!youtubeUrl :
    platform === 'instagram' ? !!instagramUrl :
    !!(youtubeUrl || instagramUrl)

  const missing = [
    !platformUrlMet && 'Platform URL',
    !(phone || whatsapp) && 'Phone number',
    niches.length === 0 && 'At least one niche',
    !age && 'Age',
    !gender && 'Gender',
  ].filter(Boolean) as string[]

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (phone && phone.length !== 10) { setError('Phone number must be 10 digits'); return }
    if (whatsapp && whatsapp.length !== 10) { setError('WhatsApp number must be 10 digits'); return }

    setSaving(true)
    setError('')

    const platformUrl = platform === 'instagram' ? instagramUrl : youtubeUrl
    const finalWhatsapp = sameAsPhone ? phone : whatsapp

    const { error } = await supabase.from('profiles').update({
      full_name: fullName,
      platform,
      platform_url: platformUrl || null,
      youtube_url: youtubeUrl || null,
      instagram_url: instagramUrl || null,
      followers_count: followersCount ? parseInt(followersCount) : null,
      niches,
      phone: phone || null,
      whatsapp: finalWhatsapp || null,
      age: age ? parseInt(age) : null,
      gender: gender || null,
    }).eq('id', userId)

    setSaving(false)
    if (error) { setError(error.message); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <form onSubmit={save} className="space-y-5">

      {/* Profile completeness banner */}
      {missing.length > 0 && (
        <div className="rounded-xl p-4 border" style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }}>
          <p className="text-xs font-semibold mb-1.5" style={{ color: '#92400E' }}>Required to apply for deals</p>
          <ul className="space-y-0.5">
            {missing.map((m) => (
              <li key={m} className="text-xs flex items-center gap-1.5" style={{ color: '#B45309' }}>
                <span className="w-1 h-1 rounded-full inline-block" style={{ backgroundColor: '#D97706' }} />
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Basic info */}
      <Section>
        <Field label="Full Name">
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Karthik Raja" className={inp} />
        </Field>
        <div className="flex gap-3">
          <div className="flex-1">
            <Field label={<Required>Age</Required>}>
              <input
                type="number" min={13} max={100}
                value={age} onChange={(e) => setAge(e.target.value)}
                placeholder="25" className={inp}
              />
            </Field>
          </div>
          <div className="flex-1">
            <Field label={<Required>Gender</Required>}>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className={inp}>
                <option value="">Select…</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </Field>
          </div>
        </div>
      </Section>

      {/* Platform */}
      <Section>
        <Field label={<Required>Platform</Required>}>
          <div className="flex gap-2">
            {(['youtube', 'instagram', 'both'] as const).map((p) => (
              <button key={p} type="button" onClick={() => setPlatform(p)}
                className="flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-colors"
                style={{
                  backgroundColor: platform === p ? 'var(--color-accent)' : 'var(--color-surface-alt)',
                  color: platform === p ? '#ffffff' : 'var(--color-text-secondary)',
                }}>
                {p === 'youtube' ? 'YouTube' : p === 'instagram' ? 'Instagram' : 'Both'}
              </button>
            ))}
          </div>
        </Field>
        {(platform === 'youtube' || platform === 'both') && (
          <Field label={<Required>YouTube Channel URL</Required>}>
            <input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="youtube.com/c/yourchannel" className={inp} />
          </Field>
        )}
        {(platform === 'instagram' || platform === 'both') && (
          <Field label={<Required>Instagram Profile URL</Required>}>
            <input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="instagram.com/yourhandle" className={inp} />
          </Field>
        )}
        <Field label="Followers / Subscribers">
          <input type="number" value={followersCount} onChange={(e) => setFollowersCount(e.target.value)} placeholder="50000" className={inp} />
        </Field>
      </Section>

      {/* Contact */}
      <Section>
        <Field label={<Required>Phone Number</Required>}>
          <div className="flex">
            <span className="border border-r-0 rounded-l-lg px-3 flex items-center text-sm"
              style={{ backgroundColor: 'var(--color-surface-alt)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>+91</span>
            <input
              type="tel" inputMode="numeric"
              value={phone} onChange={(e) => handlePhone(e.target.value)}
              placeholder="9876543210" maxLength={10}
              className={`${inp} rounded-l-none`}
            />
          </div>
          {phone && phone.length < 10 && (
            <p className="text-xs mt-1" style={{ color: 'var(--color-accent)' }}>{10 - phone.length} more digit{10 - phone.length !== 1 ? 's' : ''} needed</p>
          )}
        </Field>
        <Field label="WhatsApp Number">
          <div className="flex">
            <span className="border border-r-0 rounded-l-lg px-3 flex items-center text-sm"
              style={{ backgroundColor: 'var(--color-surface-alt)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>+91</span>
            <input
              type="tel" inputMode="numeric"
              value={sameAsPhone ? phone : whatsapp}
              onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 10))}
              disabled={sameAsPhone}
              placeholder="9876543210" maxLength={10}
              className={`${inp} rounded-l-none ${sameAsPhone ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>
          <label className="flex items-center gap-2 mt-2 cursor-pointer select-none w-fit">
            <input
              type="checkbox" checked={sameAsPhone}
              onChange={(e) => handleSameAsPhone(e.target.checked)}
              className="w-3.5 h-3.5"
              style={{ accentColor: 'var(--color-accent)' }}
            />
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Same as phone number</span>
          </label>
        </Field>
      </Section>

      {/* Niches */}
      <Section>
        <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
          Your Niches <span style={{ color: '#D97706' }}>*</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {NICHES.map((n) => (
            <button key={n} type="button" onClick={() => toggleNiche(n)}
              className="px-3 py-1.5 rounded-full text-sm capitalize transition-colors"
              style={{
                backgroundColor: niches.includes(n) ? 'var(--color-accent)' : 'var(--color-surface-alt)',
                color: niches.includes(n) ? '#ffffff' : 'var(--color-text-secondary)',
              }}>
              {n}
            </button>
          ))}
        </div>
      </Section>

      {error && <p className="text-sm" style={{ color: 'var(--color-accent)' }}>{error}</p>}

      <button type="submit" disabled={saving}
        className="w-full disabled:opacity-50 text-white font-medium py-3 rounded-xl text-sm transition-colors btn-accent">
        {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Profile'}
      </button>

      <button type="button" onClick={signOut}
        className="w-full border font-medium py-3 rounded-xl text-sm transition-colors"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
        Sign Out
      </button>
    </form>
  )
}

const inp = [
  'w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none transition-colors',
  'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-primary)]',
  'placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)]',
].join(' ')

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="border rounded-xl p-4 space-y-4"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs mb-1.5" style={{ color: 'var(--color-text-muted)' }}>{label}</label>
      {children}
    </div>
  )
}

function Required({ children }: { children: React.ReactNode }) {
  return <>{children} <span style={{ color: '#D97706' }}>*</span></>
}
