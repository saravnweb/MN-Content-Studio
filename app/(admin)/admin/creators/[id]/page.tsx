import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CreatorDetailPage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient()

  const { data: creator } = await supabase
    .from('profiles')
    .select('id, full_name, bio, platform, platform_url, youtube_url, instagram_url, twitter_url, followers_count, niches, gender, age, phone, whatsapp, created_at')
    .eq('id', params.id)
    .single()

  if (!creator) notFound()

  const { data: applications } = await supabase
    .from('applications')
    .select('id, status, created_at, campaign:campaigns(id, title, brand_name)')
    .eq('creator_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-3xl">
      <Link href="/admin/creators" className="text-gray-500 text-sm hover:text-gray-300 mb-6 inline-block">← Creators</Link>

      {/* Profile card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">{creator.full_name ?? '—'}</h2>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              {creator.gender && <span className="capitalize">{creator.gender.replace('_', ' ')}</span>}
              {creator.age && <span>{creator.age} yrs</span>}
              {creator.followers_count && (
                <span>{creator.followers_count.toLocaleString('en-IN')} followers</span>
              )}
            </div>
          </div>
          <p className="text-gray-600 text-xs shrink-0">
            Joined {new Date(creator.created_at).toLocaleDateString('en-IN')}
          </p>
        </div>

        {creator.bio && (
          <p className="text-gray-300 text-sm leading-relaxed mb-4">{creator.bio}</p>
        )}

        {/* Social links */}
        {(creator.youtube_url || creator.instagram_url || creator.twitter_url || creator.platform_url) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {(creator.youtube_url || (creator.platform === 'youtube' && creator.platform_url)) && (
              <a href={creator.youtube_url ?? creator.platform_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs bg-red-500/10 text-red-400 hover:text-red-300 px-3 py-1.5 rounded-full transition-colors">
                <span>▶</span> YouTube
              </a>
            )}
            {(creator.instagram_url || (creator.platform === 'instagram' && creator.platform_url)) && (
              <a href={creator.instagram_url ?? creator.platform_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs bg-pink-500/10 text-pink-400 hover:text-pink-300 px-3 py-1.5 rounded-full transition-colors">
                <span>◈</span> Instagram
              </a>
            )}
            {creator.twitter_url && (
              <a href={creator.twitter_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs bg-sky-500/10 text-sky-400 hover:text-sky-300 px-3 py-1.5 rounded-full transition-colors">
                <span className="font-bold">𝕏</span> Twitter
              </a>
            )}
          </div>
        )}

        {/* Contact */}
        <div className="flex flex-wrap gap-4 mb-4 text-xs">
          {creator.phone && (
            <a href={`tel:${creator.phone}`} className="text-gray-400 hover:text-white transition-colors">
              📞 {creator.phone}
            </a>
          )}
          {creator.whatsapp && (
            <a href={`https://wa.me/${creator.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300 transition-colors">
              💬 WhatsApp →
            </a>
          )}
        </div>

        {/* Niches */}
        {creator.niches?.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {creator.niches.map((n: string) => (
              <span key={n} className="text-xs bg-indigo-600/15 text-indigo-400 px-2.5 py-1 rounded-full capitalize">{n}</span>
            ))}
          </div>
        )}
      </div>

      {/* Campaign history */}
      <div>
        <h3 className="text-white font-semibold mb-4">Campaign Applications ({applications?.length ?? 0})</h3>
        {!applications?.length ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-500 text-sm">No applications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {applications.map((app: any) => (
              <Link key={app.id} href={`/admin/campaigns/${app.campaign?.id}`}
                className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
                <div>
                  <p className="text-white text-sm font-medium">{app.campaign?.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{app.campaign?.brand_name}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={app.status} />
                  <p className="text-gray-600 text-xs">{new Date(app.created_at).toLocaleDateString('en-IN')}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const s: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400',
    accepted: 'bg-green-500/10 text-green-400',
    rejected: 'bg-red-500/10 text-red-400',
    negotiating: 'bg-blue-500/10 text-blue-400',
  }
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${s[status] ?? 'bg-gray-800 text-gray-400'}`}>{status}</span>
}
