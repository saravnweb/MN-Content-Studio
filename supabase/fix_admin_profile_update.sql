-- ============================================================
-- fix_admin_profile_update.sql
-- Allow admins to update creator profiles in Supabase RLS
-- ============================================================

-- 1. Ensure the is_admin() helper exists (bypasses RLS recursion)
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

-- 2. Add update policy for admins on profiles
-- This allows admins to update any creator's niche, bio, etc.
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
CREATE POLICY "Admin can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. Verify and fix select policy if needed
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
CREATE POLICY "Admin can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- 4. Verify creators can still update their own profiles
-- (This should already exist from schema.sql, but let's be sure)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
