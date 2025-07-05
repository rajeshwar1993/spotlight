'use client';

import * as React from 'react';
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES, APP_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';

// =============================================================================
// Error Boundary Types
// =============================================================================

interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

// =============================================================================
// Global Error Boundary
// =============================================================================

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class GlobalErrorBoundary extends React.Component<
  GlobalErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('GlobalErrorBoundary caught an error:', error, errorInfo);
    }

    // Here you would typically send error to monitoring service
    // Example: Sentry.captureException(error, { extra: errorInfo });

    this.setState({
      error,
      errorInfo,
    });
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      
      if (FallbackComponent && this.state.error) {
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      return (
        <GlobalErrorFallback 
          error={this.state.error} 
          errorInfo={this.state.errorInfo}
          retry={this.retry}
        />
      );
    }

    return this.props.children;
  }
}

// =============================================================================
// Error Fallback Components
// =============================================================================

interface ErrorFallbackProps {
  error?: Error;
  errorInfo?: ErrorInfo;
  retry?: () => void;
  title?: string;
  description?: string;
  showDetails?: boolean;
}

function GlobalErrorFallback({ 
  error, 
  retry,
  showDetails = process.env.NODE_ENV === 'development'
}: ErrorFallbackProps) {
  const [showErrorDetails, setShowErrorDetails] = React.useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred. We apologize for the inconvenience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            {retry && (
              <Button onClick={retry} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            <Button variant="outline" asChild className="w-full">
              <Link href={ROUTES.home}>
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>

          {showDetails && error && (
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowErrorDetails(!showErrorDetails)}
                className="w-full text-xs"
              >
                {showErrorDetails ? 'Hide' : 'Show'} Error Details
              </Button>
              
              {showErrorDetails && (
                <div className="p-3 bg-muted rounded-md text-xs font-mono max-h-40 overflow-auto">
                  <div className="font-semibold mb-2">Error:</div>
                  <div className="mb-2">{error.message}</div>
                  {error.stack && (
                    <>
                      <div className="font-semibold mb-2">Stack:</div>
                      <div className="whitespace-pre-wrap">{error.stack}</div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// =============================================================================
// Specific Error Components
// =============================================================================

export function NotFoundError() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
          <CardDescription>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Button onClick={() => router.back()} variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button asChild className="w-full">
              <Link href={ROUTES.home}>
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ServerError({ retry }: { retry?: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl">Server Error</CardTitle>
          <CardDescription>
            We&apos;re experiencing technical difficulties. Please try again later.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            {retry && (
              <Button onClick={retry} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            <Button variant="outline" asChild className="w-full">
              <Link href={ROUTES.home}>
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button variant="ghost" asChild className="w-full">
              <a href={`mailto:support@${APP_CONFIG.name.toLowerCase()}.com`}>
                Contact Support
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =============================================================================
// Component-level Error Boundaries
// =============================================================================

interface ComponentErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export class ComponentErrorBoundary extends React.Component<
  ComponentErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ComponentErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      
      if (FallbackComponent && this.state.error) {
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      return <ComponentErrorFallback error={this.state.error} retry={this.retry} />;
    }

    return this.props.children;
  }
}

function ComponentErrorFallback({ retry }: { error?: Error; retry: () => void }) {
  return (
    <div className="flex items-center justify-center p-8">
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <h3 className="font-medium mb-2">Component Error</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This component failed to load properly.
          </p>
          <Button onClick={retry} size="sm" className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// =============================================================================
// API Error Handling
// =============================================================================

interface ApiErrorProps {
  error: Error | string;
  retry?: () => void;
  className?: string;
}

export function ApiError({ error, retry, className }: ApiErrorProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div className={cn('flex items-center justify-center p-4', className)}>
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-3" />
          <h3 className="font-medium mb-2">Error Loading Data</h3>
          <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>
          {retry && (
            <Button onClick={retry} size="sm" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// =============================================================================
// Hook for Error Handling
// =============================================================================

export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((errorInput: Error | string) => {
    const errorObj = typeof errorInput === 'string' ? new Error(errorInput) : errorInput;
    setError(errorObj);
    
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by useErrorHandler:', errorObj);
    }
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    hasError: error !== null,
  };
}