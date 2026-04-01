'use client'

import { useCallback, useEffect, useState } from 'react'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!

export default function PushSetup() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [permission, setPermission] = useState<NotificationPermission | 'default'>('default')

  const checkSubscription = useCallback(async () => {
    const registration = await getPushReg()
    const sub = await registration.pushManager.getSubscription()
    setSubscription(sub)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      checkSubscription()
      setPermission(Notification.permission)
    }
  }, [checkSubscription])

  async function getPushReg() {
    const reg = await navigator.serviceWorker.register('/sw-push.js')
    await new Promise<void>((resolve) => {
      if (reg.active) {
        reg.active.postMessage({ type: 'SET_VAPID_KEY', key: VAPID_PUBLIC_KEY })
        resolve()
      } else {
        const sw = reg.installing ?? reg.waiting
        sw?.addEventListener('statechange', function handler(e) {
          if ((e.target as ServiceWorker).state === 'activated') {
            reg.active!.postMessage({ type: 'SET_VAPID_KEY', key: VAPID_PUBLIC_KEY })
            resolve()
          }
        })
      }
    })
    return reg
  }



  async function subscribe() {
    try {
      const registration = await getPushReg()

      const result = await Notification.requestPermission()
      setPermission(result)
      if (result !== 'granted') return

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })

      const { p256dh, auth } = sub.toJSON().keys as { p256dh: string, auth: string }

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          p256dh,
          auth
        })
      })

      if (res.ok) {
        setSubscription(sub)
      }
    } catch (err) {
      console.error('Failed to subscribe to push notifications', err)
    }
  }

  async function unsubscribe() {
    if (!subscription) return

    try {
      await subscription.unsubscribe()

      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint })
      })

      setSubscription(null)
    } catch (err) {
      console.error('Failed to unsubscribe from push notifications', err)
    }
  }

  if (!isSupported) return null

  return (
    <div className="mt-6 p-4 rounded-2xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Push Notifications</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {subscription ? 'You are subscribed to new campaign alerts.' : 'Get notified instantly when new brand deals are posted.'}
          </p>
        </div>
        <button
          onClick={subscription ? unsubscribe : subscribe}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subscription ? 'border' : 'text-white btn-accent'
          }`}
          style={subscription ? { borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' } : {}}
        >
          {subscription ? 'Unsubscribe' : 'Enable Alerts'}
        </button>
      </div>

      {permission === 'denied' && (
        <p className="text-[10px] mt-2 text-red-500">
          Notifications are blocked. Please reset permission in your browser settings to enable alerts.
        </p>
      )}
    </div>
  )
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
