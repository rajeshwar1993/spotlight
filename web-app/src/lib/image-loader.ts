import { ImageLoaderProps } from 'next/image';
import { config } from './config/env-validation';

/**
 * Custom image loader for production CDN optimization
 */
export default function customImageLoader({ src, width, quality }: ImageLoaderProps) {
  // Handle external URLs
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return optimizeExternalImage(src, width, quality);
  }

  // Handle local images
  return optimizeLocalImage(src, width, quality);
}

/**
 * Optimize external images through CDN
 */
function optimizeExternalImage(src: string, width: number, quality?: number) {
  // Check if it's a Supabase storage URL
  if (src.includes('.supabase.co/storage/')) {
    return optimizeSupabaseImage(src, width, quality);
  }

  // Check if it's from Unsplash
  if (src.includes('images.unsplash.com')) {
    return optimizeUnsplashImage(src, width, quality);
  }

  // For other external images, use a CDN if available
  if (config.cloudinary.cloudName) {
    return optimizeWithCloudinary(src, width, quality);
  }

  // Fallback to original URL
  return src;
}

/**
 * Optimize Supabase storage images
 */
function optimizeSupabaseImage(src: string, width: number, quality?: number) {
  const url = new URL(src);
  const params = new URLSearchParams();

  // Add width parameter
  params.set('width', width.toString());

  // Add quality parameter
  if (quality) {
    params.set('quality', quality.toString());
  }

  // Add format parameter for modern browsers
  params.set('format', 'webp');

  // Add resize parameter
  params.set('resize', 'contain');

  // Return optimized URL
  return `${url.origin}${url.pathname}?${params.toString()}`;
}

/**
 * Optimize Unsplash images
 */
function optimizeUnsplashImage(src: string, width: number, quality?: number) {
  const url = new URL(src);
  const params = new URLSearchParams(url.search);

  // Update width parameter
  params.set('w', width.toString());

  // Update quality parameter
  if (quality) {
    params.set('q', quality.toString());
  }

  // Optimize format
  params.set('fm', 'webp');
  params.set('fit', 'crop');
  params.set('crop', 'faces');

  // Return optimized URL
  return `${url.origin}${url.pathname}?${params.toString()}`;
}

/**
 * Optimize images with Cloudinary CDN
 */
function optimizeWithCloudinary(src: string, width: number, quality?: number) {
  const { cloudName } = config.cloudinary;
  
  if (!cloudName) {
    return src;
  }

  const transformations = [
    `w_${width}`,
    `f_auto`, // Auto format
    `q_auto`, // Auto quality
  ];

  if (quality) {
    transformations.push(`q_${quality}`);
  }

  // Add responsive transformations
  transformations.push(
    'c_fill', // Fill crop mode
    'g_auto', // Auto gravity
    'dpr_auto' // Auto DPR
  );

  const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/image/fetch/${transformations.join(',')}/${encodeURIComponent(src)}`;
  
  return cloudinaryUrl;
}

/**
 * Optimize local images
 */
function optimizeLocalImage(src: string, width: number, quality?: number) {
  const params = new URLSearchParams();
  
  params.set('url', src);
  params.set('w', width.toString());
  
  if (quality) {
    params.set('q', quality.toString());
  }

  return `/_next/image?${params.toString()}`;
}

/**
 * Generate placeholder for images
 */
export function generateImagePlaceholder(width: number, height: number): string {
  // Create a simple SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="Arial, sans-serif" font-size="16" fill="#9ca3af">
        Loading...
      </text>
    </svg>
  `;

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Generate blur placeholder for images
 */
export function generateBlurPlaceholder(width: number, height: number): string {
  // Create a simple blurred SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="blur">
          <feGaussianBlur stdDeviation="20"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="#e5e7eb" filter="url(#blur)"/>
    </svg>
  `;

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Get responsive image sizes
 */
export function getResponsiveImageSizes(breakpoints?: {
  mobile?: number;
  tablet?: number;
  desktop?: number;
}) {
  const defaultBreakpoints = {
    mobile: 768,
    tablet: 1024,
    desktop: 1280,
  };

  const bp = { ...defaultBreakpoints, ...breakpoints };

  return `(max-width: ${bp.mobile}px) 100vw, (max-width: ${bp.tablet}px) 50vw, 33vw`;
}

/**
 * Optimize image for different devices
 */
export function optimizeForDevice(src: string, device: 'mobile' | 'tablet' | 'desktop') {
  const deviceWidths = {
    mobile: 768,
    tablet: 1024,
    desktop: 1920,
  };

  const deviceQualities = {
    mobile: 75,
    tablet: 80,
    desktop: 85,
  };

  return customImageLoader({
    src,
    width: deviceWidths[device],
    quality: deviceQualities[device],
  });
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, width: number, quality?: number) {
  const optimizedSrc = customImageLoader({ src, width, quality });
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = optimizedSrc;
  
  document.head.appendChild(link);
}

/**
 * Lazy load images with intersection observer
 */
export function lazyLoadImage(
  img: HTMLImageElement,
  src: string,
  options?: IntersectionObserverInit
) {
  const defaultOptions = {
    rootMargin: '50px',
    threshold: 0.1,
  };

  const observerOptions = { ...defaultOptions, ...options };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const image = entry.target as HTMLImageElement;
        image.src = src;
        image.classList.remove('lazy');
        observer.unobserve(image);
      }
    });
  }, observerOptions);

  observer.observe(img);
}

/**
 * Image optimization utilities
 */
export const imageUtils = {
  loader: customImageLoader,
  generatePlaceholder: generateImagePlaceholder,
  generateBlurPlaceholder: generateBlurPlaceholder,
  getResponsiveImageSizes,
  optimizeForDevice,
  preloadImage,
  lazyLoadImage,
};

export default customImageLoader;