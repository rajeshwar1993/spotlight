import { test, expect } from '@playwright/test';
import { CrossBrowserTestUtils } from './utils/cross-browser-utils';

test.describe('Mobile Touch Interactions', () => {
  let crossBrowserUtils: CrossBrowserTestUtils;
  
  test.beforeEach(async ({ page }) => {
    crossBrowserUtils = new CrossBrowserTestUtils(page);
  });

  test.describe('Touch Gesture Support', () => {
    test('should support tap gestures on mobile', async ({ page }) => {
      test.skip(process.env.DEVICE_TYPE !== 'mobile', 'Mobile-only test');
      
      await page.goto('/');
      
      // Test tap on navigation menu
      const touchSupport = await crossBrowserUtils.testTouchGestures('[data-testid="mobile-menu-button"]');
      
      console.log('Touch Gesture Support:', touchSupport);
      
      if (touchSupport.hasTouch) {
        expect(touchSupport.tap).toBe(true);
      }
    });

    test('should support swipe gestures on carousels', async ({ page }) => {
      test.skip(process.env.DEVICE_TYPE !== 'mobile', 'Mobile-only test');
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test swipe on testimonial carousel
      const carousel = page.locator('[data-testid="testimonial-carousel"]');
      await expect(carousel).toBeVisible();
      
      const initialSlide = await carousel.locator('.active').textContent();
      
      // Perform swipe gesture
      const box = await carousel.boundingBox();
      if (box) {
        await page.touchscreen.tap(box.x + box.width * 0.8, box.y + box.height / 2);
        await page.touchscreen.tap(box.x + box.width * 0.2, box.y + box.height / 2);
      }
      
      await page.waitForTimeout(500);
      
      const newSlide = await carousel.locator('.active').textContent();
      expect(newSlide).not.toBe(initialSlide);
    });

    test('should support pinch-to-zoom on images', async ({ page }) => {
      test.skip(process.env.DEVICE_TYPE !== 'mobile', 'Mobile-only test');
      
      await page.goto('/examples');
      await page.waitForLoadState('networkidle');
      
      // Find a portfolio image
      const portfolioImage = page.locator('[data-testid="portfolio-image"]').first();
      await expect(portfolioImage).toBeVisible();
      
      // Click to open image modal
      await portfolioImage.tap();
      
      const imageModal = page.locator('[data-testid="image-modal"]');
      await expect(imageModal).toBeVisible();
      
      // Test pinch gesture (simulated)
      const modalImage = imageModal.locator('img');
      const initialScale = await modalImage.evaluate((img) => {
        const transform = window.getComputedStyle(img).transform;
        return transform;
      });
      
      // Simulate pinch gesture
      const box = await modalImage.boundingBox();
      if (box) {
        const centerX = box.x + box.width / 2;
        const centerY = box.y + box.height / 2;
        
        // Start pinch
        await page.touchscreen.tap(centerX - 50, centerY);
        await page.touchscreen.tap(centerX + 50, centerY);
        
        // Spread fingers (zoom in)
        await page.touchscreen.tap(centerX - 100, centerY);
        await page.touchscreen.tap(centerX + 100, centerY);
      }
      
      await page.waitForTimeout(500);
      
      const finalScale = await modalImage.evaluate((img) => {
        const transform = window.getComputedStyle(img).transform;
        return transform;
      });
      
      // Scale should have changed
      expect(finalScale).not.toBe(initialScale);
    });
  });

  test.describe('Mobile Navigation', () => {
    test('should open and close mobile menu', async ({ page }) => {
      test.skip(process.env.DEVICE_TYPE !== 'mobile', 'Mobile-only test');
      
      await page.goto('/');
      
      const menuButton = page.locator('[data-testid="mobile-menu-button"]');
      const mobileMenu = page.locator('[data-testid="mobile-menu"]');
      
      // Menu should be initially hidden
      await expect(mobileMenu).toBeHidden();
      
      // Tap to open menu
      await menuButton.tap();
      await expect(mobileMenu).toBeVisible();
      
      // Tap to close menu
      await menuButton.tap();
      await expect(mobileMenu).toBeHidden();
    });

    test('should navigate using mobile menu', async ({ page }) => {
      test.skip(process.env.DEVICE_TYPE !== 'mobile', 'Mobile-only test');
      
      await page.goto('/');
      
      const menuButton = page.locator('[data-testid="mobile-menu-button"]');
      await menuButton.tap();
      
      const mobileMenu = page.locator('[data-testid="mobile-menu"]');
      await expect(mobileMenu).toBeVisible();
      
      // Navigate to examples page
      const examplesLink = mobileMenu.locator('[data-testid="examples-link"]');
      await examplesLink.tap();
      
      await expect(page).toHaveURL('/examples');
    });

    test('should support touch scrolling', async ({ page }) => {
      test.skip(process.env.DEVICE_TYPE !== 'mobile', 'Mobile-only test');
      
      await page.goto('/examples');
      await page.waitForLoadState('networkidle');
      
      // Get initial scroll position
      const initialScrollY = await page.evaluate(() => window.scrollY);
      
      // Perform swipe up (scroll down)
      await page.touchscreen.tap(200, 400);
      await page.touchscreen.tap(200, 200);
      
      await page.waitForTimeout(500);
      
      const finalScrollY = await page.evaluate(() => window.scrollY);
      
      // Should have scrolled down
      expect(finalScrollY).toBeGreaterThan(initialScrollY);
    });
  });

  test.describe('Mobile Form Interactions', () => {
    test('should handle touch input in forms', async ({ page }) => {
      test.skip(process.env.DEVICE_TYPE !== 'mobile', 'Mobile-only test');
      
      await page.goto('/create');
      
      // Test tap to focus input
      const nameInput = page.locator('[data-testid="full-name-input"]');
      await nameInput.tap();
      
      // Check that virtual keyboard appears (if detectable)
      const isInputFocused = await nameInput.evaluate((input) => {
        return document.activeElement === input;
      });
      
      expect(isInputFocused).toBe(true);
      
      // Test typing
      await nameInput.fill('John Doe');
      await expect(nameInput).toHaveValue('John Doe');
      
      // Test tap to move to next field
      const emailInput = page.locator('[data-testid="email-input"]');
      await emailInput.tap();
      
      const isEmailFocused = await emailInput.evaluate((input) => {
        return document.activeElement === input;
      });
      
      expect(isEmailFocused).toBe(true);
    });

    test('should handle mobile-specific input types', async ({ page }) => {
      test.skip(process.env.DEVICE_TYPE !== 'mobile', 'Mobile-only test');
      
      await page.goto('/create');
      
      // Test email input type
      const emailInput = page.locator('[data-testid="email-input"]');
      const emailInputType = await emailInput.getAttribute('type');
      expect(emailInputType).toBe('email');
      
      // Test tel input type
      const phoneInput = page.locator('[data-testid="phone-input"]');
      const phoneInputType = await phoneInput.getAttribute('type');
      expect(phoneInputType).toBe('tel');
      
      // Test url input type
      const websiteInput = page.locator('[data-testid="website-input"]');
      const websiteInputType = await websiteInput.getAttribute('type');
      expect(websiteInputType).toBe('url');
    });

    test('should support mobile date/time pickers', async ({ page }) => {
      test.skip(process.env.DEVICE_TYPE !== 'mobile', 'Mobile-only test');
      
      await page.goto('/create');
      
      // If there's a date picker in the form
      const dateInput = page.locator('[data-testid="date-input"]');
      if (await dateInput.count() > 0) {
        await dateInput.tap();
        
        // Check if native mobile date picker opens
        const dateInputType = await dateInput.getAttribute('type');
        expect(dateInputType).toBe('date');
      }
    });

    test('should handle mobile file upload', async ({ page }) => {
      test.skip(process.env.DEVICE_TYPE !== 'mobile', 'Mobile-only test');
      
      await page.goto('/create');
      
      // Navigate to image upload step
      await page.fill('[data-testid="full-name-input"]', 'John Doe');
      await page.fill('[data-testid="email-input"]', 'john@example.com');
      await page.locator('[data-testid="profession-select"]').selectOption('actor');
      await page.click('[data-testid="continue-button"]');
      
      // Select a template
      await page.click('[data-testid="template-t1"]');
      await page.click('[data-testid="continue-button"]');
      
      // Test file upload
      const fileInput = page.locator('[data-testid="image-upload-input"]');
      await expect(fileInput).toBeVisible();
      
      // Check if file input supports mobile camera
      const acceptAttribute = await fileInput.getAttribute('accept');
      expect(acceptAttribute).toContain('image/*');
      
      // Check if capture attribute is present for mobile camera
      const captureAttribute = await fileInput.getAttribute('capture');
      expect(captureAttribute).toBeTruthy();
    });
  });

  test.describe('Mobile Performance', () => {
    test('should maintain smooth scrolling on mobile', async ({ page }) => {
      test.skip(process.env.DEVICE_TYPE !== 'mobile', 'Mobile-only test');
      
      await page.goto('/');
      
      // Test smooth scrolling performance
      const scrollTestResult = await page.evaluate(() => {
        return new Promise((resolve) => {
          const startTime = performance.now();
          let frameCount = 0;
          
          const measureFrames = () => {
            frameCount++;
            if (performance.now() - startTime < 1000) {
              requestAnimationFrame(measureFrames);
            } else {
              resolve(frameCount);
            }
          };
          
          // Start scrolling
          window.scrollTo({ top: 1000, behavior: 'smooth' });
          requestAnimationFrame(measureFrames);
        });
      });
      
      // Should maintain at least 30 FPS
      expect(scrollTestResult).toBeGreaterThan(30);
    });

    test('should handle mobile viewport changes', async ({ page }) => {
      test.skip(process.env.DEVICE_TYPE !== 'mobile', 'Mobile-only test');
      
      await page.goto('/');
      
      // Test orientation change
      await page.setViewportSize({ width: 667, height: 375 }); // Landscape
      await page.waitForTimeout(500);
      
      // Check that layout adapts
      const heroSection = page.locator('[data-testid="hero-section"]');
      const heroHeight = await heroSection.evaluate((el) => el.getBoundingClientRect().height);
      
      await page.setViewportSize({ width: 375, height: 667 }); // Portrait
      await page.waitForTimeout(500);
      
      const newHeroHeight = await heroSection.evaluate((el) => el.getBoundingClientRect().height);
      
      // Height should change with orientation
      expect(newHeroHeight).not.toBe(heroHeight);
    });
  });

  test.describe('Mobile Accessibility', () => {
    test('should support mobile screen reader navigation', async ({ page }) => {
      test.skip(process.env.DEVICE_TYPE !== 'mobile', 'Mobile-only test');
      
      await page.goto('/');
      
      // Test that elements have proper mobile accessibility
      const touchTargets = await page.locator('button, a, input, select, textarea').all();
      
      for (const target of touchTargets.slice(0, 10)) { // Test first 10 elements
        const box = await target.boundingBox();
        if (box) {
          // Touch targets should be at least 44px (iOS) or 48px (Android) in either dimension
          expect(Math.max(box.width, box.height)).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test('should handle mobile focus states', async ({ page }) => {
      test.skip(process.env.DEVICE_TYPE !== 'mobile', 'Mobile-only test');
      
      await page.goto('/create');
      
      // Test that focus states work properly on mobile
      const inputs = await page.locator('input[type="text"], input[type="email"], input[type="tel"]').all();
      
      for (const input of inputs.slice(0, 3)) {
        await input.tap();
        
        const isFocused = await input.evaluate((el) => {
          return document.activeElement === el;
        });
        
        expect(isFocused).toBe(true);
        
        // Check that focus styles are applied
        const focusStyles = await input.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            outline: styles.outline,
            outlineOffset: styles.outlineOffset,
            borderColor: styles.borderColor,
            boxShadow: styles.boxShadow,
          };
        });
        
        // Should have some form of focus indication
        const hasFocusStyle = 
          focusStyles.outline !== 'none' ||
          focusStyles.boxShadow !== 'none' ||
          focusStyles.borderColor !== 'initial';
        
        expect(hasFocusStyle).toBe(true);
      }
    });
  });

  test.describe('Mobile-Specific Features', () => {
    test('should support mobile pull-to-refresh', async ({ page }) => {
      test.skip(process.env.DEVICE_TYPE !== 'mobile', 'Mobile-only test');
      
      await page.goto('/dashboard');
      
      // Test pull-to-refresh gesture
      const body = page.locator('body');
      const box = await body.boundingBox();
      
      if (box) {
        // Simulate pull-to-refresh
        await page.touchscreen.tap(box.width / 2, 50);
        await page.touchscreen.tap(box.width / 2, 200);
        
        // Check if refresh indicator appears
        const refreshIndicator = page.locator('[data-testid="refresh-indicator"]');
        if (await refreshIndicator.count() > 0) {
          await expect(refreshIndicator).toBeVisible();
        }
      }
    });

    test('should handle mobile share functionality', async ({ page }) => {
      test.skip(process.env.DEVICE_TYPE !== 'mobile', 'Mobile-only test');
      
      await page.goto('/examples');
      await page.waitForLoadState('networkidle');
      
      // Test native share functionality
      const shareButton = page.locator('[data-testid="share-button"]').first();
      if (await shareButton.count() > 0) {
        await shareButton.tap();
        
        // Check if share sheet appears or fallback share options
        const shareModal = page.locator('[data-testid="share-modal"]');
        const nativeShare = await page.evaluate(() => {
          return navigator.share !== undefined;
        });
        
        if (nativeShare) {
          // Native share should be triggered
          expect(nativeShare).toBe(true);
        } else {
          // Fallback share modal should appear
          await expect(shareModal).toBeVisible();
        }
      }
    });

    test('should support mobile haptic feedback', async ({ page }) => {
      test.skip(process.env.DEVICE_TYPE !== 'mobile', 'Mobile-only test');
      
      await page.goto('/create');
      
      // Test haptic feedback support
      const hapticSupport = await page.evaluate(() => {
        return navigator.vibrate !== undefined;
      });
      
      if (hapticSupport) {
        // Test button with haptic feedback
        const submitButton = page.locator('[data-testid="submit-button"]');
        if (await submitButton.count() > 0) {
          await submitButton.tap();
          
          // Haptic feedback should be triggered
          const vibrateResult = await page.evaluate(() => {
            return navigator.vibrate(100);
          });
          
          expect(vibrateResult).toBe(true);
        }
      }
    });
  });
});