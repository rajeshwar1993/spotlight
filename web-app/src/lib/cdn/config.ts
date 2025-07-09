import { config } from '../config/env-validation';

/**
 * CDN Configuration for production optimization
 */
export const cdnConfig = {
  // Cloudinary CDN configuration
  cloudinary: {
    enabled: !!config.cloudinary.cloudName,
    cloudName: config.cloudinary.cloudName,
    apiKey: config.cloudinary.apiKey,
    apiSecret: config.cloudinary.apiSecret,
    baseUrl: config.cloudinary.cloudName 
      ? `https://res.cloudinary.com/${config.cloudinary.cloudName}`
      : '',
    
    // Default transformations
    defaults: {
      format: 'auto',
      quality: 'auto',
      dpr: 'auto',
      flags: 'progressive',
    },
    
    // Responsive breakpoints
    breakpoints: [640, 768, 1024, 1280, 1600, 1920],
    
    // Optimization settings
    optimization: {
      enableAutoFormat: true,
      enableAutoQuality: true,
      enableProgressive: true,
      enableLossless: false,
      enableWebP: true,
      enableAVIF: true,
    },
  },

  // Vercel CDN configuration
  vercel: {
    enabled: config.isProduction,
    edgeRegions: ['iad1', 'sfo1', 'lhr1', 'hkg1', 'bom1'],
    cacheControl: {
      static: 'public, max-age=31536000, immutable',
      dynamic: 'public, s-maxage=60, stale-while-revalidate=300',
      api: 'public, s-maxage=60, stale-while-revalidate=300',
    },
  },

  // Supabase CDN configuration
  supabase: {
    enabled: !!config.supabase.storageUrl,
    storageUrl: config.supabase.storageUrl,
    transformations: {
      enableResize: true,
      enableFormat: true,
      enableQuality: true,
      enableProgressive: true,
    },
  },

  // General CDN settings
  general: {
    enableGzip: true,
    enableBrotli: true,
    enableHttp2: true,
    enableHttp3: true,
    minifyHtml: config.isProduction,
    minifyCSS: config.isProduction,
    minifyJS: config.isProduction,
    
    // Cache durations (in seconds)
    cacheDurations: {
      static: 31536000, // 1 year
      images: 2592000,  // 30 days
      api: 60,          // 1 minute
      pages: 300,       // 5 minutes
    },
  },
};

/**
 * Get CDN URL for static assets
 */
export function getCDNUrl(path: string, type: 'static' | 'image' | 'api' = 'static'): string {
  const baseUrl = config.isProduction ? config.appUrl : 'http://localhost:3000';
  
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // For production, use CDN optimizations
  if (config.isProduction) {
    switch (type) {
      case 'image':
        return optimizeImageCDN(`${baseUrl}/${cleanPath}`);
      case 'api':
        return `${baseUrl}/${cleanPath}`;
      default:
        return `${baseUrl}/${cleanPath}`;
    }
  }
  
  return `${baseUrl}/${cleanPath}`;
}

/**
 * Optimize image URLs for CDN
 */
function optimizeImageCDN(imageUrl: string): string {
  // If Cloudinary is enabled, use it for optimization
  if (cdnConfig.cloudinary.enabled) {
    const transformations = [
      'f_auto', // Auto format
      'q_auto', // Auto quality
      'dpr_auto', // Auto DPR
    ];
    
    return `${cdnConfig.cloudinary.baseUrl}/image/fetch/${transformations.join(',')}/${encodeURIComponent(imageUrl)}`;
  }
  
  // Otherwise, return original URL
  return imageUrl;
}

/**
 * Generate cache control headers based on content type
 */
export function getCacheControlHeader(type: 'static' | 'dynamic' | 'api'): string {
  const { cacheControl } = cdnConfig.vercel;
  
  switch (type) {
    case 'static':
      return cacheControl.static;
    case 'dynamic':
      return cacheControl.dynamic;
    case 'api':
      return cacheControl.api;
    default:
      return 'no-cache';
  }
}

/**
 * Generate resource hints for preloading
 */
export function generateResourceHints(resources: Array<{
  url: string;
  type: 'font' | 'image' | 'script' | 'style';
  crossorigin?: boolean;
}>): string {
  return resources
    .map(resource => {
      const crossorigin = resource.crossorigin ? ' crossorigin' : '';
      return `<link rel="preload" href="${resource.url}" as="${resource.type}"${crossorigin}>`;
    })
    .join('\n');
}

/**
 * Generate DNS prefetch hints
 */
export function generateDNSPrefetchHints(domains: string[]): string {
  return domains
    .map(domain => `<link rel="dns-prefetch" href="${domain}">`)
    .join('\n');
}

/**
 * Generate preconnect hints
 */
export function generatePreconnectHints(origins: Array<{
  url: string;
  crossorigin?: boolean;
}>): string {
  return origins
    .map(origin => {
      const crossorigin = origin.crossorigin ? ' crossorigin' : '';
      return `<link rel="preconnect" href="${origin.url}"${crossorigin}>`;
    })
    .join('\n');
}

/**
 * CDN optimization strategies
 */
export const cdnStrategies = {
  /**
   * Optimize for Core Web Vitals
   */
  webVitals: {
    // Largest Contentful Paint (LCP)
    lcp: {
      preloadCriticalImages: true,
      optimizeImageFormats: true,
      enableImageSizing: true,
      prioritizeAboveFold: true,
    },
    
    // First Input Delay (FID)
    fid: {
      splitCodeBundles: true,
      deferNonCriticalJS: true,
      optimizeEventHandlers: true,
    },
    
    // Cumulative Layout Shift (CLS)
    cls: {
      reserveImageSpace: true,
      avoidDynamicContent: true,
      optimizeWebFonts: true,
    },
  },

  /**
   * Optimize for mobile performance
   */
  mobile: {
    enableImageCompression: true,
    enableResourceHints: true,
    enableServiceWorker: true,
    enableOfflineSupport: true,
    prioritizeCriticalCSS: true,
    enableLazyLoading: true,
  },

  /**
   * Optimize for SEO
   */
  seo: {
    enableStructuredData: true,
    enableSitemap: true,
    enableRobotsTxt: true,
    enableCanonicalUrls: true,
    enableMetaTags: true,
    enableOpenGraph: true,
    enableTwitterCards: true,
  },
};

/**
 * Get optimized asset URLs for different environments
 */
export function getOptimizedAssetUrl(
  path: string,
  options: {
    width?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    optimize?: boolean;
  } = {}
): string {
  const { width, quality, format = 'auto', optimize = true } = options;
  
  if (!optimize || !config.isProduction) {
    return getCDNUrl(path, 'static');
  }
  
  // Build optimization parameters
  const params = new URLSearchParams();
  
  if (width) {
    params.set('w', width.toString());
  }
  
  if (quality) {
    params.set('q', quality.toString());
  }
  
  if (format !== 'auto') {
    params.set('f', format);
  }
  
  const baseUrl = getCDNUrl(path, 'image');
  const queryString = params.toString();
  
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Performance monitoring for CDN
 */
export class CDNPerformanceMonitor {
  private static metrics: Map<string, any> = new Map();
  
  static startTracking(resourceUrl: string) {
    const startTime = performance.now();
    this.metrics.set(resourceUrl, { startTime });
  }
  
  static endTracking(resourceUrl: string) {
    const metric = this.metrics.get(resourceUrl);
    if (metric) {
      const endTime = performance.now();
      metric.endTime = endTime;
      metric.duration = endTime - metric.startTime;
      
      // Report to analytics if available
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'cdn_performance', {
          event_category: 'Performance',
          event_label: resourceUrl,
          value: Math.round(metric.duration),
        });
      }
    }
  }
  
  static getMetrics(): Record<string, any> {
    return Object.fromEntries(this.metrics);
  }
  
  static clearMetrics() {
    this.metrics.clear();
  }
}

export default {
  config: cdnConfig,
  getCDNUrl,
  getCacheControlHeader,
  generateResourceHints,
  generateDNSPrefetchHints,
  generatePreconnectHints,
  strategies: cdnStrategies,
  getOptimizedAssetUrl,
  monitor: CDNPerformanceMonitor,
};