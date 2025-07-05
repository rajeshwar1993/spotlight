import * as React from 'react';
import { Loader2 } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// =============================================================================
// Generic Loading Components
// =============================================================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2 className={cn('animate-spin', sizeClasses[size], className)} />
  );
}

interface LoadingOverlayProps {
  children?: React.ReactNode;
  className?: string;
}

export function LoadingOverlay({ children, className }: LoadingOverlayProps) {
  return (
    <div className={cn(
      'absolute inset-0 bg-background/80 backdrop-blur-sm',
      'flex items-center justify-center',
      'z-50',
      className
    )}>
      <div className="flex flex-col items-center space-y-2">
        <LoadingSpinner size="lg" />
        {children && (
          <p className="text-sm text-muted-foreground">{children}</p>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Page Loading Skeletons
// =============================================================================

export function PageLoadingSkeleton() {
  return (
    <div className="container-spotlight py-8 space-y-8">
      {/* Header skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Content grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function DashboardLoadingSkeleton() {
  return (
    <div className="container-spotlight py-8 space-y-8">
      {/* Dashboard header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-8 w-16 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <PortfolioGridSkeleton />
        </div>
        <div className="space-y-6">
          <ProfileSidebarSkeleton />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Portfolio-specific Loading Skeletons
// =============================================================================

export function PortfolioCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[4/3] bg-muted">
        <Skeleton className="h-full w-full" />
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PortfolioGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PortfolioCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PortfolioDetailSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-96" />
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>

      {/* Hero image */}
      <div className="aspect-[16/9] bg-muted rounded-lg">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>

          {/* Gallery */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square bg-muted rounded-lg">
                  <Skeleton className="h-full w-full rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <ProfileSidebarSkeleton />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Form Loading States
// =============================================================================

export function FormLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>

      <div className="flex space-x-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

interface FormSubmissionLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

export function FormSubmissionLoading({ 
  isLoading, 
  children, 
  loadingText = 'Saving...' 
}: FormSubmissionLoadingProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <LoadingOverlay>
          {loadingText}
        </LoadingOverlay>
      )}
    </div>
  );
}

// =============================================================================
// Profile & User Loading States
// =============================================================================

export function ProfileSidebarSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function UserProfileSkeleton() {
  return (
    <div className="space-y-8">
      {/* Profile header */}
      <div className="flex items-start space-x-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-4 flex-1">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </div>

      {/* Profile sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <ProfileSidebarSkeleton />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Navigation Loading States
// =============================================================================

export function NavigationSkeleton() {
  return (
    <div className="flex items-center justify-between h-16 px-4">
      <div className="flex items-center space-x-8">
        <Skeleton className="h-6 w-32" />
        <div className="hidden md:flex space-x-6">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-14" />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
    </div>
  );
}