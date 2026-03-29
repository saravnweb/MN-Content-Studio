-- ── PUSH SUBSCRIPTIONS ──────────────────────────────────────────
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id  uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint    text NOT NULL,
  p256dh      text NOT NULL,
  auth        text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (creator_id, endpoint)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Creators can manage only their own subscriptions
CREATE POLICY "Creators manage own push subscriptions"
  ON public.push_subscriptions
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

-- Service role (used by API routes) can read all subscriptions to send pushes
-- This is handled by SUPABASE_SERVICE_ROLE_KEY in the API route, bypassing RLS
