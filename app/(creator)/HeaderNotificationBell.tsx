'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Bell, CheckCircle, XCircle, MessageCircle, Megaphone, ClipboardList } from 'lucide-react'

type Notification = {
  id: string
  type: string
  title: string
  body: string
  read: boolean
  created_at: string
  payload?: { campaign_id?: string }
}

function getNotificationUrl(type: string, payload?: { campaign_id?: string }): string | null {
  if (type === 'submission_approved' || type === 'submission_revision_requested') return '/dashboard'
  const cid = payload?.campaign_id
  if (cid && ['application_accepted', 'application_rejected', 'application_negotiating', 'new_campaign'].includes(type)) {
    return `/deals/${cid}`
  }
  return null
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

export default function HeaderNotificationBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const supabase = useRef(createClient()).current
  const router = useRouter()

  useEffect(() => {
    async function fetchUnread() {
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false)
      setUnread(count ?? 0)
    }

    fetchUnread()

    const channel = supabase
      .channel(`header-notif-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, () => setUnread((c) => c + 1))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, supabase])

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  async function fetchNotifications() {
    setLoading(true)
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    setNotifications(data ?? [])
    setLoading(false)
  }

  async function markAllRead() {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnread(0)
  }

  function handleToggle() {
    const nextOpen = !open
    setOpen(nextOpen)
    if (nextOpen) {
      fetchNotifications()
      if (unread > 0) {
        supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
          .then(() => setUnread(0))
      }
    }
  }

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-400 hover:text-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 bg-indigo-500 text-white text-[9px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5 border-2 border-gray-950">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 max-h-[70vh] flex flex-col rounded-xl border border-gray-700 bg-gray-900 shadow-2xl" style={{ zIndex: 9999 }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 shrink-0">
            <span className="font-semibold text-sm text-gray-100">Notifications</span>
            {notifications.some((n) => !n.read) && (
              <button onClick={markAllRead} className="text-indigo-400 text-xs hover:underline">
                Mark all read
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <p className="text-center text-gray-500 text-sm py-8">Loading…</p>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10 px-4">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm text-gray-400">No notifications yet</p>
                <p className="text-xs text-gray-600 mt-1">You&apos;ll hear here when brands respond</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {notifications.map((n) => {
                  const url = getNotificationUrl(n.type, n.payload)
                  return (
                    <div
                      key={n.id}
                      onClick={url ? () => { router.push(url); setOpen(false) } : undefined}
                      className={`px-4 py-3 flex items-start gap-3 ${!n.read ? 'bg-indigo-950/40' : ''} ${url ? 'cursor-pointer hover:bg-gray-800/60' : ''}`}
                    >
                      <span className="shrink-0 mt-0.5 opacity-60"><NotifIcon type={n.type} /></span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-100 leading-snug">{n.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{n.body}</p>
                        <p className="text-[10px] text-gray-600 mt-1">
                          {new Date(n.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0 mt-1.5" />}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
