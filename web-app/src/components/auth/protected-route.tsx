'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireEmailVerification?: boolean;
}

export function ProtectedRoute({ 
  children, 
  redirectTo = '/auth/signin', 
  requireEmailVerification = false 
}: ProtectedRouteProps) {
  const { loading, isAuthenticated, isEmailVerified } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      if (requireEmailVerification && !isEmailVerified) {
        router.push('/auth/verify');
        return;
      }
    }
  }, [loading, isAuthenticated, isEmailVerified, requireEmailVerification, router, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireEmailVerification && !isEmailVerified) {
    return null;
  }

  return <>{children}</>;
}