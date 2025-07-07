import { APP_CONFIG } from '@/lib/constants';
import type { PortfolioData } from '@/lib/templates/types';

export interface SitemapEntry {
  url: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export interface ImageSEOOptions {
  alt: string;
  title?: string;
  description?: string;
  keywords?: string[];
  width?: number;
  height?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  quality?: number;
}

export type SocialSharePlatform = 'facebook' | 'twitter' | 'linkedin' | 'pinterest' | 'whatsapp' | 'email';

/**
 * Generate XML sitemap from sitemap entries
 */
export function generateSitemap(entries: SitemapEntry[]): string {
  const urls = entries.map(entry => `
  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(
  sitemapUrl: string,
  additionalRules: string[] = []
): string {
  const baseRules = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /dashboard/',
    'Disallow: /auth/',
    'Disallow: /admin/',
    'Disallow: /profile/',
    'Disallow: /create/',
    'Disallow: /preview/',
    'Disallow: /_next/',
    'Disallow: /static/',
    '',
    'User-agent: Googlebot',
    'Allow: /',
    'Crawl-delay: 1',
    '',
    'User-agent: Bingbot',
    'Allow: /',
    'Crawl-delay: 1',
    '',
    `Sitemap: ${sitemapUrl}`,
    ...additionalRules
  ];

  return baseRules.join('\n');
}

/**
 * Optimize image for SEO with proper alt text and metadata
 */
export function optimizeImageForSEO(
  imageUrl: string,
  options: ImageSEOOptions
): {
  src: string;
  alt: string;
  title?: string;
  width?: number;
  height?: number;
  loading: 'lazy' | 'eager';
  decoding: 'async' | 'sync';
} {
  return {
    src: imageUrl,
    alt: options.alt,
    title: options.title,
    width: options.width,
    height: options.height,
    loading: 'lazy',
    decoding: 'async',
  };
}

/**
 * Generate optimized alt text for images
 */
export function generateAltText(
  imageType: 'headshot' | 'portfolio' | 'gallery' | 'hero',
  portfolioData: PortfolioData,
  context?: string
): string {
  const { user, portfolio } = portfolioData;
  const name = user.full_name || portfolio.title;
  const profession = user.profession || 'Professional';

  const altTexts = {
    headshot: `Professional headshot of ${name}, ${profession}`,
    portfolio: `Portfolio image of ${name}, ${profession}${context ? ` - ${context}` : ''}`,
    gallery: `Gallery image from ${name}'s portfolio${context ? ` - ${context}` : ''}`,
    hero: `Hero image of ${name}, ${profession} - Professional Portfolio`,
  };

  return altTexts[imageType];
}

/**
 * Extract keywords from text content
 */
export function extractKeywords(
  text: string,
  maxKeywords: number = 10
): string[] {
  if (!text) return [];

  // Remove common stop words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
    'my', 'your', 'his', 'hers', 'its', 'our', 'their', 'mine', 'yours', 'ours', 'theirs'
  ]);

  // Extract words, convert to lowercase, and filter
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  // Count word frequency
  const wordCount = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort by frequency and return top keywords
  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

/**
 * Calculate reading time for text content
 */
export function calculateReadingTime(text: string): {
  minutes: number;
  words: number;
  characters: number;
} {
  const wordsPerMinute = 200; // Average reading speed
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  const characters = text.length;

  return { minutes, words, characters };
}

/**
 * Generate canonical URL for a page
 */
export function generateCanonicalUrl(
  path: string,
  params?: Record<string, string>
): string {
  const baseUrl = APP_CONFIG.url;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  if (!params || Object.keys(params).length === 0) {
    return `${baseUrl}${cleanPath}`;
  }

  const queryString = new URLSearchParams(params).toString();
  return `${baseUrl}${cleanPath}?${queryString}`;
}

/**
 * Validate meta tags for optimal SEO
 */
export function validateMetaTags(metaTags: {
  title?: string;
  description?: string;
  keywords?: string[];
}): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Title validation
  if (!metaTags.title) {
    errors.push('Title is required');
  } else {
    if (metaTags.title.length < 10) {
      warnings.push('Title is too short (minimum 10 characters recommended)');
    }
    if (metaTags.title.length > 60) {
      warnings.push('Title is too long (maximum 60 characters recommended)');
    }
  }

  // Description validation
  if (!metaTags.description) {
    errors.push('Description is required');
  } else {
    if (metaTags.description.length < 120) {
      warnings.push('Description is too short (minimum 120 characters recommended)');
    }
    if (metaTags.description.length > 160) {
      warnings.push('Description is too long (maximum 160 characters recommended)');
    }
  }

  // Keywords validation
  if (metaTags.keywords && metaTags.keywords.length > 10) {
    warnings.push('Too many keywords (maximum 10 recommended)');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Generate social share URLs for different platforms
 */
export function generateSocialShareUrls(
  url: string,
  title: string,
  description?: string,
  image?: string
): Record<SocialSharePlatform, string> {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || '');
  const encodedImage = encodeURIComponent(image || '');

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&via=SpotlightApp`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${url}`,
  };
}

/**
 * Generate optimized URL slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate schema.org breadcrumb markup
 */
export function generateBreadcrumbMarkup(
  breadcrumbs: Array<{ name: string; url?: string }>
): string {
  const items = breadcrumbs.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: crumb.url || undefined,
  }));

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };

  return JSON.stringify(schema);
}

/**
 * Get optimal image dimensions for different social platforms
 */
export function getOptimalImageDimensions(platform: string): {
  width: number;
  height: number;
  aspectRatio: string;
} {
  const dimensions = {
    'facebook-post': { width: 1200, height: 630, aspectRatio: '1.91:1' },
    'facebook-cover': { width: 1200, height: 315, aspectRatio: '3.81:1' },
    'twitter-card': { width: 1200, height: 675, aspectRatio: '1.78:1' },
    'twitter-header': { width: 1500, height: 500, aspectRatio: '3:1' },
    'linkedin-post': { width: 1200, height: 627, aspectRatio: '1.91:1' },
    'linkedin-cover': { width: 1584, height: 396, aspectRatio: '4:1' },
    'instagram-post': { width: 1080, height: 1080, aspectRatio: '1:1' },
    'instagram-story': { width: 1080, height: 1920, aspectRatio: '9:16' },
    'pinterest-pin': { width: 1000, height: 1500, aspectRatio: '2:3' },
    'youtube-thumbnail': { width: 1280, height: 720, aspectRatio: '16:9' },
    'og-image': { width: 1200, height: 630, aspectRatio: '1.91:1' },
  };

  return dimensions[platform] || dimensions['og-image'];
}

/**
 * Generate structured data for FAQ section
 */
export function generateFAQStructuredData(
  faqs: Array<{ question: string; answer: string }>
): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return JSON.stringify(schema);
}

/**
 * Calculate SEO score based on various factors
 */
export function calculateSEOScore(page: {
  title?: string;
  description?: string;
  keywords?: string[];
  headings?: string[];
  images?: Array<{ alt?: string; title?: string }>;
  content?: string;
  canonicalUrl?: string;
  structuredData?: boolean;
}): {
  score: number;
  maxScore: number;
  factors: Array<{
    name: string;
    score: number;
    maxScore: number;
    description: string;
  }>;
} {
  const factors = [
    {
      name: 'Title',
      score: page.title && page.title.length >= 10 && page.title.length <= 60 ? 10 : 0,
      maxScore: 10,
      description: 'Title should be 10-60 characters',
    },
    {
      name: 'Description',
      score: page.description && page.description.length >= 120 && page.description.length <= 160 ? 10 : 0,
      maxScore: 10,
      description: 'Description should be 120-160 characters',
    },
    {
      name: 'Keywords',
      score: page.keywords && page.keywords.length > 0 && page.keywords.length <= 10 ? 5 : 0,
      maxScore: 5,
      description: 'Should have 1-10 relevant keywords',
    },
    {
      name: 'Headings',
      score: page.headings && page.headings.length > 0 ? 5 : 0,
      maxScore: 5,
      description: 'Should have proper heading structure',
    },
    {
      name: 'Images',
      score: page.images && page.images.every(img => img.alt) ? 10 : 0,
      maxScore: 10,
      description: 'All images should have alt text',
    },
    {
      name: 'Content Length',
      score: page.content && page.content.length >= 300 ? 10 : 0,
      maxScore: 10,
      description: 'Content should be at least 300 characters',
    },
    {
      name: 'Canonical URL',
      score: page.canonicalUrl ? 5 : 0,
      maxScore: 5,
      description: 'Should have canonical URL',
    },
    {
      name: 'Structured Data',
      score: page.structuredData ? 10 : 0,
      maxScore: 10,
      description: 'Should have structured data markup',
    },
  ];

  const totalScore = factors.reduce((sum, factor) => sum + factor.score, 0);
  const maxScore = factors.reduce((sum, factor) => sum + factor.maxScore, 0);

  return {
    score: totalScore,
    maxScore,
    factors,
  };
}