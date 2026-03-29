import { createClient } from '@/lib/supabase/server'
import MarkAllRead from './MarkAllRead'
import Link from 'next/link'
import { Bell, CheckCircle, XCircle, MessageCircle, Megaphone, ClipboardList } from 'lucide-react'

function getNotificationUrl(type: string, payload?: { campaign_id?: string }): string | null {
  if (type === 'submission_approved' || type === 'submission_revision_requested') return '/dashboard'
  const cid = payload?.campaign_id
  if (cid && ['application_accepted', 'application_rejected', 'application_negotiating', 'new_campaign'].includes(type)) {
    return `/deals/${cid}`
  }
  return null
}

export default async function NotificationsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  // Mark fetched notifications as read
  const unreadIds = notifications?.filter((n) => !n.read).map((n) => n.id) ?? []
  if (unreadIds.length > 0) {
    await supabase.from('notifications').update({ read: true }).in('id', unreadIds)
  }

  const unreadCount = unreadIds.length

  return (
    <div>
      <div className="flex items-center justify-between mb-6 pt-2">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Notifications</h1>
          {unreadCount > 0 && <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{unreadCount} new</p>}
        </div>
        {unreadCount > 0 && <MarkAllRead userId={user!.id} />}
      </div>

      {!notifications?.length ? (
        <div className="border rounded-xl p-10 text-center mt-4"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <Bell className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>No notifications yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>You&apos;ll hear here when brands respond</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const url = getNotificationUrl(n.type, n.payload)
            const inner = (
              <div
                className={`border rounded-xl p-4 transition-colors ${url ? 'cursor-pointer hover:opacity-80' : ''}`}
                style={{
                  backgroundColor: n.read ? 'var(--color-surface)' : 'var(--color-accent-soft)',
                  borderColor: n.read ? 'var(--color-border)' : 'var(--color-accent)',
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5 opacity-60"><NotifIcon type={n.type} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{n.title}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{n.body}</p>
                    <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
                      {new Date(n.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                    style={{ backgroundColor: 'var(--color-accent)' }} />}
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

function NotifIcon({ type }: { type: string }) {
  const cls = 'w-4 h-4 shrink-0'
  if (type === 'application_accepted') return <CheckCircle className={cls} />
  if (type === 'application_rejected') return <XCircle className={cls} />
  if (type === 'application_negotiating') return <MessageCircle className={cls} />
  if (type === 'new_campaign') return <Megaphone className={cls} />
  if (type === 'new_application') return <ClipboardList className={cls} />
  if (type === 'submission_approved') return <CheckCircle className={`${cls} text-emerald-400`} />
  if (type === 'submission_revision_requested') return <MessageCircle className={`${cls} text-yellow-400`} />
  return <Bell className={cls} />
}
