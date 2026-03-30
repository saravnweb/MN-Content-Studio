-- ============================================================
-- MW Content Studio — Supabase Schema
-- MN Content Studio — Supabase Schema
-- Paste this entire file into the Supabase SQL Editor and run.
-- ============================================================

-- ─────────────────────────────────────────
-- 1. PROFILES
-- Extends auth.users. Auto-created on signup via trigger.
-- ─────────────────────────────────────────
create table if not exists public.profiles (
  id             uuid references auth.users on delete cascade primary key,
  role           text not null default 'creator'
                   check (role in ('admin', 'creator')),
  full_name      text,
  username       text unique,
  avatar_url     text,
  platform       text check (platform in ('youtube', 'instagram', 'both')),
  platform_url   text,
  followers_count integer,
  niches         text[],   -- e.g. ['fitness', 'nutrition', 'lifestyle']
  bio            text,
  created_at     timestamptz default now()
);

-- ─────────────────────────────────────────
-- 2. CAMPAIGNS
-- Posted by admin only.
-- ─────────────────────────────────────────
create table if not exists public.campaigns (
  id             uuid default gen_random_uuid() primary key,
  title          text not null,
  brand_name     text not null,
  brand_logo_url text,
  description    text not null,
  budget_min     integer,         -- in INR
  budget_max     integer,         -- in INR
  deliverables   text,            -- e.g. "1 YouTube video + 2 Instagram reels"
  niches         text[] not null, -- e.g. ['fitness', 'nutrition']
  platforms      text[],          -- ['youtube', 'instagram']
  deadline       date,
  slots_total    integer default 5,
  slots_filled   integer default 0,
  status         text not null default 'active'
                   check (status in ('active', 'paused', 'closed')),
  video_url      text,
  image_url      text,
  created_by     uuid references public.profiles(id),
  created_at     timestamptz default now()
);

-- ─────────────────────────────────────────
-- 3. APPLICATIONS
-- Creator expresses interest in a campaign.
-- ─────────────────────────────────────────
create table if not exists public.applications (
  id           uuid default gen_random_uuid() primary key,
  campaign_id  uuid references public.campaigns(id) on delete cascade,
  creator_id   uuid references public.profiles(id) on delete cascade,
  message      text,     -- optional pitch from creator
  status       text not null default 'pending'
                 check (status in ('pending', 'accepted', 'rejected', 'negotiating')),
  admin_note   text,     -- internal note visible only to admin
  created_at   timestamptz default now(),
  unique (campaign_id, creator_id)
);

-- ─────────────────────────────────────────
-- 4. NOTIFICATIONS
-- ─────────────────────────────────────────
create table if not exists public.notifications (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references public.profiles(id) on delete cascade,
  type       text not null
               check (type in (
                 'new_application',
                 'application_accepted',
                 'application_rejected',
                 'application_negotiating',
                 'new_campaign'
               )),
  title      text,
  body       text,
  read       boolean not null default false,
  payload    jsonb,   -- { campaign_id, application_id }
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- 5. ROW LEVEL SECURITY
-- ─────────────────────────────────────────

alter table public.profiles      enable row level security;
alter table public.campaigns     enable row level security;
alter table public.applications  enable row level security;
alter table public.notifications enable row level security;

-- PROFILES policies
create policy "Users can view own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Admin can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

-- CAMPAIGNS policies
create policy "Admin can insert campaigns"
  on public.campaigns for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin can update campaigns"
  on public.campaigns for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin can view all campaigns"
  on public.campaigns for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Creators see active niche-matched campaigns"
  on public.campaigns for select
  using (
    status = 'active'
    and niches && (
      select niches from public.profiles where id = auth.uid()
    )
  );

-- APPLICATIONS policies
create policy "Creators can see own applications"
  on public.applications for select
  using (creator_id = auth.uid());

create policy "Creators can insert own applications"
  on public.applications for insert
  with check (creator_id = auth.uid());

create policy "Admin can see all applications"
  on public.applications for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin can update applications"
  on public.applications for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- NOTIFICATIONS policies
create policy "Users can see own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "Users can update own notifications"
  on public.notifications for update
  using (user_id = auth.uid());

create policy "Service role can insert notifications"
  on public.notifications for insert
  with check (true);

-- ─────────────────────────────────────────
-- 6. TRIGGER: Auto-create profile on signup
-- ─────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'creator'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Drop existing trigger if present, then recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────
-- 7. REALTIME
-- Enable realtime for notifications table
-- ─────────────────────────────────────────

-- Run this in Supabase Dashboard → Database → Replication
-- to enable realtime on notifications:
--   Table: notifications → enable INSERT

-- ─────────────────────────────────────────
-- DONE. After running:
-- 1. Go to Storage → create bucket "campaign-assets" (public: true)
-- 2. Authentication → Users → create admin user
-- 3. Run: UPDATE profiles SET role = 'admin' WHERE id = '<admin-user-uuid>';
-- ─────────────────────────────────────────

-- ─────────────────────────────────────────
-- 8. RPC: increment slots_filled safely
-- ─────────────────────────────────────────
create or replace function public.increment_slots(campaign_id uuid)
returns void
language sql
security definer
as $$
  update public.campaigns
  set slots_filled = slots_filled + 1
  where id = campaign_id and slots_filled < slots_total;
$$;
