-- ============================================================
-- homepage_showcase_migration.sql
-- Adds is_homepage_featured flag to applications table.
-- Run in Supabase SQL Editor after patches.sql.
-- ============================================================

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS is_homepage_featured boolean DEFAULT false;
