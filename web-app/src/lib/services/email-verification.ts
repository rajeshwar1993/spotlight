/**
 * Email verification service
 */

/**
 * Resend verification email
 */
export async function resendVerificationEmail(): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to send verification email' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error resending verification email:', error);
    return { success: false, error: 'Failed to send verification email' };
  }
}

/**
 * Check if user's email is verified
 */
export async function checkEmailVerificationStatus(): Promise<{ isVerified: boolean; error?: string }> {
  try {
    const response = await fetch('/api/auth/verification-status');
    
    if (!response.ok) {
      return { isVerified: false, error: 'Failed to check verification status' };
    }

    const data = await response.json();
    return { isVerified: data.isVerified };
  } catch (error) {
    console.error('Error checking verification status:', error);
    return { isVerified: false, error: 'Failed to check verification status' };
  }
}

/**
 * Verification status service object
 */
export const emailVerificationService = {
  resendVerificationEmail,
  checkEmailVerificationStatus,
};