import { headers } from 'next/headers';
import { APP_CONFIG } from '@/lib/constants';

export interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

export interface SEOPerformanceOptions {
  enablePreload?: boolean;
  enablePrefetch?: boolean;
  optimizeImages?: boolean;
  enableCriticalCSS?: boolean;
  enableResourceHints?: boolean;
  enableServiceWorker?: boolean;
  maxImageSize?: number;
  imageFormats?: string[];
  cacheStrategy?: 'aggressive' | 'moderate' | 'conservative';
}

/**
 * Generate performance-optimized meta tags
 */
export function generatePerformanceMetaTags(options: SEOPerformanceOptions = {}) {
  const tags: Record<string, string> = {
    // DNS prefetch for external domains
    'dns-prefetch': [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://www.google-analytics.com',
      'https://cdn.jsdelivr.net',
    ].join(' '),
    
    // Preconnect to speed up connections
    'preconnect': [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
    ].join(' '),
    
    // Resource hints
    'resource-hints': 'dns-prefetch preconnect preload prefetch',
    
    // Performance budgets
    'performance-budget': JSON.stringify({
      javascript: '250kb',
      css: '50kb',
      images: '500kb',
      fonts: '100kb',
      total: '1mb',
    }),
    
    // Core Web Vitals
    'web-vitals': 'lcp fid cls fcp ttfb',
    
    // Cache control
    'cache-control': getCacheControlValue(options.cacheStrategy),
    
    // Service worker
    'service-worker': options.enableServiceWorker ? 'enabled' : 'disabled',
    
    // Image optimization
    'image-optimization': options.optimizeImages ? 'enabled' : 'disabled',
    'supported-formats': options.imageFormats?.join(',') || 'webp,avif,jpeg,png',
    
    // Critical resource hints
    'critical-resources': 'fonts,css,javascript',
    
    // Performance monitoring
    'performance-monitoring': 'enabled',
    'metrics-endpoint': '/api/metrics',
    
    // Security headers for performance
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'x-xss-protection': '1; mode=block',
    'referrer-policy': 'strict-origin-when-cross-origin',
    
    // Compression
    'content-encoding': 'gzip, br',
    'accept-encoding': 'gzip, deflate, br',
  };

  return tags;
}

/**
 * Generate critical resource preload links
 */
export function generatePreloadLinks(criticalResources: string[] = []) {
  const defaultResources = [
    // Critical CSS
    { href: '/styles/critical.css', as: 'style' },
    
    // Critical fonts
    { 
      href: '/fonts/inter-var.woff2', 
      as: 'font', 
      type: 'font/woff2',
      crossOrigin: 'anonymous'
    },
    
    // Hero images (will be dynamically set)
    { href: '/images/hero-placeholder.webp', as: 'image' },
    
    // Critical JavaScript
    { href: '/scripts/critical.js', as: 'script' },
  ];

  const allResources = [
    ...defaultResources,
    ...criticalResources.map(href => ({ href, as: 'fetch' }))
  ];

  return allResources.map(resource => ({
    rel: 'preload',
    href: resource.href,
    as: resource.as,
    type: resource.type,
    crossOrigin: resource.crossOrigin,
  }));
}

/**
 * Generate prefetch links for next likely navigation
 */
export function generatePrefetchLinks(portfolioSlug?: string) {
  const prefetchResources = [
    // Common navigation targets
    '/dashboard',
    '/templates',
    '/examples',
    
    // Portfolio-specific resources
    ...(portfolioSlug ? [
      `/mypage/${portfolioSlug}`,
      `/dashboard/portfolios/${portfolioSlug}/edit`,
      `/dashboard/portfolios/${portfolioSlug}/preview`,
    ] : []),
    
    // Common API endpoints
    '/api/auth/session',
    '/api/portfolios',
  ];

  return prefetchResources.map(href => ({
    rel: 'prefetch',
    href,
  }));
}

/**
 * Generate optimized image srcset for different screen sizes
 */
export function generateOptimizedImageSrcSet(
  baseSrc: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1600, 1920]
): string {
  return widths
    .map(width => {
      const optimizedSrc = optimizeImageUrl(baseSrc, { width, quality: 85 });
      return `${optimizedSrc} ${width}w`;
    })
    .join(', ');
}

/**
 * Optimize image URL with query parameters
 */
export function optimizeImageUrl(
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  } = {}
): string {
  if (!src.startsWith('/') && !src.startsWith('http')) {
    return src;
  }

  const url = new URL(src, APP_CONFIG.url);
  
  if (options.width) url.searchParams.set('w', options.width.toString());
  if (options.height) url.searchParams.set('h', options.height.toString());
  if (options.quality) url.searchParams.set('q', options.quality.toString());
  if (options.format) url.searchParams.set('f', options.format);
  if (options.fit) url.searchParams.set('fit', options.fit);

  return url.toString();
}

/**
 * Generate critical CSS for above-the-fold content
 */
export function generateCriticalCSS(): string {
  return `
    /* Critical CSS for above-the-fold content */
    *,::before,::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}
    ::before,::after{--tw-content:''}
    html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal}
    body{margin:0;line-height:inherit}
    .font-sans{font-family:var(--font-sans),ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif}
    .antialiased{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
    .min-h-screen{min-height:100vh}
    .bg-white{background-color:rgb(255 255 255)}
    .opacity-0{opacity:0}
    .opacity-100{opacity:1}
    .transition-opacity{transition-property:opacity;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms}
    .duration-300{transition-duration:300ms}
    
    /* Hero section critical styles */
    .hero-section{position:relative;min-height:50vh;display:flex;align-items:center;justify-content:center}
    .hero-content{max-width:1200px;margin:0 auto;padding:2rem}
    
    /* Navigation critical styles */
    .nav-header{position:fixed;top:0;left:0;right:0;z-index:50;background:rgba(255,255,255,0.95);backdrop-filter:blur(10px)}
    
    /* Loading states */
    .loading-placeholder{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:loading 1.5s infinite}
    @keyframes loading{0%{background-position:200% 0}100%{background-position:-200% 0}}
  `;
}

/**
 * Analyze page performance and generate optimization recommendations
 */
export function analyzePagePerformance(metrics: PerformanceMetrics) {
  const recommendations: string[] = [];
  const score = calculatePerformanceScore(metrics);

  // LCP (Largest Contentful Paint) - should be < 2.5s
  if (metrics.lcp && metrics.lcp > 2500) {
    recommendations.push('Optimize Largest Contentful Paint by compressing images and using next-gen formats');
  }

  // FID (First Input Delay) - should be < 100ms
  if (metrics.fid && metrics.fid > 100) {
    recommendations.push('Reduce First Input Delay by optimizing JavaScript execution and reducing main thread work');
  }

  // CLS (Cumulative Layout Shift) - should be < 0.1
  if (metrics.cls && metrics.cls > 0.1) {
    recommendations.push('Minimize Cumulative Layout Shift by setting explicit dimensions for images and ads');
  }

  // FCP (First Contentful Paint) - should be < 1.8s
  if (metrics.fcp && metrics.fcp > 1800) {
    recommendations.push('Improve First Contentful Paint by reducing server response times and eliminating render-blocking resources');
  }

  // TTFB (Time to First Byte) - should be < 600ms
  if (metrics.ttfb && metrics.ttfb > 600) {
    recommendations.push('Optimize Time to First Byte by improving server performance and using CDN');
  }

  return {
    score,
    grade: getPerformanceGrade(score),
    recommendations,
    metrics,
  };
}

/**
 * Calculate performance score based on Core Web Vitals
 */
function calculatePerformanceScore(metrics: PerformanceMetrics): number {
  let score = 100;

  // LCP scoring (25% weight)
  if (metrics.lcp) {
    if (metrics.lcp > 4000) score -= 25;
    else if (metrics.lcp > 2500) score -= 15;
    else if (metrics.lcp > 1500) score -= 5;
  }

  // FID scoring (25% weight)
  if (metrics.fid) {
    if (metrics.fid > 300) score -= 25;
    else if (metrics.fid > 100) score -= 15;
    else if (metrics.fid > 50) score -= 5;
  }

  // CLS scoring (25% weight)
  if (metrics.cls) {
    if (metrics.cls > 0.25) score -= 25;
    else if (metrics.cls > 0.1) score -= 15;
    else if (metrics.cls > 0.05) score -= 5;
  }

  // FCP scoring (15% weight)
  if (metrics.fcp) {
    if (metrics.fcp > 3000) score -= 15;
    else if (metrics.fcp > 1800) score -= 10;
    else if (metrics.fcp > 1000) score -= 3;
  }

  // TTFB scoring (10% weight)
  if (metrics.ttfb) {
    if (metrics.ttfb > 1000) score -= 10;
    else if (metrics.ttfb > 600) score -= 6;
    else if (metrics.ttfb > 300) score -= 2;
  }

  return Math.max(0, score);
}

/**
 * Get performance grade based on score
 */
function getPerformanceGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Get cache control value based on strategy
 */
function getCacheControlValue(strategy: string = 'moderate'): string {
  switch (strategy) {
    case 'aggressive':
      return 'public, max-age=31536000, immutable';
    case 'conservative':
      return 'public, max-age=300, must-revalidate';
    case 'moderate':
    default:
      return 'public, max-age=3600, stale-while-revalidate=86400';
  }
}

/**
 * Generate Web Vitals monitoring script
 */
export function generateWebVitalsScript(): string {
  return `
    (function() {
      function sendToAnalytics(metric) {
        // Send to your analytics endpoint
        fetch('/api/metrics', {
          method: 'POST',
          body: JSON.stringify(metric),
          headers: {'Content-Type': 'application/json'},
          keepalive: true
        }).catch(console.error);
      }

      // Dynamically import web-vitals
      import('https://unpkg.com/web-vitals@3/dist/web-vitals.attribution.js')
        .then(({onCLS, onFID, onFCP, onLCP, onTTFB}) => {
          onCLS(sendToAnalytics);
          onFID(sendToAnalytics);
          onFCP(sendToAnalytics);
          onLCP(sendToAnalytics);
          onTTFB(sendToAnalytics);
        })
        .catch(err => console.error('Failed to load web-vitals:', err));
    })();
  `;
}

/**
 * Generate comprehensive performance optimization configuration
 */
export function generatePerformanceConfig(options: SEOPerformanceOptions = {}) {
  return {
    metaTags: generatePerformanceMetaTags(options),
    preloadLinks: generatePreloadLinks(),
    prefetchLinks: generatePrefetchLinks(),
    criticalCSS: options.enableCriticalCSS ? generateCriticalCSS() : null,
    webVitalsScript: generateWebVitalsScript(),
    imageOptimization: {
      enabled: options.optimizeImages ?? true,
      formats: options.imageFormats || ['webp', 'avif', 'jpeg'],
      maxSize: options.maxImageSize || 500000, // 500KB
      quality: 85,
    },
    caching: {
      strategy: options.cacheStrategy || 'moderate',
      staticAssets: '31536000', // 1 year
      dynamicContent: '3600', // 1 hour
      apiResponses: '300', // 5 minutes
    },
    serviceWorker: {
      enabled: options.enableServiceWorker ?? true,
      cachingStrategy: 'networkFirst',
      offlineSupport: true,
    },
  };
}