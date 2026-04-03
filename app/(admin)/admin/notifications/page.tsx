import { createClient } from '@/lib/supabase/server'
import MarkAllRead from './MarkAllRead'
import Link from 'next/link'
import { Bell, ClipboardList } from 'lucide-react'

export default async function AdminNotificationsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const unreadIds = notifications?.filter((n) => !n.read).map((n) => n.id) ?? []
  if (unreadIds.length > 0) {
    await supabase.from('notifications').update({ read: true }).in('id', unreadIds)
  }

  const unreadCount = unreadIds.length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-100">Notifications</h1>
          {unreadCount > 0 && <p className="text-sm mt-0.5 text-gray-400">{unreadCount} new</p>}
        </div>
        {unreadCount > 0 && <MarkAllRead userId={user!.id} />}
      </div>

      {!notifications?.length ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
          <Bell className="w-8 h-8 mx-auto mb-3 opacity-40 text-gray-400" />
          <p className="font-medium text-gray-300">No notifications yet</p>
          <p className="text-sm mt-1 text-gray-500">You&apos;ll be notified when creators apply.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const cid = n.payload?.campaign_id
            const url = n.type === 'new_application' && cid ? `/admin/campaigns/${cid}` : null
            const inner = (
              <div className={`bg-gray-900 border rounded-xl p-4 transition-colors ${url ? 'cursor-pointer hover:bg-gray-800/60' : ''} ${n.read ? 'border-gray-800' : 'border-gray-600'}`}>
                <div className="flex items-start gap-3">
                  <ClipboardList className="w-4 h-4 shrink-0 mt-0.5 text-gray-400 opacity-60" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-100">{n.title}</p>
                    <p className="text-xs mt-0.5 leading-relaxed text-gray-400">{n.body}</p>
                    <p className="text-xs mt-1.5 text-gray-500">
                      {new Date(n.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5" />}
                </div>
              </div>
            )
            return url
              ? <Link key={n.id} href={url} className="block">{inner}</Link>
              : <div key={n.id}>{inner}</div>
          })}
        </div>
      )}
    </div>
  )
}
