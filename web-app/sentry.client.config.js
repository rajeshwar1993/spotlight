import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    debug: process.env.NODE_ENV === 'development',
    
    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Session replay
    replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Error filtering
    beforeSend(event, hint) {
      // Filter out development errors in production
      if (process.env.NODE_ENV === 'development') {
        return event;
      }

      // Filter out known issues
      const ignoredErrors = [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
        'Network request failed',
        'Load failed',
        'ChunkLoadError',
        'Loading chunk',
        'Script error',
      ];

      const error = hint.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        const message = String(error.message);
        if (ignoredErrors.some(ignored => message.includes(ignored))) {
          return null;
        }
      }

      return event;
    },

    // Breadcrumb filtering
    beforeBreadcrumb(breadcrumb) {
      // Filter out noisy breadcrumbs
      if (breadcrumb.category === 'console' && breadcrumb.level !== 'error') {
        return null;
      }

      if (breadcrumb.category === 'fetch' && breadcrumb.data?.status_code === 200) {
        return null;
      }

      return breadcrumb;
    },

    // Integration configuration
    integrations: [
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.nextRouterInstrumentation,
        tracePropagationTargets: [
          'localhost',
          /^\/api\//,
          /^https:\/\/[^\/]+\.supabase\.co/,
        ],
      }),
      new Sentry.Replay({
        maskAllText: process.env.NODE_ENV === 'production',
        blockAllMedia: process.env.NODE_ENV === 'production',
      }),
    ],

    // Release information
    release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
    
    // Additional options
    attachStacktrace: true,
    captureUnhandledRejections: true,
    maxBreadcrumbs: 50,
    
    // Performance options
    enableTracing: true,
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
}