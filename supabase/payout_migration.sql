-- Ensure payout columns exist on applications table
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS payout_status text DEFAULT 'unpaid' CHECK (payout_status IN ('unpaid', 'processing', 'paid')),
ADD COLUMN IF NOT EXISTS payout_amount bigint,
ADD COLUMN IF NOT EXISTS payout_ref text,
ADD COLUMN IF NOT EXISTS payout_date timestamptz;

CREATE OR REPLACE FUNCTION public.creator_payout_summary(creator uuid)
RETURNS TABLE (total_earned bigint, paid_count bigint, pending_count bigint)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    COALESCE(SUM(CASE WHEN payout_status = 'paid' THEN payout_amount ELSE 0 END), 0),
    COUNT(CASE WHEN payout_status = 'paid' THEN 1 END),
    COUNT(CASE WHEN payout_status IN ('unpaid','processing') THEN 1 END)
  FROM public.applications
  WHERE creator_id = creator AND status = 'accepted';
$$;

