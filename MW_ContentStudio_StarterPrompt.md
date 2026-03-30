# MASTER PROMPT — MN Content Studio

> Paste this into Antigravity IDE (Claude Sonnet 4.6) to start building

---

You are helping me build **MN Content Studio** — a brand deal management platform for an influencer marketing talent manager.

## Context

My friend manages 100+ YouTube/Instagram creators. Brands contact him (offline, via call/WhatsApp) with campaign briefs. He then finds the right creators for each deal. This app replaces manual phone calls — creators sign up, browse deals, and apply. He manages everything from an admin dashboard.

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS
- Supabase (Postgres + Auth + Realtime + Storage)
- next-pwa (for PWA install on mobile)
- Vercel for hosting

## Two user roles

1. **Admin** (just my friend) — posts campaigns, reviews applications, accepts/rejects
2. **Creator** (influencers) — signs up, picks niches, browses matching deals, applies

## Key rules

- Brands do NOT have accounts. Admin enters brand info himself.
- Creators only see campaigns that match their chosen niches (fitness, food, tech, fashion, beauty, travel, gaming, finance)
- All currency is INR (₹). Target market is India.
- Creator UI must be mobile-first (PWA). Admin UI can be desktop sidebar layout.
- Use Next.js App Router, @supabase/ssr for server components, @supabase/supabase-js for client.

## Database tables (already designed)

### profiles

- id (uuid, FK to auth.users)
- role ('admin' | 'creator')
- full_name, username, avatar_url
- platform ('youtube' | 'instagram' | 'both')
- platform_url, followers_count
- niches (text array — e.g. ['fitness','nutrition'])
- bio, created_at

### campaigns

- id, title, brand_name, brand_logo_url
- description, budget_min, budget_max (INR)
- deliverables (text — "1 YouTube video + 2 reels")
- niches (text array), platforms (text array)
- deadline, slots_total, slots_filled
- status ('active' | 'paused' | 'closed')
- video_url, image_url (Supabase storage)
- created_by, created_at

### applications

- id, campaign_id, creator_id
- message (creator pitch), status ('pending' | 'accepted' | 'rejected' | 'negotiating')
- admin_note, created_at

### notifications

- id, user_id, type, title, body, read (bool), payload (jsonb), created_at

## Folder structure to build

```
app/
├── (public)/page.tsx          ← landing page
├── (public)/login/page.tsx    ← creator magic link login  
├── (public)/signup/page.tsx   ← creator signup + niche picker
├── (creator)/layout.tsx       ← bottom nav (PWA mobile)
├── (creator)/deals/page.tsx   ← filtered campaign feed
├── (creator)/deals/[id]/page.tsx ← campaign detail + apply
├── (creator)/dashboard/page.tsx  ← my applications
├── (creator)/notifications/page.tsx
├── (admin)/layout.tsx         ← sidebar layout
├── (admin)/admin/page.tsx     ← stats dashboard
├── (admin)/admin/campaigns/new/page.tsx ← post campaign
├── (admin)/admin/campaigns/[id]/page.tsx ← applications list
└── (admin)/admin/creators/page.tsx
```

## Start here

**Task 1:** Set up the Next.js project with Tailwind and Supabase. Generate:

1. `package.json` with all dependencies
2. `lib/supabase/client.ts` and `lib/supabase/server.ts`
3. The full Supabase SQL schema with RLS policies (ready to paste into Supabase SQL editor)
4. `.env.local.example` file

Then we will build page by page.
