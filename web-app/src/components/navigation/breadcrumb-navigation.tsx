'use client';

import * as React from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '@/components/ui/breadcrumb';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

interface BreadcrumbNavigationProps {
  className?: string;
  showHome?: boolean;
  maxItems?: number;
  homeIcon?: boolean;
}

// =============================================================================
// Component
// =============================================================================

export function BreadcrumbNavigation({ 
  className,
  showHome = true,
  maxItems = 5,
  homeIcon = true,
}: BreadcrumbNavigationProps) {
  const { breadcrumbs } = useBreadcrumb();

  const visibleBreadcrumbs = React.useMemo(() => {
    if (breadcrumbs.length <= maxItems) {
      return breadcrumbs;
    }

    // If we have too many items, show first, ellipsis, and last few
    const firstItem = breadcrumbs[0];
    const lastItems = breadcrumbs.slice(-2); // Show last 2 items
    
    return [firstItem, 'ellipsis', ...lastItems];
  }, [breadcrumbs, maxItems]);

  // Don't render if we only have the home breadcrumb and showHome is false
  if (!showHome && breadcrumbs.length <= 1) {
    return null;
  }

  // Don't render if we're on the home page and only have one breadcrumb
  if (breadcrumbs.length <= 1 && breadcrumbs[0]?.isCurrentPage) {
    return null;
  }

  return (
    <Breadcrumb className={cn('mb-4', className)}>
      <BreadcrumbList>
        {visibleBreadcrumbs.map((item, index) => {
          if (item === 'ellipsis') {
            return (
              <React.Fragment key="ellipsis">
                <BreadcrumbItem>
                  <BreadcrumbEllipsis />
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </React.Fragment>
            );
          }

          const breadcrumb = item as typeof breadcrumbs[0];
          const isLast = index === visibleBreadcrumbs.length - 1;
          const isHome = breadcrumb.href === '/';

          return (
            <React.Fragment key={breadcrumb.href}>
              <BreadcrumbItem>
                {breadcrumb.isCurrentPage || isLast ? (
                  <BreadcrumbPage className="flex items-center">
                    {isHome && homeIcon && <Home className="w-4 h-4 mr-1" />}
                    {breadcrumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={breadcrumb.href} className="flex items-center">
                      {isHome && homeIcon && <Home className="w-4 h-4 mr-1" />}
                      {breadcrumb.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

// =============================================================================
// Compact Breadcrumb Component
// =============================================================================

interface CompactBreadcrumbProps {
  className?: string;
  showOnlyCurrentPage?: boolean;
}

export function CompactBreadcrumb({ 
  className, 
  showOnlyCurrentPage = false 
}: CompactBreadcrumbProps) {
  const { breadcrumbs } = useBreadcrumb();
  
  const currentPage = breadcrumbs.find(item => item.isCurrentPage);
  const parentPage = breadcrumbs[breadcrumbs.length - 2];

  if (!currentPage) return null;

  if (showOnlyCurrentPage) {
    return (
      <div className={cn('text-sm text-muted-foreground', className)}>
        {currentPage.label}
      </div>
    );
  }

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {parentPage && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={parentPage.href}>
                  {parentPage.label}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}
        <BreadcrumbItem>
          <BreadcrumbPage>{currentPage.label}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

// =============================================================================
// Mobile Breadcrumb Component
// =============================================================================

export function MobileBreadcrumb({ className }: { className?: string }) {
  const { breadcrumbs } = useBreadcrumb();
  
  const currentPage = breadcrumbs.find(item => item.isCurrentPage);
  const parentPage = breadcrumbs[breadcrumbs.length - 2];

  if (!currentPage || !parentPage) return null;

  return (
    <div className={cn('flex items-center space-x-2 text-sm', className)}>
      <Link 
        href={parentPage.href}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        ← {parentPage.label}
      </Link>
    </div>
  );
}