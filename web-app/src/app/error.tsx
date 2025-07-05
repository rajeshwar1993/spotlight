'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react';
// Temporarily disable next-intl
// import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES, APP_CONFIG } from '@/lib/constants';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  // const t = useTranslations('errors.500');
  const [showDetails, setShowDetails] = React.useState(false);

  React.useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Page Error:', error);
    }

    // Here you would typically send error to monitoring service
    // Example: Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-red-50/30 to-red-100/50 dark:from-background dark:via-red-950/30 dark:to-red-900/20">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-2">
            <div className="text-6xl font-bold text-red-600 dark:text-red-400">
              500
            </div>
            <CardTitle className="text-2xl">Something Went Wrong</CardTitle>
            <CardDescription className="text-base">
              We&apos;re experiencing technical difficulties. Please try again later.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-3">
            <Button onClick={reset} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href={ROUTES.home}>
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>

          {/* Error Details for Development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full text-xs mb-2"
              >
                <Bug className="w-3 h-3 mr-1" />
                {showDetails ? 'Hide' : 'Show'} Error Details
              </Button>
              
              {showDetails && (
                <div className="p-3 bg-muted rounded-md text-xs font-mono text-left max-h-40 overflow-auto">
                  <div className="font-semibold mb-2">Error:</div>
                  <div className="mb-2 text-red-600 dark:text-red-400">
                    {error.message}
                  </div>
                  {error.digest && (
                    <>
                      <div className="font-semibold mb-2">Digest:</div>
                      <div className="mb-2">{error.digest}</div>
                    </>
                  )}
                  {error.stack && (
                    <>
                      <div className="font-semibold mb-2">Stack:</div>
                      <div className="whitespace-pre-wrap text-xs">
                        {error.stack}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Contact Support */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">
              If this problem persists, please contact support
            </p>
            <Button variant="ghost" size="sm" asChild>
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