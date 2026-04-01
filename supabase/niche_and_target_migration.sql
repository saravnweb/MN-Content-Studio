-- ============================================================
-- niche_and_target_migration.sql
-- 1. Rename old lowercase niche values to new display names
-- 2. Add target_niches column for independent audience targeting
-- 3. Update RLS to use target_niches when set
--
-- Run in Supabase SQL Editor. Safe to run multiple times.
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- STEP 1: Rename old niche values in profiles.niches
-- ─────────────────────────────────────────────────────────────

UPDATE public.profiles
SET niches = ARRAY(
  SELECT
    CASE elem
      WHEN 'fitness'       THEN 'Fitness & Wellness'
      WHEN 'beauty'        THEN 'Beauty & Cosmetics'
      WHEN 'fashion'       THEN 'Fashion & Clothing'
      WHEN 'tech'          THEN 'Technology & Gadgets'
      WHEN 'technology'    THEN 'Technology & Gadgets'
      WHEN 'lifestyle'     THEN 'Lifestyle & Home'
      WHEN 'sports'        THEN 'Sports & Athletics'
      WHEN 'food'          THEN 'Food & Beverage'
      WHEN 'travel'        THEN 'Travel & Tourism'
      WHEN 'gaming'        THEN 'Gaming & Esports'
      WHEN 'finance'       THEN 'Finance & Crypto'
      WHEN 'crypto'        THEN 'Finance & Crypto'
      WHEN 'entertainment' THEN 'Entertainment & Music'
      WHEN 'music'         THEN 'Entertainment & Music'
      WHEN 'photography'   THEN 'Photography & Art'
      WHEN 'art'           THEN 'Photography & Art'
      WHEN 'education'     THEN 'Education & Learning'
      WHEN 'learning'      THEN 'Education & Learning'
      WHEN 'health'        THEN 'Health & Medical'
      WHEN 'medical'       THEN 'Health & Medical'
      WHEN 'parenting'     THEN 'Parenting & Family'
      WHEN 'family'        THEN 'Parenting & Family'
      WHEN 'automotive'    THEN 'Automotive'
      WHEN 'diy'           THEN 'DIY & Crafts'
      WHEN 'crafts'        THEN 'DIY & Crafts'
      WHEN 'arts'          THEN 'Arts & Culture'
      WHEN 'culture'       THEN 'Arts & Culture'
      WHEN 'news'          THEN 'News & Politics'
      WHEN 'politics'      THEN 'News & Politics'
      WHEN 'business'      THEN 'Business & Entrepreneurship'
      WHEN 'entrepreneurship' THEN 'Business & Entrepreneurship'
      WHEN 'real estate'   THEN 'Real Estate'
      WHEN 'realestate'    THEN 'Real Estate'
      WHEN 'pets'          THEN 'Pets & Animals'
      WHEN 'animals'       THEN 'Pets & Animals'
      WHEN 'other'         THEN 'Other'
      ELSE elem  -- keep already-correct values unchanged
    END
  FROM UNNEST(niches) AS elem
)
WHERE niches IS NOT NULL AND array_length(niches, 1) > 0;


-- ─────────────────────────────────────────────────────────────
-- STEP 2: Rename old niche values in campaigns.niches
-- ─────────────────────────────────────────────────────────────

UPDATE public.campaigns
SET niches = ARRAY(
  SELECT
    CASE elem
      WHEN 'fitness'       THEN 'Fitness & Wellness'
      WHEN 'beauty'        THEN 'Beauty & Cosmetics'
      WHEN 'fashion'       THEN 'Fashion & Clothing'
      WHEN 'tech'          THEN 'Technology & Gadgets'
      WHEN 'technology'    THEN 'Technology & Gadgets'
      WHEN 'lifestyle'     THEN 'Lifestyle & Home'
      WHEN 'sports'        THEN 'Sports & Athletics'
      WHEN 'food'          THEN 'Food & Beverage'
      WHEN 'travel'        THEN 'Travel & Tourism'
      WHEN 'gaming'        THEN 'Gaming & Esports'
      WHEN 'finance'       THEN 'Finance & Crypto'
      WHEN 'crypto'        THEN 'Finance & Crypto'
      WHEN 'entertainment' THEN 'Entertainment & Music'
      WHEN 'music'         THEN 'Entertainment & Music'
      WHEN 'photography'   THEN 'Photography & Art'
      WHEN 'art'           THEN 'Photography & Art'
      WHEN 'education'     THEN 'Education & Learning'
      WHEN 'learning'      THEN 'Education & Learning'
      WHEN 'health'        THEN 'Health & Medical'
      WHEN 'medical'       THEN 'Health & Medical'
      WHEN 'parenting'     THEN 'Parenting & Family'
      WHEN 'family'        THEN 'Parenting & Family'
      WHEN 'automotive'    THEN 'Automotive'
      WHEN 'diy'           THEN 'DIY & Crafts'
      WHEN 'crafts'        THEN 'DIY & Crafts'
      WHEN 'arts'          THEN 'Arts & Culture'
      WHEN 'culture'       THEN 'Arts & Culture'
      WHEN 'news'          THEN 'News & Politics'
      WHEN 'politics'      THEN 'News & Politics'
      WHEN 'business'      THEN 'Business & Entrepreneurship'
      WHEN 'entrepreneurship' THEN 'Business & Entrepreneurship'
      WHEN 'real estate'   THEN 'Real Estate'
      WHEN 'realestate'    THEN 'Real Estate'
      WHEN 'pets'          THEN 'Pets & Animals'
      WHEN 'animals'       THEN 'Pets & Animals'
      WHEN 'other'         THEN 'Other'
      ELSE elem
    END
  FROM UNNEST(niches) AS elem
)
WHERE niches IS NOT NULL AND array_length(niches, 1) > 0;


-- ─────────────────────────────────────────────────────────────
-- STEP 3: Add target_niches column to campaigns
-- When set, this overrides campaign niches for "All Creators"
-- audience matching. Empty array = use campaign niches.
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS target_niches text[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_campaigns_target_niches
  ON public.campaigns USING GIN (target_niches);


-- ─────────────────────────────────────────────────────────────
-- STEP 4: Update RLS policy for creators to use target_niches
-- Falls back to campaign niches when target_niches is empty.
-- ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Creators see active campaigns with visibility" ON public.campaigns;

CREATE POLICY "Creators see active campaigns with visibility"
  ON public.campaigns FOR SELECT
  USING (
    status = 'active'
    AND (
      -- Public: anyone sees it
      visibility = 'public'
      OR
      -- All creators: match on target_niches if set, else fall back to niches
      (
        visibility = 'all_creators'
        AND auth.uid() IS NOT NULL
        AND COALESCE(NULLIF(target_niches, '{}'), niches)
            && (SELECT niches FROM public.profiles WHERE id = auth.uid())
      )
      OR
      -- Selected creators: only explicitly listed creators
      (visibility = 'selected_creators' AND auth.uid() = ANY(visible_to))
    )
  );
