/**
 * Lazy loading wrapper component for heavy dashboard components
 */

'use client';

import { Suspense, lazy, ComponentType } from 'react';
import { useIntersectionProgressiveLoading } from '@/lib/progressive-loading';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ComponentType;
  error?: React.ComponentType<{ error: Error; retry: () => void }>;
  height?: number;
  className?: string;
}

/**
 * Default loading component
 */
const DefaultLoading = ({ height = 200 }: { height?: number }) => (
  <Card className="w-full">
    <CardHeader className="space-y-2">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-1/2" />
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="flex items-center justify-center" style={{ height }}>
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </CardContent>
  </Card>
);

/**
 * Default error component
 */
const DefaultError = ({ error, retry }: { error: Error; retry: () => void }) => (
  <Card className="w-full border-red-200 bg-red-50">
    <CardContent className="p-6">
      <div className="flex items-center gap-2 text-red-600 mb-2">
        <AlertCircle className="h-5 w-5" />
        <span className="font-medium">Loading Error</span>
      </div>
      <p className="text-sm text-red-700 mb-4">{error.message}</p>
      <button
        onClick={retry}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
      >
        Retry
      </button>
    </CardContent>
  </Card>
);

/**
 * Lazy wrapper component
 */
export const LazyWrapper = ({
  children,
  fallback: Fallback = DefaultLoading,
  error: ErrorComponent = DefaultError,
  height = 200,
  className = '',
}: LazyWrapperProps) => {
  return (
    <div className={className}>
      <Suspense fallback={<Fallback height={height} />}>
        {children}
      </Suspense>
    </div>
  );
};

/**
 * Create lazy component with intersection observer
 */
export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    fallback?: ComponentType<{ height?: number }>;
    error?: ComponentType<{ error: Error; retry: () => void }>;
    height?: number;
  } = {}
) => {
  const LazyComponent = lazy(importFn);
  
  return (props: React.ComponentProps<T>) => {
    const { component, isLoading, error, retry, setElementRef } = useIntersectionProgressiveLoading(
      importFn,
      { useIntersectionObserver: true, intersectionOptions: { threshold: 0.1 } }
    );

    if (error) {
      const ErrorComponent = options.error || DefaultError;
      return <ErrorComponent error={error} retry={retry} />;
    }

    if (isLoading || !component) {
      const FallbackComponent = options.fallback || DefaultLoading;
      return (
        <div ref={setElementRef}>
          <FallbackComponent height={options.height} />
        </div>
      );
    }

    return (
      <Suspense fallback={<DefaultLoading height={options.height} />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
};

/**
 * Lazy dashboard components
 */
export const LazyDashboardComponents = {
  PortfolioAnalytics: createLazyComponent(
    () => import('@/components/dashboard/portfolio-analytics'),
    { height: 400 }
  ),
  
  BulkPortfolioOperations: createLazyComponent(
    () => import('@/components/dashboard/bulk-portfolio-operations'),
    { height: 300 }
  ),
  
  PortfolioComparison: createLazyComponent(
    () => import('@/components/dashboard/portfolio-comparison'),
    { height: 500 }
  ),
  
  AdvancedPortfolioFilters: createLazyComponent(
    () => import('@/components/dashboard/advanced-portfolio-filters'),
    { height: 200 }
  ),
  
  PortfolioPerformanceInsights: createLazyComponent(
    () => import('@/components/dashboard/portfolio-performance-insights'),
    { height: 350 }
  ),
  
  ProfileAnalytics: createLazyComponent(
    () => import('@/components/profile/profile-analytics'),
    { height: 300 }
  ),
  
  PerformanceDashboard: createLazyComponent(
    () => import('@/components/performance/performance-dashboard'),
    { height: 600 }
  ),
};

/**
 * Lazy form components
 */
export const LazyFormComponents = {
  PortfolioEditForm: createLazyComponent(
    () => import('@/components/portfolio/portfolio-edit-form'),
    { height: 400 }
  ),
  
  ImageUpload: createLazyComponent(
    () => import('@/components/portfolio/image-upload'),
    { height: 300 }
  ),
  
  ImageCropper: createLazyComponent(
    () => import('@/components/portfolio/image-cropper'),
    { height: 400 }
  ),
  
  TemplateCustomizer: createLazyComponent(
    () => import('@/components/templates/features/customization/template-customizer'),
    { height: 500 }
  ),
};

/**
 * Lazy template components
 */
export const LazyTemplateComponents = {
  TemplateRenderer: createLazyComponent(
    () => import('@/components/templates/template-renderer'),
    { height: 600 }
  ),
  
  TemplatePreview: createLazyComponent(
    () => import('@/components/templates/template-preview'),
    { height: 400 }
  ),
  
  TemplateSelector: createLazyComponent(
    () => import('@/components/templates/template-selector'),
    { height: 300 }
  ),
};

/**
 * Lazy admin components
 */
export const LazyAdminComponents = {
  AdminGuard: createLazyComponent(
    () => import('@/components/admin/admin-guard'),
    { height: 100 }
  ),
};

/**
 * Section loading skeleton
 */
export const SectionSkeleton = ({ 
  title = true, 
  lines = 3, 
  height = 200 
}: { 
  title?: boolean; 
  lines?: number; 
  height?: number;
}) => (
  <Card className="w-full">
    <CardHeader>
      {title && <Skeleton className="h-6 w-48" />}
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {[...Array(lines)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-center" style={{ height }}>
        <Skeleton className="h-full w-full" />
      </div>
    </CardContent>
  </Card>
);

/**
 * Chart loading skeleton
 */
export const ChartSkeleton = ({ height = 300 }: { height?: number }) => (
  <Card className="w-full">
    <CardHeader>
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-4 w-48" />
    </CardHeader>
    <CardContent>
      <div className="flex items-end justify-center gap-2" style={{ height }}>
        {[...Array(8)].map((_, i) => (
          <Skeleton 
            key={i} 
            className="w-8" 
            style={{ height: `${Math.random() * 80 + 20}%` }}
          />
        ))}
      </div>
    </CardContent>
  </Card>
);

/**
 * Table loading skeleton
 */
export const TableSkeleton = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => (
  <Card className="w-full">
    <CardHeader>
      <Skeleton className="h-6 w-40" />
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {/* Header row */}
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {[...Array(cols)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
        
        {/* Data rows */}
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {[...Array(cols)].map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-8 w-full" />
            ))}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

/**
 * Grid loading skeleton
 */
export const GridSkeleton = ({ 
  items = 6, 
  cols = 3, 
  height = 200 
}: { 
  items?: number; 
  cols?: number; 
  height?: number;
}) => (
  <div className={`grid gap-4 grid-cols-1 md:grid-cols-${cols}`}>
    {[...Array(items)].map((_, i) => (
      <Card key={i} className="w-full">
        <CardContent className="p-4">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <Skeleton className="w-full" style={{ height }} />
        </CardContent>
      </Card>
    ))}
  </div>
);

export default LazyWrapper;