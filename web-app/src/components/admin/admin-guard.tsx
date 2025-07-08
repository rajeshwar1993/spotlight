'use client';

import { useUser } from '@/hooks/use-user';
import { useEffect, useState } from 'react';

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ADMIN_EMAILS = [
  'admin@spotlight.com',
  'rajeshwarrudra@gmail.com',
  // Add more admin emails as needed
];

export function AdminGuard({ children, fallback }: AdminGuardProps) {
  const { user, loading, isAuthenticated } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const adminStatus = ADMIN_EMAILS.includes(user.email || '');
      setIsAdmin(adminStatus);
      setAdminLoading(false);
    } else if (!loading && !isAuthenticated) {
      setAdminLoading(false);
    }
  }, [loading, isAuthenticated, user]);

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please sign in to access this page.</p>
          <a href="/auth/signin" className="text-blue-600 hover:text-blue-700">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don&apos;t have permission to access this page.</p>
          <a href="/dashboard" className="text-blue-600 hover:text-blue-700">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook to check if current user is admin
export function useAdmin() {
  const { user, loading, isAuthenticated } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const adminStatus = ADMIN_EMAILS.includes(user.email || '');
      setIsAdmin(adminStatus);
    }
  }, [loading, isAuthenticated, user]);

  return {
    isAdmin,
    loading,
    isAuthenticated,
  };
}