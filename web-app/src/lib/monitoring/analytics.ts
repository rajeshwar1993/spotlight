import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { config } from '../config/env-validation';

/**
 * Analytics configuration
 */
export const analyticsConfig = {
  vercel: {
    enabled: config.isProduction && !!config.monitoring.vercelAnalytics.id,
    id: config.monitoring.vercelAnalytics.id,
  },
  googleAnalytics: {
    enabled: config.isProduction && !!config.monitoring.googleAnalytics.id,
    id: config.monitoring.googleAnalytics.id,
  },
  performance: {
    enabled: config.performance.monitoring,
    sampleRate: config.isProduction ? 0.1 : 1.0,
  },
};

/**
 * Web Vitals monitoring
 */
export function reportWebVitals(metric: any) {
  if (!config.performance.monitoring) return;

  const { name, value, id, label } = metric;
  
  // Report to Vercel Analytics
  if (analyticsConfig.vercel.enabled) {
    // Vercel Analytics automatically captures Web Vitals
    console.log(`[Web Vitals] ${name}: ${value}`);
  }

  // Report to Google Analytics
  if (analyticsConfig.googleAnalytics.enabled && typeof gtag !== 'undefined') {
    gtag('event', name, {
      event_category: label === 'web-vital' ? 'Web Vitals' : 'Performance',
      event_label: id,
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      non_interaction: true,
    });
  }

  // Report to Sentry
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.metrics.gauge(`web_vitals.${name}`, value, {
      tags: {
        label,
        id,
      },
    });
  }

  // Report to custom analytics endpoint
  if (config.isProduction) {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        value,
        id,
        label,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    }).catch((error) => {
      console.error('Failed to report Web Vitals:', error);
    });
  }
}

/**
 * Custom analytics events
 */
export class AnalyticsTracker {
  /**
   * Track page views
   */
  static pageView(url: string, title?: string) {
    if (!config.isProduction) return;

    // Google Analytics
    if (analyticsConfig.googleAnalytics.enabled && typeof gtag !== 'undefined') {
      gtag('config', analyticsConfig.googleAnalytics.id!, {
        page_title: title,
        page_location: url,
      });
    }

    // Custom analytics
    this.track('page_view', {
      url,
      title,
      timestamp: Date.now(),
    });
  }

  /**
   * Track user events
   */
  static event(eventName: string, properties?: Record<string, any>) {
    if (!config.isProduction) return;

    // Google Analytics
    if (analyticsConfig.googleAnalytics.enabled && typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        ...properties,
        event_category: properties?.category || 'User Interaction',
      });
    }

    // Custom analytics
    this.track(eventName, {
      ...properties,
      timestamp: Date.now(),
    });
  }

  /**
   * Track user actions
   */
  static action(action: string, target?: string, properties?: Record<string, any>) {
    this.event('user_action', {
      action,
      target,
      ...properties,
      category: 'User Action',
    });
  }

  /**
   * Track errors
   */
  static error(error: Error, context?: Record<string, any>) {
    this.event('error', {
      error_message: error.message,
      error_stack: error.stack,
      ...context,
      category: 'Error',
    });
  }

  /**
   * Track performance metrics
   */
  static performance(metric: string, value: number, properties?: Record<string, any>) {
    this.event('performance', {
      metric,
      value,
      ...properties,
      category: 'Performance',
    });
  }

  /**
   * Track business metrics
   */
  static business(metric: string, value: number, properties?: Record<string, any>) {
    this.event('business_metric', {
      metric,
      value,
      ...properties,
      category: 'Business',
    });
  }

  /**
   * Track user journey
   */
  static journey(step: string, properties?: Record<string, any>) {
    this.event('user_journey', {
      step,
      ...properties,
      category: 'User Journey',
    });
  }

  /**
   * Track feature usage
   */
  static feature(feature: string, action: string, properties?: Record<string, any>) {
    this.event('feature_usage', {
      feature,
      action,
      ...properties,
      category: 'Feature Usage',
    });
  }

  /**
   * Track conversion events
   */
  static conversion(event: string, value?: number, properties?: Record<string, any>) {
    this.event('conversion', {
      conversion_event: event,
      conversion_value: value,
      ...properties,
      category: 'Conversion',
    });
  }

  /**
   * Generic track method
   */
  private static track(eventName: string, properties: Record<string, any>) {
    if (!config.isProduction) {
      console.log(`[Analytics] ${eventName}:`, properties);
      return;
    }

    // Send to custom analytics endpoint
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: eventName,
        properties,
        timestamp: Date.now(),
        session_id: this.getSessionId(),
        user_id: this.getUserId(),
      }),
    }).catch((error) => {
      console.error('Failed to track event:', error);
    });
  }

  /**
   * Get or create session ID
   */
  private static getSessionId(): string {
    if (typeof window === 'undefined') return '';
    
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Get user ID if available
   */
  private static getUserId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('user_id');
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceTracker {
  private static observers: Map<string, PerformanceObserver> = new Map();

  /**
   * Start performance monitoring
   */
  static init() {
    if (typeof window === 'undefined' || !config.performance.monitoring) return;

    // Monitor Long Tasks
    this.observeLongTasks();
    
    // Monitor Layout Shifts
    this.observeLayoutShifts();
    
    // Monitor Largest Contentful Paint
    this.observeLCP();
    
    // Monitor First Input Delay
    this.observeFID();
    
    // Monitor Resource Loading
    this.observeResourceTiming();
  }

  /**
   * Monitor long tasks (>50ms)
   */
  private static observeLongTasks() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) {
            AnalyticsTracker.performance('long_task', entry.duration, {
              name: entry.name,
              start_time: entry.startTime,
            });
          }
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
      this.observers.set('longtask', observer);
    }
  }

  /**
   * Monitor layout shifts
   */
  private static observeLayoutShifts() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (entry.value > 0.1) {
            AnalyticsTracker.performance('layout_shift', entry.value, {
              sources: entry.sources?.map((source: any) => source.node) || [],
            });
          }
        });
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('layout-shift', observer);
    }
  }

  /**
   * Monitor Largest Contentful Paint
   */
  private static observeLCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        AnalyticsTracker.performance('lcp', lastEntry.startTime, {
          element: lastEntry.element?.tagName || 'unknown',
          url: lastEntry.url || window.location.href,
        });
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('largest-contentful-paint', observer);
    }
  }

  /**
   * Monitor First Input Delay
   */
  private static observeFID() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          AnalyticsTracker.performance('fid', entry.processingStart - entry.startTime, {
            event_type: entry.name,
            start_time: entry.startTime,
          });
        });
      });

      observer.observe({ entryTypes: ['first-input'] });
      this.observers.set('first-input', observer);
    }
  }

  /**
   * Monitor resource loading
   */
  private static observeResourceTiming() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          // Only track slow resources
          if (entry.duration > 1000) {
            AnalyticsTracker.performance('slow_resource', entry.duration, {
              resource: entry.name,
              type: entry.initiatorType,
              size: entry.transferSize || 0,
            });
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', observer);
    }
  }

  /**
   * Stop performance monitoring
   */
  static stop() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
  }
}

/**
 * Analytics components for React
 */
export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      {analyticsConfig.vercel.enabled && <Analytics />}
      {analyticsConfig.vercel.enabled && <SpeedInsights />}
    </>
  );
};

/**
 * Initialize analytics
 */
export function initializeAnalytics() {
  if (typeof window === 'undefined') return;

  // Initialize performance tracking
  PerformanceTracker.init();

  // Initialize Google Analytics
  if (analyticsConfig.googleAnalytics.enabled) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsConfig.googleAnalytics.id}`;
    document.head.appendChild(script);

    script.onload = () => {
      window.gtag = function() {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(arguments);
      };
      
      window.gtag('js', new Date());
      window.gtag('config', analyticsConfig.googleAnalytics.id!);
    };
  }

  console.log('✅ Analytics initialized');
}

export default {
  config: analyticsConfig,
  tracker: AnalyticsTracker,
  performance: PerformanceTracker,
  reportWebVitals,
  init: initializeAnalytics,
  Provider: AnalyticsProvider,
};