import { test, expect } from '@playwright/test';

test.describe('Visual Regression Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure animations are disabled for consistent screenshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    });
  });

  test.describe('Homepage Visual Tests', () => {
    test('should match homepage design across viewports', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Wait for dynamic content to load
      await page.waitForTimeout(2000);
      
      // Desktop view
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('homepage-desktop.png', {
        fullPage: true,
        threshold: 0.2,
        mask: [
          page.locator('[data-testid="animated-counter"]'),
          page.locator('[data-testid="current-time"]'),
        ],
      });
      
      // Tablet view
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('homepage-tablet.png', {
        fullPage: true,
        threshold: 0.2,
        mask: [
          page.locator('[data-testid="animated-counter"]'),
          page.locator('[data-testid="current-time"]'),
        ],
      });
      
      // Mobile view
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('homepage-mobile.png', {
        fullPage: true,
        threshold: 0.2,
        mask: [
          page.locator('[data-testid="animated-counter"]'),
          page.locator('[data-testid="current-time"]'),
        ],
      });
    });

    test('should match hero section design', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const heroSection = page.locator('[data-testid="hero-section"]');
      await expect(heroSection).toBeVisible();
      
      await expect(heroSection).toHaveScreenshot('hero-section.png', {
        threshold: 0.2,
        mask: [
          page.locator('[data-testid="animated-text"]'),
        ],
      });
    });

    test('should match navigation design', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const navigation = page.locator('[data-testid="main-navigation"]');
      await expect(navigation).toBeVisible();
      
      await expect(navigation).toHaveScreenshot('navigation.png', {
        threshold: 0.1,
      });
      
      // Test mobile navigation
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      
      const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
      await mobileMenuButton.click();
      
      const mobileMenu = page.locator('[data-testid="mobile-menu"]');
      await expect(mobileMenu).toBeVisible();
      
      await expect(mobileMenu).toHaveScreenshot('mobile-navigation.png', {
        threshold: 0.1,
      });
    });

    test('should match footer design', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const footer = page.locator('[data-testid="footer"]');
      await expect(footer).toBeVisible();
      
      await expect(footer).toHaveScreenshot('footer.png', {
        threshold: 0.1,
      });
    });
  });

  test.describe('Portfolio Creation Visual Tests', () => {
    test('should match portfolio creation flow design', async ({ page }) => {
      await page.goto('/create');
      await page.waitForLoadState('networkidle');
      
      // Step 1: Basic Information
      await expect(page).toHaveScreenshot('portfolio-creation-step1.png', {
        fullPage: true,
        threshold: 0.2,
      });
      
      // Fill out step 1
      await page.fill('[data-testid="full-name-input"]', 'John Doe');
      await page.fill('[data-testid="email-input"]', 'john@example.com');
      await page.locator('[data-testid="profession-select"]').selectOption('actor');
      await page.click('[data-testid="continue-button"]');
      
      // Step 2: Template Selection
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('portfolio-creation-step2.png', {
        fullPage: true,
        threshold: 0.2,
      });
      
      // Select template
      await page.click('[data-testid="template-t1"]');
      await page.click('[data-testid="continue-button"]');
      
      // Step 3: Bio and Details
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveScreenshot('portfolio-creation-step3.png', {
        fullPage: true,
        threshold: 0.2,
      });
    });

    test('should match template preview design', async ({ page }) => {
      await page.goto('/create');
      await page.waitForLoadState('networkidle');
      
      // Navigate to template selection
      await page.fill('[data-testid="full-name-input"]', 'John Doe');
      await page.fill('[data-testid="email-input"]', 'john@example.com');
      await page.locator('[data-testid="profession-select"]').selectOption('actor');
      await page.click('[data-testid="continue-button"]');
      
      // Test each template preview
      const templates = ['t1', 't2', 't3', 't4'];
      
      for (const template of templates) {
        const templateCard = page.locator(`[data-testid="template-${template}"]`);
        await expect(templateCard).toBeVisible();
        
        await expect(templateCard).toHaveScreenshot(`template-${template}-preview.png`, {
          threshold: 0.1,
        });
      }
    });

    test('should match form validation states', async ({ page }) => {
      await page.goto('/create');
      await page.waitForLoadState('networkidle');
      
      // Test error states
      await page.click('[data-testid="continue-button"]');
      
      await expect(page).toHaveScreenshot('form-validation-errors.png', {
        fullPage: true,
        threshold: 0.2,
      });
      
      // Test success states
      await page.fill('[data-testid="full-name-input"]', 'John Doe');
      await page.fill('[data-testid="email-input"]', 'john@example.com');
      await page.locator('[data-testid="profession-select"]').selectOption('actor');
      
      await expect(page).toHaveScreenshot('form-validation-success.png', {
        fullPage: true,
        threshold: 0.2,
      });
    });
  });

  test.describe('Dashboard Visual Tests', () => {
    test('should match dashboard design', async ({ page }) => {
      // Mock authentication
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
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('dashboard-main.png', {
        fullPage: true,
        threshold: 0.3,
        mask: [
          page.locator('[data-testid="user-avatar"]'),
          page.locator('[data-testid="last-activity"]'),
        ],
      });
    });

    test('should match portfolio management design', async ({ page }) => {
      // Mock authentication and portfolios
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
      
      await page.route('/api/portfolios', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            portfolios: [
              {
                id: 'portfolio-1',
                title: 'John Doe Portfolio',
                is_published: true,
                created_at: '2023-01-01T00:00:00Z',
              },
              {
                id: 'portfolio-2',
                title: 'Jane Smith Portfolio',
                is_published: false,
                created_at: '2023-01-02T00:00:00Z',
              },
            ],
          }),
        });
      });
      
      await page.goto('/dashboard/portfolios');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('portfolio-management.png', {
        fullPage: true,
        threshold: 0.3,
        mask: [
          page.locator('[data-testid="created-date"]'),
        ],
      });
    });

    test('should match profile settings design', async ({ page }) => {
      // Mock authentication
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
      
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('profile-settings.png', {
        fullPage: true,
        threshold: 0.3,
        mask: [
          page.locator('[data-testid="user-avatar"]'),
          page.locator('[data-testid="last-login"]'),
        ],
      });
    });
  });

  test.describe('Public Portfolio Visual Tests', () => {
    test('should match public portfolio design for each template', async ({ page }) => {
      // Mock portfolio data
      await page.route('/api/portfolios/slug/*', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            portfolio: {
              id: 'portfolio-1',
              title: 'John Doe',
              profession: 'actor',
              bio: 'Experienced actor with 10+ years in theater and film.',
              template_id: 'T1',
              images: [
                { url: '/placeholder-image.jpg', alt: 'Portfolio image' },
              ],
              is_published: true,
            },
          }),
        });
      });
      
      const templates = ['T1', 'T2', 'T3', 'T4'];
      
      for (const template of templates) {
        // Update mock to return different template
        await page.route('/api/portfolios/slug/*', (route) => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              portfolio: {
                id: 'portfolio-1',
                title: 'John Doe',
                profession: 'actor',
                bio: 'Experienced actor with 10+ years in theater and film.',
                template_id: template,
                images: [
                  { url: '/placeholder-image.jpg', alt: 'Portfolio image' },
                ],
                is_published: true,
              },
            }),
          });
        });
        
        await page.goto('/mypage/john-doe');
        await page.waitForLoadState('networkidle');
        
        await expect(page).toHaveScreenshot(`public-portfolio-${template.toLowerCase()}.png`, {
          fullPage: true,
          threshold: 0.3,
          mask: [
            page.locator('[data-testid="view-count"]'),
          ],
        });
      }
    });

    test('should match portfolio sharing modal design', async ({ page }) => {
      // Mock portfolio data
      await page.route('/api/portfolios/slug/*', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            portfolio: {
              id: 'portfolio-1',
              title: 'John Doe',
              profession: 'actor',
              bio: 'Experienced actor with 10+ years in theater and film.',
              template_id: 'T1',
              images: [],
              is_published: true,
            },
          }),
        });
      });
      
      await page.goto('/mypage/john-doe');
      await page.waitForLoadState('networkidle');
      
      // Open share modal
      await page.click('[data-testid="share-button"]');
      
      const shareModal = page.locator('[data-testid="share-modal"]');
      await expect(shareModal).toBeVisible();
      
      await expect(shareModal).toHaveScreenshot('portfolio-share-modal.png', {
        threshold: 0.1,
      });
    });
  });

  test.describe('Examples Page Visual Tests', () => {
    test('should match examples page design', async ({ page }) => {
      // Mock portfolio data
      await page.route('/api/portfolios/discover', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            portfolios: [
              {
                id: 'portfolio-1',
                title: 'John Doe',
                profession: 'actor',
                template_id: 'T1',
                images: [{ url: '/placeholder-image.jpg', alt: 'Portfolio image' }],
                is_published: true,
              },
              {
                id: 'portfolio-2',
                title: 'Jane Smith',
                profession: 'model',
                template_id: 'T2',
                images: [{ url: '/placeholder-image.jpg', alt: 'Portfolio image' }],
                is_published: true,
              },
            ],
            totalCount: 2,
            hasMore: false,
          }),
        });
      });
      
      await page.goto('/examples');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('examples-page.png', {
        fullPage: true,
        threshold: 0.3,
      });
    });

    test('should match portfolio cards design', async ({ page }) => {
      // Mock portfolio data
      await page.route('/api/portfolios/discover', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            portfolios: [
              {
                id: 'portfolio-1',
                title: 'John Doe',
                profession: 'actor',
                template_id: 'T1',
                images: [{ url: '/placeholder-image.jpg', alt: 'Portfolio image' }],
                is_published: true,
              },
            ],
            totalCount: 1,
            hasMore: false,
          }),
        });
      });
      
      await page.goto('/examples');
      await page.waitForLoadState('networkidle');
      
      const portfolioCard = page.locator('[data-testid="portfolio-card"]').first();
      await expect(portfolioCard).toBeVisible();
      
      await expect(portfolioCard).toHaveScreenshot('portfolio-card.png', {
        threshold: 0.2,
      });
    });

    test('should match filter panel design', async ({ page }) => {
      await page.goto('/examples');
      await page.waitForLoadState('networkidle');
      
      const filterPanel = page.locator('[data-testid="filter-panel"]');
      await expect(filterPanel).toBeVisible();
      
      await expect(filterPanel).toHaveScreenshot('filter-panel.png', {
        threshold: 0.1,
      });
    });
  });

  test.describe('Error Page Visual Tests', () => {
    test('should match 404 page design', async ({ page }) => {
      await page.goto('/nonexistent-page');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('404-page.png', {
        fullPage: true,
        threshold: 0.2,
      });
    });

    test('should match error boundary design', async ({ page }) => {
      // Mock an error
      await page.route('/api/portfolios', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' }),
        });
      });
      
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      const errorBoundary = page.locator('[data-testid="error-boundary"]');
      if (await errorBoundary.count() > 0) {
        await expect(errorBoundary).toHaveScreenshot('error-boundary.png', {
          threshold: 0.2,
        });
      }
    });
  });

  test.describe('Component Visual Tests', () => {
    test('should match button component variations', async ({ page }) => {
      await page.goto('/components/buttons'); // Assuming a components showcase page
      await page.waitForLoadState('networkidle');
      
      // Test different button variants
      const buttonVariants = ['primary', 'secondary', 'outline', 'ghost'];
      
      for (const variant of buttonVariants) {
        const button = page.locator(`[data-testid="button-${variant}"]`);
        if (await button.count() > 0) {
          await expect(button).toHaveScreenshot(`button-${variant}.png`, {
            threshold: 0.1,
          });
        }
      }
    });

    test('should match form component variations', async ({ page }) => {
      await page.goto('/create');
      await page.waitForLoadState('networkidle');
      
      // Test different form states
      const formElements = [
        '[data-testid="full-name-input"]',
        '[data-testid="email-input"]',
        '[data-testid="profession-select"]',
      ];
      
      for (const element of formElements) {
        const formElement = page.locator(element);
        await expect(formElement).toBeVisible();
        
        await expect(formElement).toHaveScreenshot(`form-${element.split('-')[2]}.png`, {
          threshold: 0.1,
        });
      }
    });

    test('should match loading states', async ({ page }) => {
      // Mock slow API response
      await page.route('/api/portfolios', (route) => {
        setTimeout(() => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ portfolios: [] }),
          });
        }, 2000);
      });
      
      await page.goto('/dashboard');
      
      // Capture loading state
      const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
      if (await loadingSpinner.count() > 0) {
        await expect(loadingSpinner).toHaveScreenshot('loading-spinner.png', {
          threshold: 0.1,
        });
      }
    });
  });

  test.describe('Dark Mode Visual Tests', () => {
    test('should match dark mode design', async ({ page }) => {
      // Enable dark mode
      await page.emulateMedia({ colorScheme: 'dark' });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('homepage-dark-mode.png', {
        fullPage: true,
        threshold: 0.3,
        mask: [
          page.locator('[data-testid="animated-counter"]'),
          page.locator('[data-testid="current-time"]'),
        ],
      });
    });

    test('should match dark mode dashboard', async ({ page }) => {
      // Enable dark mode
      await page.emulateMedia({ colorScheme: 'dark' });
      
      // Mock authentication
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
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('dashboard-dark-mode.png', {
        fullPage: true,
        threshold: 0.3,
        mask: [
          page.locator('[data-testid="user-avatar"]'),
          page.locator('[data-testid="last-activity"]'),
        ],
      });
    });
  });

  test.describe('Print Styles Visual Tests', () => {
    test('should match print styles for portfolios', async ({ page }) => {
      // Mock portfolio data
      await page.route('/api/portfolios/slug/*', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            portfolio: {
              id: 'portfolio-1',
              title: 'John Doe',
              profession: 'actor',
              bio: 'Experienced actor with 10+ years in theater and film.',
              template_id: 'T1',
              images: [],
              is_published: true,
            },
          }),
        });
      });
      
      await page.goto('/mypage/john-doe');
      await page.waitForLoadState('networkidle');
      
      // Emulate print media
      await page.emulateMedia({ media: 'print' });
      
      await expect(page).toHaveScreenshot('portfolio-print-style.png', {
        fullPage: true,
        threshold: 0.3,
      });
    });
  });
});