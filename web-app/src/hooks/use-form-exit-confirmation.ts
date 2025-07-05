'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UseFormExitConfirmationOptions {
  hasUnsavedChanges: boolean;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function useFormExitConfirmation({
  hasUnsavedChanges,
  message = 'You have unsaved changes. Are you sure you want to leave this page?',
  onConfirm,
  onCancel,
}: UseFormExitConfirmationOptions) {
  const router = useRouter();
  const isNavigatingRef = useRef(false);

  // Handle browser refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, message]);

  // Handle programmatic navigation
  const confirmNavigation = useCallback(
    (url: string) => {
      if (!hasUnsavedChanges) {
        router.push(url);
        return;
      }

      if (isNavigatingRef.current) {
        return;
      }

      const confirmed = window.confirm(message);
      
      if (confirmed) {
        isNavigatingRef.current = true;
        onConfirm?.();
        router.push(url);
      } else {
        onCancel?.();
      }
    },
    [hasUnsavedChanges, message, router, onConfirm, onCancel]
  );

  // Safe navigation function
  const safeNavigate = useCallback(
    (url: string) => {
      confirmNavigation(url);
    },
    [confirmNavigation]
  );

  // Allow navigation without confirmation
  const allowNavigation = useCallback(() => {
    isNavigatingRef.current = true;
  }, []);

  return {
    safeNavigate,
    allowNavigation,
    hasUnsavedChanges,
  };
}