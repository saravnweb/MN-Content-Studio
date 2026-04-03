'use client'

import { useState, useMemo } from 'react'
import { Play, X, ExternalLink, Camera, Video } from 'lucide-react'

export type FeaturedVideo = {
  id: string
  video_url: string | null   // YouTube or Instagram link
  file_url: string | null    // Direct uploaded video file (Manual Upload)
  platform: 'instagram' | 'youtube'
  creator_name: string
  creator_niche: string | null
  brand_name: string
  avatar_initials: string
}

// ── URL utilities ────────────────────────────────────────────

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0]
    if (u.hostname.includes('youtube.com')) {
      const parts = u.pathname.split('/')
      const shortIdx = parts.indexOf('shorts')
      if (shortIdx !== -1) return parts[shortIdx + 1]
      const embedIdx = parts.indexOf('embed')
      if (embedIdx !== -1) return parts[embedIdx + 1]
      return u.searchParams.get('v')
    }
  } catch { /* invalid URL */ }
  return null
}

function getInstagramShortcode(url: string): string | null {
  if (!url) return null
  const m = url.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/)
  return m ? m[1] : null
}

function getThumbnail(video: FeaturedVideo): string | null {
  if (video.platform === 'youtube' && video.video_url) {
    const ytId = getYouTubeId(video.video_url)
    if (ytId) return `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`
  }
  return null // Instagram or File Upload → gradient placeholder or video preview
}

function getEmbedUrl(video: FeaturedVideo): string | null {
  if (video.video_url) {
    const ytId = getYouTubeId(video.video_url)
    if (ytId && video.platform === 'youtube') return `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`
    
    const igCode = getInstagramShortcode(video.video_url)
    if (igCode && video.platform === 'instagram') return `https://www.instagram.com/p/${igCode}/embed/captioned/`
  }
  return null
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

// ── Sub-components ───────────────────────────────────────────

function VideoCard({ video, onClick }: { video: FeaturedVideo; onClick: () => void }) {
  const thumbnail = getThumbnail(video)
  const isVertical = video.platform === 'instagram'

  return (
    <button
      onClick={onClick}
      className={`group relative w-full overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 transition-all duration-500 text-left hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500`}
      aria-label={`Play video by ${video.creator_name}`}
    >
      {/* Media Area */}
      <div className={`relative w-full overflow-hidden bg-gray-950 ${isVertical ? "aspect-[9/16]" : "aspect-video"}`}>
        {video.file_url ? (
          /* Premium Preview: Muted looping video */
          <video
            src={video.file_url}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            muted
            loop
            playsInline
            autoPlay
          />
        ) : thumbnail ? (
          <img
            src={thumbnail}
            alt=""
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          /* Placeholder */
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-950 to-violet-950">
            <span className="text-4xl font-bold text-white/20 select-none">
              {video.avatar_initials}
            </span>
          </div>
        )}

        {/* Glassmorphism overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        
        {/* Play Icon - Premium Style */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl scale-90 group-hover:scale-110 transition-all duration-500">
            <Play className="w-6 h-6 text-white fill-white ml-1" />
          </div>
        </div>

        {/* Platform Badge */}
        <div className="absolute top-3 right-3 z-10">
          <div className={`p-2 rounded-full backdrop-blur-md border shadow-lg ${
            video.platform === 'instagram' 
              ? "bg-pink-500/20 border-pink-500/30 text-pink-400" 
              : "bg-red-500/20 border-red-500/30 text-red-400"
          }`}>
            {video.platform === 'instagram' ? <InstagramIcon className="w-3.5 h-3.5" /> : <YoutubeIcon className="w-3.5 h-3.5" />}
          </div>
        </div>

        {/* Creator Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
          <p className="text-label text-indigo-400 mb-1">{video.brand_name || 'Showcase Content'}</p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-card-title text-white truncate">{video.creator_name}</p>
            {video.creator_niche && (
              <span className="text-badge bg-white/10 backdrop-blur-sm text-white border border-white/10 px-2 py-0.5 rounded-full font-bold">
                {video.creator_niche}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

function VideoModal({ video, onClose }: { video: FeaturedVideo; onClose: () => void }) {
  const embedUrl = getEmbedUrl(video)
  const isVertical = video.platform === 'instagram'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 backdrop-blur-2xl p-4 sm:p-8 pt-20 sm:pt-24 animate-in fade-in zoom-in duration-300"
      onClick={onClose}
    >
      {/* 
         Premium Close Button:
         - Large hit area (p-4 on the button)
         - Visual reinforcement (backdrop blur + border)
         - High z-index to stay above the iframe
      */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-8 sm:right-8 text-white transition-all p-4 hover:scale-110 z-[110] group"
        aria-label="Close modal"
      >
        <div className="bg-white/10 group-hover:bg-white/20 p-2.5 rounded-full backdrop-blur-xl border border-white/20 shadow-2xl transition-all">
          <X size={28} />
        </div>
      </button>

      <div
        className={`relative w-full bg-black rounded-3xl overflow-hidden shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)] border border-white/10 ${
          isVertical ? "max-w-md aspect-[9/16]" : "max-w-5xl aspect-video"
        }`}
        onClick={e => e.stopPropagation()}
      >
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            scrolling="no"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            title={`Video by ${video.creator_name}`}
          />
        ) : video.file_url ? (
          <video
            src={video.file_url}
            className="absolute inset-0 w-full h-full"
            controls
            autoPlay
            playsInline
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <p className="text-gray-400">Content unavailable</p>
            {video.video_url && (
              <a href={video.video_url} target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-indigo-400 underline">
                Open Original <ExternalLink size={14} />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Proof Banner */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center hidden sm:block">
        <p className="text-label text-white/30 tracking-[0.2em] mb-2">Authentic Social Proof</p>
        <p className="text-white/50 text-xs tracking-wide">Direct {video.platform === 'instagram' ? 'Instagram Reel' : 'YouTube Video'} Feed</p>
      </div>
    </div>
  )
}

// ── Main export ──────────────────────────────────────────────

export default function CreatorVideoGrid({ videos }: { videos: FeaturedVideo[] }) {
  const [activeVideo, setActiveVideo] = useState<FeaturedVideo | null>(null)
  const [platform, setPlatform] = useState<'instagram' | 'youtube'>('instagram')

  const filteredVideos = useMemo(() => 
    videos.filter(v => v.platform === platform),
  [videos, platform])

  if (videos.length === 0) return null

  return (
    <div className="w-full">
      {/* Platform Toggle */}
      <div className="flex justify-end mb-6 px-2">
        <div className="inline-flex p-1 bg-gray-900/50 border border-gray-800 rounded-full shadow-lg backdrop-blur-md">
          <button
            onClick={() => setPlatform('instagram')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-badge font-bold transition-all duration-500 ${
              platform === 'instagram' 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" 
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <InstagramIcon className={`w-3 h-3 ${platform === 'instagram' ? "text-white" : "text-pink-600/60"}`} />
            Instagram
          </button>
          <button
            onClick={() => setPlatform('youtube')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-badge font-bold transition-all duration-500 ${
              platform === 'youtube' 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" 
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <YoutubeIcon className={`w-3 h-3 ${platform === 'youtube' ? "text-white" : "text-red-600/60"}`} />
            YouTube
          </button>
        </div>
      </div>

      {/* Dynamic Grid */}
      <div className={`grid gap-4 sm:gap-6 lg:gap-8 transition-all duration-500 ${
        platform === 'instagram' 
          ? "grid-cols-2 md:grid-cols-3" 
          : "grid-cols-1 sm:grid-cols-2"
      }`}>
        {filteredVideos.length > 0 ? (
          filteredVideos.map(video => (
            <div key={video.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <VideoCard video={video} onClick={() => setActiveVideo(video)} />
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-gray-900/50 rounded-3xl border border-dashed border-gray-800">
            <p className="text-gray-500">No {platform} videos showcased yet.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {activeVideo && (
        <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </div>
  )
}
