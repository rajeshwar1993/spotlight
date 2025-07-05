'use client';

import React from 'react';
import { TemplateType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TemplateErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface TemplateErrorBoundaryProps {
  templateType: TemplateType;
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    templateType: TemplateType;
    error: Error;
    resetError: () => void;
  }>;
}

export class TemplateErrorBoundary extends React.Component<
  TemplateErrorBoundaryProps,
  TemplateErrorBoundaryState
> {
  constructor(props: TemplateErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): TemplateErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Template Error Boundary caught an error:', error, errorInfo);
    }

    // In production, you might want to log to an error reporting service
    // reportError(error, errorInfo, { templateType: this.props.templateType });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;
      
      if (Fallback && this.state.error) {
        return (
          <Fallback
            templateType={this.props.templateType}
            error={this.state.error}
            resetError={this.resetError}
          />
        );
      }

      return (
        <TemplateErrorFallback
          templateType={this.props.templateType}
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

// Default error fallback component
interface TemplateErrorFallbackProps {
  templateType: TemplateType;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  onRetry: () => void;
}

function TemplateErrorFallback({ 
  templateType, 
  error, 
  errorInfo,
  onRetry 
}: TemplateErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-[500px] flex items-center justify-center p-8 bg-gray-50">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
          <CardTitle className="text-xl text-red-900">
            Template Loading Error
          </CardTitle>
          <CardDescription>
            There was an error loading the {templateType} template. This might be a temporary issue.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Error details for development */}
          {isDevelopment && error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-2">Error Details:</h4>
              <p className="text-sm text-red-700 font-mono mb-2">
                {error.name}: {error.message}
              </p>
              {error.stack && (
                <details className="text-xs text-red-600">
                  <summary className="cursor-pointer font-medium">Stack Trace</summary>
                  <pre className="mt-2 whitespace-pre-wrap">{error.stack}</pre>
                </details>
              )}
              {errorInfo && (
                <details className="text-xs text-red-600 mt-2">
                  <summary className="cursor-pointer font-medium">Component Stack</summary>
                  <pre className="mt-2 whitespace-pre-wrap">{errorInfo.componentStack}</pre>
                </details>
              )}
            </div>
          )}

          {/* User-friendly error information */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">What you can try:</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 flex-shrink-0" />
                Click the retry button below
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 flex-shrink-0" />
                Try selecting a different template
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 flex-shrink-0" />
                Refresh the page
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 flex-shrink-0" />
                Check your internet connection
              </li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={onRetry}
              className="flex-1"
            >
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              Try Again
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              Refresh Page
            </Button>
          </div>

          {/* Template information */}
          <div className="pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Template: {templateType} | 
              Time: {new Date().toLocaleTimeString()} |
              {isDevelopment ? ' Development Mode' : ' Production Mode'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for functional components to use error boundary
export function useTemplateErrorHandler(templateType: TemplateType) {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
    console.error(`Template ${templateType} error:`, error);
  }, [templateType]);

  return {
    error,
    resetError,
    handleError,
    hasError: error !== null
  };
}

export default TemplateErrorBoundary;