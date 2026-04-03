-- ============================================================
-- showcase_videos_migration.sql
-- Standalone table for admin-curated homepage showcase videos.
-- No campaign/application required — admin pastes a URL or uploads a file.
-- Run in Supabase SQL Editor after patches.sql.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.showcase_videos (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  video_url      text,           -- YouTube or Instagram URL
  file_url       text,           -- Supabase Storage public URL (uploaded file)
  creator_name   text NOT NULL,
  niche          text,
  brand_name     text,
  display_order  integer NOT NULL DEFAULT 0,
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE public.showcase_videos ENABLE ROW LEVEL SECURITY;

-- Admin and Service Role can do everything
DROP POLICY IF EXISTS "Admin can manage showcase_videos" ON public.showcase_videos;
DROP POLICY IF EXISTS "Service role can manage showcase_videos" ON public.showcase_videos;
DROP POLICY IF EXISTS "Admin/Service can manage showcase_videos" ON public.showcase_videos;

CREATE POLICY "Admin/Service can manage showcase_videos"
  ON public.showcase_videos
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Public (including unauthenticated guests) can read showcase videos
DROP POLICY IF EXISTS "Anyone can view showcase_videos" ON public.showcase_videos;
CREATE POLICY "Anyone can view showcase_videos"
  ON public.showcase_videos FOR SELECT
  USING (true);
