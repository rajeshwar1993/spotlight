/**
 * Dynamic loading utilities for code splitting and performance optimization
 */

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * Loading component for dynamic imports
 */
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

/**
 * Error component for dynamic import failures
 */
export const LoadingError = ({ error }: { error: Error }) => (
  <div className="flex items-center justify-center min-h-[200px] text-red-500">
    <div className="text-center">
      <h2 className="text-lg font-medium mb-2">Failed to load component</h2>
      <p className="text-sm">{error.message}</p>
    </div>
  </div>
);

/**
 * Dynamic import with loading and error states
 */
export const createDynamicComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    loading?: ComponentType;
    error?: ComponentType<{ error: Error }>;
    ssr?: boolean;
  } = {}
) => {
  return dynamic(importFn, {
    loading: options.loading || LoadingSpinner,
    ssr: options.ssr ?? true,
  });
};

/**
 * Route-based dynamic components
 */
export const DynamicComponents = {
  // Dashboard components
  Dashboard: createDynamicComponent(
    () => import('@/app/dashboard/page'),
    { ssr: false }
  ),
  
  PortfolioDashboard: createDynamicComponent(
    () => import('@/app/dashboard/portfolios/page'),
    { ssr: false }
  ),
  
  EnhancedPortfolioDashboard: createDynamicComponent(
    () => import('@/app/dashboard/portfolios/enhanced/page'),
    { ssr: false }
  ),
  
  // Admin components
  AdminDashboard: createDynamicComponent(
    () => import('@/app/admin/page'),
    { ssr: false }
  ),
  
  // Portfolio creation components
  PortfolioCreation: createDynamicComponent(
    () => import('@/app/create/page'),
    { ssr: false }
  ),
  
  // Profile components
  ProfileDashboard: createDynamicComponent(
    () => import('@/app/profile/dashboard/page'),
    { ssr: false }
  ),
  
  ProfileSettings: createDynamicComponent(
    () => import('@/app/profile/settings/page'),
    { ssr: false }
  ),
  
  // Authentication components
  SignIn: createDynamicComponent(
    () => import('@/app/auth/signin/page'),
    { ssr: true }
  ),
  
  SignUp: createDynamicComponent(
    () => import('@/app/auth/signup/page'),
    { ssr: true }
  ),
  
  // Examples/Discovery page
  ExamplesPage: createDynamicComponent(
    () => import('@/app/examples/page'),
    { ssr: true }
  ),
};

/**
 * Component-level dynamic imports
 */
export const DynamicUIComponents = {
  // Heavy dashboard components
  PortfolioAnalytics: createDynamicComponent(
    () => import('@/components/dashboard/portfolio-analytics'),
    { ssr: false }
  ),
  
  BulkPortfolioOperations: createDynamicComponent(
    () => import('@/components/dashboard/bulk-portfolio-operations'),
    { ssr: false }
  ),
  
  PortfolioComparison: createDynamicComponent(
    () => import('@/components/dashboard/portfolio-comparison'),
    { ssr: false }
  ),
  
  AdvancedPortfolioFilters: createDynamicComponent(
    () => import('@/components/dashboard/advanced-portfolio-filters'),
    { ssr: false }
  ),
  
  // Template components
  TemplateRenderer: createDynamicComponent(
    () => import('@/components/templates/template-renderer'),
    { ssr: true }
  ),
  
  TemplateCustomizer: createDynamicComponent(
    () => import('@/components/templates/features/customization/template-customizer'),
    { ssr: false }
  ),
  
  // Form components
  PortfolioEditForm: createDynamicComponent(
    () => import('@/components/portfolio/portfolio-edit-form'),
    { ssr: false }
  ),
  
  ImageUpload: createDynamicComponent(
    () => import('@/components/portfolio/image-upload'),
    { ssr: false }
  ),
  
  ImageCropper: createDynamicComponent(
    () => import('@/components/portfolio/image-cropper'),
    { ssr: false }
  ),
  
  // Profile components
  ProfileAnalytics: createDynamicComponent(
    () => import('@/components/profile/profile-analytics'),
    { ssr: false }
  ),
  
  InlineEditField: createDynamicComponent(
    () => import('@/components/profile/inline-edit-field'),
    { ssr: false }
  ),
  
  // Admin components
  AdminGuard: createDynamicComponent(
    () => import('@/components/admin/admin-guard'),
    { ssr: false }
  ),
};

/**
 * Template-specific dynamic imports
 */
export const DynamicTemplates = {
  T1: createDynamicComponent(
    () => import('@/components/templates/t1'),
    { ssr: true }
  ),
  
  T2: createDynamicComponent(
    () => import('@/components/templates/t2'),
    { ssr: true }
  ),
  
  T3: createDynamicComponent(
    () => import('@/components/templates/t3'),
    { ssr: true }
  ),
  
  T4: createDynamicComponent(
    () => import('@/components/templates/t4'),
    { ssr: true }
  ),
};

/**
 * Preload utilities for performance optimization
 */
export const preloadUtils = {
  /**
   * Preload a dynamic component
   */
  preloadComponent: (importFn: () => Promise<any>) => {
    if (typeof window !== 'undefined') {
      // Preload the component when the browser is idle
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          importFn().catch(() => {
            // Ignore preload errors
          });
        });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
          importFn().catch(() => {
            // Ignore preload errors
          });
        }, 100);
      }
    }
  },

  /**
   * Preload components based on user navigation patterns
   */
  preloadByRoute: (currentPath: string) => {
    const preloadMap: Record<string, (() => Promise<any>)[]> = {
      '/': [
        () => import('@/app/create/page'),
        () => import('@/app/examples/page'),
        () => import('@/app/auth/signin/page'),
      ],
      '/dashboard': [
        () => import('@/app/dashboard/portfolios/page'),
        () => import('@/app/profile/dashboard/page'),
      ],
      '/create': [
        () => import('@/components/templates/template-renderer'),
        () => import('@/components/portfolio/image-upload'),
      ],
      '/examples': [
        () => import('@/app/create/page'),
        () => import('@/app/auth/signin/page'),
      ],
    };

    const componentsToPreload = preloadMap[currentPath];
    if (componentsToPreload) {
      componentsToPreload.forEach(importFn => {
        preloadUtils.preloadComponent(importFn);
      });
    }
  },

  /**
   * Preload components based on user interaction
   */
  preloadOnHover: (importFn: () => Promise<any>) => {
    let hasPreloaded = false;
    
    return () => {
      if (!hasPreloaded) {
        hasPreloaded = true;
        preloadUtils.preloadComponent(importFn);
      }
    };
  },

  /**
   * Preload components based on viewport intersection
   */
  preloadOnIntersection: (importFn: () => Promise<any>, threshold = 0.1) => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return () => {};
    }

    let hasPreloaded = false;
    
    return (element: Element) => {
      if (hasPreloaded) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            hasPreloaded = true;
            preloadUtils.preloadComponent(importFn);
            observer.disconnect();
          }
        },
        { threshold }
      );

      observer.observe(element);
    };
  },
};

/**
 * Bundle size optimization utilities
 */
export const bundleUtils = {
  /**
   * Lazy load external libraries
   */
  lazyLoadLibrary: async <T>(
    importFn: () => Promise<T>,
    fallback?: () => T
  ): Promise<T> => {
    try {
      return await importFn();
    } catch (error) {
      console.error('Failed to load library:', error);
      if (fallback) {
        return fallback();
      }
      throw error;
    }
  },

  /**
   * Conditional loading based on feature flags
   */
  conditionalLoad: async <T>(
    condition: boolean,
    importFn: () => Promise<T>,
    fallback?: () => T
  ): Promise<T | null> => {
    if (!condition) {
      return fallback ? fallback() : null;
    }
    
    return bundleUtils.lazyLoadLibrary(importFn, fallback);
  },

  /**
   * Progressive enhancement loading
   */
  progressiveLoad: async <T>(
    basicImport: () => Promise<T>,
    enhancedImport: () => Promise<T>,
    shouldUseEnhanced: () => boolean = () => true
  ): Promise<T> => {
    const basic = await basicImport();
    
    if (shouldUseEnhanced()) {
      try {
        return await enhancedImport();
      } catch {
        return basic;
      }
    }
    
    return basic;
  },
};

/**
 * Route-based code splitting configuration
 */
export const routeConfig = {
  // Routes that should be server-side rendered
  ssrRoutes: [
    '/',
    '/examples',
    '/mypage/[slug]',
    '/auth/signin',
    '/auth/signup',
  ],
  
  // Routes that should be client-side only
  clientOnlyRoutes: [
    '/dashboard',
    '/dashboard/portfolios',
    '/dashboard/portfolios/enhanced',
    '/profile/dashboard',
    '/profile/settings',
    '/admin',
    '/create',
  ],
  
  // Routes that should be preloaded
  preloadRoutes: [
    '/create',
    '/examples',
    '/dashboard',
  ],
};