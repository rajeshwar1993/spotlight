import { Page, expect, BrowserContext } from '@playwright/test';

/**
 * Cross-browser testing utilities for comprehensive browser compatibility testing
 */

export interface BrowserInfo {
  name: string;
  version: string;
  userAgent: string;
  viewport: { width: number; height: number };
  deviceScaleFactor: number;
  isMobile: boolean;
  hasTouch: boolean;
}

export interface VisualTestOptions {
  threshold?: number;
  animations?: 'disabled' | 'allow';
  clip?: { x: number; y: number; width: number; height: number };
  fullPage?: boolean;
  mask?: string[];
  maskColor?: string;
}

export class CrossBrowserTestUtils {
  constructor(private page: Page) {}

  /**
   * Get browser information for the current test
   */
  async getBrowserInfo(): Promise<BrowserInfo> {
    const userAgent = await this.page.evaluate(() => navigator.userAgent);
    const viewport = this.page.viewportSize();
    const context = this.page.context();
    
    return {
      name: context.browser()?.browserType().name() || 'unknown',
      version: context.browser()?.version() || 'unknown',
      userAgent,
      viewport: viewport || { width: 1920, height: 1080 },
      deviceScaleFactor: await this.page.evaluate(() => window.devicePixelRatio),
      isMobile: await this.page.evaluate(() => /Mobi|Android/i.test(navigator.userAgent)),
      hasTouch: await this.page.evaluate(() => 'ontouchstart' in window),
    };
  }

  /**
   * Test CSS feature support across browsers
   */
  async testCSSFeatureSupport(features: string[]): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const feature of features) {
      const supported = await this.page.evaluate((prop) => {
        return CSS.supports(prop);
      }, feature);
      results[feature] = supported;
    }
    
    return results;
  }

  /**
   * Test JavaScript API support
   */
  async testJavaScriptAPISupport(apis: string[]): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const api of apis) {
      const supported = await this.page.evaluate((apiPath) => {
        const path = apiPath.split('.');
        let obj: any = window;
        
        for (const prop of path) {
          if (obj && typeof obj === 'object' && prop in obj) {
            obj = obj[prop];
          } else {
            return false;
          }
        }
        
        return obj !== undefined;
      }, api);
      results[api] = supported;
    }
    
    return results;
  }

  /**
   * Test responsive design breakpoints
   */
  async testResponsiveBreakpoints(breakpoints: Array<{ name: string; width: number; height: number }>) {
    const results: Array<{ name: string; width: number; height: number; screenshot: string }> = [];
    
    for (const breakpoint of breakpoints) {
      await this.page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
      await this.page.waitForTimeout(500); // Allow layout to stabilize
      
      const screenshot = await this.page.screenshot({
        fullPage: true,
        animations: 'disabled',
      });
      
      results.push({
        ...breakpoint,
        screenshot: screenshot.toString('base64'),
      });
    }
    
    return results;
  }

  /**
   * Visual regression testing with cross-browser comparison
   */
  async compareVisualRegression(
    screenshotName: string,
    options: VisualTestOptions = {}
  ): Promise<void> {
    const browserInfo = await this.getBrowserInfo();
    const screenshotOptions = {
      threshold: options.threshold || 0.2,
      animations: options.animations || 'disabled' as const,
      clip: options.clip,
      fullPage: options.fullPage || false,
      mask: options.mask ? await this.page.locator(options.mask.join(', ')).all() : undefined,
      maskColor: options.maskColor || '#000000',
    };

    // Create browser-specific screenshot name
    const browserScreenshotName = `${screenshotName}-${browserInfo.name}-${browserInfo.viewport.width}x${browserInfo.viewport.height}`;
    
    await expect(this.page).toHaveScreenshot(`${browserScreenshotName}.png`, screenshotOptions);
  }

  /**
   * Test form input compatibility across browsers
   */
  async testFormInputCompatibility(inputSelector: string): Promise<Record<string, any>> {
    const inputElement = this.page.locator(inputSelector);
    
    const compatibility = await this.page.evaluate((selector) => {
      const input = document.querySelector(selector) as HTMLInputElement;
      if (!input) return {};
      
      return {
        type: input.type,
        placeholder: input.placeholder,
        required: input.required,
        pattern: input.pattern,
        autocomplete: input.autocomplete,
        validity: {
          valid: input.validity.valid,
          badInput: input.validity.badInput,
          customError: input.validity.customError,
          patternMismatch: input.validity.patternMismatch,
          rangeOverflow: input.validity.rangeOverflow,
          rangeUnderflow: input.validity.rangeUnderflow,
          stepMismatch: input.validity.stepMismatch,
          tooLong: input.validity.tooLong,
          tooShort: input.validity.tooShort,
          typeMismatch: input.validity.typeMismatch,
          valueMissing: input.validity.valueMissing,
        },
        willValidate: input.willValidate,
      };
    }, inputSelector);
    
    return compatibility;
  }

  /**
   * Test touch gestures (for mobile browsers)
   */
  async testTouchGestures(elementSelector: string): Promise<Record<string, boolean>> {
    const browserInfo = await this.getBrowserInfo();
    if (!browserInfo.hasTouch) {
      return { hasTouch: false };
    }
    
    const element = this.page.locator(elementSelector);
    const results: Record<string, boolean> = { hasTouch: true };
    
    try {
      // Test tap
      await element.tap();
      results.tap = true;
    } catch {
      results.tap = false;
    }
    
    try {
      // Test double tap
      await element.tap({ clickCount: 2 });
      results.doubleTap = true;
    } catch {
      results.doubleTap = false;
    }
    
    // Test swipe (if element supports it)
    try {
      const box = await element.boundingBox();
      if (box) {
        await this.page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
        await this.page.touchscreen.tap(box.x + box.width / 2 + 100, box.y + box.height / 2);
        results.swipe = true;
      }
    } catch {
      results.swipe = false;
    }
    
    return results;
  }

  /**
   * Test accessibility features across browsers
   */
  async testAccessibilityFeatures(elementSelector: string): Promise<Record<string, any>> {
    const element = this.page.locator(elementSelector);
    
    const accessibility = await this.page.evaluate((selector) => {
      const el = document.querySelector(selector) as HTMLElement;
      if (!el) return {};
      
      return {
        ariaLabel: el.getAttribute('aria-label'),
        ariaDescribedBy: el.getAttribute('aria-describedby'),
        ariaLabelledBy: el.getAttribute('aria-labelledby'),
        role: el.getAttribute('role'),
        tabIndex: el.tabIndex,
        focusable: el.tabIndex >= 0,
        screenReaderText: el.getAttribute('sr-only') || el.textContent,
        keyboardAccessible: el.hasAttribute('tabindex') || ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName),
      };
    }, elementSelector);
    
    return accessibility;
  }

  /**
   * Test performance metrics across browsers
   */
  async testPerformanceMetrics(): Promise<Record<string, number>> {
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        transferSize: navigation.transferSize || 0,
        encodedBodySize: navigation.encodedBodySize || 0,
        decodedBodySize: navigation.decodedBodySize || 0,
      };
    });
    
    return metrics;
  }

  /**
   * Test cross-browser storage compatibility
   */
  async testStorageCompatibility(): Promise<Record<string, boolean>> {
    const storage = await this.page.evaluate(() => {
      const tests: Record<string, boolean> = {};
      
      // Test localStorage
      try {
        localStorage.setItem('test', 'value');
        tests.localStorage = localStorage.getItem('test') === 'value';
        localStorage.removeItem('test');
      } catch {
        tests.localStorage = false;
      }
      
      // Test sessionStorage
      try {
        sessionStorage.setItem('test', 'value');
        tests.sessionStorage = sessionStorage.getItem('test') === 'value';
        sessionStorage.removeItem('test');
      } catch {
        tests.sessionStorage = false;
      }
      
      // Test IndexedDB
      tests.indexedDB = typeof window.indexedDB !== 'undefined';
      
      // Test Web Storage
      tests.webStorage = typeof window.Storage !== 'undefined';
      
      return tests;
    });
    
    return storage;
  }

  /**
   * Test browser-specific rendering differences
   */
  async testRenderingDifferences(elements: string[]): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    
    for (const elementSelector of elements) {
      const element = this.page.locator(elementSelector);
      
      const styles = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          display: computed.display,
          position: computed.position,
          flexDirection: computed.flexDirection,
          gridTemplateColumns: computed.gridTemplateColumns,
          transform: computed.transform,
          filter: computed.filter,
          backdropFilter: computed.backdropFilter,
          clipPath: computed.clipPath,
          mask: computed.mask,
          mixBlendMode: computed.mixBlendMode,
        };
      });
      
      results[elementSelector] = styles;
    }
    
    return results;
  }

  /**
   * Test browser console errors and warnings
   */
  async captureConsoleMessages(): Promise<Array<{ type: string; text: string; url?: string; line?: number }>> {
    const messages: Array<{ type: string; text: string; url?: string; line?: number }> = [];
    
    this.page.on('console', (msg) => {
      messages.push({
        type: msg.type(),
        text: msg.text(),
        url: msg.location().url,
        line: msg.location().lineNumber,
      });
    });
    
    return messages;
  }

  /**
   * Test network request compatibility
   */
  async testNetworkRequests(): Promise<Array<{ url: string; method: string; status: number; contentType: string }>> {
    const requests: Array<{ url: string; method: string; status: number; contentType: string }> = [];
    
    this.page.on('response', (response) => {
      requests.push({
        url: response.url(),
        method: response.request().method(),
        status: response.status(),
        contentType: response.headers()['content-type'] || '',
      });
    });
    
    return requests;
  }
}

/**
 * Browser-specific test configurations
 */
export const browserTestConfigs = {
  chrome: {
    features: [
      'display: grid',
      'display: flex',
      'backdrop-filter: blur(10px)',
      'clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      'filter: drop-shadow(0 0 10px rgba(0,0,0,0.5))',
    ],
    apis: [
      'fetch',
      'IntersectionObserver',
      'ResizeObserver',
      'navigator.serviceWorker',
      'window.requestIdleCallback',
      'window.performance.mark',
    ],
  },
  firefox: {
    features: [
      'display: grid',
      'display: flex',
      'backdrop-filter: blur(10px)',
      'clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      'scrollbar-width: thin',
    ],
    apis: [
      'fetch',
      'IntersectionObserver',
      'ResizeObserver',
      'navigator.serviceWorker',
      'window.performance.mark',
    ],
  },
  safari: {
    features: [
      'display: grid',
      'display: flex',
      'backdrop-filter: blur(10px)',
      '-webkit-backdrop-filter: blur(10px)',
      'clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    ],
    apis: [
      'fetch',
      'IntersectionObserver',
      'navigator.serviceWorker',
      'window.performance.mark',
    ],
  },
  edge: {
    features: [
      'display: grid',
      'display: flex',
      'backdrop-filter: blur(10px)',
      'clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      'filter: drop-shadow(0 0 10px rgba(0,0,0,0.5))',
    ],
    apis: [
      'fetch',
      'IntersectionObserver',
      'ResizeObserver',
      'navigator.serviceWorker',
      'window.requestIdleCallback',
      'window.performance.mark',
    ],
  },
};

/**
 * Common responsive breakpoints for testing
 */
export const responsiveBreakpoints = [
  { name: 'mobile-portrait', width: 375, height: 667 },
  { name: 'mobile-landscape', width: 667, height: 375 },
  { name: 'tablet-portrait', width: 768, height: 1024 },
  { name: 'tablet-landscape', width: 1024, height: 768 },
  { name: 'desktop-small', width: 1024, height: 768 },
  { name: 'desktop-medium', width: 1440, height: 900 },
  { name: 'desktop-large', width: 1920, height: 1080 },
  { name: 'desktop-4k', width: 3840, height: 2160 },
];