-- ============================================================
-- Ensure pgcrypto is enabled for gen_random_uuid()
create extension if not exists pgcrypto;

create table if not exists public.brand_inquiries (
  id           uuid default gen_random_uuid() primary key,
  company_name text not null,
  contact_name text not null,
  email        text not null,
  phone        text,
  niche        text,
  brief        text not null,
  budget_range text,
  platforms    text[],
  timeline     text,
  status       text not null default 'new'
                 check (status in ('new', 'contacted', 'converted', 'declined')),
  admin_note   text,
  created_at   timestamptz default now()
);

alter table public.brand_inquiries enable row level security;

-- Public can submit (unauthenticated insert)
create policy "Anyone can submit brand inquiry"
  on public.brand_inquiries for insert
  with check (true);

-- Only admin can read
create policy "Admin can view all inquiries"
  on public.brand_inquiries for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Only admin can update (status, admin_note)
create policy "Admin can update inquiries"
  on public.brand_inquiries for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
