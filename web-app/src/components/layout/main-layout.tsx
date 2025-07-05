'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';

import { Navbar } from './navbar';
import { Footer } from './footer';
import { AnnouncementBannerContainer } from './announcement-banner';
import { GlobalErrorBoundary } from './error-boundary';
import { BreadcrumbNavigation } from '@/components/navigation';
import { cn } from '@/lib/utils';

// =============================================================================
// Layout Configuration
// =============================================================================

// Pages that should not show the navbar
const NAVBAR_HIDDEN_ROUTES = [
  '/auth/signin',
  '/auth/signup',
  '/auth/reset-password',
  '/auth/verify',
] as const;

// Pages that should not show the footer
const FOOTER_HIDDEN_ROUTES = [
  '/auth/signin',
  '/auth/signup',
  '/auth/reset-password',
  '/auth/verify',
  '/dashboard',
  '/profile/settings',
] as const;

// Pages that should not show the announcement banner
const ANNOUNCEMENT_HIDDEN_ROUTES = [
  '/auth/signin',
  '/auth/signup',
  '/auth/reset-password',
  '/auth/verify',
] as const;

// Pages that should have a different background
const SPECIAL_BACKGROUND_ROUTES = [
  '/auth/signin',
  '/auth/signup',
  '/auth/reset-password',
  '/auth/verify',
] as const;

// Pages that should show breadcrumb navigation
const BREADCRUMB_ENABLED_ROUTES = [
  '/dashboard',
  '/profile',
  '/profile/settings',
  '/create',
  '/examples',
  '/templates',
  '/pricing',
] as const;

// =============================================================================
// Layout Components
// =============================================================================

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

function SkipLink({ href, children }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4',
        'bg-primary text-primary-foreground px-4 py-2 rounded-md',
        'z-[100] transition-all'
      )}
    >
      {children}
    </a>
  );
}

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  hasNavbar: boolean;
  hasFooter: boolean;
  hasAnnouncement: boolean;
  isSpecialBackground: boolean;
  hasBreadcrumb: boolean;
}

function PageWrapper({ 
  children, 
  className, 
  hasNavbar, 
  hasFooter, 
  hasAnnouncement,
  isSpecialBackground,
  hasBreadcrumb 
}: PageWrapperProps) {
  return (
    <div 
      className={cn(
        'min-h-screen flex flex-col',
        isSpecialBackground && 'bg-gradient-to-br from-background via-spotlight-50/30 to-spotlight-100/50 dark:from-background dark:via-spotlight-950/30 dark:to-spotlight-900/20',
        className
      )}
    >
      {/* Skip Links for Accessibility */}
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      {hasNavbar && <SkipLink href="#navigation">Skip to navigation</SkipLink>}

      {/* Announcement Banner */}
      {hasAnnouncement && <AnnouncementBannerContainer />}

      {/* Navigation */}
      {hasNavbar && (
        <nav id="navigation" role="navigation" aria-label="Main navigation">
          <Navbar />
        </nav>
      )}

      {/* Main Content */}
      <main 
        id="main-content" 
        role="main"
        className={cn(
          'flex-1',
          !hasNavbar && !hasAnnouncement && 'pt-0',
        )}
      >
        {/* Breadcrumb Navigation */}
        {hasBreadcrumb && (
          <div className="container-spotlight pt-6">
            <BreadcrumbNavigation />
          </div>
        )}
        {children}
      </main>

      {/* Footer */}
      {hasFooter && (
        <footer role="contentinfo">
          <Footer />
        </footer>
      )}
    </div>
  );
}

// =============================================================================
// Main Layout Component
// =============================================================================

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MainLayout({ children, className }: MainLayoutProps) {
  const pathname = usePathname();

  // Determine layout configuration based on current route
  const shouldShowNavbar = !NAVBAR_HIDDEN_ROUTES.some(route => pathname === route);
  const shouldShowFooter = !FOOTER_HIDDEN_ROUTES.some(route => pathname === route);
  const shouldShowAnnouncement = !ANNOUNCEMENT_HIDDEN_ROUTES.some(route => pathname === route);
  const isSpecialBackground = SPECIAL_BACKGROUND_ROUTES.some(route => pathname === route);
  const shouldShowBreadcrumb = BREADCRUMB_ENABLED_ROUTES.some(route => pathname.startsWith(route));

  return (
    <GlobalErrorBoundary>
      <PageWrapper
        className={className}
        hasNavbar={shouldShowNavbar}
        hasFooter={shouldShowFooter}
        hasAnnouncement={shouldShowAnnouncement}
        isSpecialBackground={isSpecialBackground}
        hasBreadcrumb={shouldShowBreadcrumb}
      >
        {children}
      </PageWrapper>
    </GlobalErrorBoundary>
  );
}

// =============================================================================
// Specialized Layout Components
// =============================================================================

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div 
      className={cn(
        'min-h-screen flex items-center justify-center p-4',
        'bg-gradient-to-br from-background via-spotlight-50/30 to-spotlight-100/50',
        'dark:from-background dark:via-spotlight-950/30 dark:to-spotlight-900/20',
        className
      )}
    >
      <SkipLink href="#auth-content">Skip to authentication form</SkipLink>
      <main id="auth-content" role="main" className="w-full max-w-md">
        {children}
      </main>
    </div>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}

export function DashboardLayout({ children, sidebar, className }: DashboardLayoutProps) {
  return (
    <div className={cn('min-h-screen flex flex-col', className)}>
      <SkipLink href="#dashboard-content">Skip to dashboard content</SkipLink>
      
      <nav role="navigation" aria-label="Main navigation">
        <Navbar />
      </nav>

      <div className="flex-1 flex">
        {sidebar && (
          <aside 
            role="complementary" 
            aria-label="Dashboard sidebar"
            className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-muted/30"
          >
            {sidebar}
          </aside>
        )}

        <main 
          id="dashboard-content" 
          role="main"
          className="flex-1 overflow-auto"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

interface PortfolioLayoutProps {
  children: React.ReactNode;
  className?: string;
  showNavbar?: boolean;
  showFooter?: boolean;
}

export function PortfolioLayout({ 
  children, 
  className, 
  showNavbar = true, 
  showFooter = true 
}: PortfolioLayoutProps) {
  return (
    <div className={cn('min-h-screen flex flex-col bg-background', className)}>
      <SkipLink href="#portfolio-content">Skip to portfolio content</SkipLink>

      {showNavbar && (
        <nav role="navigation" aria-label="Main navigation">
          <Navbar />
        </nav>
      )}

      <main 
        id="portfolio-content" 
        role="main"
        className="flex-1"
      >
        {children}
      </main>

      {showFooter && (
        <footer role="contentinfo">
          <Footer />
        </footer>
      )}
    </div>
  );
}

// =============================================================================
// Layout Provider Context
// =============================================================================

interface LayoutContextValue {
  hasNavbar: boolean;
  hasFooter: boolean;
  hasAnnouncement: boolean;
  isSpecialBackground: boolean;
  hasBreadcrumb: boolean;
  pathname: string;
}

const LayoutContext = React.createContext<LayoutContextValue | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const value: LayoutContextValue = {
    hasNavbar: !NAVBAR_HIDDEN_ROUTES.some(route => pathname === route),
    hasFooter: !FOOTER_HIDDEN_ROUTES.some(route => pathname === route),
    hasAnnouncement: !ANNOUNCEMENT_HIDDEN_ROUTES.some(route => pathname === route),
    isSpecialBackground: SPECIAL_BACKGROUND_ROUTES.some(route => pathname === route),
    hasBreadcrumb: BREADCRUMB_ENABLED_ROUTES.some(route => pathname.startsWith(route)),
    pathname,
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = React.useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}

// =============================================================================
// Export Default
// =============================================================================

export default MainLayout;