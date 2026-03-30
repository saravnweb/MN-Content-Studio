# MN Content Studio — Product Requirements Document
> Paste this file into Antigravity IDE as context before prompting Claude to build.

---

## What is this?

MN Content Studio is a **brand deal management platform** for a talent manager / influencer marketing agent. The admin (your friend) acts as a middleman between brands and content creators (YouTubers, Instagram influencers). Instead of calling every creator manually, creators sign up on this platform, browse brand campaign deals, and express interest. The admin gets notified and negotiates from there.

**Live Lovable prototype:** https://connectinfluencer.lovable.app/

---

## The Problem

- Admin has 100+ creator contacts and growing
- He manually calls/WhatsApp every creator for each brand deal
- No way to post a deal once and let relevant creators find it
- Brands contact him offline (WhatsApp, call, email) — they will NOT log into a new system

---

## Core Concept

**Admin posts campaigns. Creators discover and apply. Admin manages from dashboard.**

Brands do NOT need an account. Admin enters brand details himself when posting a campaign. This is intentional for v1 — brands are offline clients.

---

## User Roles

| Role | Who | Access |
|------|-----|--------|
| Admin | Your friend (1 person) | Post campaigns, view all applications, accept/reject, get notifications |
| Creator | YouTube/Instagram influencers | Sign up, set niche, browse deals, apply to relevant ones |

---

## Key Design Decision — No Brand Portal (v1)

Brands call your friend → he posts the deal himself with brand name + logo.
Brand pages are a **v2 feature** once 10–15 recurring brands exist.

Each campaign has **niche tags** (fitness, food, tech, fashion, travel, beauty, gaming, finance).
Creators pick their niches on signup → they only see relevant campaigns.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| PWA | next-pwa plugin (creators install it on phone) |
| Backend | Supabase (Postgres + Auth + Realtime + Storage + Edge Functions) |
| Auth | Supabase Auth — magic link for creators, email+password for admin |
| Hosting | Vercel (free tier, CI/CD from GitHub) |
| Notifications | Supabase Realtime + Web Push API (service worker) |
| Email | Supabase built-in email or Resend.com |
| File Storage | Supabase Storage (brand logos, campaign videos/images) |

---

## Database Schema

### Table: `profiles`
Extends Supabase auth.users

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  role text check (role in ('admin', 'creator')) not null default 'creator',
  full_name text,
  username text unique,
  avatar_url text,
  platform text check (platform in ('youtube', 'instagram', 'both')),
  platform_url text,
  followers_count integer,
  niches text[], -- ['fitness','nutrition','lifestyle']
  bio text,
  created_at timestamptz default now()
);
```

### Table: `campaigns`
Posted by admin only.

```sql
create table campaigns (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  brand_name text not null,
  brand_logo_url text,
  description text not null,
  budget_min integer, -- in INR
  budget_max integer,
  deliverables text, -- "1 YouTube video + 2 Instagram reels"
  niches text[] not null, -- ['fitness','nutrition']
  platforms text[], -- ['youtube','instagram']
  deadline date,
  slots_total integer default 5,
  slots_filled integer default 0,
  status text check (status in ('active','paused','closed')) default 'active',
  video_url text, -- Supabase storage URL
  image_url text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);
```

### Table: `applications`
Creator expresses interest in a campaign.

```sql
create table applications (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references campaigns(id) on delete cascade,
  creator_id uuid references profiles(id) on delete cascade,
  message text, -- optional pitch from creator
  status text check (status in ('pending','accepted','rejected','negotiating')) default 'pending',
  admin_note text, -- internal note from admin
  created_at timestamptz default now(),
  unique(campaign_id, creator_id)
);
```

### Table: `notifications`

```sql
create table notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  type text check (type in ('new_application','application_accepted','application_rejected','new_campaign')),
  title text,
  body text,
  read boolean default false,
  payload jsonb, -- { campaign_id, application_id }
  created_at timestamptz default now()
);
```

---

## Row Level Security Policies

```sql
-- Creators can only see their own applications
create policy "creators see own applications"
on applications for select
using (creator_id = auth.uid());

-- Admin can see all applications
create policy "admin sees all applications"
on applications for select
using (exists (
  select 1 from profiles where id = auth.uid() and role = 'admin'
));

-- Only admin can insert campaigns
create policy "admin inserts campaigns"
on campaigns for insert
with check (exists (
  select 1 from profiles where id = auth.uid() and role = 'admin'
));

-- Creators can only see active campaigns that match their niches
create policy "creators see matching campaigns"
on campaigns for select
using (
  status = 'active'
  and niches && (
    select niches from profiles where id = auth.uid()
  )
);
```

---

## Page Structure (Next.js App Router)

```
app/
├── (public)/
│   ├── page.tsx              -- Landing page (MW Content Studio)
│   ├── login/page.tsx        -- Creator magic link login
│   └── signup/page.tsx       -- Creator signup + niche selection
│
├── (creator)/
│   ├── layout.tsx            -- Creator shell with bottom nav (PWA)
│   ├── dashboard/page.tsx    -- "My applications" summary
│   ├── deals/
│   │   ├── page.tsx          -- Browse all matching campaigns
│   │   └── [id]/page.tsx     -- Campaign detail + Apply button
│   ├── notifications/page.tsx
│   └── profile/page.tsx
│
├── (admin)/
│   ├── layout.tsx            -- Admin sidebar layout
│   ├── admin/page.tsx        -- Dashboard: stats overview
│   ├── admin/campaigns/
│   │   ├── page.tsx          -- All campaigns list
│   │   ├── new/page.tsx      -- Post new campaign
│   │   └── [id]/page.tsx     -- Campaign detail + applications list
│   ├── admin/applications/page.tsx  -- All applications across campaigns
│   └── admin/creators/page.tsx      -- All registered creators
│
└── api/
    └── notify/route.ts       -- Edge function: trigger notifications
```

---

## User Flows

### Creator Flow
1. Creator receives link from your friend (WhatsApp/DM)
2. Signs up → enters name, platform (YouTube/Instagram), followers count, picks niches
3. Browses campaign feed — only sees campaigns matching their niches
4. Taps a campaign → reads details, budget, deliverables, deadline
5. Taps "I'm Interested" → optionally writes a short pitch → submits
6. Gets notified when admin accepts or rejects

### Admin Flow
1. Brand contacts admin offline (WhatsApp/call)
2. Admin logs into dashboard → clicks "New Campaign"
3. Fills: brand name, logo upload, campaign title, description, budget range, niche tags, platforms, deadline, slots
4. Publishes → all matching creators get push notification
5. Admin sees incoming applications → views creator profile + pitch
6. Accepts or rejects → creator gets notified automatically

---

## Campaign Card (what creators see)

Each card shows:
- Brand logo + name
- Niche tags (pills)
- Campaign title
- Budget range (₹ min – max)
- Deadline
- Slots remaining (e.g. "4 of 8 spots left")
- "I'm Interested" button

---

## Notification Triggers

| Event | Who gets notified | How |
|-------|------------------|-----|
| Creator applies | Admin | In-app notification + email |
| Admin accepts application | Creator | Push notification + in-app |
| Admin rejects application | Creator | Push notification + in-app |
| New campaign posted | All matching creators | Push notification |

---

## Build Order (v1 Sprint Plan)

### Sprint 1 — Foundation
- [ ] Supabase project setup (tables + RLS policies above)
- [ ] Next.js project init with Tailwind + next-pwa
- [ ] Supabase Auth setup (magic link for creators, email+pass for admin)
- [ ] `profiles` table + onboarding flow (niche selection)

### Sprint 2 — Admin Core
- [ ] Admin login page
- [ ] Admin dashboard layout (sidebar)
- [ ] Post new campaign form (with Supabase Storage for logo/image)
- [ ] Campaign list page (admin)

### Sprint 3 — Creator Core
- [ ] Creator deal feed (filtered by niche)
- [ ] Campaign detail page
- [ ] Apply / express interest flow
- [ ] My applications page

### Sprint 4 — Notifications
- [ ] In-app notification bell (Supabase Realtime)
- [ ] Email notification on new application (admin)
- [ ] PWA push notification on accept/reject (creator)

### Sprint 5 — Polish
- [ ] Admin: accept/reject applications UI
- [ ] Creator profile page
- [ ] Admin: creators list
- [ ] Mobile responsiveness + PWA install prompt

---

## v2 Features (don't build yet)

- Brand portal (brands log in and post their own deals)
- Brand profile pages (`/brand/muscleblaze`)
- Creator analytics (follower growth, engagement rate)
- In-app chat between admin and creator
- Contract/agreement upload per campaign
- Commission tracking

---

## Environment Variables Needed

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## Notes for Claude in Antigravity IDE

- Always use Next.js App Router (not Pages Router)
- Use `@supabase/ssr` package for server-side Supabase client
- Use `@supabase/supabase-js` for client-side
- Use Tailwind CSS for all styling — no external UI libraries unless necessary
- Creator-facing pages must be mobile-first (PWA)
- Admin pages can be desktop-first (sidebar layout)
- All currency is INR (Indian Rupees ₹)
- Target market: Indian content creators and brands
