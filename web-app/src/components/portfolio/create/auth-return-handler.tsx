'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

/**
 * Component to handle returning users after authentication
 * during the portfolio creation flow
 */
export function AuthReturnHandler() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Check if user was in the middle of portfolio creation
      const returnStep = sessionStorage.getItem('portfolio-creation-return-step');
      
      if (returnStep) {
        // Clear the return step
        sessionStorage.removeItem('portfolio-creation-return-step');
        
        // Redirect to the appropriate step
        const step = parseInt(returnStep);
        if (step >= 1 && step <= 3) {
          router.push(`/create/step/${step}`);
        } else {
          router.push('/create/step/1');
        }
      }
    }
  }, [user, loading, router]);

  return null;
}

/**
 * Hook to check if user should be redirected back to portfolio creation
 */
export function useAuthReturn() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const checkAndRedirect = () => {
    if (!loading && user) {
      const returnStep = sessionStorage.getItem('portfolio-creation-return-step');
      
      if (returnStep) {
        sessionStorage.removeItem('portfolio-creation-return-step');
        
        const step = parseInt(returnStep);
        if (step >= 1 && step <= 3) {
          router.push(`/create/step/${step}`);
          return true;
        }
      }
    }
    return false;
  };

  return { checkAndRedirect };
}