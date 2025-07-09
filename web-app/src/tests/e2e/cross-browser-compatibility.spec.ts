import { test, expect } from '@playwright/test';
import { CrossBrowserTestUtils, browserTestConfigs, responsiveBreakpoints } from './utils/cross-browser-utils';

test.describe('Cross-Browser Compatibility Tests', () => {
  let crossBrowserUtils: CrossBrowserTestUtils;
  
  test.beforeEach(async ({ page }) => {
    crossBrowserUtils = new CrossBrowserTestUtils(page);
    await page.goto('/');
  });

  test.describe('Browser Feature Support', () => {
    test('should support CSS features across browsers', async ({ page, browserName }) => {
      const config = browserTestConfigs[browserName as keyof typeof browserTestConfigs];
      if (!config) {
        test.skip(`No configuration found for browser: ${browserName}`);
      }

      const featureSupport = await crossBrowserUtils.testCSSFeatureSupport(config.features);
      
      // Log results for debugging
      console.log(`CSS Feature Support - ${browserName}:`, featureSupport);
      
      // Core features should be supported
      expect(featureSupport['display: grid']).toBe(true);
      expect(featureSupport['display: flex']).toBe(true);
      
      // Browser-specific feature checks
      if (browserName === 'webkit') {
        // Safari-specific checks
        expect(featureSupport['-webkit-backdrop-filter: blur(10px)']).toBe(true);
      } else if (browserName === 'chromium') {
        // Chrome-specific checks
        expect(featureSupport['backdrop-filter: blur(10px)']).toBe(true);
      }
    });

    test('should support JavaScript APIs across browsers', async ({ page, browserName }) => {
      const config = browserTestConfigs[browserName as keyof typeof browserTestConfigs];
      if (!config) {
        test.skip(`No configuration found for browser: ${browserName}`);
      }

      const apiSupport = await crossBrowserUtils.testJavaScriptAPISupport(config.apis);
      
      // Log results for debugging
      console.log(`JavaScript API Support - ${browserName}:`, apiSupport);
      
      // Core APIs should be supported
      expect(apiSupport['fetch']).toBe(true);
      expect(apiSupport['IntersectionObserver']).toBe(true);
      expect(apiSupport['navigator.serviceWorker']).toBe(true);
      
      // Browser-specific API checks
      if (browserName !== 'webkit') {
        expect(apiSupport['ResizeObserver']).toBe(true);
      }
    });

    test('should support storage APIs across browsers', async ({ page }) => {
      const storageSupport = await crossBrowserUtils.testStorageCompatibility();
      
      // Log results for debugging
      console.log('Storage API Support:', storageSupport);
      
      // All modern browsers should support these
      expect(storageSupport.localStorage).toBe(true);
      expect(storageSupport.sessionStorage).toBe(true);
      expect(storageSupport.indexedDB).toBe(true);
      expect(storageSupport.webStorage).toBe(true);
    });
  });

  test.describe('Visual Regression Testing', () => {
    test('should render homepage consistently across browsers', async ({ page }) => {
      await page.waitForLoadState('networkidle');
      
      // Wait for dynamic content to load
      await page.waitForTimeout(2000);
      
      await crossBrowserUtils.compareVisualRegression('homepage', {
        fullPage: true,
        threshold: 0.3,
        mask: [
          '[data-testid="animated-counter"]', // Mask animated elements
          '[data-testid="current-time"]',     // Mask time-sensitive content
        ],
      });
    });

    test('should render portfolio creation form consistently', async ({ page }) => {
      await page.goto('/create');
      await page.waitForLoadState('networkidle');
      
      await crossBrowserUtils.compareVisualRegression('portfolio-creation-form', {
        fullPage: true,
        threshold: 0.2,
      });
    });

    test('should render dashboard consistently', async ({ page }) => {
      // Need to authenticate first
      await page.goto('/auth/signin');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="signin-button"]');
      
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      await crossBrowserUtils.compareVisualRegression('dashboard', {
        fullPage: true,
        threshold: 0.3,
        mask: [
          '[data-testid="user-avatar"]',    // Mask user-specific content
          '[data-testid="last-activity"]', // Mask time-sensitive content
        ],
      });
    });
  });

  test.describe('Form Input Compatibility', () => {
    test('should handle form inputs consistently across browsers', async ({ page }) => {
      await page.goto('/create');
      
      // Test different input types
      const inputs = [
        '[data-testid="full-name-input"]',
        '[data-testid="email-input"]',
        '[data-testid="phone-input"]',
        '[data-testid="website-input"]',
      ];
      
      for (const inputSelector of inputs) {
        const compatibility = await crossBrowserUtils.testFormInputCompatibility(inputSelector);
        
        // Log results for debugging
        console.log(`Form Input Compatibility - ${inputSelector}:`, compatibility);
        
        // Basic form validation should work
        expect(compatibility.willValidate).toBe(true);
        expect(compatibility.validity).toBeDefined();
      }
    });

    test('should validate form inputs consistently', async ({ page }) => {
      await page.goto('/create');
      
      // Test email validation
      await page.fill('[data-testid="email-input"]', 'invalid-email');
      await page.click('[data-testid="continue-button"]');
      
      const emailError = await page.locator('[data-testid="email-error"]');
      await expect(emailError).toBeVisible();
      
      // Test required field validation
      await page.fill('[data-testid="full-name-input"]', '');
      await page.click('[data-testid="continue-button"]');
      
      const nameError = await page.locator('[data-testid="name-error"]');
      await expect(nameError).toBeVisible();
    });
  });

  test.describe('Performance Metrics', () => {
    test('should meet performance benchmarks across browsers', async ({ page }) => {
      await page.goto('/');
      
      const metrics = await crossBrowserUtils.testPerformanceMetrics();
      
      // Log results for debugging
      console.log('Performance Metrics:', metrics);
      
      // Performance assertions
      expect(metrics.domContentLoaded).toBeLessThan(3000); // 3s
      expect(metrics.loadComplete).toBeLessThan(5000);     // 5s
      expect(metrics.firstContentfulPaint).toBeLessThan(2000); // 2s
      
      // Size assertions
      expect(metrics.encodedBodySize).toBeLessThan(1000000); // 1MB
    });

    test('should load critical resources efficiently', async ({ page }) => {
      const networkRequests = await crossBrowserUtils.testNetworkRequests();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Wait for requests to complete
      await page.waitForTimeout(2000);
      
      // Check for critical resources
      const criticalResources = networkRequests.filter(req => 
        req.url.includes('.css') || 
        req.url.includes('.js') || 
        req.url.includes('.woff')
      );
      
      // All critical resources should load successfully
      criticalResources.forEach(resource => {
        expect(resource.status).toBeLessThan(400);
      });
    });
  });

  test.describe('Accessibility Compatibility', () => {
    test('should maintain accessibility across browsers', async ({ page }) => {
      await page.goto('/');
      
      // Test key interactive elements
      const elements = [
        '[data-testid="main-navigation"]',
        '[data-testid="cta-button"]',
        '[data-testid="search-input"]',
        '[data-testid="language-selector"]',
      ];
      
      for (const elementSelector of elements) {
        const accessibility = await crossBrowserUtils.testAccessibilityFeatures(elementSelector);
        
        // Log results for debugging
        console.log(`Accessibility - ${elementSelector}:`, accessibility);
        
        // Basic accessibility requirements
        expect(accessibility.keyboardAccessible).toBe(true);
        expect(accessibility.focusable).toBe(true);
      }
    });

    test('should support screen reader navigation', async ({ page }) => {
      await page.goto('/');
      
      // Test heading structure
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      expect(headings.length).toBeGreaterThan(0);
      
      // Test landmark regions
      const landmarks = await page.locator('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]').all();
      expect(landmarks.length).toBeGreaterThan(0);
      
      // Test skip links
      const skipLinks = await page.locator('[href="#main-content"]').all();
      expect(skipLinks.length).toBeGreaterThan(0);
    });
  });

  test.describe('Console Error Detection', () => {
    test('should not have console errors across browsers', async ({ page }) => {
      const consoleMessages = await crossBrowserUtils.captureConsoleMessages();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Wait for dynamic content
      await page.waitForTimeout(3000);
      
      // Filter out non-error messages
      const errors = consoleMessages.filter(msg => msg.type === 'error');
      const warnings = consoleMessages.filter(msg => msg.type === 'warning');
      
      // Log for debugging
      console.log('Console Errors:', errors);
      console.log('Console Warnings:', warnings);
      
      // Should have no console errors
      expect(errors.length).toBe(0);
      
      // Warnings should be minimal
      expect(warnings.length).toBeLessThan(5);
    });
  });

  test.describe('Browser-Specific Behavior', () => {
    test('should handle browser-specific CSS rendering', async ({ page, browserName }) => {
      await page.goto('/');
      
      const elements = [
        '[data-testid="hero-section"]',
        '[data-testid="feature-grid"]',
        '[data-testid="testimonial-carousel"]',
      ];
      
      const renderingDifferences = await crossBrowserUtils.testRenderingDifferences(elements);
      
      // Log results for debugging
      console.log(`Rendering Differences - ${browserName}:`, renderingDifferences);
      
      // Verify consistent display types
      Object.values(renderingDifferences).forEach((styles: any) => {
        expect(styles.display).toBeDefined();
        expect(styles.position).toBeDefined();
      });
    });

    test('should handle browser-specific JavaScript behavior', async ({ page, browserName }) => {
      await page.goto('/');
      
      // Test event handling
      const eventHandling = await page.evaluate(() => {
        const results: Record<string, boolean> = {};
        
        // Test event listener support
        const testDiv = document.createElement('div');
        
        try {
          testDiv.addEventListener('click', () => {});
          results.addEventListener = true;
        } catch {
          results.addEventListener = false;
        }
        
        try {
          testDiv.attachEvent?.('onclick', () => {});
          results.attachEvent = !!testDiv.attachEvent;
        } catch {
          results.attachEvent = false;
        }
        
        // Test DOM manipulation
        try {
          testDiv.classList.add('test');
          results.classList = true;
        } catch {
          results.classList = false;
        }
        
        return results;
      });
      
      // Log results for debugging
      console.log(`Event Handling - ${browserName}:`, eventHandling);
      
      // Modern event handling should work
      expect(eventHandling.addEventListener).toBe(true);
      expect(eventHandling.classList).toBe(true);
    });
  });

  test.describe('Browser-Specific Optimizations', () => {
    test('should optimize for browser-specific features', async ({ page, browserName }) => {
      await page.goto('/');
      
      // Test browser-specific optimizations
      const optimizations = await page.evaluate((browser) => {
        const results: Record<string, any> = {};
        
        // Test hardware acceleration
        results.hardwareAcceleration = {
          transform3d: CSS.supports('transform', 'translateZ(0)'),
          willChange: CSS.supports('will-change', 'transform'),
        };
        
        // Test browser-specific prefixes
        if (browser === 'webkit') {
          results.webkitSpecific = {
            webkitTransform: CSS.supports('-webkit-transform', 'translateX(0)'),
            webkitBackfaceVisibility: CSS.supports('-webkit-backface-visibility', 'hidden'),
          };
        }
        
        if (browser === 'firefox') {
          results.mozSpecific = {
            mozTransform: CSS.supports('-moz-transform', 'translateX(0)'),
            mozUserSelect: CSS.supports('-moz-user-select', 'none'),
          };
        }
        
        return results;
      }, browserName);
      
      // Log results for debugging
      console.log(`Browser Optimizations - ${browserName}:`, optimizations);
      
      // Hardware acceleration should be supported
      expect(optimizations.hardwareAcceleration.transform3d).toBe(true);
    });
  });
});

test.describe('Responsive Design Cross-Browser Testing', () => {
  let crossBrowserUtils: CrossBrowserTestUtils;
  
  test.beforeEach(async ({ page }) => {
    crossBrowserUtils = new CrossBrowserTestUtils(page);
  });

  test('should render responsively across all breakpoints', async ({ page }) => {
    await page.goto('/');
    
    const breakpointResults = await crossBrowserUtils.testResponsiveBreakpoints(responsiveBreakpoints);
    
    // Log results for debugging
    console.log('Responsive Breakpoint Results:', breakpointResults.map(r => ({ 
      name: r.name, 
      width: r.width, 
      height: r.height 
    })));
    
    // Verify all breakpoints were tested
    expect(breakpointResults.length).toBe(responsiveBreakpoints.length);
    
    // Each breakpoint should have a screenshot
    breakpointResults.forEach((result, index) => {
      expect(result.screenshot).toBeDefined();
      expect(result.screenshot.length).toBeGreaterThan(0);
    });
  });

  test('should maintain layout integrity across viewports', async ({ page }) => {
    await page.goto('/');
    
    const viewports = [
      { width: 320, height: 568 },  // iPhone SE
      { width: 375, height: 667 },  // iPhone 6/7/8
      { width: 414, height: 896 },  // iPhone 11
      { width: 768, height: 1024 }, // iPad
      { width: 1024, height: 768 }, // iPad Landscape
      { width: 1440, height: 900 }, // Desktop
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);
      
      // Test that key elements are visible and properly positioned
      const heroSection = page.locator('[data-testid="hero-section"]');
      const navigation = page.locator('[data-testid="main-navigation"]');
      
      await expect(heroSection).toBeVisible();
      await expect(navigation).toBeVisible();
      
      // Take screenshot for visual verification
      await expect(page).toHaveScreenshot(`layout-${viewport.width}x${viewport.height}.png`, {
        fullPage: true,
        threshold: 0.3,
      });
    }
  });
});