/**
 * Critical CSS extraction and optimization utilities
 */

import { useEffect, useState } from 'react';

export interface CriticalCSSOptions {
  // Above-the-fold height threshold
  viewportHeight?: number;
  // Viewport width for mobile-first approach
  viewportWidth?: number;
  // CSS selectors to always include
  forcedSelectors?: string[];
  // CSS selectors to exclude
  excludedSelectors?: string[];
  // Maximum size of critical CSS (in bytes)
  maxSize?: number;
  // Whether to inline critical CSS
  inline?: boolean;
}

export interface CriticalCSSResult {
  critical: string;
  nonCritical: string;
  size: number;
  selectors: string[];
}

/**
 * Critical CSS extractor class
 */
export class CriticalCSSExtractor {
  private options: Required<CriticalCSSOptions>;
  private criticalSelectors = new Set<string>();
  private nonCriticalSelectors = new Set<string>();

  constructor(options: CriticalCSSOptions = {}) {
    this.options = {
      viewportHeight: options.viewportHeight || 600,
      viewportWidth: options.viewportWidth || 375,
      forcedSelectors: options.forcedSelectors || [],
      excludedSelectors: options.excludedSelectors || [],
      maxSize: options.maxSize || 14000, // 14KB threshold
      inline: options.inline ?? true,
    };
  }

  /**
   * Extract critical CSS from current page
   */
  async extractCriticalCSS(): Promise<CriticalCSSResult> {
    if (typeof window === 'undefined') {
      throw new Error('Critical CSS extraction requires browser environment');
    }

    // Get all stylesheets
    const stylesheets = Array.from(document.styleSheets);
    const criticalCSS: string[] = [];
    const nonCriticalCSS: string[] = [];

    // Set viewport for analysis
    const originalViewport = this.setViewport();

    try {
      for (const stylesheet of stylesheets) {
        const rules = await this.extractRulesFromStylesheet(stylesheet);
        
        for (const rule of rules) {
          if (this.isCriticalRule(rule)) {
            criticalCSS.push(rule.cssText);
            this.criticalSelectors.add(rule.selectorText || '');
          } else {
            nonCriticalCSS.push(rule.cssText);
            this.nonCriticalSelectors.add(rule.selectorText || '');
          }
        }
      }

      // Add forced selectors
      this.addForcedSelectors(criticalCSS);

      // Optimize and minify
      const optimizedCritical = this.optimizeCSS(criticalCSS.join('\n'));
      const optimizedNonCritical = this.optimizeCSS(nonCriticalCSS.join('\n'));

      return {
        critical: optimizedCritical,
        nonCritical: optimizedNonCritical,
        size: new Blob([optimizedCritical]).size,
        selectors: Array.from(this.criticalSelectors),
      };
    } finally {
      // Restore viewport
      this.restoreViewport(originalViewport);
    }
  }

  /**
   * Extract rules from a stylesheet
   */
  private async extractRulesFromStylesheet(stylesheet: CSSStyleSheet): Promise<CSSRule[]> {
    const rules: CSSRule[] = [];

    try {
      const cssRules = stylesheet.cssRules || stylesheet.rules;
      if (!cssRules) return rules;

      for (let i = 0; i < cssRules.length; i++) {
        const rule = cssRules[i];
        
        if (rule.type === CSSRule.STYLE_RULE) {
          rules.push(rule);
        } else if (rule.type === CSSRule.MEDIA_RULE) {
          const mediaRule = rule as CSSMediaRule;
          if (this.isRelevantMediaRule(mediaRule)) {
            for (let j = 0; j < mediaRule.cssRules.length; j++) {
              rules.push(mediaRule.cssRules[j]);
            }
          }
        }
      }
    } catch (error) {
      // Handle CORS errors with external stylesheets
      console.warn('Cannot access stylesheet rules:', error);
    }

    return rules;
  }

  /**
   * Check if a CSS rule is critical (above-the-fold)
   */
  private isCriticalRule(rule: CSSRule): boolean {
    if (rule.type !== CSSRule.STYLE_RULE) return false;

    const styleRule = rule as CSSStyleRule;
    const selector = styleRule.selectorText;

    // Check if selector is in excluded list
    if (this.options.excludedSelectors.includes(selector)) {
      return false;
    }

    // Check if selector is in forced list
    if (this.options.forcedSelectors.includes(selector)) {
      return true;
    }

    // Check if elements matching this selector are in viewport
    try {
      const elements = document.querySelectorAll(selector);
      
      for (const element of elements) {
        if (this.isElementInViewport(element)) {
          return true;
        }
      }
    } catch (error) {
      // Invalid selector, skip
      return false;
    }

    return false;
  }

  /**
   * Check if an element is in the viewport
   */
  private isElementInViewport(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    
    return (
      rect.top < this.options.viewportHeight &&
      rect.bottom > 0 &&
      rect.left < this.options.viewportWidth &&
      rect.right > 0
    );
  }

  /**
   * Check if a media rule is relevant for critical CSS
   */
  private isRelevantMediaRule(mediaRule: CSSMediaRule): boolean {
    const mediaText = mediaRule.media.mediaText.toLowerCase();
    
    // Include rules for mobile and small screens
    if (mediaText.includes('max-width') || mediaText.includes('screen')) {
      return true;
    }

    // Exclude print and other non-screen media
    if (mediaText.includes('print') || mediaText.includes('speech')) {
      return false;
    }

    return true;
  }

  /**
   * Add forced selectors to critical CSS
   */
  private addForcedSelectors(criticalCSS: string[]): void {
    for (const selector of this.options.forcedSelectors) {
      try {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          // Find the computed style for the first element
          const computedStyle = window.getComputedStyle(elements[0]);
          const cssText = this.createCSSRule(selector, computedStyle);
          if (cssText) {
            criticalCSS.push(cssText);
          }
        }
      } catch (error) {
        console.warn(`Failed to add forced selector ${selector}:`, error);
      }
    }
  }

  /**
   * Create CSS rule from computed style
   */
  private createCSSRule(selector: string, computedStyle: CSSStyleDeclaration): string | null {
    const importantProperties = [
      'display',
      'position',
      'top',
      'left',
      'right',
      'bottom',
      'width',
      'height',
      'margin',
      'padding',
      'border',
      'background',
      'color',
      'font-size',
      'font-family',
      'font-weight',
      'line-height',
      'text-align',
      'visibility',
      'opacity',
    ];

    const declarations: string[] = [];

    for (const property of importantProperties) {
      const value = computedStyle.getPropertyValue(property);
      if (value && value !== 'initial' && value !== 'inherit') {
        declarations.push(`${property}: ${value}`);
      }
    }

    if (declarations.length === 0) return null;

    return `${selector} { ${declarations.join('; ')} }`;
  }

  /**
   * Optimize and minify CSS
   */
  private optimizeCSS(css: string): string {
    return css
      // Remove comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remove excess whitespace
      .replace(/\s+/g, ' ')
      // Remove whitespace around braces and semicolons
      .replace(/\s*{\s*/g, '{')
      .replace(/\s*}\s*/g, '}')
      .replace(/\s*;\s*/g, ';')
      // Remove trailing semicolons
      .replace(/;}/g, '}')
      // Remove empty rules
      .replace(/[^{}]*{\s*}/g, '')
      .trim();
  }

  /**
   * Set viewport for analysis
   */
  private setViewport(): { width: number; height: number } {
    const original = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Temporarily resize for analysis
    if (window.resizeTo) {
      window.resizeTo(this.options.viewportWidth, this.options.viewportHeight);
    }

    return original;
  }

  /**
   * Restore viewport
   */
  private restoreViewport(original: { width: number; height: number }): void {
    if (window.resizeTo) {
      window.resizeTo(original.width, original.height);
    }
  }
}

/**
 * Hook for critical CSS extraction
 */
export const useCriticalCSS = (options: CriticalCSSOptions = {}) => {
  const [criticalCSS, setCriticalCSS] = useState<CriticalCSSResult | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const extractCSS = async () => {
    if (typeof window === 'undefined') return;

    setIsExtracting(true);
    setError(null);

    try {
      const extractor = new CriticalCSSExtractor(options);
      const result = await extractor.extractCriticalCSS();
      setCriticalCSS(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsExtracting(false);
    }
  };

  useEffect(() => {
    // Extract critical CSS after component mount
    const timer = setTimeout(extractCSS, 100);
    return () => clearTimeout(timer);
  }, []);

  return {
    criticalCSS,
    isExtracting,
    error,
    extractCSS,
  };
};

/**
 * Critical CSS utilities
 */
export const criticalCSSUtils = {
  /**
   * Inject critical CSS into document head
   */
  injectCriticalCSS: (css: string, id = 'critical-css') => {
    if (typeof window === 'undefined') return;

    // Remove existing critical CSS
    const existing = document.getElementById(id);
    if (existing) {
      existing.remove();
    }

    // Create and inject new critical CSS
    const style = document.createElement('style');
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
  },

  /**
   * Lazy load non-critical CSS
   */
  loadNonCriticalCSS: (css: string, id = 'non-critical-css') => {
    if (typeof window === 'undefined') return;

    const loadCSS = () => {
      const existing = document.getElementById(id);
      if (existing) return; // Already loaded

      const style = document.createElement('style');
      style.id = id;
      style.textContent = css;
      document.head.appendChild(style);
    };

    // Load after initial render
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadCSS);
    } else {
      // Use requestIdleCallback for better performance
      if ('requestIdleCallback' in window) {
        requestIdleCallback(loadCSS);
      } else {
        setTimeout(loadCSS, 0);
      }
    }
  },

  /**
   * Preload CSS file
   */
  preloadCSS: (href: string) => {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
  },

  /**
   * Load CSS file asynchronously
   */
  loadCSSAsync: (href: string, media = 'all') => {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = 'print'; // Initially load as print to prevent render blocking
    link.onload = () => {
      link.media = media; // Switch to actual media after load
    };
    document.head.appendChild(link);
  },

  /**
   * Get critical CSS for specific components
   */
  getCriticalCSSForComponents: (componentSelectors: string[]) => {
    const extractor = new CriticalCSSExtractor({
      forcedSelectors: componentSelectors,
      viewportHeight: 600,
      viewportWidth: 375,
    });

    return extractor.extractCriticalCSS();
  },

  /**
   * Generate critical CSS configuration for different routes
   */
  generateRouteConfigs: () => {
    const routeConfigs: Record<string, CriticalCSSOptions> = {
      '/': {
        forcedSelectors: [
          '.hero-section',
          '.navbar',
          '.main-cta',
          '.featured-portfolios',
        ],
        viewportHeight: 600,
        excludedSelectors: ['.footer', '.modal', '.dropdown'],
      },
      '/create': {
        forcedSelectors: [
          '.creation-form',
          '.progress-indicator',
          '.step-navigation',
        ],
        viewportHeight: 700,
        excludedSelectors: ['.template-preview', '.advanced-options'],
      },
      '/dashboard': {
        forcedSelectors: [
          '.dashboard-header',
          '.portfolio-grid',
          '.sidebar',
        ],
        viewportHeight: 800,
        excludedSelectors: ['.analytics-charts', '.bulk-operations'],
      },
      '/examples': {
        forcedSelectors: [
          '.portfolio-grid',
          '.filter-panel',
          '.search-input',
        ],
        viewportHeight: 600,
        excludedSelectors: ['.portfolio-modal', '.share-options'],
      },
    };

    return routeConfigs;
  },
};

/**
 * Critical CSS presets for common scenarios
 */
export const criticalCSSPresets = {
  // Homepage preset
  homepage: {
    forcedSelectors: [
      'header',
      'nav',
      '.hero',
      '.main-content',
      'h1',
      'h2',
      '.btn-primary',
      '.featured-section',
    ],
    excludedSelectors: [
      'footer',
      '.modal',
      '.dropdown',
      '.accordion-content',
      '.lazy-load',
    ],
    viewportHeight: 600,
    viewportWidth: 375,
  },

  // Dashboard preset
  dashboard: {
    forcedSelectors: [
      '.dashboard-header',
      '.main-navigation',
      '.content-area',
      '.card',
      '.button',
      '.table-header',
    ],
    excludedSelectors: [
      '.modal',
      '.tooltip',
      '.popover',
      '.chart-details',
      '.advanced-filters',
    ],
    viewportHeight: 800,
    viewportWidth: 1024,
  },

  // Portfolio creation preset
  creation: {
    forcedSelectors: [
      '.creation-wizard',
      '.step-indicator',
      '.form-section',
      '.input-field',
      '.button',
      '.progress-bar',
    ],
    excludedSelectors: [
      '.template-preview',
      '.advanced-options',
      '.help-tooltip',
      '.validation-message',
    ],
    viewportHeight: 700,
    viewportWidth: 768,
  },

  // Portfolio view preset
  portfolio: {
    forcedSelectors: [
      '.portfolio-header',
      '.hero-section',
      '.about-section',
      '.portfolio-grid',
      '.contact-section',
    ],
    excludedSelectors: [
      '.modal',
      '.lightbox',
      '.share-menu',
      '.comments-section',
    ],
    viewportHeight: 600,
    viewportWidth: 375,
  },
};