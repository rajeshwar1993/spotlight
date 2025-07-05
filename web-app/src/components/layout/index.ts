// Layout component barrel exports

// Main Layout Components
export { MainLayout, AuthLayout, DashboardLayout, PortfolioLayout } from './main-layout';
export { LayoutProvider, useLayout } from './main-layout';

// Navigation Components
export { Navbar } from './navbar';
export { Footer } from './footer';

// Announcement System
export { AnnouncementBanner, AnnouncementBannerContainer } from './announcement-banner';

// Loading States and Skeletons
export {
  LoadingSpinner,
  LoadingOverlay,
  PageLoadingSkeleton,
  DashboardLoadingSkeleton,
  PortfolioCardSkeleton,
  PortfolioGridSkeleton,
  PortfolioDetailSkeleton,
  FormLoadingSkeleton,
  FormSubmissionLoading,
  ProfileSidebarSkeleton,
  UserProfileSkeleton,
  NavigationSkeleton,
} from './loading-states';

// Error Boundary Components
export {
  GlobalErrorBoundary,
  ComponentErrorBoundary,
  NotFoundError,
  ServerError,
  ApiError,
  useErrorHandler,
} from './error-boundary';

// Default export
export { default } from './main-layout';