-- Fix missing columns in profiles table
-- Run this in the Supabase SQL Editor

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone         text,
  ADD COLUMN IF NOT EXISTS whatsapp      text,
  ADD COLUMN IF NOT EXISTS youtube_url   text,
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS twitter_url   text,
  ADD COLUMN IF NOT EXISTS gender        text CHECK (gender IN ('male', 'female', 'non-binary', 'prefer_not_to_say')),
  ADD COLUMN IF NOT EXISTS age           smallint CHECK (age >= 13 AND age <= 100),
  ADD COLUMN IF NOT EXISTS city          text;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
