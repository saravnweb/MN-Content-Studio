-- ============================================================
-- FINAL FIX: BRANDS AND PAYOUT COLUMNS
-- This script adds the missing 'brands' table and the columns
-- on 'profiles' and 'applications' required for payouts.
-- Run this in the Supabase SQL Editor.
-- ============================================================

-- 1. Create BRANDS table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.brands (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name       text NOT NULL UNIQUE,
  tagline    text,
  logo_url   text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

-- 2. Add payout handling columns to APPLICATIONS
ALTER TABLE public.applications 
  ADD COLUMN IF NOT EXISTS payout_status text DEFAULT 'unpaid' CHECK (payout_status IN ('unpaid', 'processing', 'paid')),
  ADD COLUMN IF NOT EXISTS payout_amount bigint,
  ADD COLUMN IF NOT EXISTS payout_ref text,
  ADD COLUMN IF NOT EXISTS payout_date timestamptz;

-- 3. Add bank/UPI details to PROFILES
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_holder_name text,
  ADD COLUMN IF NOT EXISTS bank_name           text,
  ADD COLUMN IF NOT EXISTS account_number      text,
  ADD COLUMN IF NOT EXISTS ifsc_code           text,
  ADD COLUMN IF NOT EXISTS upi_id               text;

-- 4. Enable Row Level Security and Policies for BRANDS
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Policy: Admin can manage everything
DROP POLICY IF EXISTS "Admin can manage brands" ON public.brands;
CREATE POLICY "Admin can manage brands" ON public.brands 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Everyone can view brands (needed for deal cards)
DROP POLICY IF EXISTS "Anyone can view brands" ON public.brands;
CREATE POLICY "Anyone can view brands" ON public.brands FOR SELECT USING (true);

-- 5. Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';
