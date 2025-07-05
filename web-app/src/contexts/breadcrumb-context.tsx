'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
// Temporarily disable next-intl integration
// import { useTranslations } from 'next-intl';

// =============================================================================
// Types
// =============================================================================

export interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrentPage?: boolean;
}

interface BreadcrumbContextValue {
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  addBreadcrumb: (breadcrumb: BreadcrumbItem) => void;
  removeBreadcrumb: (href: string) => void;
  clearBreadcrumbs: () => void;
}

// =============================================================================
// Context
// =============================================================================

const BreadcrumbContext = React.createContext<BreadcrumbContextValue | undefined>(undefined);

// =============================================================================
// Provider
// =============================================================================

interface BreadcrumbProviderProps {
  children: React.ReactNode;
}

export function BreadcrumbProvider({ children }: BreadcrumbProviderProps) {
  const [customBreadcrumbs, setCustomBreadcrumbs] = React.useState<BreadcrumbItem[]>([]);
  const pathname = usePathname();
  // const t = useTranslations('navigation.breadcrumb');
  
  // Simple label mapping until we restore i18n
  const getLabelForSegment = React.useCallback((segment: string): string => {
    const labelMap: Record<string, string> = {
      'dashboard': 'Dashboard',
      'profile': 'Profile',
      'settings': 'Settings',
      'auth': 'Authentication',
      'signin': 'Sign In',
      'signup': 'Sign Up',
      'reset-password': 'Reset Password',
      'verify': 'Verify Email',
      'create': 'Create Portfolio',
      'examples': 'Examples',
      'templates': 'Templates',
      'pricing': 'Pricing',
    };
    
    return labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
  }, []);

  // Generate automatic breadcrumbs based on the current pathname
  const generateAutomaticBreadcrumbs = React.useCallback((): BreadcrumbItem[] => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always include home
    breadcrumbs.push({
      label: 'Home',
      href: '/',
      isCurrentPage: pathname === '/',
    });

    // Build breadcrumbs from path segments
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Get localized label for the segment
      const label = getLabelForSegment(segment);

      breadcrumbs.push({
        label,
        href: currentPath,
        isCurrentPage: isLast,
      });
    });

    return breadcrumbs;
  }, [pathname, getLabelForSegment]);

  // Combine automatic and custom breadcrumbs
  const breadcrumbs = React.useMemo(() => {
    if (customBreadcrumbs.length > 0) {
      return customBreadcrumbs;
    }
    return generateAutomaticBreadcrumbs();
  }, [customBreadcrumbs, generateAutomaticBreadcrumbs]);

  const setBreadcrumbs = React.useCallback((newBreadcrumbs: BreadcrumbItem[]) => {
    setCustomBreadcrumbs(newBreadcrumbs);
  }, []);

  const addBreadcrumb = React.useCallback((breadcrumb: BreadcrumbItem) => {
    setCustomBreadcrumbs(prev => {
      const exists = prev.find(item => item.href === breadcrumb.href);
      if (exists) {
        return prev.map(item => 
          item.href === breadcrumb.href ? breadcrumb : item
        );
      }
      return [...prev, breadcrumb];
    });
  }, []);

  const removeBreadcrumb = React.useCallback((href: string) => {
    setCustomBreadcrumbs(prev => prev.filter(item => item.href !== href));
  }, []);

  const clearBreadcrumbs = React.useCallback(() => {
    setCustomBreadcrumbs([]);
  }, []);

  const value: BreadcrumbContextValue = {
    breadcrumbs,
    setBreadcrumbs,
    addBreadcrumb,
    removeBreadcrumb,
    clearBreadcrumbs,
  };

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

// =============================================================================
// Hook
// =============================================================================

export function useBreadcrumb() {
  const context = React.useContext(BreadcrumbContext);
  if (context === undefined) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
  }
  return context;
}

// =============================================================================
// Custom Breadcrumb Hook for Pages
// =============================================================================

export function usePageBreadcrumb(breadcrumbs: BreadcrumbItem[]) {
  const { setBreadcrumbs, clearBreadcrumbs } = useBreadcrumb();

  React.useEffect(() => {
    setBreadcrumbs(breadcrumbs);
    return () => clearBreadcrumbs();
  }, [breadcrumbs, setBreadcrumbs, clearBreadcrumbs]);
}