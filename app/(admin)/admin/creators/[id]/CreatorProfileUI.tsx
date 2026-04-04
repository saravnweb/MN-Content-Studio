'use client'

import { useState } from 'react'
import { 
  User, 
  Megaphone, 
  Banknote, 
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Smartphone,
  Video,
  Camera,
  X,
  Globe,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import AdminNicheEditor from './AdminNicheEditor'
import FeatureToggleButton from './FeatureToggleButton'

type Tab = 'overview' | 'campaigns' | 'payments'

interface CreatorProfileUIProps {
  creator: any
  applications: any[]
  payoutSummary: {
    totalEarned: number
    paidCount: number
    pendingCount: number
  }
}

export default function CreatorProfileUI({ 
  creator, 
  applications, 
  payoutSummary 
}: CreatorProfileUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'campaigns', label: 'Participations', icon: Megaphone },
    { id: 'payments', label: 'Payments', icon: Banknote },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header Info */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-2xl font-bold text-gray-100 shadow-xl shadow-indigo-500/20">
            {creator.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) ?? '??'}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-100 tracking-tight font-heading">
              {creator.full_name ?? '—'}
            </h1>
            <div className="flex items-center gap-3 mt-1.5 text-gray-400">
               <span className="text-meta font-medium">@{creator.username || 'username'}</span>
               <span className="w-1 h-1 bg-gray-600 rounded-full" />
               <div className="flex items-center gap-1.5">
                 <Clock className="w-3.5 h-3.5" />
                 <span className="text-meta">Joined {new Date(creator.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
               </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Header */}
        <div className="flex gap-4">
          <StatMini label="Followers" value={formatCompactNumber(creator.followers_count ?? 0)} color="text-indigo-400" />
          <StatMini label="Joined Campaigns" value={applications.length.toString()} color="text-purple-400" />
          <StatMini label="Earnings" value={`₹${payoutSummary.totalEarned.toLocaleString('en-IN')}`} color="text-emerald-400" />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-800 mb-8 sticky top-0 bg-black/50 backdrop-blur-md z-10 -mx-4 px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all relative ${
                isActive ? 'text-gray-100' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : ''}`} />
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px] animate-in fade-in duration-300">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 shadow-sm">
                <h3 className="heading-section mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-400" /> Bio & Background
                </h3>
                <p className="text-gray-300 leading-relaxed text-base">
                  {creator.bio || <span className="text-gray-500 italic">No bio provided by creator.</span>}
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
                  <InfoItem icon={User} label="Gender" value={creator.gender?.replace('_', ' ') || '—'} color="text-purple-400" />
                  <InfoItem icon={Clock} label="Age" value={creator.age ? `${creator.age} years` : '—'} color="text-blue-400" />
                  <InfoItem icon={Globe} label="City" value={creator.city || '—'} color="text-emerald-400" />
                </div>
              </section>

              <section className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 shadow-sm">
                <h3 className="heading-section mb-6 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-indigo-400" /> Social Presence
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SocialCard 
                    platform="youtube" 
                    url={creator.youtube_url || (creator.platform === 'youtube' ? creator.platform_url : null)} 
                    label="YouTube Channel"
                  />
                  <SocialCard 
                    platform="instagram" 
                    url={creator.instagram_url || (creator.platform === 'instagram' ? creator.platform_url : null)} 
                    label="Instagram Account"
                  />
                  {creator.twitter_url && (
                    <SocialCard 
                      platform="twitter" 
                      url={creator.twitter_url} 
                      label="Twitter Profile"
                    />
                  )}
                </div>
              </section>
            </div>

            {/* Sidebar info */}
            <div className="space-y-6">
              <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-3xl p-6">
                <h4 className="text-label text-indigo-400 mb-6 px-1">Direct Contact</h4>
                <div className="space-y-4">
                  {creator.phone && (
                    <ContactItem 
                      href={`tel:${creator.phone}`} 
                      icon={Smartphone} 
                      label="Call Phone" 
                      subtext={creator.phone} 
                      hoverColor="hover:text-blue-400"
                    />
                  )}
                  {creator.whatsapp && (
                    <ContactItem 
                      href={`https://wa.me/${creator.whatsapp.replace(/\D/g, '')}`} 
                      icon={MessageCircle} 
                      label="WhatsApp Chat" 
                      subtext="Instant message" 
                      hoverColor="hover:text-green-400"
                    />
                  )}
                  {!creator.phone && !creator.whatsapp && (
                     <p className="text-gray-500 text-xs italic">No contact details provided.</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6">
                <AdminNicheEditor creatorId={creator.id} initialNiches={creator.niches ?? []} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
               <h3 className="heading-section flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-indigo-400" /> Campaign History
               </h3>
               <span className="text-meta font-medium">{applications.length} Participations</span>
            </div>
            
            {applications.length === 0 ? (
              <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-12 text-center">
                 <AlertCircle className="w-10 h-10 text-gray-700 mx-auto mb-4" />
                 <p className="text-gray-400 font-medium text-lg">No campaign participation history found.</p>
                 <p className="text-gray-600 text-sm mt-1">This creator hasn&apos;t applied to any roles yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {applications.map((app) => (
                  <Link 
                    key={app.id}
                    href={`/admin/campaigns/${app.campaign?.id}`}
                    className="group flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900/40 border border-gray-800 rounded-2xl p-5 hover:border-indigo-500/30 hover:bg-gray-900/60 transition-all transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/10 transition-colors">
                        <Megaphone className="w-5 h-5 text-gray-400 group-hover:text-indigo-400 transition-colors" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-gray-100 font-bold truncate group-hover:text-indigo-300 transition-colors">{app.campaign?.title}</h4>
                        <p className="text-meta mt-0.5">{app.campaign?.brand_name} • {new Date(app.created_at).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                       <StatusBadge status={app.status} />
                       {app.submission_status === 'approved' && app.submission_url && (
                        <div className="flex items-center gap-2 border-l border-gray-800 pl-4 ml-4" onClick={(e) => e.stopPropagation()}>
                           <p className="text-label hidden lg:block">Featured</p>
                           <FeatureToggleButton
                              applicationId={app.id}
                              isFeatured={!!app.is_homepage_featured}
                            />
                        </div>
                       )}
                       <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-100 transition-all transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Financial Overview */}
            <div className="space-y-6">
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-6">
                <h4 className="text-label text-emerald-400 mb-6">Earnings Summary</h4>
                <div className="space-y-6">
                  <div>
                    <p className="text-label mb-1">Total Earned</p>
                    <p className="text-stat font-black">₹{payoutSummary.totalEarned.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-500/10">
                    <div>
                      <p className="text-label mb-1">Completed</p>
                      <p className="heading-section">{payoutSummary.paidCount} Payouts</p>
                    </div>
                    <div>
                      <p className="text-label mb-1">In Processing</p>
                      <p className="heading-section">{payoutSummary.pendingCount} Pending</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6">
                <h4 className="text-label mb-6">Payment Settings</h4>
                {!(creator.account_number || creator.upi_id) ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-xs italic">Creator hasn&apos;t saved payment methods.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {creator.account_number && (
                      <div className="space-y-3">
                         <div className="flex items-center gap-2 text-indigo-400">
                           <Banknote className="w-3.5 h-3.5" />
                           <span className="text-label">Bank Account</span>
                         </div>
                         <div className="space-y-1 bg-black/20 rounded-xl p-3 border border-gray-800">
                           <PayItem label="Holder" value={creator.account_holder_name} />
                           <PayItem label="Bank" value={creator.bank_name} />
                           <PayItem label="Number" value={creator.account_number} mono />
                           <PayItem label="IFSC" value={creator.ifsc_code} mono />
                         </div>
                      </div>
                    )}
                    {creator.upi_id && (
                       <div className="space-y-3">
                        <div className="flex items-center gap-2 text-purple-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="text-label">UPI Details</span>
                        </div>
                        <div className="bg-black/20 rounded-xl p-3 border border-gray-800">
                          <p className="text-xs font-mono text-gray-100 select-all break-all">{creator.upi_id}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Payout History Table */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="heading-section flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-emerald-400" /> Payout History
              </h3>
              
              {applications.filter(a => a.payout_status === 'paid').length === 0 ? (
                <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-12 text-center">
                  <p className="text-gray-500 font-medium">No completed payouts yet.</p>
                </div>
              ) : (
                <div className="overflow-hidden border border-gray-800 rounded-3xl">
                  <table className="w-full text-left">
                    <thead className="bg-gray-800/50 text-label">
                      <tr>
                        <th className="px-6 py-4">Campaign</th>
                        <th className="px-6 py-4">Reference</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {applications.filter(a => a.payout_status === 'paid').map((app) => (
                        <tr key={app.id} className="text-meta text-gray-300 hover:bg-gray-900/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-100 max-w-[150px] truncate">{app.campaign?.title}</td>
                          <td className="px-6 py-4 font-mono text-xs text-gray-500">{app.payout_ref || '—'}</td>
                          <td className="px-6 py-4">{app.payout_date ? new Date(app.payout_date).toLocaleDateString('en-IN') : '—'}</td>
                          <td className="px-6 py-4 text-right font-black text-emerald-400">₹{app.payout_amount?.toLocaleString('en-IN') || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatMini({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl px-5 py-3 min-w-[100px]">
      <p className="text-label mb-1">{label}</p>
      <p className={`text-xl font-black ${color}`}>{value}</p>
    </div>
  )
}

function InfoItem({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="bg-black/20 rounded-2xl p-4 border border-gray-800/50">
      <div className={`flex items-center gap-2 ${color} mb-1`}>
        <Icon className="w-3.5 h-3.5" />
        <span className="text-label">{label}</span>
      </div>
      <p className="text-lg font-bold text-gray-100 truncate">{value}</p>
    </div>
  )
}

function SocialCard({ platform, url, label }: { platform: string; url: string | null; label: string }) {
  if (!url) return null
  
  const iconMap: Record<string, any> = {
    youtube: Video,
    instagram: Camera,
    twitter: X
  }
  const colorMap: Record<string, string> = {
    youtube: 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20',
    instagram: 'bg-pink-500/10 text-pink-500 border-pink-500/20 hover:bg-pink-500/20',
    twitter: 'bg-gray-100/5 text-gray-300 border-gray-100/10 hover:bg-gray-100/10'
  }
  
  const Icon = iconMap[platform] || Globe
  
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-[0.98] ${colorMap[platform]}`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <div>
          <p className="text-label opacity-60 leading-none mb-1">{platform}</p>
          <p className="text-sm font-bold truncate max-w-[120px]">{label}</p>
        </div>
      </div>
      <ExternalLink className="w-4 h-4 opacity-40" />
    </a>
  )
}

function ContactItem({ href, icon: Icon, label, subtext, hoverColor }: { href: string; icon: any; label: string; subtext: string; hoverColor: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`group block bg-black/20 border border-gray-800/50 rounded-2xl p-4 transition-all ${hoverColor} hover:border-current/30`}>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center group-hover:bg-current group-hover:bg-opacity-10 transition-colors">
          <Icon className="w-5 h-5 text-gray-500 group-hover:text-current transition-colors" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-100 group-hover:text-current transition-colors">{label}</p>
          <p className="text-meta mt-0.5">{subtext}</p>
        </div>
      </div>
    </a>
  )
}

function PayItem({ label, value, mono }: { label: string; value: string | null; mono?: boolean }) {
  if (!value) return null
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-label">{label}</span>
      <span className={`text-meta text-gray-300 ${mono ? 'font-mono' : 'font-medium'}`}>{value}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    accepted: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
    negotiating: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  }
  return (
    <span className={`text-badge px-3 py-1 rounded-full uppercase tracking-widest border font-bold ${styles[status] || 'bg-gray-800 text-gray-500 border-gray-700'}`}>
      {status}
    </span>
  )
}

function formatCompactNumber(number: number) {
  if (number >= 1000000) return (number / 1000000).toFixed(1) + 'M'
  if (number >= 1000) return (number / 1000).toFixed(1) + 'K'
  return number.toString()
}
