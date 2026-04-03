-- Add platform column to showcase_videos
ALTER TABLE public.showcase_videos 
ADD COLUMN IF NOT EXISTS platform text;

-- Add check constraint for platform
ALTER TABLE public.showcase_videos
DROP CONSTRAINT IF EXISTS showcase_videos_platform_check,
ADD CONSTRAINT showcase_videos_platform_check 
CHECK (platform IN ('instagram', 'youtube'));

-- Infer platform from existing video_url if platform is NULL
UPDATE public.showcase_videos
SET platform = 'instagram'
WHERE platform IS NULL AND video_url ILIKE '%instagram.com%';

UPDATE public.showcase_videos
SET platform = 'youtube'
WHERE platform IS NULL AND (video_url ILIKE '%youtube.com%' OR video_url ILIKE '%youtu.be%');

-- Default remaining to instagram (if file upload and platform not set)
UPDATE public.showcase_videos
SET platform = 'instagram'
WHERE platform IS NULL;

-- Make platform NOT NULL after populating
ALTER TABLE public.showcase_videos
ALTER COLUMN platform SET NOT NULL;
