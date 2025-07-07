/**
 * SEO utilities for Spotlight Portfolio Platform
 * 
 * This module provides comprehensive SEO functionality including:
 * - Schema.org structured data generation
 * - Meta tag optimization
 * - Social media optimization
 * - Local SEO features
 * - Performance optimization
 */

// Schema.org exports
export {
  generatePersonSchema,
  generatePortfolioSchema,
  generateCreativeWorksFromImages,
  generateSpotlightOrganizationSchema,
  generateLocalBusinessSchema,
  generateBreadcrumbSchema,
  generateWebSiteSchema,
  generatePortfolioStructuredData,
  type PersonSchema,
  type OrganizationSchema,
  type PortfolioSchema,
  type LocalBusinessSchema,
  type BreadcrumbSchema,
  type WebSiteSchema,
  type CreativeWorkSchema,
  type SchemaBase,
} from './schema';

// Meta tags exports
export {
  generatePortfolioMetaTags,
  generateEnhancedMetaTags,
  generateHomePageMetaTags,
  generateDashboardMetaTags,
  generateAuthMetaTags,
  generateErrorPageMetaTags,
  type EnhancedMetaTagsOptions,
} from './meta-tags';

// Structured data exports
export {
  generateJSONLD,
  generatePortfolioJSONLD,
  generateFAQSchema,
  generateHowToSchema,
  generateArticleSchema,
  generateReviewSchema,
  generateCourseSchema,
  generateEventSchema,
  generateJobPostingSchema,
  validateStructuredData,
  generateHomePageStructuredData,
} from './structured-data';

// Utility functions
export {
  generateSitemap,
  generateRobotsTxt,
  optimizeImageForSEO,
  generateAltText,
  extractKeywords,
  calculateReadingTime,
  generateCanonicalUrl,
  validateMetaTags,
  generateSocialShareUrls,
  type SitemapEntry,
  type ImageSEOOptions,
  type SocialSharePlatform,
} from './utils';

// Local SEO exports
export {
  generateEnhancedLocalBusinessSchema,
  generateLocalBusinessReviewSchema,
  generateServiceSchema,
  generateLocalEventSchema,
  generateLocalFAQSchema,
  generateLocalSEOMetaTags,
  generateComprehensiveLocalSEO,
  type LocationData,
  type LocalSEOOptions,
} from './local-seo';

// Performance SEO exports
export {
  generatePerformanceMetaTags,
  generatePreloadLinks,
  generatePrefetchLinks,
  generateOptimizedImageSrcSet,
  optimizeImageUrl,
  generateCriticalCSS,
  analyzePagePerformance,
  generateWebVitalsScript,
  generatePerformanceConfig,
  type PerformanceMetrics,
  type SEOPerformanceOptions,
} from './performance';

// Constants
export {
  SEO_DEFAULTS,
  SOCIAL_MEDIA_PLATFORMS,
  SCHEMA_TYPES,
  META_TAG_LIMITS,
} from './constants';