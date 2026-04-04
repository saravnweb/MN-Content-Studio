'use client'

import { useState, useTransition, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { NICHES } from '@/lib/constants'
import { Trash2, Link as LinkIcon, Upload, Loader2, HelpCircle } from 'lucide-react'
import { addShowcaseVideo, deleteShowcaseVideo } from './actions'

type ShowcaseVideo = {
  id: string
  video_url: string | null
  file_url: string | null
  platform: 'instagram' | 'youtube'
  creator_name: string
  niche: string | null
  brand_name: string | null
  display_order: number
  created_at: string
}

const BLANK = {
  platform: 'instagram' as 'instagram' | 'youtube',
  video_url: '',
  creator_name: '',
  niche: '',
  brand_name: '',
}

// ── SVG Icons ────────────────────────────────────────────────

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
)

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
)

export default function ShowcaseManager({ initialVideos }: { initialVideos: ShowcaseVideo[] }) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [videos, setVideos] = useState(initialVideos)
  const [form, setForm] = useState(BLANK)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, startDeleteTransition] = useTransition()

  function setField(key: keyof typeof BLANK, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.creator_name.trim()) {
      setError('Creator name is required.')
      return
    }

    setUploading(true)
    try {
      let file_url: string | null = null

      // Upload file if selected
      if (selectedFile) {
        const ext = selectedFile.name.split('.').pop()
        const path = `showcase/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('campaign-assets')
          .upload(path, selectedFile, { upsert: false })

        if (uploadError) throw new Error(uploadError.message)

        const { data: urlData } = supabase.storage
          .from('campaign-assets')
          .getPublicUrl(path)
        file_url = urlData.publicUrl
      }

      const payload = {
        video_url: form.video_url.trim() || null,
        file_url,
        platform: form.platform,
        creator_name: form.creator_name.trim(),
        niche: form.niche || null,
        brand_name: form.brand_name.trim() || null,
        display_order: videos.length,
      }

      const data = await addShowcaseVideo(payload)

      setVideos(v => [...v, data])
      setForm(BLANK)
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      router.refresh()
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.')
    } finally {
      setUploading(false)
    }
  }

  function handleDelete(id: string) {
    const video = videos.find(v => v.id === id)
    startDeleteTransition(async () => {
      try {
        await deleteShowcaseVideo(id, video?.file_url ?? null)
        setVideos(v => v.filter(x => x.id !== id))
        router.refresh()
      } catch { /* ignore */ }
    })
  }

  return (
    <div className="space-y-8 pb-20 text-left">
      {/* ── Add form ── */}
      <form onSubmit={handleAdd} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-gray-100 font-semibold">Add New Video</h2>
          <div className="flex gap-2 p-1 bg-gray-800 rounded-lg">
            {(['instagram', 'youtube'] as const).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setField('platform', p)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  form.platform === p
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-gray-100'
                }`}
              >
                {p === 'instagram' ? <InstagramIcon className="w-3.5 h-3.5" /> : <YoutubeIcon className="w-3.5 h-3.5" />}
                {p === 'instagram' ? 'Instagram' : 'YouTube'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* Left Column: Source Info */}
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-400 mb-1.5">
                Platform Link (for Social Proof)
                <div className="group relative">
                  <HelpCircle size={14} className="text-gray-600" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-[10px] text-gray-300 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                    Paste the reel or video link. This shows the likes and comments when clicked.
                  </div>
                </div>
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="url"
                  value={form.video_url}
                  onChange={e => setField('video_url', e.target.value)}
                  placeholder={form.platform === 'instagram' ? "https://instagram.com/reel/..." : "https://youtube.com/watch?v=..."}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-gray-400 mb-1.5">
                Grid Preview File (for Design)
                <div className="group relative">
                  <HelpCircle size={14} className="text-gray-600" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-[10px] text-gray-300 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                    {form.platform === 'instagram' 
                      ? "Recommended for Reels. Upload a MP4 to show a high-quality looping preview in the grid."
                      : "Optional for YouTube. If uploaded, this replaces the YouTube thumbnail."}
                  </div>
                </div>
              </label>
              <div className="relative border-2 border-dashed border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors cursor-pointer group">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={e => setSelectedFile(e.target.files?.[0] ?? null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2">
                  <Upload className={`w-6 h-6 ${selectedFile ? 'text-emerald-400' : 'text-gray-600 group-hover:text-gray-400'}`} />
                  <p className="text-xs text-gray-500 text-center">
                    {selectedFile ? selectedFile.name : 'Click or drag video file'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Metadata */}
          <div className="space-y-4 text-left">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Creator Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.creator_name}
                onChange={e => setField('creator_name', e.target.value)}
                placeholder="e.g. Riya Sharma"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="niche-select" className="block text-sm text-gray-400 mb-1.5">Niche</label>
                <select
                  id="niche-select"
                  value={form.niche}
                  onChange={e => setField('niche', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">— Niche —</option>
                  {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Brand</label>
                <input
                  type="text"
                  value={form.brand_name}
                  onChange={e => setField('brand_name', e.target.value)}
                  placeholder="e.g. KFC"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-wait text-white font-bold px-5 py-3 rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
              >
                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                {uploading ? 'Processing Showcase...' : 'Publish to Showcase'}
              </button>
            </div>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      </form>

      {/* ── Video list ── */}
      <div className="space-y-4 text-left">
        <h2 className="text-gray-100 font-semibold flex items-center justify-between">
          <span>Manage Content ({videos.length})</span>
        </h2>
        
        <div className="grid grid-cols-1 gap-3">
          {videos.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
              <p className="text-gray-500 text-sm italic">Nothing published yet.</p>
            </div>
          ) : (
            videos.map(v => (
              <div key={v.id} className="group flex items-center gap-4 bg-gray-900/50 hover:bg-gray-900 border border-gray-800 p-4 rounded-2xl transition-all">
                <div className={`w-12 h-16 rounded-lg bg-gray-800 flex items-center justify-center shrink-0 border border-gray-700 overflow-hidden`}>
                  {v.file_url ? (
                    <video src={v.file_url} className="w-full h-full object-cover" muted />
                  ) : (
                    <div className="text-gray-600">
                      {v.platform === 'instagram' ? <InstagramIcon className="w-5 h-5" /> : <YoutubeIcon className="w-5 h-5" />}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                      v.platform === 'instagram' ? 'bg-pink-500/10 text-pink-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {v.platform}
                    </span>
                    <p className="text-gray-100 text-sm font-bold truncate">{v.creator_name}</p>
                  </div>
                  <p className="text-gray-500 text-[11px] truncate flex items-center gap-2">
                    {v.brand_name && <span className="text-gray-400">{v.brand_name}</span>}
                    {v.niche && <span className="w-1 h-1 rounded-full bg-gray-700" />}
                    {v.niche && <span>{v.niche}</span>}
                  </p>
                  <p className="text-gray-600 text-[10px] font-mono mt-1 truncate">
                    {v.video_url || 'No platform link'}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(v.id)}
                  className="opacity-0 group-hover:opacity-100 px-3 py-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all flex items-center gap-1 text-xs font-semibold"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
