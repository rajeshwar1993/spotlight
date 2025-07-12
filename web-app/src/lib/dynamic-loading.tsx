/**
 * Dynamic loading utilities for code splitting and performance optimization
 */

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import React from 'react';

/**
 * Loading component for dynamic imports
 */
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

/**
 * Error component for dynamic import failures
 */
export const LoadingError = ({ error }: { error: Error }) => (
  <div className="flex items-center justify-center min-h-[200px] text-red-500">
    <div className="text-center">
      <h2 className="text-lg font-medium mb-2">Failed to load component</h2>
      <p className="text-sm">{error.message}</p>
    </div>
  </div>
);

/**
 * Dynamic component loader with error handling
 */
export function createDynamicComponent<T = {}>(
  componentImport: () => Promise<{ default: ComponentType<T> }>,
  options: {
    loading?: ComponentType;
    error?: ComponentType<{ error: Error }>;
    ssr?: boolean;
  } = {}
) {
  return dynamic(componentImport, {
    loading: options.loading || LoadingSpinner,
    ssr: options.ssr ?? true,
  });
}

/**
 * Route-based code splitting configuration
 */
export const routeConfig = {
  ssrRoutes: [
    '/',
    '/examples',
    '/mypage/[slug]',
    '/auth/signin',
    '/auth/signup',
  ],
  
  clientOnlyRoutes: [
    '/dashboard',
    '/dashboard/portfolios',
    '/dashboard/portfolios/enhanced',
    '/profile/dashboard',
    '/profile/settings',
    '/admin',
    '/create',
  ],
  
  preloadRoutes: [
    '/create',
    '/examples',
    '/dashboard',
  ],
};