import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { company_name, contact_name, email, phone, niche, brief, budget_range, platforms, timeline } = body

  if (!company_name?.trim() || !contact_name?.trim() || !email?.trim() || !brief?.trim()) {
    return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from('brand_inquiries').insert({
    company_name: company_name.trim(),
    contact_name: contact_name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || null,
    niche: niche || null,
    brief: brief.trim(),
    budget_range: budget_range || null,
    platforms: platforms?.length ? platforms : null,
    timeline: timeline || null,
  })

  if (error) {
    console.error('brand_inquiries insert error:', error)
    return NextResponse.json({ 
      error: 'Something went wrong. Please try again.',
      debug: error.message // Temporarily include actual error for debugging
    }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
