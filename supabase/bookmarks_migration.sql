-- ── BOOKMARKS ───────────────────────────────────────────────────
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.bookmarks (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id  uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (creator_id, campaign_id)
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators manage own bookmarks"
  ON public.bookmarks
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());
