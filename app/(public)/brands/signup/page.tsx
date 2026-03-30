'use client'

import { useState } from 'react'
import Link from 'next/link'
import BrandLogo from '@/components/BrandLogo'

const NICHES = ['Fashion', 'Beauty', 'Fitness', 'Food & Beverage', 'Tech & Gadgets', 'Travel', 'Gaming', 'Finance', 'Lifestyle', 'Education', 'Other']
const BUDGET_RANGES = ['Under ₹25,000', '₹25,000 – ₹50,000', '₹50,000 – ₹1,00,000', '₹1,00,000 – ₹5,00,000', '₹5,00,000+']
const TIMELINES = ['ASAP (within 2 weeks)', 'Within 1 month', '2–3 months', 'Flexible']
const PLATFORMS = ['YouTube', 'Instagram', 'Both']

type FormState = {
  company_name: string
  contact_name: string
  email: string
  phone: string
  niche: string
  brief: string
  budget_range: string
  platforms: string[]
  timeline: string
}

const EMPTY: FormState = {
  company_name: '',
  contact_name: '',
  email: '',
  phone: '',
  niche: '',
  brief: '',
  budget_range: '',
  platforms: [],
  timeline: '',
}

export default function BrandSignupPage() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function set(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function togglePlatform(p: string) {
    setForm(prev => ({
      ...prev,
      platforms: prev.platforms.includes(p)
        ? prev.platforms.filter(x => x !== p)
        : [...prev.platforms, p],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/brands/inquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong.')
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
        <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center justify-between">
          <BrandLogo withLink={true} size={28} textClassName="font-bold text-base tracking-tight text-gray-100" />
          <Link href="/brands" className="text-sm text-gray-400 hover:text-gray-100 transition-colors">For Brands</Link>
        </header>
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full text-center">
            <div className="w-14 h-14 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-6">
              <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-100 mb-3">We&apos;ve got your details</h1>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Thanks for reaching out. Our team will review your campaign requirements and get back to you within 24 hours.
            </p>
            <Link
              href="/brands"
              className="inline-block px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-100 rounded-xl text-sm font-medium transition-colors"
            >
              Back to For Brands
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 selection:bg-indigo-500/30">
      <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <BrandLogo withLink={true} size={28} textClassName="font-bold text-base tracking-tight text-gray-100" />
        <Link href="/brands" className="text-sm text-gray-400 hover:text-gray-100 transition-colors">Back</Link>
      </header>

      <main className="max-w-xl mx-auto px-4 py-12">
        <div className="mb-10">
          <div className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-4 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            For Brands
          </div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">List your campaign</h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            Tell us about your brand and what you need. We&apos;ll review your submission and follow up within 24 hours.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Company + Contact row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Brand / Company name" required>
              <input
                type="text"
                value={form.company_name}
                onChange={e => set('company_name', e.target.value)}
                placeholder="Acme Corp"
                required
                className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 outline-none transition-colors"
              />
            </Field>
            <Field label="Your name" required>
              <input
                type="text"
                value={form.contact_name}
                onChange={e => set('contact_name', e.target.value)}
                placeholder="Priya Subramaniam"
                required
                className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 outline-none transition-colors"
              />
            </Field>
          </div>

          {/* Email + Phone row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Work email" required>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="priya@acmecorp.com"
                required
                className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 outline-none transition-colors"
              />
            </Field>
            <Field label="Phone" hint="optional">
              <input
                type="tel"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 outline-none transition-colors"
              />
            </Field>
          </div>

          {/* Niche */}
          <Field label="Product niche">
            <select
              value={form.niche}
              onChange={e => set('niche', e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-gray-100 outline-none transition-colors"
            >
              <option value="">Select a niche…</option>
              {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>

          {/* Platforms */}
          <Field label="Target platform">
            <div className="flex gap-2 flex-wrap">
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    form.platforms.includes(p)
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </Field>

          {/* Campaign brief */}
          <Field label="Campaign brief" required>
            <textarea
              value={form.brief}
              onChange={e => set('brief', e.target.value)}
              placeholder="Describe your product, what content you need (e.g. 2 Instagram Reels + 1 YouTube integration), key messaging, and anything else we should know."
              required
              rows={4}
              className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 outline-none transition-colors resize-none"
            />
          </Field>

          {/* Budget + Timeline row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Budget range">
              <select
                value={form.budget_range}
                onChange={e => set('budget_range', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-gray-100 outline-none transition-colors"
              >
                <option value="">Select a range…</option>
                {BUDGET_RANGES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
            <Field label="Timeline">
              <select
                value={form.timeline}
                onChange={e => set('timeline', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-gray-100 outline-none transition-colors"
              >
                <option value="">Select a timeline…</option>
                {TIMELINES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-600/25 transition-colors"
          >
            {submitting ? 'Submitting…' : 'Submit Campaign Enquiry'}
          </button>

          <p className="text-xs text-center text-gray-500">
            We review every submission personally. You&apos;ll hear from us within 24 hours.
          </p>

        </form>
      </main>
    </div>
  )
}

function Field({ label, hint, required, children }: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">
        {label}
        {required && <span className="text-indigo-400 ml-0.5">*</span>}
        {hint && <span className="text-gray-600 ml-1">({hint})</span>}
      </label>
      {children}
    </div>
  )
}
