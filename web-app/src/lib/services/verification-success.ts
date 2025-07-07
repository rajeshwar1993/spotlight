/**
 * Email verification success handling utilities
 */

/**
 * Handle successful email verification
 * This can be called when email verification is detected
 */
export function handleVerificationSuccess() {
  // Store success state in localStorage for cross-tab communication
  localStorage.setItem('email_verification_success', 'true');
  localStorage.setItem('email_verification_success_timestamp', Date.now().toString());
  
  // Dispatch a custom event for components to listen to
  window.dispatchEvent(new CustomEvent('emailVerificationSuccess', {
    detail: { timestamp: Date.now() }
  }));
}

/**
 * Check if verification success should be shown
 */
export function shouldShowVerificationSuccess(): boolean {
  const success = localStorage.getItem('email_verification_success');
  const timestamp = localStorage.getItem('email_verification_success_timestamp');
  
  if (!success || !timestamp) {
    return false;
  }
  
  // Show success message for 5 minutes
  const fiveMinutes = 5 * 60 * 1000;
  const timeSinceSuccess = Date.now() - parseInt(timestamp);
  
  return timeSinceSuccess < fiveMinutes;
}

/**
 * Clear verification success state
 */
export function clearVerificationSuccess() {
  localStorage.removeItem('email_verification_success');
  localStorage.removeItem('email_verification_success_timestamp');
}

/**
 * Hook for listening to verification success events
 */
export function useVerificationSuccessListener(callback: () => void) {
  const handleSuccess = () => {
    callback();
  };

  // Listen for the custom event
  if (typeof window !== 'undefined') {
    window.addEventListener('emailVerificationSuccess', handleSuccess);
    
    return () => {
      window.removeEventListener('emailVerificationSuccess', handleSuccess);
    };
  }
  
  return () => {};
}