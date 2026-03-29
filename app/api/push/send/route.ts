import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

// Configure web-push once
webpush.setVapidDetails(
  process.env.VAPID_MAILTO!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
  /** If provided, only notify this creator; otherwise notify all */
  creatorId?: string
}

// Called by admin campaign creation or any server action
export async function POST(request: Request) {
  try {
    // Validate this is an internal call using a shared secret
    const authHeader = request.headers.get('x-internal-secret')
    if (authHeader !== process.env.INTERNAL_API_SECRET) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const payload: PushPayload = await request.json()
    const { title, body, url = '/deals', tag = 'new-campaign', creatorId } = payload

    // Use service role to bypass RLS and read all subscriptions
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    let query = supabase.from('push_subscriptions').select('endpoint, p256dh, auth, creator_id')
    if (creatorId) query = query.eq('creator_id', creatorId)

    const { data: subscriptions, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!subscriptions?.length) return NextResponse.json({ sent: 0 })

    const notification = JSON.stringify({ title, body, url, tag })

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            notification,
            { TTL: 86400 }, // 24h
          )
        } catch (err: any) {
          // 410 Gone = subscription expired — clean it up
          if (err.statusCode === 410) {
            await supabase.from('push_subscriptions')
              .delete().eq('endpoint', sub.endpoint)
          }
          throw err
        }
      })
    )

    const sent = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length
    return NextResponse.json({ sent, failed })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
