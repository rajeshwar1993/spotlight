/**
 * SEO constants and default values
 */

export const SEO_DEFAULTS = {
  title: 'Spotlight - Professional Portfolio Platform',
  description: 'Create stunning professional portfolios in minutes. Perfect for actors, models, and creative professionals.',
  keywords: ['portfolio', 'actor', 'model', 'creative', 'professional'],
  locale: 'en_US',
  type: 'website',
  siteName: 'Spotlight',
  twitterHandle: '@SpotlightApp',
  themeColor: '#ffffff',
  backgroundColor: '#ffffff',
  
  // Image dimensions
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterImageWidth: 1200,
  twitterImageHeight: 675,
  
  // Content limits
  titleMinLength: 10,
  titleMaxLength: 60,
  descriptionMinLength: 120,
  descriptionMaxLength: 160,
  keywordsMaxCount: 10,
  
  // Cache durations (in seconds)
  sitemapCacheDuration: 3600, // 1 hour
  robotsCacheDuration: 86400, // 24 hours
  structuredDataCacheDuration: 1800, // 30 minutes
} as const;

export const SOCIAL_MEDIA_PLATFORMS = {
  facebook: {
    name: 'Facebook',
    shareUrl: 'https://www.facebook.com/sharer/sharer.php',
    color: '#1877f2',
    icon: 'facebook',
    requirements: ['url', 'quote'],
  },
  twitter: {
    name: 'Twitter',
    shareUrl: 'https://twitter.com/intent/tweet',
    color: '#1da1f2',
    icon: 'twitter',
    requirements: ['url', 'text', 'via'],
  },
  linkedin: {
    name: 'LinkedIn',
    shareUrl: 'https://www.linkedin.com/sharing/share-offsite/',
    color: '#0077b5',
    icon: 'linkedin',
    requirements: ['url', 'title', 'summary'],
  },
  pinterest: {
    name: 'Pinterest',
    shareUrl: 'https://pinterest.com/pin/create/button/',
    color: '#bd081c',
    icon: 'pinterest',
    requirements: ['url', 'media', 'description'],
  },
  whatsapp: {
    name: 'WhatsApp',
    shareUrl: 'https://wa.me/',
    color: '#25d366',
    icon: 'whatsapp',
    requirements: ['text'],
  },
  email: {
    name: 'Email',
    shareUrl: 'mailto:',
    color: '#666666',
    icon: 'email',
    requirements: ['subject', 'body'],
  },
} as const;

export const SCHEMA_TYPES = {
  // Core types
  PERSON: 'Person',
  ORGANIZATION: 'Organization',
  WEBSITE: 'WebSite',
  WEBPAGE: 'WebPage',
  
  // Creative work types
  CREATIVE_WORK: 'CreativeWork',
  CREATIVE_WORK_SERIES: 'CreativeWorkSeries',
  VISUAL_ARTWORK: 'VisualArtwork',
  PHOTOGRAPH: 'Photograph',
  VIDEO_OBJECT: 'VideoObject',
  AUDIO_OBJECT: 'AudioObject',
  
  // Business types
  LOCAL_BUSINESS: 'LocalBusiness',
  PROFESSIONAL_SERVICE: 'ProfessionalService',
  SERVICE: 'Service',
  OFFER: 'Offer',
  
  // Content types
  ARTICLE: 'Article',
  BLOG_POSTING: 'BlogPosting',
  NEWS_ARTICLE: 'NewsArticle',
  REVIEW: 'Review',
  RATING: 'Rating',
  
  // Navigation types
  BREADCRUMB_LIST: 'BreadcrumbList',
  LIST_ITEM: 'ListItem',
  
  // FAQ and How-to types
  FAQ_PAGE: 'FAQPage',
  QUESTION: 'Question',
  ANSWER: 'Answer',
  HOW_TO: 'HowTo',
  HOW_TO_STEP: 'HowToStep',
  HOW_TO_SECTION: 'HowToSection',
  HOW_TO_DIRECTION: 'HowToDirection',
  
  // Event types
  EVENT: 'Event',
  BUSINESS_EVENT: 'BusinessEvent',
  EDUCATIONAL_EVENT: 'EducationalEvent',
  
  // Job types
  JOB_POSTING: 'JobPosting',
  
  // Course types
  COURSE: 'Course',
  COURSE_INSTANCE: 'CourseInstance',
  
  // Place types
  PLACE: 'Place',
  POSTAL_ADDRESS: 'PostalAddress',
  GEO_COORDINATES: 'GeoCoordinates',
  GEO_CIRCLE: 'GeoCircle',
  
  // Contact types
  CONTACT_POINT: 'ContactPoint',
  
  // Monetary types
  MONETARY_AMOUNT: 'MonetaryAmount',
  PRICE_SPECIFICATION: 'PriceSpecification',
} as const;

export const META_TAG_LIMITS = {
  title: {
    min: 10,
    max: 60,
    optimal: 50,
  },
  description: {
    min: 120,
    max: 160,
    optimal: 150,
  },
  keywords: {
    max: 10,
    optimal: 5,
  },
  openGraph: {
    title: {
      min: 10,
      max: 95,
      optimal: 85,
    },
    description: {
      min: 120,
      max: 200,
      optimal: 180,
    },
    imageWidth: 1200,
    imageHeight: 630,
    imageAspectRatio: 1.91,
  },
  twitter: {
    title: {
      min: 10,
      max: 70,
      optimal: 60,
    },
    description: {
      min: 120,
      max: 200,
      optimal: 180,
    },
    imageWidth: 1200,
    imageHeight: 675,
    imageAspectRatio: 1.78,
  },
  viewport: {
    default: 'width=device-width, initial-scale=1.0, viewport-fit=cover',
  },
  themeColor: {
    default: '#ffffff',
  },
} as const;

export const SITEMAP_PRIORITIES = {
  homepage: 1.0,
  portfolios: 0.8,
  publicPortfolios: 0.7,
  staticPages: 0.6,
  authPages: 0.4,
  dashboardPages: 0.3,
} as const;

export const SITEMAP_CHANGE_FREQUENCIES = {
  homepage: 'daily',
  portfolios: 'weekly',
  publicPortfolios: 'weekly',
  staticPages: 'monthly',
  authPages: 'yearly',
  dashboardPages: 'monthly',
} as const;

export const ROBOTS_RULES = {
  allowed: [
    '/',
    '/mypage/*',
    '/templates',
    '/examples',
    '/pricing',
    '/about',
    '/contact',
    '/help',
    '/terms',
    '/privacy',
  ],
  disallowed: [
    '/api/',
    '/dashboard/',
    '/auth/',
    '/admin/',
    '/profile/',
    '/create/',
    '/preview/',
    '/_next/',
    '/static/',
    '/.*\\?.*', // Query parameters
  ],
  crawlDelay: {
    default: 1,
    googlebot: 1,
    bingbot: 1,
    yandexbot: 2,
    baiduspider: 3,
  },
} as const;

export const STRUCTURED_DATA_CONTEXTS = {
  schemaOrg: 'https://schema.org',
  openGraph: 'https://ogp.me/ns#',
  twitter: 'https://dev.twitter.com/cards/markup',
  dublin: 'https://dublincore.org/specifications/dublin-core/dcmi-terms/',
} as const;

export const IMAGE_SEO_FORMATS = {
  webp: {
    quality: 85,
    lossless: false,
    effort: 4,
  },
  avif: {
    quality: 80,
    lossless: false,
    effort: 4,
  },
  jpeg: {
    quality: 85,
    progressive: true,
    mozjpeg: true,
  },
  png: {
    quality: 90,
    compressionLevel: 9,
    adaptiveFiltering: true,
  },
} as const;

export const PERFORMANCE_BUDGETS = {
  // Core Web Vitals targets
  lcp: 2.5, // Largest Contentful Paint (seconds)
  fid: 100, // First Input Delay (milliseconds)
  cls: 0.1, // Cumulative Layout Shift
  
  // Additional performance metrics
  fcp: 1.8, // First Contentful Paint (seconds)
  ttfb: 0.6, // Time to First Byte (seconds)
  
  // Bundle size budgets
  javascript: 250000, // 250KB
  css: 50000, // 50KB
  images: 500000, // 500KB
  fonts: 100000, // 100KB
  
  // Network budgets
  requests: 50, // Maximum number of requests
  totalSize: 1000000, // 1MB total page size
} as const;

export const LOCAL_SEO_CATEGORIES = {
  // Creative professions
  'Actor': 'Arts & Entertainment',
  'Model': 'Arts & Entertainment',
  'Photographer': 'Professional Services',
  'Musician': 'Arts & Entertainment',
  'Artist': 'Arts & Entertainment',
  'Designer': 'Professional Services',
  'Writer': 'Professional Services',
  'Director': 'Arts & Entertainment',
  'Producer': 'Arts & Entertainment',
  'Filmmaker': 'Arts & Entertainment',
  
  // Default category
  'default': 'Professional Services',
} as const;

export const ACCESSIBILITY_REQUIREMENTS = {
  // WCAG 2.1 AA compliance
  colorContrast: 4.5, // Minimum contrast ratio
  focusIndicator: true,
  keyboardNavigation: true,
  altText: true,
  ariaLabels: true,
  headingStructure: true,
  semanticMarkup: true,
  
  // Screen reader support
  screenReader: true,
  landmarks: true,
  skipLinks: true,
  
  // Motor accessibility
  clickTargetSize: 44, // Minimum 44px click targets
  motionReduction: true,
  
  // Cognitive accessibility
  readingLevel: 8, // 8th grade reading level
  sessionTimeout: 1800, // 30 minutes
} as const;