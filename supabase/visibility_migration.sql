-- ============================================================
-- visibility_migration.sql — Add campaign visibility targeting
-- Run after schema.sql to add per-campaign creator targeting
-- ============================================================

-- Ensure is_admin() function exists (from patches.sql)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Add visibility columns to campaigns table
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'public' 
  CHECK (visibility IN ('public', 'all_creators', 'selected_creators')),
ADD COLUMN IF NOT EXISTS visible_to uuid[] DEFAULT '{}';

-- Create index on visible_to for faster lookups
CREATE INDEX IF NOT EXISTS idx_campaigns_visible_to ON public.campaigns USING GIN (visible_to);

-- ──────────────────────────────────────────────────────────
-- UPDATE RLS POLICIES
-- ──────────────────────────────────────────────────────────

-- Drop old policies (handle both old and new names)
DROP POLICY IF EXISTS "Creators see active niche-matched campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Public can view active campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Public unauthenticated can view public campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Creators see active campaigns with visibility" ON public.campaigns;
DROP POLICY IF EXISTS "Admin can view all campaigns" ON public.campaigns;

-- Policy 1: Unauthenticated public users see only 'public' campaigns
CREATE POLICY "Public unauthenticated can view public campaigns"
  ON public.campaigns FOR SELECT
  USING (
    status = 'active' 
    AND visibility = 'public'
    AND auth.uid() IS NULL
  );

-- Policy 2: Authenticated creators see campaigns based on visibility and niche matching
CREATE POLICY "Creators see active campaigns with visibility"
  ON public.campaigns FOR SELECT
  USING (
    status = 'active'
    AND (
      -- Public campaigns: anyone can see
      visibility = 'public'
      OR
      -- All creators: only if niches match AND logged-in
      (visibility = 'all_creators' 
        AND auth.uid() IS NOT NULL 
        AND niches && (SELECT niches FROM public.profiles WHERE id = auth.uid())
      )
      OR
      -- Selected creators: only if current user is in the list
      (visibility = 'selected_creators' AND auth.uid() = ANY(visible_to))
    )
  );

-- Policy 3: Admin can see all campaigns regardless of visibility
CREATE POLICY "Admin can view all campaigns"
  ON public.campaigns FOR SELECT
  USING (public.is_admin());
