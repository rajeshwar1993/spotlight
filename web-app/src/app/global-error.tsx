'use client';

import * as React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  React.useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Global Error:', error);
    }

    // Here you would typically send error to monitoring service
    // Example: Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="bg-background text-foreground font-sans antialiased">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
              <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              
              <div className="space-y-2 mb-6">
                <h1 className="text-2xl font-bold">Application Error</h1>
                <p className="text-muted-foreground">
                  A critical error has occurred. We apologize for the inconvenience.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={reset}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
                
                <button
                  onClick={() => window.location.href = '/'}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </button>
              </div>

              {/* Error Details for Development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-6 pt-4 border-t text-left">
                  <details className="text-xs">
                    <summary className="cursor-pointer font-medium mb-2">
                      Error Details (Development)
                    </summary>
                    <div className="p-3 bg-muted rounded-md font-mono max-h-40 overflow-auto">
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
                          <div className="whitespace-pre-wrap">
                            {error.stack}
                          </div>
                        </>
                      )}
                    </div>
                  </details>
                </div>
              )}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}