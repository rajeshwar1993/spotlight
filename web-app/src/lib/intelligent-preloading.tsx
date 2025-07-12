/**
 * Intelligent preloading system for optimized user experience
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';

export interface PreloadStrategy {
  // Preload on hover
  hover?: boolean;
  // Preload on intersection
  intersection?: boolean;
  // Preload on idle
  idle?: boolean;
  // Preload immediately
  immediate?: boolean;
  // Preload based on user behavior
  predictive?: boolean;
}

export interface PreloadConfig {
  strategy: PreloadStrategy;
  priority: 'high' | 'medium' | 'low';
  timeout?: number;
  threshold?: number;
  delay?: number;
}

export interface NavigationPattern {
  from: string;
  to: string;
  count: number;
  probability: number;
}

export interface UserBehavior {
  sessionStart: number;
  visitedPages: string[];
  navigationPatterns: NavigationPattern[];
  timeOnPage: Record<string, number>;
  interactions: Array<{
    type: 'click' | 'hover' | 'scroll';
    target: string;
    timestamp: number;
  }>;
}

/**
 * Intelligent preloading class
 */
export class IntelligentPreloader {
  private preloadedResources = new Set<string>();
  private preloadQueue: Array<{
    url: string;
    config: PreloadConfig;
    importFn: () => Promise<any>;
  }> = [];
  private userBehavior: UserBehavior;
  private navigationPatterns: NavigationPattern[] = [];
  private isProcessing = false;

  constructor() {
    this.userBehavior = {
      sessionStart: Date.now(),
      visitedPages: [],
      navigationPatterns: [],
      timeOnPage: {},
      interactions: [],
    };

    this.loadStoredPatterns();
    this.setupEventListeners();
  }

  /**
   * Add resource to preload queue
   */
  addToQueue(
    url: string,
    importFn: () => Promise<any>,
    config: PreloadConfig
  ): void {
    if (this.preloadedResources.has(url)) return;

    this.preloadQueue.push({ url, importFn, config });
    this.sortQueue();
    this.processQueue();
  }

  /**
   * Preload based on navigation patterns
   */
  preloadByPattern(currentPath: string): void {
    const patterns = this.getPredictivePatterns(currentPath);
    
    patterns.forEach(pattern => {
      if (pattern.probability > 0.3) { // 30% threshold
        this.preloadRoute(pattern.to, {
          strategy: { predictive: true },
          priority: pattern.probability > 0.7 ? 'high' : 'medium',
        });
      }
    });
  }

  /**
   * Preload specific route
   */
  preloadRoute(path: string, config: PreloadConfig): void {
    const routeMap: Record<string, () => Promise<any>> = {
      '/': () => import('@/app/page'),
      '/create': () => import('@/app/create/page'),
      '/dashboard': () => import('@/app/dashboard/page'),
      '/dashboard/portfolios': () => import('@/app/dashboard/portfolios/page'),
      '/dashboard/portfolios/enhanced': () => import('@/app/dashboard/portfolios/enhanced/page'),
      '/examples': () => import('@/app/examples/page'),
      '/profile/dashboard': () => import('@/app/profile/dashboard/page'),
      '/profile/settings': () => import('@/app/profile/settings/page'),
      '/admin': () => import('@/app/admin/page'),
      '/auth/signin': () => import('@/app/auth/signin/page'),
      '/auth/signup': () => import('@/app/auth/signup/page'),
    };

    const importFn = routeMap[path];
    if (importFn) {
      this.addToQueue(path, importFn, config);
    }
  }

  /**
   * Preload component
   */
  preloadComponent(
    componentName: string,
    importFn: () => Promise<any>,
    config: PreloadConfig
  ): void {
    this.addToQueue(componentName, importFn, config);
  }

  /**
   * Get predictive patterns for current path
   */
  private getPredictivePatterns(currentPath: string): NavigationPattern[] {
    return this.navigationPatterns
      .filter(pattern => pattern.from === currentPath)
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 3); // Top 3 predictions
  }

  /**
   * Sort queue by priority
   */
  private sortQueue(): void {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    this.preloadQueue.sort((a, b) => {
      const priorityDiff = priorityOrder[a.config.priority] - priorityOrder[b.config.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Secondary sort by strategy
      const aScore = this.getStrategyScore(a.config.strategy);
      const bScore = this.getStrategyScore(b.config.strategy);
      return bScore - aScore;
    });
  }

  /**
   * Get strategy score for sorting
   */
  private getStrategyScore(strategy: PreloadStrategy): number {
    let score = 0;
    if (strategy.immediate) score += 4;
    if (strategy.predictive) score += 3;
    if (strategy.hover) score += 2;
    if (strategy.intersection) score += 1;
    return score;
  }

  /**
   * Process preload queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.preloadQueue.length === 0) return;

    this.isProcessing = true;

    // Process high priority items first
    const highPriorityItems = this.preloadQueue.filter(item => item.config.priority === 'high');
    const otherItems = this.preloadQueue.filter(item => item.config.priority !== 'high');

    await this.processItems(highPriorityItems);
    await this.processItems(otherItems);

    this.isProcessing = false;
  }

  /**
   * Process individual items
   */
  private async processItems(items: typeof this.preloadQueue): Promise<void> {
    for (const item of items) {
      if (this.preloadedResources.has(item.url)) continue;

      try {
        // Apply strategy-specific logic
        if (item.config.strategy.immediate) {
          await this.preloadResource(item);
        } else if (item.config.strategy.idle) {
          await this.preloadOnIdle(item);
        } else if (item.config.strategy.predictive) {
          await this.preloadPredictive(item);
        }
      } catch (error) {
        console.warn(`Failed to preload ${item.url}:`, error);
      }

      // Add delay between preloads to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  /**
   * Preload resource immediately
   */
  private async preloadResource(item: typeof this.preloadQueue[0]): Promise<void> {
    const startTime = performance.now();
    
    try {
      await item.importFn();
      this.preloadedResources.add(item.url);
      
      const endTime = performance.now();
      console.log(`Preloaded ${item.url} in ${endTime - startTime}ms`);
    } catch (error) {
      console.error(`Failed to preload ${item.url}:`, error);
    }
  }

  /**
   * Preload on idle
   */
  private async preloadOnIdle(item: typeof this.preloadQueue[0]): Promise<void> {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.preloadResource(item);
      });
    } else {
      setTimeout(() => {
        this.preloadResource(item);
      }, 100);
    }
  }

  /**
   * Preload based on prediction
   */
  private async preloadPredictive(item: typeof this.preloadQueue[0]): Promise<void> {
    // Only preload if user has been on current page for enough time
    const currentPath = window.location.pathname;
    const timeOnCurrentPage = Date.now() - (this.userBehavior.timeOnPage[currentPath] || Date.now());
    
    if (timeOnCurrentPage > 2000) { // 2 seconds threshold
      await this.preloadResource(item);
    }
  }

  /**
   * Setup event listeners for behavior tracking
   */
  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    // Track page visits
    window.addEventListener('popstate', () => {
      this.trackPageVisit(window.location.pathname);
    });

    // Track user interactions
    document.addEventListener('click', (e) => {
      this.trackInteraction('click', e.target);
    });

    document.addEventListener('mouseover', (e) => {
      this.trackInteraction('hover', e.target);
    });

    window.addEventListener('scroll', () => {
      this.trackInteraction('scroll', document.body);
    });

    // Save patterns before page unload
    window.addEventListener('beforeunload', () => {
      this.savePatterns();
    });
  }

  /**
   * Track page visit
   */
  private trackPageVisit(path: string): void {
    const previousPath = this.userBehavior.visitedPages[this.userBehavior.visitedPages.length - 1];
    
    if (previousPath && previousPath !== path) {
      this.updateNavigationPattern(previousPath, path);
    }

    this.userBehavior.visitedPages.push(path);
    this.userBehavior.timeOnPage[path] = Date.now();
  }

  /**
   * Track user interaction
   */
  private trackInteraction(type: 'click' | 'hover' | 'scroll', target: EventTarget | null): void {
    if (!target) return;

    const element = target as Element;
    const selector = this.getElementSelector(element);

    this.userBehavior.interactions.push({
      type,
      target: selector,
      timestamp: Date.now(),
    });
  }

  /**
   * Get element selector
   */
  private getElementSelector(element: Element): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  /**
   * Update navigation pattern
   */
  private updateNavigationPattern(from: string, to: string): void {
    const existingPattern = this.navigationPatterns.find(
      pattern => pattern.from === from && pattern.to === to
    );

    if (existingPattern) {
      existingPattern.count++;
    } else {
      this.navigationPatterns.push({
        from,
        to,
        count: 1,
        probability: 0,
      });
    }

    this.calculateProbabilities();
  }

  /**
   * Calculate navigation probabilities
   */
  private calculateProbabilities(): void {
    const fromCounts: Record<string, number> = {};

    // Count total navigations from each page
    this.navigationPatterns.forEach(pattern => {
      fromCounts[pattern.from] = (fromCounts[pattern.from] || 0) + pattern.count;
    });

    // Calculate probabilities
    this.navigationPatterns.forEach(pattern => {
      pattern.probability = pattern.count / fromCounts[pattern.from];
    });
  }

  /**
   * Load stored patterns from localStorage
   */
  private loadStoredPatterns(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('navigation-patterns');
      if (stored) {
        this.navigationPatterns = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load navigation patterns:', error);
    }
  }

  /**
   * Save patterns to localStorage
   */
  private savePatterns(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('navigation-patterns', JSON.stringify(this.navigationPatterns));
    } catch (error) {
      console.warn('Failed to save navigation patterns:', error);
    }
  }

  /**
   * Clear all preloaded resources
   */
  clearCache(): void {
    this.preloadedResources.clear();
    this.preloadQueue = [];
  }

  /**
   * Get preloading statistics
   */
  getStats(): {
    preloadedCount: number;
    queueLength: number;
    hitRate: number;
    navigationPatterns: NavigationPattern[];
  } {
    const totalNavigations = this.navigationPatterns.reduce((sum, pattern) => sum + pattern.count, 0);
    const successfulPredictions = this.navigationPatterns.filter(pattern => pattern.probability > 0.3).length;

    return {
      preloadedCount: this.preloadedResources.size,
      queueLength: this.preloadQueue.length,
      hitRate: totalNavigations > 0 ? successfulPredictions / totalNavigations : 0,
      navigationPatterns: this.navigationPatterns.slice(0, 10), // Top 10 patterns
    };
  }
}

/**
 * Hook for intelligent preloading
 */
export const useIntelligentPreloading = (enabled = true) => {
  const [preloader] = useState(() => new IntelligentPreloader());
  const router = useRouter();
  const currentPath = useRef<string>('');

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleRouteChange = (path: string) => {
      if (currentPath.current !== path) {
        preloader.preloadByPattern(path);
        currentPath.current = path;
      }
    };

    // Track initial route
    handleRouteChange(window.location.pathname);

    // Listen for route changes
    const handlePopState = () => {
      handleRouteChange(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [preloader, enabled]);

  const preloadRoute = (path: string, config: PreloadConfig) => {
    preloader.preloadRoute(path, config);
  };

  const preloadComponent = (name: string, importFn: () => Promise<any>, config: PreloadConfig) => {
    preloader.preloadComponent(name, importFn, config);
  };

  const clearCache = () => {
    preloader.clearCache();
  };

  const getStats = () => {
    return preloader.getStats();
  };

  return {
    preloadRoute,
    preloadComponent,
    clearCache,
    getStats,
  };
};

/**
 * Link component with intelligent preloading
 */
export const IntelligentLink = ({
  href,
  children,
  preloadConfig = { strategy: { hover: true }, priority: 'medium' },
  ...props
}: {
  href: string;
  children: React.ReactNode;
  preloadConfig?: PreloadConfig;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const { preloadRoute } = useIntelligentPreloading();
  const [hasPreloaded, setHasPreloaded] = useState(false);

  const handleMouseEnter = () => {
    if (!hasPreloaded && preloadConfig.strategy.hover) {
      preloadRoute(href, preloadConfig);
      setHasPreloaded(true);
    }
  };

  return (
    <a
      href={href}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {children}
    </a>
  );
};

/**
 * Intersection observer preloading hook
 */
export const useIntersectionPreloading = (
  importFn: () => Promise<any>,
  options: IntersectionObserverInit = {}
) => {
  const [elementRef, setElementRef] = useState<Element | null>(null);
  const [hasPreloaded, setHasPreloaded] = useState(false);

  useEffect(() => {
    if (!elementRef || hasPreloaded) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          importFn().then(() => {
            setHasPreloaded(true);
          }).catch(console.error);
          observer.disconnect();
        }
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(elementRef);

    return () => observer.disconnect();
  }, [elementRef, importFn, hasPreloaded, options]);

  return { setElementRef, hasPreloaded };
};

/**
 * Preloading utilities
 */
export const preloadingUtils = {
  /**
   * Preload critical resources for route
   */
  preloadCriticalResources: (route: string) => {
    const criticalMap: Record<string, Array<() => Promise<any>>> = {
      '/': [
        () => import('@/components/home/hero-section'),
        () => import('@/components/home/featured-portfolios'),
      ],
      '/create': [
        () => import('@/components/portfolio/create/step-1-basic-info'),
        () => import('@/components/templates/template-selector'),
      ],
      '/dashboard': [
        () => import('@/components/portfolio/portfolio-list'),
        () => import('@/components/dashboard/portfolio-analytics'),
      ],
      '/examples': [
        () => import('@/components/discovery/portfolio-card'),
        () => import('@/components/discovery/filter-panel'),
      ],
    };

    const resources = criticalMap[route];
    if (resources) {
      resources.forEach(importFn => {
        importFn().catch(console.error);
      });
    }
  },

  /**
   * Preload based on user role
   */
  preloadByUserRole: (role: string) => {
    const roleMap: Record<string, Array<() => Promise<any>>> = {
      admin: [
        () => import('@/app/admin/page'),
        () => import('@/components/admin/admin-guard'),
      ],
      user: [
        () => import('@/app/dashboard/page'),
        () => import('@/app/create/page'),
      ],
    };

    const resources = roleMap[role];
    if (resources) {
      resources.forEach(importFn => {
        importFn().catch(console.error);
      });
    }
  },

  /**
   * Preload templates based on usage patterns
   */
  preloadPopularTemplates: () => {
    const popularTemplates = ['t1', 't2', 't3', 't4'];
    
    popularTemplates.forEach(templateId => {
      import(`@/components/templates/${templateId}`).catch(console.error);
    });
  },
};

/**
 * Global preloader instance
 */
export const globalPreloader = new IntelligentPreloader();