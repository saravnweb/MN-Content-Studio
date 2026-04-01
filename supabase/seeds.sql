-- ============================================================
-- MW Content Studio — Sample Data Seeds
-- Paste into Supabase SQL Editor and run.
-- ============================================================

-- ─────────────────────────────────────────
-- 5 Sample Brands (logos set via app later)
-- ─────────────────────────────────────────
INSERT INTO public.brands (name, tagline, logo_url) VALUES
  ('MuscleBlaze',  'Sports Nutrition · India',         NULL),
  ('Mamaearth',    'Goodness Inside · Skincare & Hair', NULL),
  ('boAt',         'Lifestyle Electronics · India',    NULL),
  ('Nykaa',        'Beauty & Wellness · India',        NULL),
  ('Lenskart',     'Eyewear for Everyone · India',     NULL)
ON CONFLICT (name) DO NOTHING;

-- ─────────────────────────────────────────
-- 5 Sample Campaigns (one per brand)
-- NOTE: Replace <YOUR_ADMIN_UUID> with your actual admin user UUID
--       from Supabase Auth → Users
-- ─────────────────────────────────────────
INSERT INTO public.campaigns (
  title, brand_name, brand_logo_url,
  description, deliverables,
  budget_min, budget_max,
  niches, platforms,
  deadline, slots_total, slots_filled, status
)
SELECT
  title, brand_name, NULL,
  description, deliverables,
  budget_min, budget_max,
  niches::text[], platforms::text[],
  deadline, slots_total, 0, 'active'
FROM (VALUES

  (
    'Whey Protein Summer Campaign',
    'MuscleBlaze',
    'Looking for fitness creators with 10k–500k followers to review and demo our new Whey Isolate range. Content should feel authentic — your honest workout review, not a scripted ad.',
    '1 YouTube video (min 8 min) + 2 Instagram Reels',
    15000, 40000,
    ARRAY['Fitness & Wellness'],
    ARRAY['youtube', 'instagram'],
    (CURRENT_DATE + INTERVAL '45 days')::date,
    5
  ),

  (
    'Onion Hair Oil Launch',
    'Mamaearth',
    'Promote our new Onion Hair Oil targeting women aged 18–35 dealing with hair fall. Real before/after results preferred. Campaign runs across reels and shorts.',
    '3 Instagram Reels + 1 YouTube Short',
    8000, 20000,
    ARRAY['Beauty & Cosmetics'],
    ARRAY['instagram', 'youtube'],
    (CURRENT_DATE + INTERVAL '30 days')::date,
    8
  ),

  (
    'boAt Rockerz 550 Review Campaign',
    'boAt',
    'Tech and lifestyle creators needed to review our flagship Rockerz 550 wireless headphones. Focus on sound quality, battery life, and style. Unboxing + review format preferred.',
    '1 YouTube Review video (min 6 min) OR 2 Instagram Reels',
    10000, 25000,
    ARRAY['Technology & Gadgets'],
    ARRAY['youtube', 'instagram'],
    (CURRENT_DATE + INTERVAL '21 days')::date,
    6
  ),

  (
    'Nykaa Festive Makeup Collab',
    'Nykaa',
    'Looking for beauty and fashion creators to create festive makeup looks using Nykaa products. Creative freedom encouraged — show your signature style with our palette.',
    '2 Instagram Reels + 3 Instagram Stories',
    12000, 30000,
    ARRAY['Beauty & Cosmetics', 'Fashion & Clothing'],
    ARRAY['instagram'],
    (CURRENT_DATE + INTERVAL '14 days')::date,
    10
  ),

  (
    'Back to College Eyewear Campaign',
    'Lenskart',
    'Target college-going audience (18–25). Creators should showcase picking their first pair of prescription glasses or stylish frames online. Fun, youthful, and relatable content.',
    '1 Instagram Reel + 1 YouTube Short',
    6000, 15000,
    ARRAY['Fashion & Clothing', 'Lifestyle & Home'],
    ARRAY['instagram', 'youtube'],
    (CURRENT_DATE + INTERVAL '60 days')::date,
    7
  )

) AS t(title, brand_name, description, deliverables, budget_min, budget_max, niches, platforms, deadline, slots_total);
