-- ============================================================
-- Test: Campaign Visibility & Niche-Based Filtering
-- Run this after applying visibility_migration.sql
-- ============================================================

-- Test 1: Check visibility columns exist
SELECT 
  COUNT(*) as column_count,
  STRING_AGG(column_name, ', ') as columns
FROM information_schema.columns
WHERE table_name = 'campaigns' 
AND column_name IN ('visibility', 'visible_to');
-- Expected result: column_count = 2, columns = 'visibility, visible_to'
-- If 0, the migration has NOT been applied yet

-- Test 2: Check RLS policies exist
SELECT 
  policyname, 
  cmd,
  SUBSTRING(qual, 1, 100) as policy_logic
FROM pg_policies 
WHERE tablename = 'campaigns'
ORDER BY policyname;

-- Test 3: Create test data (run this once to validate setup)
-- First, ensure the users exist in auth.users (to satisfy foreign key)
INSERT INTO auth.users (id, email, aud, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'sports@test.com', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440002', 'fitness@test.com', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440003', 'fashion@test.com', 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Create 3 test creators with different niches (Updates or inserts profiles)
INSERT INTO public.profiles (id, role, full_name, niches) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'creator', 'Sports Creator', ARRAY['sports', 'fitness']),
  ('550e8400-e29b-41d4-a716-446655440002', 'creator', 'Fitness Creator', ARRAY['fitness', 'wellness']),
  ('550e8400-e29b-41d4-a716-446655440003', 'creator', 'Fashion Creator', ARRAY['fashion', 'lifestyle'])
ON CONFLICT (id) DO UPDATE SET 
  role = EXCLUDED.role, 
  full_name = EXCLUDED.full_name, 
  niches = EXCLUDED.niches;

-- Create 3 test campaigns
INSERT INTO public.campaigns (id, title, brand_name, description, niches, visibility, visible_to, status) VALUES
  (
    '660e8400-e29b-41d4-a716-446655440001',
    'Decathlon Sports Campaign',
    'Decathlon',
    'Sports equipment review',
    ARRAY['sports'],
    'all_creators',
    '{}',
    'active'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440002',
    'Exclusive Wellness Campaign',
    'Nutrela',
    'Private wellness collab',
    ARRAY['wellness', 'fitness'],
    'selected_creators',
    ARRAY['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002']::uuid[],
    'active'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440003',
    'Public Brand Campaign',
    'FashionBrand Co',
    'Public campaign visible to all',
    ARRAY['fashion'],
    'public',
    '{}',
    'active'
  )
ON CONFLICT DO NOTHING;

-- Test 4: Sports Creator visibility (auth.uid() = '550e8400-e29b-41d4-a716-446655440001')
-- This simulates what SQL filters would apply if you were logged in as Sports Creator
SELECT 
  id, 
  title, 
  brand_name, 
  niches, 
  visibility,
  CASE 
    WHEN visibility = 'public' THEN 'PUBLIC - visible to all'
    WHEN visibility = 'all_creators' AND ARRAY['sports', 'fitness'] && niches THEN 'NICHE MATCH - visible via all_creators'
    WHEN visibility = 'all_creators' AND NOT (ARRAY['sports', 'fitness'] && niches) THEN 'NO NICHE MATCH - hidden'
    WHEN visibility = 'selected_creators' AND '550e8400-e29b-41d4-a716-446655440001' = ANY(visible_to) THEN 'SELECTED - visible to this creator'
    WHEN visibility = 'selected_creators' THEN 'SELECTED - hidden from this creator'
    ELSE 'UNKNOWN'
  END as sports_creator_sees
FROM public.campaigns
WHERE status = 'active'
ORDER BY title;

-- EXPECTED RESULTS:
-- Decathlon Sports Campaign: NICHE MATCH (sports creator with sports niche)
-- Exclusive Wellness Campaign: SELECTED (in visible_to array)
-- Public Brand Campaign: PUBLIC

-- Test 5: Fitness Creator visibility (auth.uid() = '550e8400-e29b-41d4-a716-446655440002')
SELECT 
  id, 
  title, 
  brand_name, 
  niches, 
  visibility,
  CASE 
    WHEN visibility = 'public' THEN 'PUBLIC - visible to all'
    WHEN visibility = 'all_creators' AND ARRAY['fitness', 'wellness'] && niches THEN 'NICHE MATCH - visible via all_creators'
    WHEN visibility = 'all_creators' AND NOT (ARRAY['fitness', 'wellness'] && niches) THEN 'NO NICHE MATCH - hidden'
    WHEN visibility = 'selected_creators' AND '550e8400-e29b-41d4-a716-446655440002' = ANY(visible_to) THEN 'SELECTED - visible to this creator'
    WHEN visibility = 'selected_creators' THEN 'SELECTED - hidden from this creator'
    ELSE 'UNKNOWN'
  END as fitness_creator_sees
FROM public.campaigns
WHERE status = 'active'
ORDER BY title;

-- EXPECTED RESULTS:
-- Decathlon Sports Campaign: NO NICHE MATCH (fitness creator doesn't have sports niche)
-- Exclusive Wellness Campaign: NICHE MATCH + SELECTED (wellness/fitness niche AND in visible_to)
-- Public Brand Campaign: PUBLIC

-- Test 6: Fashion Creator visibility (auth.uid() = '550e8400-e29b-41d4-a716-446655440003')
SELECT 
  id, 
  title, 
  brand_name, 
  niches, 
  visibility,
  CASE 
    WHEN visibility = 'public' THEN 'PUBLIC - visible to all'
    WHEN visibility = 'all_creators' AND ARRAY['fashion', 'lifestyle'] && niches THEN 'NICHE MATCH - visible via all_creators'
    WHEN visibility = 'all_creators' AND NOT (ARRAY['fashion', 'lifestyle'] && niches) THEN 'NO NICHE MATCH - hidden'
    WHEN visibility = 'selected_creators' AND '550e8400-e29b-41d4-a716-446655440003' = ANY(visible_to) THEN 'SELECTED - visible to this creator'
    WHEN visibility = 'selected_creators' THEN 'SELECTED - hidden from this creator'
    ELSE 'UNKNOWN'
  END as fashion_creator_sees
FROM public.campaigns
WHERE status = 'active'
ORDER BY title;

-- EXPECTED RESULTS:
-- Decathlon Sports Campaign: NO NICHE MATCH (fashion creator doesn't have sports niche)
-- Exclusive Wellness Campaign: SELECTED - hidden (not in visible_to array)
-- Public Brand Campaign: NICHE MATCH (fashion niche matches)

-- Test 7: Verify visible_to array can be updated dynamically
-- This would add fashion creator to the exclusive campaign
-- UPDATE public.campaigns
-- SET visible_to = array_append(visible_to, '550e8400-e29b-41d4-a716-446655440003')
-- WHERE id = '660e8400-e29b-41d4-a716-446655440002';

-- Cleanup (run when done testing)
-- DELETE FROM public.campaigns WHERE id IN ('660e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003');
-- DELETE FROM auth.users WHERE id IN ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003');
