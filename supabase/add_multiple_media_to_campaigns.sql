-- Add image_urls and video_urls columns to campaigns table
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}';
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS video_urls text[] DEFAULT '{}';

-- Migrate existing data
UPDATE public.campaigns 
SET image_urls = ARRAY[image_url] 
WHERE image_url IS NOT NULL AND (image_urls IS NULL OR array_length(image_urls, 1) IS NULL);

UPDATE public.campaigns 
SET video_urls = ARRAY[video_url] 
WHERE video_url IS NOT NULL AND (video_urls IS NULL OR array_length(video_urls, 1) IS NULL);
