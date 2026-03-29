import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check if admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { payload, isEdit, id } = await request.json()

    let result;
    if (isEdit && id) {
      result = await supabase.from('campaigns').update(payload).eq('id', id).select().single()
    } else {
      result = await supabase.from('campaigns').insert(payload).select().single()
    }

    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 })

    // If newly published (active), send push notifications
    if (payload.status === 'active' && !isEdit) {
      const origin = new URL(request.url).origin
      
      // Fire and forget push notification
      fetch(`${origin}/api/push/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-secret': process.env.INTERNAL_API_SECRET!,
        },
        body: JSON.stringify({
          title: `New Deal: ${payload.brand_name}`,
          body: payload.title,
          url: `/deals/${result.data.id}`,
        }),
      }).catch(err => console.error('Push broadcast failed', err))
    }

    return NextResponse.json({ ok: true, data: result.data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const { error } = await supabase.from('campaigns').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
