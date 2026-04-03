import { createAdminClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CreatorVideoGrid, { FeaturedVideo } from '@/components/landing/CreatorVideoGrid'
import BrandLogo from '@/components/BrandLogo'
import ThemeToggle from '@/components/ThemeToggle'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Creator Video Showcase — MW Content Studio',
  description: 'Explore the high-quality content created by our elite network of creators for top brands.',
}

export const revalidate = 3600 // Cache for 1 hour

// Cached function to fetch all admin-curated showcase videos
const getAllVideos = unstable_cache(
  async (): Promise<FeaturedVideo[]> => {
    const adminSupabase = createAdminClient()
    const { data } = await adminSupabase
      .from('showcase_videos')
      .select('id, video_url, file_url, creator_name, niche, brand_name, platform')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (!data) return []

    return data.map((row: any) => {
      const name: string = row.creator_name ?? 'Creator'
      const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
      return {
        id: row.id,
        video_url: row.video_url ?? null,
        file_url: row.file_url ?? null,
        platform: row.platform ?? (row.video_url?.includes('youtube.com') || row.video_url?.includes('youtu.be') ? 'youtube' : 'instagram'),
        creator_name: name,
        creator_niche: row.niche ?? null,
        brand_name: row.brand_name ?? '',
        avatar_initials: initials,
      }
    })
  },
  ['all-showcase-videos'],
  { revalidate: 3600, tags: ['featured-videos'] }
)

export default async function ShowcasePage() {
  const videos = await getAllVideos()

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-gray-950/90 backdrop-blur-md border-b border-gray-800 px-5 py-3 flex items-center justify-between">
        <BrandLogo withLink />
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-grow max-w-2xl mx-auto px-5 py-12">
        <div className="mb-10">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Back to home
          </Link>
          
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-100 mb-3">
            Video Showcase
          </h1>
          <p className="text-gray-400 text-lg">
            A curated selection of work from our elite creator network.
          </p>
        </div>

        {videos.length > 0 ? (
          <CreatorVideoGrid videos={videos} />
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
            <p className="text-gray-400">No showcase videos found.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
