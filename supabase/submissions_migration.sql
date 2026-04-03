-- ============================================================
-- Add submission columns to applications table
-- Run in Supabase SQL Editor
-- ============================================================

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS submission_url         text,
  ADD COLUMN IF NOT EXISTS submission_status      text NOT NULL DEFAULT 'not_submitted'
    CHECK (submission_status IN ('not_submitted', 'submitted', 'approved', 'revision_requested')),
  ADD COLUMN IF NOT EXISTS admin_submission_note  text,
  ADD COLUMN IF NOT EXISTS submission_submitted_at timestamptz;
