-- ============================================================
-- niche_cleanup.sql
-- Force all niche values in profiles and campaigns to match
-- the master list defined in lib/constants.ts
-- ============================================================

-- 1. Sync public.profiles niches
UPDATE public.profiles
SET niches = ARRAY(
  SELECT DISTINCT new_val
  FROM (
    SELECT
      CASE
        WHEN lower(elem) IN ('food', 'food & beverage') THEN 'Food & Beverage'
        WHEN lower(elem) IN ('fashion', 'fashion & clothing') THEN 'Fashion & Clothing'
        WHEN lower(elem) IN ('lifestyle', 'lifestyle & home') THEN 'Lifestyle & Home'
        WHEN lower(elem) IN ('travel', 'travel & tourism') THEN 'Travel & Tourism'
        WHEN lower(elem) IN ('fitness', 'fitness & wellness') THEN 'Fitness & Wellness'
        WHEN lower(elem) IN ('beauty', 'beauty & cosmetics') THEN 'Beauty & Cosmetics'
        WHEN lower(elem) IN ('tech', 'technology', 'technology & gadgets') THEN 'Technology & Gadgets'
        WHEN lower(elem) IN ('gaming', 'gaming & esports') THEN 'Gaming & Esports'
        WHEN lower(elem) IN ('finance', 'crypto', 'finance & crypto') THEN 'Finance & Crypto'
        WHEN lower(elem) IN ('entertainment', 'music', 'entertainment & music') THEN 'Entertainment & Music'
        WHEN lower(elem) IN ('photography', 'art', 'photography & art') THEN 'Photography & Art'
        WHEN lower(elem) IN ('education', 'learning', 'education & learning') THEN 'Education & Learning'
        WHEN lower(elem) IN ('health', 'medical', 'health & medical') THEN 'Health & Medical'
        WHEN lower(elem) IN ('parenting', 'family', 'parenting & family') THEN 'Parenting & Family'
        WHEN lower(elem) IN ('automotive') THEN 'Automotive'
        WHEN lower(elem) IN ('sports', 'athletics', 'sports & athletics') THEN 'Sports & Athletics'
        WHEN lower(elem) IN ('diy', 'crafts', 'diy & crafts') THEN 'DIY & Crafts'
        WHEN lower(elem) IN ('arts', 'culture', 'arts & culture') THEN 'Arts & Culture'
        WHEN lower(elem) IN ('news', 'politics', 'news & politics') THEN 'News & Politics'
        WHEN lower(elem) IN ('business', 'entrepreneurship', 'business & entrepreneurship') THEN 'Business & Entrepreneurship'
        WHEN lower(elem) IN ('real estate', 'realestate') THEN 'Real Estate'
        WHEN lower(elem) IN ('pets', 'animals', 'pets & animals') THEN 'Pets & Animals'
        WHEN lower(elem) IN ('other') THEN 'Other'
        ELSE NULL 
      END AS new_val
    FROM UNNEST(niches) AS elem
  ) t
  WHERE new_val IS NOT NULL
)
WHERE niches IS NOT NULL AND array_length(niches, 1) > 0;

-- 2. Sync public.campaigns niches
UPDATE public.campaigns
SET niches = ARRAY(
  SELECT DISTINCT new_val
  FROM (
    SELECT
      CASE
        WHEN lower(elem) IN ('food', 'food & beverage') THEN 'Food & Beverage'
        WHEN lower(elem) IN ('fashion', 'fashion & clothing') THEN 'Fashion & Clothing'
        WHEN lower(elem) IN ('lifestyle', 'lifestyle & home') THEN 'Lifestyle & Home'
        WHEN lower(elem) IN ('travel', 'travel & tourism') THEN 'Travel & Tourism'
        WHEN lower(elem) IN ('fitness', 'fitness & wellness') THEN 'Fitness & Wellness'
        WHEN lower(elem) IN ('beauty', 'beauty & cosmetics') THEN 'Beauty & Cosmetics'
        WHEN lower(elem) IN ('tech', 'technology', 'technology & gadgets') THEN 'Technology & Gadgets'
        WHEN lower(elem) IN ('gaming', 'gaming & esports') THEN 'Gaming & Esports'
        WHEN lower(elem) IN ('finance', 'crypto', 'finance & crypto') THEN 'Finance & Crypto'
        WHEN lower(elem) IN ('entertainment', 'music', 'entertainment & music') THEN 'Entertainment & Music'
        WHEN lower(elem) IN ('photography', 'art', 'photography & art') THEN 'Photography & Art'
        WHEN lower(elem) IN ('education', 'learning', 'education & learning') THEN 'Education & Learning'
        WHEN lower(elem) IN ('health', 'medical', 'health & medical') THEN 'Health & Medical'
        WHEN lower(elem) IN ('parenting', 'family', 'parenting & family') THEN 'Parenting & Family'
        WHEN lower(elem) IN ('automotive') THEN 'Automotive'
        WHEN lower(elem) IN ('sports', 'athletics', 'sports & athletics') THEN 'Sports & Athletics'
        WHEN lower(elem) IN ('diy', 'crafts', 'diy & crafts') THEN 'DIY & Crafts'
        WHEN lower(elem) IN ('arts', 'culture', 'arts & culture') THEN 'Arts & Culture'
        WHEN lower(elem) IN ('news', 'politics', 'news & politics') THEN 'News & Politics'
        WHEN lower(elem) IN ('business', 'entrepreneurship', 'business & entrepreneurship') THEN 'Business & Entrepreneurship'
        WHEN lower(elem) IN ('real estate', 'realestate') THEN 'Real Estate'
        WHEN lower(elem) IN ('pets', 'animals', 'pets & animals') THEN 'Pets & Animals'
        WHEN lower(elem) IN ('other') THEN 'Other'
        ELSE NULL
      END AS new_val
    FROM UNNEST(niches) AS elem
  ) t
  WHERE new_val IS NOT NULL
)
WHERE niches IS NOT NULL AND array_length(niches, 1) > 0;
