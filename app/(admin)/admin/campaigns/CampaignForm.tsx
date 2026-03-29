'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import NextImage from 'next/image'
import { Tag, FileText, Target, Settings, Play, Camera, Image as ImageIcon } from 'lucide-react'

const NICHES = [
  'fitness', 'food', 'tech', 'fashion', 'travel', 'beauty',
  'gaming', 'finance', 'lifestyle', 'wellness', 'education',
  'entertainment', 'sports', 'parenting', 'automotive', 'home-decor',
]
const PLATFORMS = ['youtube', 'instagram']
const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  youtube: <Play className="w-4 h-4" />,
  instagram: <Camera className="w-4 h-4" />,
}

type Brand = { id: string; name: string; tagline: string | null; logo_url: string | null }

interface CampaignFormProps {
  /** Pass existing campaign data to switch to edit mode */
  initial?: {
    id: string
    title: string
    description: string
    budget_min: number | null
    budget_max: number | null
    deliverables: string | null
    niches: string[]
    platforms: string[] | null
    deadline: string | null
    slots_total: number
    status: 'active' | 'paused' | 'closed'
    image_url: string | null
    video_url: string | null
    brand_name: string
    brand_logo_url: string | null
  }
}

export default function CampaignForm({ initial }: CampaignFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEdit = !!initial
  const modalFileRef = useRef<HTMLInputElement>(null)
  const bannerFileRef = useRef<HTMLInputElement>(null)

  // Brands
  const [brands, setBrands] = useState<Brand[]>([])
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  const [showAddBrand, setShowAddBrand] = useState(false)
  const [newBrandName, setNewBrandName] = useState('')
  const [newBrandTagline, setNewBrandTagline] = useState('')
  const [newBrandLogoFile, setNewBrandLogoFile] = useState<File | null>(null)
  const [newBrandLogoPreview, setNewBrandLogoPreview] = useState<string | null>(null)
  const [savingBrand, setSavingBrand] = useState(false)
  const [brandError, setBrandError] = useState('')

  // Campaign fields
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [budgetMin, setBudgetMin] = useState(String(initial?.budget_min ?? ''))
  const [budgetMax, setBudgetMax] = useState(String(initial?.budget_max ?? ''))
  const [deliverables, setDeliverables] = useState(initial?.deliverables ?? '')
  const [selectedNiches, setSelectedNiches] = useState<string[]>(initial?.niches ?? [])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(initial?.platforms ?? [])
  const [deadline, setDeadline] = useState(initial?.deadline?.slice(0, 10) ?? '')
  const [slotsTotal, setSlotsTotal] = useState(String(initial?.slots_total ?? 5))
  const [status, setStatus] = useState<'active' | 'paused' | 'closed'>(initial?.status ?? 'active')

  // Media
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(initial?.image_url ?? null)
  const [uploadingBanner, setUploadingBanner] = useState(false)

  // State
  const [error, setError] = useState('')
  const [activeSection, setActiveSection] = useState<'brand' | 'info' | 'targeting' | 'settings'>('brand')
  const [isPending, startTransition] = useTransition()

  // Steps
  const STEPS: { id: 'brand' | 'info' | 'targeting' | 'settings'; label: string; icon: React.ReactNode }[] = [
    { id: 'brand', label: 'Brand', icon: <Tag className="w-4 h-4" /> },
    { id: 'info', label: 'Info', icon: <FileText className="w-4 h-4" /> },
    { id: 'targeting', label: 'Targeting', icon: <Target className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ]

  useEffect(() => {
    supabase.from('brands').select('*').order('name').then(({ data }) => {
      if (data) {
        setBrands(data)
        if (initial?.brand_name) {
          const found = (data as Brand[]).find((b) => b.name === initial.brand_name)
          if (found) setSelectedBrand(found)
        }
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function onModalLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setNewBrandLogoFile(file)
    setNewBrandLogoPreview(URL.createObjectURL(file))
  }

  function onBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerFile(file)
    setBannerPreview(URL.createObjectURL(file))
  }

  async function saveBrand() {
    if (!newBrandName.trim()) { setBrandError('Brand name is required'); return }
    setSavingBrand(true); setBrandError('')
    let logo_url: string | null = null
    if (newBrandLogoFile) {
      const ext = newBrandLogoFile.name.split('.').pop()
      const path = `brand-logos/${newBrandName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('campaign-assets').upload(path, newBrandLogoFile, { upsert: true })
      if (uploadErr) { setBrandError('Logo upload failed: ' + uploadErr.message); setSavingBrand(false); return }
      logo_url = supabase.storage.from('campaign-assets').getPublicUrl(path).data.publicUrl
    }
    const { data, error: insertErr } = await supabase.from('brands')
      .insert({ name: newBrandName.trim(), tagline: newBrandTagline.trim() || null, logo_url }).select().single()
    if (insertErr) { setBrandError(insertErr.message); setSavingBrand(false); return }
    const newBrand = data as Brand
    setBrands((prev) => [...prev, newBrand].sort((a, b) => a.name.localeCompare(b.name)))
    setSelectedBrand(newBrand)
    setShowAddBrand(false); setNewBrandName(''); setNewBrandTagline('')
    setNewBrandLogoFile(null); setNewBrandLogoPreview(null); setSavingBrand(false)
  }

  async function uploadBanner(): Promise<string | null> {
    if (!bannerFile) return initial?.image_url ?? null
    setUploadingBanner(true)
    const ext = bannerFile.name.split('.').pop()
    const path = `campaign-banners/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('campaign-assets').upload(path, bannerFile, { upsert: true })
    setUploadingBanner(false)
    if (error) return null
    return supabase.storage.from('campaign-assets').getPublicUrl(path).data.publicUrl
  }

  async function handleSubmit(e: React.FormEvent, publishStatus: 'active' | 'paused') {
    e.preventDefault()
    if (!selectedBrand) { setError('Please select a brand'); setActiveSection('brand'); return }
    if (!title.trim()) { setError('Campaign title is required'); setActiveSection('info'); return }
    if (!description.trim()) { setError('Description is required'); setActiveSection('info'); return }
    if (selectedNiches.length === 0) { setError('Select at least one niche'); setActiveSection('targeting'); return }
    const min = budgetMin ? parseInt(budgetMin) : 0
    const max = budgetMax ? parseInt(budgetMax) : 0
    if (min > 0 && max > 0 && max < min) { setError('Budget Max must be >= Budget Min'); setActiveSection('targeting'); return }
    setError('')

    startTransition(async () => {
      const image_url = await uploadBanner()
      const payload = {
        title: title.trim(),
        brand_name: selectedBrand!.name,
        brand_logo_url: selectedBrand!.logo_url,
        description: description.trim(),
        budget_min: budgetMin ? parseInt(budgetMin) : null,
        budget_max: budgetMax ? parseInt(budgetMax) : null,
        deliverables: deliverables.trim() || null,
        niches: selectedNiches,
        platforms: selectedPlatforms.length ? selectedPlatforms : null,
        deadline: deadline || null,
        slots_total: parseInt(slotsTotal) || 5,
        status: publishStatus || status,
        image_url,
      }

      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload, isEdit, id: initial?.id })
      })
      
      const { error: apiErr } = await res.json()
      if (apiErr) { setError(apiErr); return }

      router.push('/admin/campaigns')
      router.refresh()
    })
  }

  const toggleNiche = (n: string) =>
    setSelectedNiches((p) => p.includes(n) ? p.filter((x) => x !== n) : [...p, n])
  const togglePlatform = (p: string) =>
    setSelectedPlatforms((p2) => p2.includes(p) ? p2.filter((x) => x !== p) : [...p2, p])

  const budgetDisplay = budgetMin || budgetMax
    ? `₹${parseInt(budgetMin || '0').toLocaleString('en-IN')}${budgetMax ? ` – ₹${parseInt(budgetMax).toLocaleString('en-IN')}` : ''}`
    : 'Not set'

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">{isEdit ? 'Edit Campaign' : 'New Campaign'}</h2>
          <p className="text-gray-400 text-sm mt-1">{isEdit ? 'Update campaign details' : 'Post a brand deal for creators'}</p>
        </div>
        {isEdit && (
          <StatusToggle value={status} onChange={setStatus} />
        )}
      </div>

      <div className="flex gap-6">
        {/* Step nav — left rail */}
        <div className="hidden md:flex flex-col gap-1 w-36 shrink-0 pt-1">
          {STEPS.map((step) => (
            <button key={step.id} type="button" onClick={() => setActiveSection(step.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                activeSection === step.id
                  ? 'bg-indigo-600/20 text-indigo-400'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
              }`}>
              <span>{step.icon}</span>
              {step.label}
            </button>
          ))}
          {/* Live preview card */}
          <div className="mt-4 bg-gray-900 border border-gray-800 rounded-xl p-3 space-y-2">
            <p className="text-gray-400 text-[10px] uppercase tracking-wider font-medium">Preview</p>
            {selectedBrand && (
              <div className="flex items-center gap-2">
                <BrandAvatar brand={selectedBrand} size="sm" />
                <p className="text-white text-xs font-medium truncate">{selectedBrand.name}</p>
              </div>
            )}
            {title && <p className="text-gray-300 text-xs leading-snug line-clamp-2">{title}</p>}
            {budgetMin && (
              <p className="text-indigo-400 text-xs font-semibold">{budgetDisplay}</p>
            )}
            {selectedNiches.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedNiches.slice(0, 3).map((n) => (
                  <span key={n} className="text-[9px] bg-indigo-600/15 text-indigo-400 px-1.5 py-0.5 rounded-full capitalize">{n}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main form */}
        <div className="flex-1 min-w-0">
          <form onSubmit={(e) => handleSubmit(e, status === 'closed' ? 'paused' : status)} className="space-y-5">

            {/* ── BRAND SECTION ── */}
            <FormSection id="brand" activeId={activeSection} title="Brand" icon={<Tag className="w-4 h-4" />}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-xs">Choose the brand for this campaign</p>
                <button type="button" onClick={() => { setShowAddBrand(true); setBrandError('') }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                  + New Brand
                </button>
              </div>

              {brands.length === 0 ? (
                <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center">
                  <p className="text-gray-400 text-sm mb-3">No brands yet</p>
                  <button type="button" onClick={() => setShowAddBrand(true)}
                    className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Add Your First Brand
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {brands.map((b) => (
                    <button key={b.id} type="button" onClick={() => setSelectedBrand(b)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                        selectedBrand?.id === b.id
                          ? 'border-indigo-500 bg-indigo-950 ring-1 ring-indigo-500/30'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                      }`}>
                      <BrandAvatar brand={b} size="sm" />
                      <div className="min-w-0">
                        <p className="text-white text-xs font-medium truncate">{b.name}</p>
                        {b.tagline && <p className="text-gray-400 text-[10px] truncate">{b.tagline}</p>}
                      </div>
                      {selectedBrand?.id === b.id && (
                        <span className="ml-auto text-indigo-400 text-xs shrink-0">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </FormSection>

            {/* ── CAMPAIGN INFO ── */}
            <FormSection id="info" activeId={activeSection} title="Campaign Info" icon={<FileText className="w-4 h-4" />}>
              <Field label="Campaign Title *">
                <input required value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Whey Protein Summer Campaign" className={inputCls} />
              </Field>
              <Field label="Description *">
                <textarea required rows={5} value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe who you're looking for, campaign goals, any requirements…"
                  className={`${inputCls} resize-none`} />
                <p className="text-gray-400 text-xs mt-1 text-right">{description.length} chars</p>
              </Field>
              <Field label="Deliverables">
                <input value={deliverables} onChange={(e) => setDeliverables(e.target.value)}
                  placeholder="e.g. 1 YouTube video + 2 Instagram Reels" className={inputCls} />
              </Field>

              {/* Banner image upload */}
              <Field label="Campaign Banner Image">
                <div
                  onClick={() => bannerFileRef.current?.click()}
                  className="relative cursor-pointer border-2 border-dashed border-gray-700 hover:border-indigo-500 rounded-xl overflow-hidden transition-colors"
                  style={{ minHeight: '120px' }}>
                  {bannerPreview ? (
                    <NextImage src={bannerPreview} alt="Banner" fill className="object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                      <p className="text-gray-400 text-sm">Click to upload banner</p>
                      <p className="text-gray-400 text-xs">Recommended: 1200×400px</p>
                    </div>
                  )}
                  {bannerPreview && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                      <p className="text-white text-sm font-medium">Change Image</p>
                    </div>
                  )}
                </div>
                <input ref={bannerFileRef} type="file" accept="image/*" onChange={onBannerChange} className="hidden" />
              </Field>
            </FormSection>

            {/* ── TARGETING ── */}
            <FormSection id="targeting" activeId={activeSection} title="Targeting" icon={<Target className="w-4 h-4" />}>
              <Field label="Budget Range (INR)">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                    <input type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)}
                      placeholder="15,000" className={`${inputCls} pl-7`} />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                    <input type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)}
                      placeholder="40,000" className={`${inputCls} pl-7`} />
                  </div>
                </div>
                <p className="text-gray-400 text-xs mt-1">Min budget · Max budget</p>
              </Field>

              <Field label="Niches * (select all that apply)">
                <div className="flex flex-wrap gap-2 mt-1">
                  {NICHES.map((n) => (
                    <button key={n} type="button" onClick={() => toggleNiche(n)}
                      className={`px-3 py-1.5 rounded-full text-sm capitalize transition-all font-medium ${
                        selectedNiches.includes(n)
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                      }`}>
                      {n}
                    </button>
                  ))}
                </div>
                {selectedNiches.length > 0 && (
                  <p className="text-indigo-400 text-xs mt-2">{selectedNiches.length} selected</p>
                )}
              </Field>

              <Field label="Platforms">
                <div className="flex gap-3 mt-1">
                  {PLATFORMS.map((p) => (
                    <button key={p} type="button" onClick={() => togglePlatform(p)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm capitalize font-medium transition-all ${
                        selectedPlatforms.includes(p)
                          ? 'bg-indigo-600 text-white ring-1 ring-indigo-400/30'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                      }`}>
                      <span>{PLATFORM_ICONS[p]}</span>
                      {p}
                    </button>
                  ))}
                </div>
              </Field>
            </FormSection>

            {/* ── SETTINGS ── */}
            <FormSection id="settings" activeId={activeSection} title="Settings" icon={<Settings className="w-4 h-4" />}>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Application Deadline">
                  <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputCls} />
                </Field>
                <Field label="Creator Slots">
                  <input type="number" min="1" max="100" value={slotsTotal}
                    onChange={(e) => setSlotsTotal(e.target.value)} className={inputCls} />
                </Field>
              </div>
              {!isEdit && (
                <div className="mt-2 flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700">
                  <input type="checkbox" id="start-paused" checked={status === 'paused'}
                    onChange={(e) => setStatus(e.target.checked ? 'paused' : 'active')}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 accent-indigo-600" />
                  <label htmlFor="start-paused" className="text-sm text-gray-300 cursor-pointer">
                    Save as draft (don&apos;t publish yet)
                  </label>
                </div>
              )}
            </FormSection>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Action bar */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => router.back()}
                className="px-5 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors">
                Cancel
              </button>
              {!isEdit && (
                <button type="button" disabled={isPending}
                  onClick={(e) => handleSubmit(e as any, 'paused')}
                  className="px-5 py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 rounded-xl text-sm font-medium transition-colors">
                  Save Draft
                </button>
              )}
              <button type="submit" disabled={isPending || uploadingBanner}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-lg shadow-indigo-900/30 active:scale-[0.99]">
                {isPending || uploadingBanner
                  ? (uploadingBanner ? 'Uploading…' : 'Saving…')
                  : isEdit
                    ? 'Save Changes'
                    : status === 'paused' ? 'Save as Draft' : 'Publish Campaign'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Add Brand Modal ── */}
      {showAddBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Add New Brand</h3>
              <button type="button" onClick={() => setShowAddBrand(false)}
                className="text-gray-400 hover:text-gray-300 w-8 h-8 rounded-full hover:bg-gray-800 flex items-center justify-center transition-colors">
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button type="button" onClick={() => modalFileRef.current?.click()}
                className="w-20 h-20 rounded-2xl bg-gray-800 border-2 border-dashed border-gray-700 hover:border-indigo-500 flex items-center justify-center overflow-hidden shrink-0 transition-colors">
                {newBrandLogoPreview
                  ? <NextImage src={newBrandLogoPreview} alt="logo" fill className="object-cover" />
                  : <span className="text-gray-400 text-xs text-center leading-tight px-2">Upload Logo</span>
                }
              </button>
              <input ref={modalFileRef} type="file" accept="image/*" onChange={onModalLogoChange} className="hidden" />
              <p className="text-gray-400 text-xs leading-relaxed">Upload the brand logo. It will be reused across campaigns.</p>
            </div>

            <div className="space-y-3">
              <Field label="Brand Name *">
                <input value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="e.g. MuscleBlaze" className={inputCls} />
              </Field>
              <Field label="Tagline / Category">
                <input value={newBrandTagline} onChange={(e) => setNewBrandTagline(e.target.value)}
                  placeholder="e.g. Sports Nutrition · India" className={inputCls} />
              </Field>
            </div>

            {brandError && <p className="text-red-400 text-xs">{brandError}</p>}

            <div className="flex gap-3">
              <button type="button" onClick={() => setShowAddBrand(false)}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm transition-colors">
                Cancel
              </button>
              <button type="button" onClick={saveBrand} disabled={savingBrand}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl text-sm transition-colors">
                {savingBrand ? 'Saving…' : 'Save Brand'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────

function FormSection({ id, activeId, title, icon, children }: {
  id: string; activeId: string; title: string; icon: React.ReactNode; children: React.ReactNode
}) {
  const isActive = activeId === id
  return (
    <div className={`bg-gray-900 border rounded-xl transition-all ${
      isActive ? 'border-indigo-500/40 ring-1 ring-indigo-500/10' : 'border-gray-800'
    }`}>
      <button type="button" onClick={() => {}}
        className="w-full flex items-center gap-3 px-5 py-4 text-left">
        <span>{icon}</span>
        <span className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-300'}`}>{title}</span>
      </button>
      <div className="px-5 pb-5 space-y-4 border-t border-gray-800">
        {children}
      </div>
    </div>
  )
}

function StatusToggle({ value, onChange }: { value: string; onChange: (v: 'active' | 'paused' | 'closed') => void }) {
  const opts = [
    { v: 'active', label: 'Active', cls: 'bg-green-500/10 text-green-400 border-green-500/30' },
    { v: 'paused', label: 'Paused', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
    { v: 'closed', label: 'Closed', cls: 'bg-gray-700 text-gray-400 border-gray-600' },
  ] as const
  return (
    <div className="flex gap-1.5 p-1 bg-gray-900 border border-gray-800 rounded-xl">
      {opts.map((o) => (
        <button key={o.v} type="button" onClick={() => onChange(o.v)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            value === o.v ? `${o.cls} border` : 'text-gray-400 hover:text-gray-400'
          }`}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

function BrandAvatar({ brand, size }: { brand: Brand; size: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'w-8 h-8 rounded-lg text-xs' : 'w-10 h-10 rounded-xl text-sm'
  const initials = brand.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  if (brand.logo_url) {
    const dim = size === 'sm' ? 32 : 40
    return <NextImage src={brand.logo_url} alt={brand.name} width={dim} height={dim} className={`${cls} object-cover shrink-0`} />
  }
  return <div className={`${cls} bg-indigo-900 text-indigo-300 font-bold flex items-center justify-center shrink-0`}>{initials}</div>
}

const inputCls = 'w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-colors'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5 font-medium">{label}</label>
      {children}
    </div>
  )
}
