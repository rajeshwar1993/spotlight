/**
 * Performance monitoring and Web Vitals utilities
 * Provides comprehensive performance tracking and optimization features
 */

import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export interface PerformanceMetric {
  name: string;
  value: number;
  id: string;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType: string;
}

export interface BundleMetrics {
  size: number;
  gzipSize: number;
  chunks: string[];
  assets: string[];
}

/**
 * Web Vitals thresholds based on Google's recommendations
 */
export const PERFORMANCE_THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
} as const;

/**
 * Performance monitoring class
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeWebVitals();
    this.initializeResourceTiming();
    this.initializeNavigationTiming();
  }

  /**
   * Initialize Web Vitals collection
   */
  private initializeWebVitals() {
    const handleMetric = (metric: any) => {
      const performanceMetric: PerformanceMetric = {
        name: metric.name,
        value: metric.value,
        id: metric.id,
        delta: metric.delta,
        rating: this.getRating(metric.name, metric.value),
        navigationType: metric.navigationType,
      };

      this.metrics.push(performanceMetric);
      this.reportMetric(performanceMetric);
    };

    // Collect Core Web Vitals
    getCLS(handleMetric);
    getFID(handleMetric);
    getFCP(handleMetric);
    getLCP(handleMetric);
    getTTFB(handleMetric);
  }

  /**
   * Initialize resource timing monitoring
   */
  private initializeResourceTiming() {
    if (typeof window === 'undefined') return;

    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          this.analyzeResourceTiming(entry as PerformanceResourceTiming);
        }
      }
    });

    resourceObserver.observe({ entryTypes: ['resource'] });
    this.observers.push(resourceObserver);
  }

  /**
   * Initialize navigation timing monitoring
   */
  private initializeNavigationTiming() {
    if (typeof window === 'undefined') return;

    const navigationObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          this.analyzeNavigationTiming(entry as PerformanceNavigationTiming);
        }
      }
    });

    navigationObserver.observe({ entryTypes: ['navigation'] });
    this.observers.push(navigationObserver);
  }

  /**
   * Analyze resource timing entry
   */
  private analyzeResourceTiming(entry: PerformanceResourceTiming) {
    const duration = entry.responseEnd - entry.startTime;
    const size = entry.transferSize || 0;

    // Flag slow resources
    if (duration > 1000) {
      console.warn(`Slow resource detected: ${entry.name} (${duration}ms)`);
    }

    // Flag large resources
    if (size > 100000) {
      console.warn(`Large resource detected: ${entry.name} (${size} bytes)`);
    }
  }

  /**
   * Analyze navigation timing entry
   */
  private analyzeNavigationTiming(entry: PerformanceNavigationTiming) {
    const domContentLoaded = entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart;
    const loadComplete = entry.loadEventEnd - entry.loadEventStart;

    console.log('Navigation timing:', {
      domContentLoaded,
      loadComplete,
      redirectCount: entry.redirectCount,
      type: entry.type,
    });
  }

  /**
   * Get performance rating based on thresholds
   */
  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const threshold = PERFORMANCE_THRESHOLDS[name as keyof typeof PERFORMANCE_THRESHOLDS];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Report metric to analytics or monitoring service
   */
  private reportMetric(metric: PerformanceMetric) {
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${metric.name}: ${metric.value}ms (${metric.rating})`);
    }

    // In production, send to analytics
    if (process.env.NODE_ENV === 'production') {
      // Send to your analytics service
      // Example: analytics.track('performance-metric', metric);
    }
  }

  /**
   * Get all collected metrics
   */
  getMetrics(): PerformanceMetric[] {
    return this.metrics;
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary() {
    const summary = {
      total: this.metrics.length,
      good: this.metrics.filter(m => m.rating === 'good').length,
      needsImprovement: this.metrics.filter(m => m.rating === 'needs-improvement').length,
      poor: this.metrics.filter(m => m.rating === 'poor').length,
    };

    return {
      ...summary,
      score: Math.round((summary.good / summary.total) * 100) || 0,
    };
  }

  /**
   * Cleanup observers
   */
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * Bundle size analyzer
 */
export class BundleAnalyzer {
  /**
   * Analyze bundle size from build stats
   */
  static analyzeBuildStats(stats: any): BundleMetrics {
    const assets = stats.assets || [];
    const chunks = stats.chunks || [];

    const totalSize = assets.reduce((sum: number, asset: any) => sum + asset.size, 0);
    const gzipSize = assets.reduce((sum: number, asset: any) => sum + (asset.gzipSize || 0), 0);

    return {
      size: totalSize,
      gzipSize,
      chunks: chunks.map((chunk: any) => chunk.name),
      assets: assets.map((asset: any) => asset.name),
    };
  }

  /**
   * Get recommendations for bundle optimization
   */
  static getOptimizationRecommendations(metrics: BundleMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.size > 1000000) {
      recommendations.push('Consider code splitting to reduce bundle size');
    }

    if (metrics.gzipSize > 500000) {
      recommendations.push('Enable gzip compression on server');
    }

    if (metrics.chunks.length < 3) {
      recommendations.push('Implement route-based code splitting');
    }

    return recommendations;
  }
}

/**
 * Performance budget checker
 */
export class PerformanceBudget {
  private budgets = {
    // Bundle sizes in bytes
    totalBundleSize: 1000000, // 1MB
    gzipBundleSize: 500000,   // 500KB
    chunkSize: 250000,        // 250KB per chunk
    
    // Performance timings in ms
    firstContentfulPaint: 1800,
    largestContentfulPaint: 2500,
    cumulativeLayoutShift: 0.1,
    firstInputDelay: 100,
    timeToFirstByte: 800,
  };

  /**
   * Check if metrics are within budget
   */
  checkBudget(metrics: PerformanceMetric[]): { passed: boolean; violations: string[] } {
    const violations: string[] = [];

    metrics.forEach(metric => {
      const budget = this.budgets[metric.name as keyof typeof this.budgets];
      if (budget && metric.value > budget) {
        violations.push(`${metric.name}: ${metric.value} exceeds budget of ${budget}`);
      }
    });

    return {
      passed: violations.length === 0,
      violations,
    };
  }

  /**
   * Update performance budgets
   */
  updateBudgets(newBudgets: Partial<typeof this.budgets>) {
    this.budgets = { ...this.budgets, ...newBudgets };
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = typeof window !== 'undefined' ? new PerformanceMonitor() : null;

/**
 * Utility functions for performance optimization
 */
export const performanceUtils = {
  /**
   * Preload critical resources
   */
  preloadResource: (href: string, as: string) => {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  },

  /**
   * Lazy load non-critical resources
   */
  lazyLoadResource: (href: string, as: string) => {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  },

  /**
   * Measure function execution time
   */
  measureExecutionTime: <T>(fn: () => T, label?: string): T => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    if (label) {
      console.log(`${label}: ${end - start}ms`);
    }
    
    return result;
  },

  /**
   * Debounce function for performance optimization
   */
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate?: boolean
  ): T => {
    let timeout: NodeJS.Timeout | undefined;
    
    return ((...args: Parameters<T>) => {
      const later = () => {
        timeout = undefined;
        if (!immediate) func(...args);
      };
      
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      
      if (callNow) func(...args);
    }) as T;
  },

  /**
   * Throttle function for performance optimization
   */
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): T => {
    let inThrottle: boolean;
    
    return ((...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }) as T;
  },
};