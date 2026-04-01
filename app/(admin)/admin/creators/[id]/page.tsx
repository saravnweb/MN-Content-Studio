import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AdminNicheEditor from './AdminNicheEditor'
import { 
  User, 
  Calendar, 
  Smartphone, 
  MessageCircle, 
  Camera, 
  Video, 
  X, 
  Globe, 
  Users,
  ArrowUpRight,
  Clock
} from 'lucide-react'

export default async function CreatorDetailPage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient()

  const { data: creator } = await supabase
    .from('profiles')
    .select('id, full_name, bio, platform, platform_url, youtube_url, instagram_url, twitter_url, followers_count, niches, gender, age, phone, whatsapp, created_at, account_holder_name, bank_name, account_number, ifsc_code, upi_id')
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
      <Link href="/admin/creators" className="text-gray-400 text-base hover:text-gray-300 mb-6 inline-block">← Creators</Link>

      {/* Profile card - Redesigned for Premium Look */}
      <div className="relative overflow-hidden bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8 shadow-2xl">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Avatar & Basic Info */}
            <div className="flex-1">
              <div className="flex items-center gap-5 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-indigo-500/20">
                  {creator.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) ?? '??'}
                </div>
                <div>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                    {creator.full_name ?? '—'}
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5 text-gray-400 group">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-sm font-medium">Joined {new Date(creator.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {creator.bio && (
                <p className="text-gray-300 text-base leading-relaxed mb-8 max-w-xl border-l-2 border-indigo-500/30 pl-4 py-1 italic">
                  {creator.bio}
                </p>
              )}

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                {creator.followers_count && (
                  <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 transition-all hover:border-indigo-500/30 hover:bg-gray-800/60 group">
                    <div className="flex items-center gap-2 text-indigo-400 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Followers</span>
                    </div>
                    <p className="text-lg font-bold text-white leading-none">
                      {creator.followers_count.toLocaleString('en-IN')}
                    </p>
                  </div>
                )}
                <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 transition-all hover:border-indigo-500/30 hover:bg-gray-800/60">
                  <div className="flex items-center gap-2 text-purple-400 mb-1">
                    <User className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Profile</span>
                  </div>
                  <p className="text-lg font-bold text-white leading-none capitalize">
                    {creator.gender?.replace('_', ' ') ?? '—'}
                    {creator.age ? `, ${creator.age}y` : ''}
                  </p>
                </div>
              </div>

              {/* Status Section (Optional/Future) */}
              <div className="flex flex-wrap items-center gap-4 py-6 border-t border-gray-800/80">
                {/* Social links - Redesigned */}
                <div className="flex flex-wrap gap-2.5">
                  {(creator.youtube_url || (creator.platform === 'youtube' && creator.platform_url)) && (
                    <a href={creator.youtube_url ?? creator.platform_url} target="_blank" rel="noopener noreferrer"
                      className="group flex items-center gap-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-xl transition-all border border-red-500/20 hover:scale-[1.02] active:scale-95">
                      <Video className="w-4 h-4" />
                      <span className="text-sm font-bold">YouTube</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                  {(creator.instagram_url || (creator.platform === 'instagram' && creator.platform_url)) && (
                    <a href={creator.instagram_url ?? creator.platform_url} target="_blank" rel="noopener noreferrer"
                      className="group flex items-center gap-3 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 px-4 py-2 rounded-xl transition-all border border-pink-500/20 hover:scale-[1.02] active:scale-95">
                      <Camera className="w-4 h-4" />
                      <span className="text-sm font-bold">Instagram</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                  {creator.twitter_url && (
                    <a href={creator.twitter_url} target="_blank" rel="noopener noreferrer"
                      className="group flex items-center gap-3 bg-gray-100/5 hover:bg-gray-100/10 text-gray-400 hover:text-white px-4 py-2 rounded-xl transition-all border border-gray-100/10 hover:scale-[1.02] active:scale-95">
                      <X className="w-4 h-4" />
                      <span className="text-sm font-bold">Twitter</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar for Contact & Meta */}
            <div className="w-full md:w-64 space-y-6 shrink-0">
              {/* Contact Group */}
              <div className="bg-gray-800/30 rounded-2xl p-5 border border-gray-800/50">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Direct Contact</p>
                <div className="space-y-4">
                  {creator.phone && (
                    <a href={`tel:${creator.phone}`} className="flex items-center gap-3 text-gray-300 hover:text-white transition-all group">
                      <div className="p-2.5 rounded-lg bg-gray-800 border border-gray-700 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30 transition-all">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium truncate">{creator.phone}</span>
                    </a>
                  )}
                  {creator.whatsapp && (
                    <a href={`https://wa.me/${creator.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 text-gray-300 hover:text-green-400 transition-all group">
                      <div className="p-2.5 rounded-lg bg-gray-800 border border-gray-700 group-hover:bg-green-500/20 group-hover:border-green-500/30 transition-all">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">WhatsApp Chat</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Niches integrated into side */}
              <div className="bg-gray-800/30 rounded-2xl p-5 border border-gray-800/50">
                <AdminNicheEditor creatorId={creator.id} initialNiches={creator.niches ?? []} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment details */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h3 className="text-white font-semibold mb-4">Payment Details</h3>
        {!(creator.account_number || creator.upi_id) ? (
          <p className="text-gray-400 text-base">Creator has not saved payment details yet.</p>
        ) : (
          <div className="space-y-4">
            {creator.account_number && (
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide mb-2">Bank Account</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <PayField label="Account Holder" value={creator.account_holder_name} />
                  <PayField label="Bank Name" value={creator.bank_name} />
                  <PayField label="Account Number" value={creator.account_number} mono />
                  <PayField label="IFSC Code" value={creator.ifsc_code} mono />
                </div>
              </div>
            )}
            {creator.upi_id && (
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide mb-2">UPI</p>
                <PayField label="UPI ID" value={creator.upi_id} mono />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Campaign history */}
      <div>
        <h3 className="text-white font-semibold mb-4">Campaign Applications ({applications?.length ?? 0})</h3>
        {!applications?.length ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-400 text-base">No applications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {applications.map((app: any) => (
              <Link key={app.id} href={`/admin/campaigns/${app.campaign?.id}`}
                className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
                <div>
                  <p className="text-white text-base font-medium">{app.campaign?.title}</p>
                  <p className="text-gray-400 text-sm mt-0.5">{app.campaign?.brand_name}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={app.status} />
                  <p className="text-gray-400 text-sm">{new Date(app.created_at).toLocaleDateString('en-IN')}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PayField({ label, value, mono }: { label: string; value: string | null | undefined; mono?: boolean }) {
  if (!value) return null
  return (
    <div>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className={`text-white text-base mt-0.5 select-all ${mono ? 'font-mono tracking-wide' : ''}`}>{value}</p>
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
  return <span className={`text-sm font-medium px-2.5 py-1 rounded-full capitalize ${s[status] ?? 'bg-gray-800 text-gray-400'}`}>{status}</span>
}
