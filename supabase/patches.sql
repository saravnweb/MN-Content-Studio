-- ============================================================
-- patches.sql — Run AFTER schema.sql in Supabase SQL Editor
-- Fixes RLS infinite recursion on profiles table
-- ============================================================

-- Helper: check if current user is admin WITHOUT querying profiles via RLS
-- SECURITY DEFINER bypasses RLS, breaking the recursion loop
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN (
    (current_setting('role', true) = 'service_role') OR
    (auth.role() = 'service_role') OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
END;
$$;

-- ── PROFILES ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
CREATE POLICY "Admin can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- ── CAMPAIGNS ─────────────────────────────────────────────
-- Allow anyone (including unauthenticated) to browse active campaigns
DROP POLICY IF EXISTS "Public can view active campaigns" ON public.campaigns;
CREATE POLICY "Public can view active campaigns"
  ON public.campaigns FOR SELECT
  USING (status = 'active');


DROP POLICY IF EXISTS "Admin can insert campaigns" ON public.campaigns;
CREATE POLICY "Admin can insert campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can update campaigns" ON public.campaigns;
CREATE POLICY "Admin can update campaigns"
  ON public.campaigns FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete campaigns" ON public.campaigns;
CREATE POLICY "Admin can delete campaigns"
  ON public.campaigns FOR DELETE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can view all campaigns" ON public.campaigns;
CREATE POLICY "Admin can view all campaigns"
  ON public.campaigns FOR SELECT
  USING (public.is_admin());

-- ── APPLICATIONS ──────────────────────────────────────────
DROP POLICY IF EXISTS "Admin can see all applications" ON public.applications;
CREATE POLICY "Admin can see all applications"
  ON public.applications FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can update applications" ON public.applications;
CREATE POLICY "Admin can update applications"
  ON public.applications FOR UPDATE
  USING (public.is_admin());

-- ── BRANDS ────────────────────────────────────────────────
-- Reusable brand library: upload logo once, reuse across campaigns
CREATE TABLE IF NOT EXISTS public.brands (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name       text NOT NULL UNIQUE,
  tagline    text,
  logo_url   text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage brands"
  ON public.brands
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Anyone (including public) can read brands (needed to show brand info on deal cards)
DROP POLICY IF EXISTS "Anyone authenticated can view brands" ON public.brands;
CREATE POLICY "Anyone can view brands"
  ON public.brands FOR SELECT
  USING (true);

-- ── STORAGE: campaign-assets bucket ───────────────────────
-- Allow authenticated users (admin) to upload files
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaign-assets', 'campaign-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Authenticated users can upload to campaign-assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'campaign-assets'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update campaign-assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'campaign-assets'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Public can read campaign-assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'campaign-assets');

-- ── NOTIFICATIONS ─────────────────────────────────────────
-- Allow trigger function to insert (already set to true, but make explicit)
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
CREATE POLICY "Service role can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- ── CREATOR PROFILE: extended onboarding fields ───────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone         text,
  ADD COLUMN IF NOT EXISTS whatsapp      text,
  ADD COLUMN IF NOT EXISTS youtube_url   text,
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS twitter_url   text,
  ADD COLUMN IF NOT EXISTS gender        text CHECK (gender IN ('male', 'female', 'non-binary', 'prefer_not_to_say')),
  ADD COLUMN IF NOT EXISTS age           smallint CHECK (age >= 13 AND age <= 100);

-- ── APPLICATIONS: content submission fields ────────────────
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS submission_url           text,
  ADD COLUMN IF NOT EXISTS submission_note          text,
  ADD COLUMN IF NOT EXISTS submission_status        text NOT NULL DEFAULT 'not_submitted'
                           CHECK (submission_status IN
                             ('not_submitted','submitted','approved','revision_requested')),
  ADD COLUMN IF NOT EXISTS submission_submitted_at  timestamptz,
  ADD COLUMN IF NOT EXISTS admin_submission_note    text;

-- Allow creators to update their own submission fields
DROP POLICY IF EXISTS "Creators can update own application submission" ON public.applications;
CREATE POLICY "Creators can update own application submission"
  ON public.applications FOR UPDATE
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);
