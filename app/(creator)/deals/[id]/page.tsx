import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import ApplyButton from './ApplyButton'
import Link from 'next/link'
import Linkify from '@/components/Linkify'
import { ChevronLeft, Banknote, Calendar, Package, CalendarDays, Users, Play, Camera } from 'lucide-react'

export default async function DealDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: campaign } = await supabase.from('campaigns').select('*').eq('id', params.id).single()
  if (!campaign) notFound()

  const [{ data: app }, { data: profile }] = await Promise.all([
    supabase.from('applications').select('id, status').eq('campaign_id', params.id).eq('creator_id', user!.id).maybeSingle(),
    supabase.from('profiles').select('platform, platform_url, niches').eq('id', user!.id).single(),
  ])

  if (!campaign.brand_logo_url) {
    const { data: brand } = await supabase.from('brands').select('logo_url').eq('name', campaign.brand_name).maybeSingle()
    if (brand?.logo_url) campaign.brand_logo_url = brand.logo_url
  }

  const profileComplete = !!(profile?.platform_url && profile?.niches && profile.niches.length > 0)
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`
  const slotsLeft = campaign.slots_total - campaign.slots_filled
  const PlatformIcon = ({ p }: { p: string }) =>
    p === 'youtube' ? <Play className="w-3 h-3 inline-block mr-0.5" /> :
    p === 'instagram' ? <Camera className="w-3 h-3 inline-block mr-0.5" /> : null

  return (
    <>
      {/* Back */}
      <Link href="/deals" className="inline-flex items-center gap-1.5 text-sm mb-5 font-medium transition-colors"
        style={{ color: 'var(--color-text-muted)' }}>
        <ChevronLeft className="w-4 h-4" />
        Back
      </Link>

      {/* ── Brand Hero Card ── */}
      <div className="rounded-2xl overflow-hidden border mb-4 shadow-sm"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>

        {campaign.image_url && (
          <div className="h-36 w-full relative overflow-hidden">
            <Image src={campaign.image_url} alt={campaign.title} fill priority className="object-cover" />
          </div>
        )}

        <div className="px-4 pt-4 pb-5">
          {/* Brand Logo + Name */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border relative shrink-0" style={{ borderColor: 'var(--color-border)' }}>
              {campaign.brand_logo_url ? (
                <Image src={campaign.brand_logo_url} alt={campaign.brand_name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: 'var(--color-accent)' }}>
                  {campaign.brand_name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Brand</p>
              <p className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>{campaign.brand_name}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Slots left</p>
              <p className={`text-sm font-bold ${slotsLeft === 0 ? 'text-red-500' : slotsLeft <= 2 ? 'text-amber-500' : ''}`}
                style={slotsLeft > 2 ? { color: 'var(--color-accent)' } : {}}>
                {slotsLeft} / {campaign.slots_total}
              </p>
            </div>
          </div>

          <h1 className="text-xl font-bold leading-snug mb-1" style={{ color: 'var(--color-text-primary)' }}>
            {campaign.title}
          </h1>

          {campaign.platforms && campaign.platforms.length > 0 && (
            <p className="text-xs capitalize mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
              {campaign.platforms.map((p: string, i: number) => (
                <span key={p} className="inline-flex items-center gap-1">
                  {i > 0 && <span className="opacity-40">·</span>}
                  <PlatformIcon p={p} />{p}
                </span>
              ))}
            </p>
          )}

          <div className="flex flex-wrap gap-1.5">
            {campaign.niches?.map((n: string) => (
              <span key={n} className="text-xs px-2.5 py-1 rounded-full capitalize font-medium"
                style={{ backgroundColor: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}>
                {n}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Meta Grid ── */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {(campaign.budget_min || campaign.budget_max) && (
          <MetaCard icon={<Banknote className="w-3.5 h-3.5" />} label="Budget"
            value={campaign.budget_min && campaign.budget_max && campaign.budget_min !== campaign.budget_max
              ? `${fmt(campaign.budget_min)} – ${fmt(campaign.budget_max)}`
              : fmt(campaign.budget_min ?? campaign.budget_max!)}
            accent
          />
        )}
        {campaign.deadline && (
          <MetaCard icon={<Calendar className="w-3.5 h-3.5" />} label="Deadline"
            value={new Date(campaign.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          />
        )}
        {campaign.deliverables && (
          <MetaCard icon={<Package className="w-3.5 h-3.5" />} label="Deliverables" value={campaign.deliverables} className="col-span-2" />
        )}
        <MetaCard icon={<CalendarDays className="w-3.5 h-3.5" />} label="Posted"
          value={new Date(campaign.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        />
        {campaign.slots_total && (
          <MetaCard icon={<Users className="w-3.5 h-3.5" />} label="Total Spots" value={`${campaign.slots_total} creators`} />
        )}
      </div>

      {/* ── About this Campaign ── */}
      <div className="rounded-2xl border p-4 mb-4"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <h2 className="font-semibold text-sm mb-2" style={{ color: 'var(--color-text-primary)' }}>About this Campaign</h2>
        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--color-text-secondary)' }}>
          <Linkify text={campaign.description} />
        </p>
      </div>

      {/* ── Video preview ── */}
      {campaign.video_url && (
        <div className="rounded-2xl border overflow-hidden mb-4"
          style={{ borderColor: 'var(--color-border)' }}>
          <video src={campaign.video_url} controls className="w-full max-h-64 object-cover" />
        </div>
      )}

      {/* ── Profile incomplete warning ── */}
      {!profileComplete && (
        <div className="rounded-2xl border px-4 py-3.5 mb-4 space-y-1.5"
          style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }}>
          <p className="text-sm font-semibold" style={{ color: '#92400E' }}>Complete your profile to apply</p>
          <p className="text-xs" style={{ color: '#B45309' }}>
            Add your {!profile?.platform_url ? 'social media URL' : ''}{!profile?.platform_url && (!profile?.niches || profile.niches.length === 0) ? ' and ' : ''}
            {(!profile?.niches || profile.niches.length === 0) ? 'content niches' : ''} to your profile first.
          </p>
          <Link href="/profile" className="inline-block text-white text-xs font-semibold px-4 py-2 rounded-lg btn-accent mt-1">
            Complete Profile →
          </Link>
        </div>
      )}

      {/* ── Apply CTA ── */}
      <ApplyButton
        campaignId={campaign.id}
        creatorId={user!.id}
        alreadyApplied={!!app}
        applicationStatus={app?.status}
        profileComplete={profileComplete}
        slotsFull={slotsLeft <= 0}
      />
    </>
  )
}

function MetaCard({ icon, label, value, accent, className = '' }: {
  icon: React.ReactNode; label: string; value: string; accent?: boolean; className?: string
}) {
  return (
    <div className={`rounded-2xl border px-4 py-3.5 ${className}`}
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>{icon}<span>{label}</span></div>
      <p className="text-sm font-bold leading-snug"
        style={{ color: accent ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>
        {value}
      </p>
    </div>
  )
}
