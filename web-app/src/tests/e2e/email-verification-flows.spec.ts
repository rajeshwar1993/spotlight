import { test, expect } from '@playwright/test';

test.describe('Email Verification Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start with a fresh session
    await page.context().clearCookies();
    await page.goto('/');
  });

  test.describe('Sign Up Email Verification', () => {
    test('should send verification email on sign up', async ({ page }) => {
      await page.goto('/auth/signup');
      
      // Fill out sign up form
      await page.fill('[data-testid="full-name-input"]', 'Test User');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
      await page.fill('[data-testid="confirm-password-input"]', 'SecurePassword123!');
      
      // Accept terms
      await page.check('[data-testid="terms-checkbox"]');
      
      // Submit form
      await page.click('[data-testid="signup-button"]');
      
      // Should redirect to verification page
      await expect(page).toHaveURL('/auth/verify-email');
      
      // Should show verification message
      const verificationMessage = page.locator('[data-testid="verification-message"]');
      await expect(verificationMessage).toBeVisible();
      await expect(verificationMessage).toContainText('test@example.com');
    });

    test('should show resend verification button', async ({ page }) => {
      await page.goto('/auth/signup');
      
      // Complete sign up process
      await page.fill('[data-testid="full-name-input"]', 'Test User');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
      await page.fill('[data-testid="confirm-password-input"]', 'SecurePassword123!');
      await page.check('[data-testid="terms-checkbox"]');
      await page.click('[data-testid="signup-button"]');
      
      // Should be on verification page
      await expect(page).toHaveURL('/auth/verify-email');
      
      // Should have resend button
      const resendButton = page.locator('[data-testid="resend-verification-button"]');
      await expect(resendButton).toBeVisible();
      await expect(resendButton).toBeEnabled();
    });

    test('should handle resend verification email', async ({ page }) => {
      await page.goto('/auth/signup');
      
      // Complete sign up process
      await page.fill('[data-testid="full-name-input"]', 'Test User');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
      await page.fill('[data-testid="confirm-password-input"]', 'SecurePassword123!');
      await page.check('[data-testid="terms-checkbox"]');
      await page.click('[data-testid="signup-button"]');
      
      // Click resend button
      const resendButton = page.locator('[data-testid="resend-verification-button"]');
      await resendButton.click();
      
      // Should show success message
      const successMessage = page.locator('[data-testid="resend-success-message"]');
      await expect(successMessage).toBeVisible();
      await expect(successMessage).toContainText('Verification email sent');
      
      // Button should be disabled temporarily
      await expect(resendButton).toBeDisabled();
    });

    test('should handle email verification API errors', async ({ page }) => {
      // Mock API to return error
      await page.route('/api/auth/resend-verification', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' }),
        });
      });
      
      await page.goto('/auth/signup');
      
      // Complete sign up process
      await page.fill('[data-testid="full-name-input"]', 'Test User');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
      await page.fill('[data-testid="confirm-password-input"]', 'SecurePassword123!');
      await page.check('[data-testid="terms-checkbox"]');
      await page.click('[data-testid="signup-button"]');
      
      // Try to resend verification
      const resendButton = page.locator('[data-testid="resend-verification-button"]');
      await resendButton.click();
      
      // Should show error message
      const errorMessage = page.locator('[data-testid="resend-error-message"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText('Failed to send verification email');
    });
  });

  test.describe('Email Verification Process', () => {
    test('should verify email with valid token', async ({ page }) => {
      // Simulate clicking verification link
      const validToken = 'valid-verification-token-123';
      await page.goto(`/auth/verify-email?token=${validToken}`);
      
      // Should show verification success
      const successMessage = page.locator('[data-testid="verification-success"]');
      await expect(successMessage).toBeVisible();
      await expect(successMessage).toContainText('Email verified successfully');
      
      // Should have button to continue to dashboard
      const continueButton = page.locator('[data-testid="continue-to-dashboard"]');
      await expect(continueButton).toBeVisible();
      await continueButton.click();
      
      // Should redirect to dashboard
      await expect(page).toHaveURL('/dashboard');
    });

    test('should handle invalid verification token', async ({ page }) => {
      // Mock API to return invalid token error
      await page.route('/api/auth/verify-email*', (route) => {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid verification token' }),
        });
      });
      
      const invalidToken = 'invalid-token-123';
      await page.goto(`/auth/verify-email?token=${invalidToken}`);
      
      // Should show error message
      const errorMessage = page.locator('[data-testid="verification-error"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText('Invalid verification token');
      
      // Should have button to resend verification
      const resendButton = page.locator('[data-testid="resend-verification-button"]');
      await expect(resendButton).toBeVisible();
    });

    test('should handle expired verification token', async ({ page }) => {
      // Mock API to return expired token error
      await page.route('/api/auth/verify-email*', (route) => {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Verification token expired' }),
        });
      });
      
      const expiredToken = 'expired-token-123';
      await page.goto(`/auth/verify-email?token=${expiredToken}`);
      
      // Should show expired message
      const expiredMessage = page.locator('[data-testid="verification-expired"]');
      await expect(expiredMessage).toBeVisible();
      await expect(expiredMessage).toContainText('Verification link has expired');
      
      // Should have button to get new verification email
      const resendButton = page.locator('[data-testid="resend-verification-button"]');
      await expect(resendButton).toBeVisible();
    });
  });

  test.describe('Email Verification Banners', () => {
    test('should show verification banner for unverified users', async ({ page }) => {
      // Mock unverified user state
      await page.route('/api/auth/user', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'user-123',
              email: 'test@example.com',
              email_verified: false,
            },
          }),
        });
      });
      
      await page.goto('/dashboard');
      
      // Should show verification banner
      const verificationBanner = page.locator('[data-testid="email-verification-banner"]');
      await expect(verificationBanner).toBeVisible();
      await expect(verificationBanner).toContainText('Please verify your email address');
      
      // Should have resend button in banner
      const resendButton = verificationBanner.locator('[data-testid="resend-verification-button"]');
      await expect(resendButton).toBeVisible();
    });

    test('should not show verification banner for verified users', async ({ page }) => {
      // Mock verified user state
      await page.route('/api/auth/user', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'user-123',
              email: 'test@example.com',
              email_verified: true,
            },
          }),
        });
      });
      
      await page.goto('/dashboard');
      
      // Should not show verification banner
      const verificationBanner = page.locator('[data-testid="email-verification-banner"]');
      await expect(verificationBanner).not.toBeVisible();
    });

    test('should dismiss verification banner', async ({ page }) => {
      // Mock unverified user state
      await page.route('/api/auth/user', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'user-123',
              email: 'test@example.com',
              email_verified: false,
            },
          }),
        });
      });
      
      await page.goto('/dashboard');
      
      // Should show verification banner
      const verificationBanner = page.locator('[data-testid="email-verification-banner"]');
      await expect(verificationBanner).toBeVisible();
      
      // Click dismiss button
      const dismissButton = verificationBanner.locator('[data-testid="dismiss-banner"]');
      await dismissButton.click();
      
      // Banner should be hidden
      await expect(verificationBanner).not.toBeVisible();
    });
  });

  test.describe('Portfolio Publishing Restrictions', () => {
    test('should prevent portfolio publishing for unverified users', async ({ page }) => {
      // Mock unverified user state
      await page.route('/api/auth/user', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'user-123',
              email: 'test@example.com',
              email_verified: false,
            },
          }),
        });
      });
      
      // Mock portfolio data
      await page.route('/api/portfolios', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            portfolios: [
              {
                id: 'portfolio-123',
                title: 'Test Portfolio',
                is_published: false,
                user_id: 'user-123',
              },
            ],
          }),
        });
      });
      
      await page.goto('/dashboard/portfolios');
      
      // Try to publish portfolio
      const publishButton = page.locator('[data-testid="publish-portfolio-button"]');
      await publishButton.click();
      
      // Should show verification requirement message
      const verificationModal = page.locator('[data-testid="verification-required-modal"]');
      await expect(verificationModal).toBeVisible();
      await expect(verificationModal).toContainText('Email verification required');
      
      // Should have button to resend verification
      const resendButton = verificationModal.locator('[data-testid="resend-verification-button"]');
      await expect(resendButton).toBeVisible();
    });

    test('should allow portfolio publishing for verified users', async ({ page }) => {
      // Mock verified user state
      await page.route('/api/auth/user', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'user-123',
              email: 'test@example.com',
              email_verified: true,
            },
          }),
        });
      });
      
      // Mock portfolio data
      await page.route('/api/portfolios', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            portfolios: [
              {
                id: 'portfolio-123',
                title: 'Test Portfolio',
                is_published: false,
                user_id: 'user-123',
              },
            ],
          }),
        });
      });
      
      // Mock successful publish
      await page.route('/api/portfolios/portfolio-123/publish', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      });
      
      await page.goto('/dashboard/portfolios');
      
      // Should be able to publish portfolio
      const publishButton = page.locator('[data-testid="publish-portfolio-button"]');
      await publishButton.click();
      
      // Should show success message
      const successMessage = page.locator('[data-testid="publish-success-message"]');
      await expect(successMessage).toBeVisible();
      await expect(successMessage).toContainText('Portfolio published successfully');
    });
  });

  test.describe('Email Verification Status Integration', () => {
    test('should show verification status in user menu', async ({ page }) => {
      // Mock unverified user state
      await page.route('/api/auth/user', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'user-123',
              email: 'test@example.com',
              email_verified: false,
            },
          }),
        });
      });
      
      await page.goto('/dashboard');
      
      // Open user menu
      const userMenuButton = page.locator('[data-testid="user-menu-button"]');
      await userMenuButton.click();
      
      // Should show verification status
      const verificationStatus = page.locator('[data-testid="verification-status"]');
      await expect(verificationStatus).toBeVisible();
      await expect(verificationStatus).toContainText('Unverified');
      
      // Should have verify email link
      const verifyEmailLink = page.locator('[data-testid="verify-email-link"]');
      await expect(verifyEmailLink).toBeVisible();
    });

    test('should show verified badge for verified users', async ({ page }) => {
      // Mock verified user state
      await page.route('/api/auth/user', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'user-123',
              email: 'test@example.com',
              email_verified: true,
            },
          }),
        });
      });
      
      await page.goto('/dashboard');
      
      // Open user menu
      const userMenuButton = page.locator('[data-testid="user-menu-button"]');
      await userMenuButton.click();
      
      // Should show verified badge
      const verifiedBadge = page.locator('[data-testid="verified-badge"]');
      await expect(verifiedBadge).toBeVisible();
      await expect(verifiedBadge).toContainText('Verified');
    });
  });

  test.describe('Email Verification Edge Cases', () => {
    test('should handle email verification for existing users', async ({ page }) => {
      // Mock existing user trying to verify again
      await page.route('/api/auth/verify-email*', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ 
            message: 'Email already verified',
            already_verified: true,
          }),
        });
      });
      
      const token = 'already-verified-token';
      await page.goto(`/auth/verify-email?token=${token}`);
      
      // Should show already verified message
      const alreadyVerifiedMessage = page.locator('[data-testid="already-verified-message"]');
      await expect(alreadyVerifiedMessage).toBeVisible();
      await expect(alreadyVerifiedMessage).toContainText('Email already verified');
      
      // Should have button to go to dashboard
      const dashboardButton = page.locator('[data-testid="go-to-dashboard"]');
      await expect(dashboardButton).toBeVisible();
    });

    test('should handle network errors during verification', async ({ page }) => {
      // Mock network error
      await page.route('/api/auth/verify-email*', (route) => {
        route.abort('failed');
      });
      
      const token = 'network-error-token';
      await page.goto(`/auth/verify-email?token=${token}`);
      
      // Should show network error message
      const networkErrorMessage = page.locator('[data-testid="network-error-message"]');
      await expect(networkErrorMessage).toBeVisible();
      await expect(networkErrorMessage).toContainText('Network error');
      
      // Should have retry button
      const retryButton = page.locator('[data-testid="retry-verification"]');
      await expect(retryButton).toBeVisible();
    });

    test('should handle verification timeout', async ({ page }) => {
      // Mock slow API response
      await page.route('/api/auth/verify-email*', (route) => {
        setTimeout(() => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true }),
          });
        }, 30000); // 30 second delay
      });
      
      const token = 'timeout-token';
      await page.goto(`/auth/verify-email?token=${token}`);
      
      // Should show loading state
      const loadingMessage = page.locator('[data-testid="verification-loading"]');
      await expect(loadingMessage).toBeVisible();
      
      // Should show timeout message after timeout
      const timeoutMessage = page.locator('[data-testid="verification-timeout"]');
      await expect(timeoutMessage).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Email Verification Internationalization', () => {
    test('should support multiple languages for verification messages', async ({ page }) => {
      // Test English (default)
      await page.goto('/auth/verify-email?token=test-token');
      const englishMessage = page.locator('[data-testid="verification-message"]');
      await expect(englishMessage).toContainText('verify your email');
      
      // Test Spanish
      await page.goto('/es/auth/verify-email?token=test-token');
      const spanishMessage = page.locator('[data-testid="verification-message"]');
      await expect(spanishMessage).toContainText('verificar tu correo');
      
      // Test French
      await page.goto('/fr/auth/verify-email?token=test-token');
      const frenchMessage = page.locator('[data-testid="verification-message"]');
      await expect(frenchMessage).toContainText('vérifier votre email');
    });
  });
});