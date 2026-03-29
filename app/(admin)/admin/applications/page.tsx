import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ApplicationsPage() {
  const supabase = createClient()
  const { data: applications } = await supabase
    .from('applications')
    .select('id, status, created_at, creator:profiles(full_name, platform), campaign:campaigns(id, title, brand_name)')
    .order('created_at', { ascending: false })

  const pending = applications?.filter((a) => a.status === 'pending') ?? []
  const others = applications?.filter((a) => a.status !== 'pending') ?? []

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Applications</h2>
        <p className="text-gray-500 text-sm mt-1">{pending.length} pending · {applications?.length ?? 0} total</p>
      </div>

      {!applications?.length ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-500 text-sm">No applications yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <Group title="Pending Review" apps={pending} />
          )}
          {others.length > 0 && (
            <Group title="Reviewed" apps={others} />
          )}
        </div>
      )}
    </div>
  )
}

function Group({ title, apps }: { title: string; apps: any[] }) {
  return (
    <div>
      <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">{title}</h3>
      <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
        {apps.map((app) => (
          <Link key={app.id} href={`/admin/campaigns/${app.campaign?.id}`}
            className="flex items-center justify-between px-5 py-4 hover:bg-gray-800/50 transition-colors">
            <div>
              <p className="text-white text-sm font-medium">{app.creator?.full_name ?? '—'}</p>
              <p className="text-gray-500 text-xs mt-0.5">
                {app.campaign?.brand_name} · {app.campaign?.title}
                {app.creator?.platform ? ` · ${app.creator.platform}` : ''}
              </p>
            </div>
            <StatusBadge status={app.status} />
          </Link>
        ))}
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
