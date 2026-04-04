import { createAdminClient } from '@/lib/supabase/server'
import ShowcaseManager from './ShowcaseManager'

export const dynamic = 'force-dynamic'

export default async function ShowcasePage() {
  const supabase = createAdminClient()

  const { data: videos } = await supabase
    .from('showcase_videos')
    .select('id, video_url, file_url, platform, creator_name, niche, brand_name, display_order, created_at')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">Homepage Showcase</h1>
        <p className="text-gray-400 text-sm mt-1">
          Videos shown in the &quot;Live View&quot; grid on the public homepage. Add a YouTube/Instagram link or upload a video file.
        </p>
      </div>

      <ShowcaseManager initialVideos={videos ?? []} />
    </div>
  )
}
