/**
 * Master list of content niches/categories
 * Consolidated from Google AdSense, YouTube, Facebook/Meta, TikTok, IAB, Instagram, LinkedIn, Twitter
 * Used across admin campaign creation, brand signup, and creator profile
 * 
 * Last updated: April 1, 2026
 * Total categories: 23
 */

export const NICHES = [
  'Fitness & Wellness',
  'Beauty & Cosmetics',
  'Fashion & Clothing',
  'Food & Beverage',
  'Technology & Gadgets',
  'Travel & Tourism',
  'Gaming & Esports',
  'Finance & Crypto',
  'Lifestyle & Home',
  'Entertainment & Music',
  'Photography & Art',
  'Education & Learning',
  'Health & Medical',
  'Parenting & Family',
  'Automotive',
  'Sports & Athletics',
  'DIY & Crafts',
  'Arts & Culture',
  'News & Politics',
  'Business & Entrepreneurship',
  'Real Estate',
  'Pets & Animals',
  'Other',
] as const

/**
 * Export as both array and sorted object for different use cases
 */
export const NICHE_OPTIONS = [...NICHES].sort()
export const NICHE_SET = new Set(NICHES)
