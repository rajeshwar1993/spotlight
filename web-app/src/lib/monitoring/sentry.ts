// Conditionally import Sentry
let Sentry: any = null;
try {
  Sentry = require('@sentry/nextjs');
} catch (e) {
  // Sentry not installed
}
import { config } from '../config/env-validation';

/**
 * Sentry configuration for production monitoring
 */
export const sentryConfig = {
  dsn: config.monitoring.sentry.dsn,
  environment: config.nodeEnv,
  debug: config.isDevelopment,
  
  // Performance monitoring
  tracesSampleRate: config.isProduction ? 0.1 : 1.0,
  
  // Session replay
  replaysSessionSampleRate: config.isProduction ? 0.01 : 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Error filtering
  beforeSend(event, hint) {
    // Filter out development errors
    if (config.isDevelopment) {
      return event;
    }

    // Filter out known issues
    const ignoredErrors = [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'Network request failed',
      'Load failed',
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
        config.appUrl,
        config.supabase.url,
        /^\/api\//,
      ],
    }),
    new Sentry.Replay({
      maskAllText: config.isProduction,
      blockAllMedia: config.isProduction,
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
  profilesSampleRate: config.isProduction ? 0.1 : 1.0,
};

/**
 * Initialize Sentry for the application
 */
export function initializeSentry() {
  if (!config.monitoring.sentry.dsn) {
    console.warn('⚠️ Sentry DSN not configured, error monitoring disabled');
    return;
  }

  try {
    if (Sentry) {
      Sentry.init(sentryConfig);
      console.log('✅ Sentry initialized successfully');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Sentry:', error);
  }
}

/**
 * Custom error logging with context
 */
export class ErrorLogger {
  static captureException(error: Error, context?: Record<string, any>) {
    if (!Sentry) return;
    
    if (context) {
      Sentry.withScope((scope) => {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value);
        });
        Sentry.captureException(error);
      });
    } else {
      Sentry.captureException(error);
    }
  }

  static captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) {
    if (context) {
      Sentry.withScope((scope) => {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value);
        });
        Sentry.captureMessage(message, level);
      });
    } else {
      Sentry.captureMessage(message, level);
    }
  }

  static setUser(user: { id: string; email?: string; username?: string }) {
    Sentry.setUser(user);
  }

  static setTag(key: string, value: string) {
    Sentry.setTag(key, value);
  }

  static addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
    Sentry.addBreadcrumb(breadcrumb);
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static transactions = new Map<string, Sentry.Transaction>();

  static startTransaction(name: string, op: string, description?: string) {
    const transaction = Sentry.startTransaction({
      name,
      op,
      description,
    });

    this.transactions.set(name, transaction);
    return transaction;
  }

  static finishTransaction(name: string) {
    const transaction = this.transactions.get(name);
    if (transaction) {
      transaction.finish();
      this.transactions.delete(name);
    }
  }

  static addSpan(transactionName: string, spanName: string, op: string, fn: () => Promise<any>) {
    const transaction = this.transactions.get(transactionName);
    if (transaction) {
      const span = transaction.startChild({
        op,
        description: spanName,
      });

      return fn().finally(() => span.finish());
    }

    return fn();
  }

  static recordMetric(name: string, value: number, tags?: Record<string, string>) {
    Sentry.metrics.gauge(name, value, {
      tags,
      timestamp: Date.now() / 1000,
    });
  }

  static recordTiming(name: string, duration: number, tags?: Record<string, string>) {
    Sentry.metrics.timing(name, duration, 'millisecond', {
      tags,
      timestamp: Date.now() / 1000,
    });
  }
}

/**
 * API error tracking middleware
 */
export function withSentryErrorHandling<T extends (...args: any[]) => any>(
  handler: T,
  operationName: string
): T {
  return (async (...args: Parameters<T>) => {
    const transaction = PerformanceMonitor.startTransaction(
      operationName,
      'http.server'
    );

    try {
      const result = await handler(...args);
      transaction.setStatus('ok');
      return result;
    } catch (error) {
      transaction.setStatus('internal_error');
      
      ErrorLogger.captureException(error as Error, {
        operation: operationName,
        args: args.length > 0 ? args[0] : undefined,
      });
      
      throw error;
    } finally {
      PerformanceMonitor.finishTransaction(operationName);
    }
  }) as T;
}

/**
 * React component error boundary
 */
export function withSentryComponentTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return Sentry.withSentryRouting(Component);
}

/**
 * Database query monitoring
 */
export function trackDatabaseQuery(queryName: string, query: () => Promise<any>) {
  const transaction = PerformanceMonitor.startTransaction(
    `db.${queryName}`,
    'db.query'
  );

  const startTime = Date.now();

  return query()
    .then((result) => {
      const duration = Date.now() - startTime;
      PerformanceMonitor.recordTiming('db.query.duration', duration, {
        query: queryName,
        status: 'success',
      });

      transaction.setStatus('ok');
      return result;
    })
    .catch((error) => {
      const duration = Date.now() - startTime;
      PerformanceMonitor.recordTiming('db.query.duration', duration, {
        query: queryName,
        status: 'error',
      });

      transaction.setStatus('internal_error');
      ErrorLogger.captureException(error, {
        query: queryName,
        duration,
      });

      throw error;
    })
    .finally(() => {
      PerformanceMonitor.finishTransaction(`db.${queryName}`);
    });
}

/**
 * User action tracking
 */
export function trackUserAction(action: string, properties?: Record<string, any>) {
  ErrorLogger.addBreadcrumb({
    category: 'user',
    message: action,
    level: 'info',
    data: properties,
  });

  PerformanceMonitor.recordMetric('user.action', 1, {
    action,
    ...properties,
  });
}

/**
 * Feature flag tracking
 */
export function trackFeatureFlag(flag: string, enabled: boolean, userId?: string) {
  ErrorLogger.addBreadcrumb({
    category: 'feature',
    message: `Feature ${flag} ${enabled ? 'enabled' : 'disabled'}`,
    level: 'info',
    data: { flag, enabled, userId },
  });

  PerformanceMonitor.recordMetric('feature.flag', enabled ? 1 : 0, {
    flag,
    userId: userId || 'anonymous',
  });
}

/**
 * Health check monitoring
 */
export async function monitorHealthCheck(service: string, check: () => Promise<boolean>) {
  const startTime = Date.now();
  const transaction = PerformanceMonitor.startTransaction(
    `health.${service}`,
    'health.check'
  );

  try {
    const isHealthy = await check();
    const duration = Date.now() - startTime;

    PerformanceMonitor.recordTiming('health.check.duration', duration, {
      service,
      status: isHealthy ? 'healthy' : 'unhealthy',
    });

    PerformanceMonitor.recordMetric('health.check.status', isHealthy ? 1 : 0, {
      service,
    });

    transaction.setStatus(isHealthy ? 'ok' : 'unavailable');

    if (!isHealthy) {
      ErrorLogger.captureMessage(`Health check failed for ${service}`, 'warning', {
        service,
        duration,
      });
    }

    return isHealthy;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    PerformanceMonitor.recordTiming('health.check.duration', duration, {
      service,
      status: 'error',
    });

    PerformanceMonitor.recordMetric('health.check.status', 0, {
      service,
    });

    transaction.setStatus('internal_error');
    ErrorLogger.captureException(error as Error, {
      service,
      duration,
    });

    return false;
  } finally {
    PerformanceMonitor.finishTransaction(`health.${service}`);
  }
}

// Initialize Sentry if we're in a browser environment
if (typeof window !== 'undefined') {
  initializeSentry();
}

export default {
  init: initializeSentry,
  error: ErrorLogger,
  performance: PerformanceMonitor,
  withErrorHandling: withSentryErrorHandling,
  withComponentTracking: withSentryComponentTracking,
  trackDatabaseQuery,
  trackUserAction,
  trackFeatureFlag,
  monitorHealthCheck,
};