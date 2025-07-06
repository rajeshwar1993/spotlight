/**
 * Image performance monitoring and metrics collection
 */

export interface ImageMetrics {
  loadTime: number;
  fileSize: number;
  renderTime: number;
  firstByte: number;
  format: string;
  dimensions: { width: number; height: number };
  cacheHit: boolean;
  compressionRatio?: number;
}

export interface ImagePerformanceEntry {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
  initiatorType: string;
  transferSize: number;
  encodedBodySize: number;
  decodedBodySize: number;
  responseStart: number;
  responseEnd: number;
}

export interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
}

export class ImageMetricsCollector {
  private static instance: ImageMetricsCollector;
  private metrics: Map<string, ImageMetrics> = new Map();
  private performanceObserver: PerformanceObserver | null = null;
  private mutationObserver: MutationObserver | null = null;
  private isEnabled: boolean = false;

  private constructor() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.setupPerformanceObserver();
      this.setupMutationObserver();
      this.isEnabled = true;
    }
  }

  static getInstance(): ImageMetricsCollector {
    if (!ImageMetricsCollector.instance) {
      ImageMetricsCollector.instance = new ImageMetricsCollector();
    }
    return ImageMetricsCollector.instance;
  }

  /**
   * Setup performance observer for resource timing
   */
  private setupPerformanceObserver(): void {
    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.initiatorType === 'img' || entry.initiatorType === 'fetch') {
            this.processPerformanceEntry(entry as PerformanceResourceTiming);
          }
        });
      });

      this.performanceObserver.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }

  /**
   * Setup mutation observer for layout shift detection
   */
  private setupMutationObserver(): void {
    try {
      this.mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
            const target = mutation.target as HTMLImageElement;
            if (target.tagName === 'IMG') {
              this.trackImageLoad(target);
            }
          }
        });
      });

      this.mutationObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['src'],
        subtree: true,
      });
    } catch (error) {
      console.warn('Mutation Observer not supported:', error);
    }
  }

  /**
   * Process performance entry for image resources
   */
  private processPerformanceEntry(entry: PerformanceResourceTiming): void {
    const url = entry.name;
    const isImageResource = this.isImageUrl(url);
    
    if (!isImageResource) return;

    const metrics: ImageMetrics = {
      loadTime: entry.duration,
      fileSize: entry.transferSize || entry.encodedBodySize,
      renderTime: entry.responseEnd - entry.responseStart,
      firstByte: entry.responseStart - entry.requestStart,
      format: this.extractImageFormat(url),
      dimensions: { width: 0, height: 0 }, // Will be updated when image loads
      cacheHit: entry.transferSize === 0 && entry.encodedBodySize > 0,
      compressionRatio: entry.encodedBodySize > 0 ? entry.decodedBodySize / entry.encodedBodySize : undefined,
    };

    this.metrics.set(url, metrics);
  }

  /**
   * Track individual image loading
   */
  trackImageLoad(img: HTMLImageElement): void {
    if (!this.isEnabled) return;

    const url = img.src;
    const startTime = performance.now();

    const onLoad = () => {
      const loadTime = performance.now() - startTime;
      
      const existingMetrics = this.metrics.get(url);
      const updatedMetrics: ImageMetrics = {
        ...existingMetrics,
        loadTime: existingMetrics?.loadTime || loadTime,
        dimensions: {
          width: img.naturalWidth,
          height: img.naturalHeight,
        },
        format: this.extractImageFormat(url),
        fileSize: existingMetrics?.fileSize || 0,
        renderTime: existingMetrics?.renderTime || 0,
        firstByte: existingMetrics?.firstByte || 0,
        cacheHit: existingMetrics?.cacheHit || false,
      };

      this.metrics.set(url, updatedMetrics);
      
      // Clean up listeners
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
    };

    const onError = () => {
      console.warn(`Failed to load image: ${url}`);
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
    };

    img.addEventListener('load', onLoad);
    img.addEventListener('error', onError);
  }

  /**
   * Check if URL is an image resource
   */
  private isImageUrl(url: string): boolean {
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|avif|svg)($|\?)/i;
    const isSupabaseImage = url.includes('/storage/v1/render/image/');
    return imageExtensions.test(url) || isSupabaseImage;
  }

  /**
   * Extract image format from URL
   */
  private extractImageFormat(url: string): string {
    // Check for format parameter in URL
    const urlParams = new URLSearchParams(url.split('?')[1]);
    const formatParam = urlParams.get('format');
    if (formatParam) return formatParam;

    // Extract from file extension
    const match = url.match(/\.([a-z0-9]+)($|\?)/i);
    return match ? match[1].toLowerCase() : 'unknown';
  }

  /**
   * Get metrics for a specific image
   */
  getImageMetrics(url: string): ImageMetrics | undefined {
    return this.metrics.get(url);
  }

  /**
   * Get all collected metrics
   */
  getAllMetrics(): Map<string, ImageMetrics> {
    return new Map(this.metrics);
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    totalImages: number;
    averageLoadTime: number;
    totalFileSize: number;
    cacheHitRate: number;
    formatDistribution: Record<string, number>;
  } {
    const metrics = Array.from(this.metrics.values());
    
    const totalImages = metrics.length;
    const averageLoadTime = metrics.reduce((sum, m) => sum + m.loadTime, 0) / totalImages || 0;
    const totalFileSize = metrics.reduce((sum, m) => sum + m.fileSize, 0);
    const cacheHits = metrics.filter(m => m.cacheHit).length;
    const cacheHitRate = totalImages > 0 ? cacheHits / totalImages : 0;
    
    const formatDistribution: Record<string, number> = {};
    metrics.forEach(m => {
      formatDistribution[m.format] = (formatDistribution[m.format] || 0) + 1;
    });

    return {
      totalImages,
      averageLoadTime,
      totalFileSize,
      cacheHitRate,
      formatDistribution,
    };
  }

  /**
   * Measure Core Web Vitals
   */
  measureCoreWebVitals(): Promise<Partial<CoreWebVitals>> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
        resolve({});
        return;
      }

      const vitals: Partial<CoreWebVitals> = {};
      let measurementsCompleted = 0;
      const totalMeasurements = 4; // LCP, FID, CLS, FCP

      const completeMeasurement = () => {
        measurementsCompleted++;
        if (measurementsCompleted >= totalMeasurements) {
          resolve(vitals);
        }
      };

      // Measure LCP
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          if (entries.length > 0) {
            vitals.lcp = entries[entries.length - 1].startTime;
          }
          completeMeasurement();
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.warn('LCP measurement not supported');
        completeMeasurement();
      }

      // Measure FID
      try {
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          if (entries.length > 0) {
            vitals.fid = (entries[0] as any).processingStart - entries[0].startTime;
          }
          completeMeasurement();
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (error) {
        console.warn('FID measurement not supported');
        completeMeasurement();
      }

      // Measure CLS
      try {
        let clsScore = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          entryList.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsScore += entry.value;
            }
          });
          vitals.cls = clsScore;
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        
        // Complete CLS measurement after 5 seconds
        setTimeout(() => {
          vitals.cls = clsScore;
          completeMeasurement();
        }, 5000);
      } catch (error) {
        console.warn('CLS measurement not supported');
        completeMeasurement();
      }

      // Measure FCP
      try {
        const fcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          if (entries.length > 0) {
            vitals.fcp = entries[0].startTime;
          }
          completeMeasurement();
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
      } catch (error) {
        console.warn('FCP measurement not supported');
        completeMeasurement();
      }

      // Fallback timeout
      setTimeout(() => {
        resolve(vitals);
      }, 10000);
    });
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics(): string {
    const summary = this.getPerformanceSummary();
    const allMetrics = Object.fromEntries(this.metrics);
    
    return JSON.stringify({
      summary,
      metrics: allMetrics,
      timestamp: new Date().toISOString(),
    }, null, 2);
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    const summary = this.getPerformanceSummary();
    
    // Check average load time
    if (summary.averageLoadTime > 2000) {
      recommendations.push('Consider enabling image compression or using modern formats (WebP/AVIF)');
    }
    
    // Check cache hit rate
    if (summary.cacheHitRate < 0.8) {
      recommendations.push('Improve cache headers for better cache hit rates');
    }
    
    // Check format distribution
    const modernFormats = ['webp', 'avif'];
    const totalModern = modernFormats.reduce((sum, format) => sum + (summary.formatDistribution[format] || 0), 0);
    if (totalModern / summary.totalImages < 0.5) {
      recommendations.push('Consider using more modern image formats for better compression');
    }
    
    // Check total file size
    if (summary.totalFileSize > 5 * 1024 * 1024) { // 5MB
      recommendations.push('Consider implementing lazy loading and image optimization');
    }
    
    return recommendations;
  }

  /**
   * Cleanup observers
   */
  destroy(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    this.metrics.clear();
  }
}

/**
 * Hook for using image metrics in React components
 */
export function useImageMetrics() {
  const collector = ImageMetricsCollector.getInstance();
  
  return {
    trackImage: (img: HTMLImageElement) => collector.trackImageLoad(img),
    getMetrics: (url: string) => collector.getImageMetrics(url),
    getSummary: () => collector.getPerformanceSummary(),
    getRecommendations: () => collector.getOptimizationRecommendations(),
    measureCoreWebVitals: () => collector.measureCoreWebVitals(),
    exportMetrics: () => collector.exportMetrics(),
  };
}

export default ImageMetricsCollector;