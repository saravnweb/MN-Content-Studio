import React from 'react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AdminCharts from './AdminCharts'
import { User, Megaphone, Clock, ClipboardList, CheckCircle, Banknote, ChevronRight } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = createClient()

  const [
    { count: totalCreators },
    { count: activeCampaigns },
    { count: pendingApplications },
    { count: totalApplications },
    { count: approvedContent },
    { count: submissionsNeedingReview },
    { count: pendingPayouts },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'creator'),
    supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('applications').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('*', { count: 'exact', head: true }).eq('submission_status', 'approved'),
    supabase.from('applications').select('*', { count: 'exact', head: true }).eq('submission_status', 'submitted'),
    supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'accepted').eq('submission_status', 'approved').in('payout_status', ['unpaid', 'processing']),
  ])

  // Revenue: sum all paid payouts
  const { data: revenueData } = await supabase
    .from('applications')
    .select('payout_amount, payout_date')
    .eq('payout_status', 'paid')

  const totalRevenue = revenueData?.reduce((s, r) => s + (r.payout_amount ?? 0), 0) ?? 0

  // Applications per day — last 14 days
  const { data: appsByDay } = await supabase
    .from('applications')
    .select('created_at')
    .gte('created_at', new Date(Date.now() - 14 * 86400000).toISOString())
    .order('created_at', { ascending: true })

  // Build a 14-day histogram
  const dayMap: Record<string, number> = {}
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    dayMap[d.toISOString().slice(0, 10)] = 0
  }
  appsByDay?.forEach((a) => {
    const day = a.created_at.slice(0, 10)
    if (dayMap[day] !== undefined) dayMap[day]++
  })
  const chartData = Object.entries(dayMap).map(([date, count]) => ({ date, count }))

  // Payout status breakdown
  const { data: payoutBreakdown } = await supabase
    .from('applications')
    .select('payout_status')
    .eq('status', 'accepted')
    .eq('submission_status', 'approved')

  const payoutCounts = {
    unpaid: payoutBreakdown?.filter((p) => p.payout_status === 'unpaid').length ?? 0,
    processing: payoutBreakdown?.filter((p) => p.payout_status === 'processing').length ?? 0,
    paid: payoutBreakdown?.filter((p) => p.payout_status === 'paid').length ?? 0,
  }

  const { data: recentApps } = await supabase
    .from('applications')
    .select('id, status, created_at, creator:profiles(full_name), campaign:campaigns(id, title, brand_name)')
    .order('created_at', { ascending: false })
    .limit(6)

  const attentionItems = [
    { count: pendingApplications ?? 0, label: 'Pending Applications', href: '/admin/applications', color: 'text-yellow-400', border: 'border-yellow-500/20', bg: 'bg-yellow-500/5' },
    { count: submissionsNeedingReview ?? 0, label: 'Awaiting Content Review', href: '/admin/submissions', color: 'text-yellow-400', border: 'border-yellow-500/20', bg: 'bg-yellow-500/5' },
    { count: pendingPayouts ?? 0, label: 'Payouts Due', href: '/admin/payouts', color: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/5' },
  ].filter((item) => item.count > 0)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-100">Dashboard</h2>
        <p className="text-gray-400 text-sm mt-1">Platform overview</p>
      </div>

      {/* ── Needs Attention ── */}
      {attentionItems.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-6">
          <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">Needs Attention</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {attentionItems.map((item) => (
              <Link key={item.href} href={item.href}
                className={`flex items-center justify-between ${item.bg} border ${item.border} rounded-xl px-4 py-3 hover:opacity-90 transition-opacity`}>
                <div>
                  <p className={`text-2xl font-bold ${item.color}`}>{item.count}</p>
                  <p className="text-gray-300 text-xs mt-0.5">{item.label}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Creators" value={totalCreators ?? 0} sub="registered" color="text-gray-400" icon={<User className="w-6 h-6" />} />
        <StatCard label="Active Campaigns" value={activeCampaigns ?? 0} sub="live now" color="text-green-400" icon={<Megaphone className="w-6 h-6" />} />
        <StatCard label="Pending Review" value={pendingApplications ?? 0} sub="applications" color="text-yellow-400" icon={<Clock className="w-6 h-6" />} />
        <StatCard label="Total Applications" value={totalApplications ?? 0} sub="all time" color="text-gray-400" icon={<ClipboardList className="w-6 h-6" />} />
        <StatCard label="Content Approved" value={approvedContent ?? 0} sub="deliverables" color="text-green-400" icon={<CheckCircle className="w-6 h-6" />} />
        <StatCard
          label="Total Paid Out"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          sub="to creators"
          color="text-gray-300"
          icon={<Banknote className="w-6 h-6" />}
          isString
        />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* Applications sparkline */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-100 font-semibold text-sm mb-1">Applications — Last 14 Days</p>
          <p className="text-gray-400 text-xs mb-4">{(appsByDay?.length ?? 0)} applications in this period</p>
          <AdminCharts chartData={chartData} payoutCounts={payoutCounts} />
        </div>

        {/* Payout donut */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-100 font-semibold text-sm mb-1">Payout Status</p>
          <p className="text-gray-400 text-xs mb-4">Approved content only</p>
          <PayoutDonut counts={payoutCounts} />
        </div>
      </div>

      {/* ── Recent Applications ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-100 font-semibold">Recent Applications</h3>
          <Link href="/admin/applications" className="text-gray-400 hover:text-white text-sm hover:underline transition-colors">View all</Link>
        </div>
        {!recentApps?.length ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-400 text-sm">No applications yet</p>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
            {recentApps.map((app: any) => (
              <Link key={app.id} href={`/admin/campaigns/${app.campaign?.id}`}
                className="px-5 py-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
                <div>
                  <p className="text-gray-100 text-sm font-medium">{app.creator?.full_name ?? '—'}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{app.campaign?.brand_name} · {app.campaign?.title}</p>
                </div>
                <StatusBadge status={app.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, color, icon, isString }: {
  label: string; value: number | string; sub: string; color: string; icon: React.ReactNode; isString?: boolean
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-start gap-4">
      <span className={`mt-0.5 shrink-0 ${color}`}>{icon}</span>
      <div className="min-w-0">
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-2xl font-bold ${color} truncate`}>{value}</p>
        <p className="text-gray-400 text-xs mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

function PayoutDonut({ counts }: { counts: { unpaid: number; processing: number; paid: number } }) {
  const total = counts.unpaid + counts.processing + counts.paid
  if (total === 0) return <p className="text-gray-400 text-sm text-center py-8">No approved content yet</p>

  const segments = [
    { label: 'Unpaid', count: counts.unpaid, color: '#F87171' },
    { label: 'Processing', count: counts.processing, color: '#FBBF24' },
    { label: 'Paid', count: counts.paid, color: '#4ADE80' },
  ]

  // Simple bar chart instead of SVG donut
  return (
    <div className="space-y-3">
      {segments.map((s) => {
        const pct = total > 0 ? Math.round((s.count / total) * 100) : 0
        return (
          <div key={s.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">{s.label}</span>
              <span className="font-semibold" style={{ color: s.color }}>{s.count} ({pct}%)</span>
            </div>
            <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: s.color }} />
            </div>
          </div>
        )
      })}
      <p className="text-gray-400 text-xs pt-2 text-center">{total} total approved deliverables</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400',
    accepted: 'bg-green-500/10 text-green-400',
    rejected: 'bg-red-500/10 text-red-400',
    negotiating: 'bg-yellow-500/10 text-yellow-400',
  }
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${styles[status] ?? 'bg-gray-800 text-gray-400'}`}>
      {status}
    </span>
  )
}
