'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

type Brand = { id: string; name: string; tagline: string | null; logo_url: string | null }

export default function BrandsPage() {
  const supabase = createClient()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    supabase.from('brands').select('*').order('name').then(({ data }) => {
      if (data) setBrands(data)
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleLogoUpload(brand: Brand, file: File) {
    setUploadingId(brand.id)
    const logo_url = await uploadLogo(brand.name, file)
    if (!logo_url) { setUploadingId(null); return }

    const { error } = await supabase.from('brands').update({ logo_url }).eq('id', brand.id)
    if (error) { alert('Save failed: ' + error.message); setUploadingId(null); return }

    setBrands((prev) => prev.map((b) => b.id === brand.id ? { ...b, logo_url } : b))
    setUploadingId(null)
  }

  async function uploadLogo(brandName: string, file: File): Promise<string | null> {
    const ext = file.name.split('.').pop()
    const path = `brand-logos/${brandName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('campaign-assets').upload(path, file, { upsert: true })
    if (error) { alert('Upload failed: ' + error.message); return null }
    return supabase.storage.from('campaign-assets').getPublicUrl(path).data.publicUrl
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this brand? This cannot be undone.')) return
    setDeletingId(id)
    const { error } = await supabase.from('brands').delete().eq('id', id)
    if (error) { alert('Delete failed: ' + error.message); setDeletingId(null); return }
    setBrands((prev) => prev.filter((b) => b.id !== id))
    setDeletingId(null)
  }

  function onBrandCreated(brand: Brand) {
    setBrands((prev) => [...prev, brand].sort((a, b) => a.name.localeCompare(b.name)))
    setShowCreate(false)
  }

  if (loading) return <p className="text-gray-400 text-sm">Loading…</p>

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Brands</h2>
          <p className="text-gray-400 text-sm mt-1">Upload a logo once — reused across all campaigns</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          New Brand
        </button>
      </div>

      {/* Brand list */}
      {brands.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-800 rounded-2xl">
          <p className="text-gray-400 text-sm">No brands yet.</p>
          <button onClick={() => setShowCreate(true)} className="mt-3 text-indigo-400 hover:text-indigo-300 text-sm">
            Add your first brand →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {brands.map((brand) => (
            <div key={brand.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
              {/* Logo — click to replace */}
              <button
                type="button"
                onClick={() => fileInputs.current[brand.id]?.click()}
                disabled={uploadingId === brand.id}
                title="Click to upload logo"
                className="relative w-14 h-14 rounded-xl bg-gray-800 border-2 border-dashed border-gray-700 hover:border-indigo-500 flex items-center justify-center overflow-hidden shrink-0 transition-colors group"
              >
                {brand.logo_url ? (
                  <>
                    <Image src={brand.logo_url} alt={brand.name} fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-xs font-medium">Change</span>
                    </div>
                  </>
                ) : uploadingId === brand.id ? (
                  <span className="text-gray-400 text-xs">…</span>
                ) : (
                  <Initials name={brand.name} />
                )}
              </button>
              <input
                type="file" accept="image/*" className="hidden"
                ref={(el) => { fileInputs.current[brand.id] = el }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoUpload(brand, f) }}
              />

              <div className="flex-1 min-w-0">
                <p className="text-gray-100 font-medium text-sm">{brand.name}</p>
                {brand.tagline && <p className="text-gray-400 text-xs mt-0.5">{brand.tagline}</p>}
              </div>

              <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full ${
                brand.logo_url ? 'text-green-400 bg-green-500/10' : 'text-gray-400 bg-gray-800'
              }`}>
                {brand.logo_url ? 'Logo set' : 'No logo'}
              </span>
              <button
                onClick={() => handleDelete(brand.id)}
                disabled={deletingId === brand.id}
                title="Delete brand"
                className="text-gray-400 hover:text-red-400 disabled:opacity-30 text-sm transition-colors shrink-0"
              >
                {deletingId === brand.id ? '…' : '✕'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Brand Drawer */}
      {showCreate && (
        <CreateBrandDrawer
          onClose={() => setShowCreate(false)}
          onCreated={onBrandCreated}
          uploadLogo={uploadLogo}
          supabase={supabase}
        />
      )}
    </div>
  )
}

// ─── Create Brand Drawer ──────────────────────────────────────────────────────

const NICHE_TAGS = ['fitness', 'beauty', 'tech', 'food', 'fashion', 'travel', 'gaming', 'finance', 'lifestyle', 'health']

function CreateBrandDrawer({
  onClose, onCreated, uploadLogo, supabase,
}: {
  onClose: () => void
  onCreated: (b: Brand) => void
  uploadLogo: (name: string, file: File) => Promise<string | null>
  supabase: ReturnType<typeof import('@/lib/supabase/client').createClient>
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  function toggleTag(t: string) {
    setTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])
  }

  async function handleSave() {
    if (!name.trim()) { setError('Brand name is required'); return }
    setSaving(true)
    setError('')

    let logo_url: string | null = null
    if (logoFile) {
      logo_url = await uploadLogo(name.trim(), logoFile)
      if (!logo_url) { setSaving(false); return }
    }

    // Build tagline: use typed tagline, or fall back to selected tags
    const finalTagline = tagline.trim() || (tags.length ? tags.join(' · ') : null)

    const { data, error: insertErr } = await supabase
      .from('brands')
      .insert({ name: name.trim(), tagline: finalTagline, logo_url })
      .select()
      .single()

    if (insertErr) { setError(insertErr.message); setSaving(false); return }
    onCreated(data as Brand)
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-gray-950 border-l border-gray-800 flex flex-col shadow-2xl">
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <h3 className="text-gray-100 font-semibold text-base">New Brand</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-300 text-2xl leading-none">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">

          {/* Logo upload */}
          <div>
            <p className="text-xs text-gray-400 mb-3">Brand Logo</p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full h-40 rounded-2xl bg-gray-900 border-2 border-dashed border-gray-700 hover:border-indigo-500 flex flex-col items-center justify-center transition-colors overflow-hidden group"
            >
              {logoPreview ? (
                <Image src={logoPreview} alt="preview" fill className="object-contain p-3" />
              ) : (
                <div className="text-center">
                  <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-600/20 transition-colors">
                    <span className="text-gray-400 text-lg group-hover:text-indigo-400">↑</span>
                  </div>
                  <p className="text-gray-400 text-sm">Click to upload logo</p>
                  <p className="text-gray-400 text-xs mt-1">PNG, JPG, SVG — square works best</p>
                </div>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
            {logoPreview && (
              <button onClick={() => { setLogoFile(null); setLogoPreview(null) }}
                className="mt-2 text-xs text-gray-400 hover:text-red-400 transition-colors">
                Remove logo
              </button>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Brand Name *</label>
            <input
              value={name} onChange={(e) => setName(e.target.value)}
              placeholder="MuscleBlaze"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Tagline / Category</label>
            <input
              value={tagline} onChange={(e) => setTagline(e.target.value)}
              placeholder="Sports Nutrition · India"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500"
            />
            <p className="text-gray-700 text-xs mt-1.5">Or pick industry tags below — they&apos;ll be used as tagline</p>
          </div>

          {/* Industry tags */}
          <div>
            <label className="block text-xs text-gray-400 mb-2.5">Industry Tags</label>
            <div className="flex flex-wrap gap-2">
              {NICHE_TAGS.map((t) => (
                <button
                  key={t} type="button" onClick={() => toggleTag(t)}
                  className={`px-3 py-1.5 rounded-full text-xs capitalize transition-colors ${
                    tags.includes(t)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        {/* Drawer footer */}
        <div className="px-6 py-5 border-t border-gray-800 flex gap-3">
          <button onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-900 hover:bg-gray-800 text-gray-300 rounded-xl text-sm transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl text-sm transition-colors">
            {saving ? 'Saving…' : 'Save Brand'}
          </button>
        </div>
      </div>
    </>
  )
}

function Initials({ name }: { name: string }) {
  const letters = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  return <span className="text-gray-400 text-sm font-bold">{letters}</span>
}
