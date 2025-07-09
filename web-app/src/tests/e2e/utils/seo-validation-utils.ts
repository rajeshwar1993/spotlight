import { Page } from '@playwright/test';

/**
 * SEO validation utilities for comprehensive SEO testing
 */

export interface SEOMetrics {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  robots: string;
  viewport: string;
  lang: string;
  charset: string;
  ogTitle: string;
  ogDescription: string;
  ogType: string;
  ogImage: string;
  ogUrl: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  structuredData: any[];
  headings: { level: string; text: string }[];
  images: { src: string; alt: string; width?: string; height?: string }[];
  links: { href: string; text: string; rel?: string }[];
  performance: {
    loadTime: number;
    domContentLoaded: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
  };
}

export interface SEOValidationResult {
  url: string;
  metrics: SEOMetrics;
  issues: SEOIssue[];
  score: number;
  recommendations: string[];
}

export interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  element?: string;
  impact: 'high' | 'medium' | 'low';
}

export class SEOValidationUtils {
  constructor(private page: Page) {}

  /**
   * Perform comprehensive SEO analysis
   */
  async analyzeSEO(): Promise<SEOValidationResult> {
    const url = this.page.url();
    const metrics = await this.extractSEOMetrics();
    const issues = await this.validateSEO(metrics);
    const score = this.calculateSEOScore(issues);
    const recommendations = this.generateRecommendations(issues);

    return {
      url,
      metrics,
      issues,
      score,
      recommendations,
    };
  }

  /**
   * Extract SEO metrics from the page
   */
  async extractSEOMetrics(): Promise<SEOMetrics> {
    const metrics = await this.page.evaluate(() => {
      // Helper function to get meta content
      const getMetaContent = (selector: string): string => {
        const element = document.querySelector(selector);
        return element?.getAttribute('content') || '';
      };

      // Helper function to get attribute
      const getAttribute = (selector: string, attr: string): string => {
        const element = document.querySelector(selector);
        return element?.getAttribute(attr) || '';
      };

      // Extract structured data
      const structuredData: any[] = [];
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(script => {
        try {
          const data = JSON.parse(script.textContent || '');
          structuredData.push(data);
        } catch (e) {
          // Invalid JSON, skip
        }
      });

      // Extract headings
      const headings: { level: string; text: string }[] = [];
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headingElements.forEach(heading => {
        headings.push({
          level: heading.tagName.toLowerCase(),
          text: heading.textContent?.trim() || '',
        });
      });

      // Extract images
      const images: { src: string; alt: string; width?: string; height?: string }[] = [];
      const imageElements = document.querySelectorAll('img');
      imageElements.forEach(img => {
        images.push({
          src: img.src,
          alt: img.alt,
          width: img.getAttribute('width') || undefined,
          height: img.getAttribute('height') || undefined,
        });
      });

      // Extract links
      const links: { href: string; text: string; rel?: string }[] = [];
      const linkElements = document.querySelectorAll('a[href]');
      linkElements.forEach(link => {
        links.push({
          href: (link as HTMLAnchorElement).href,
          text: link.textContent?.trim() || '',
          rel: link.getAttribute('rel') || undefined,
        });
      });

      return {
        title: document.title,
        description: getMetaContent('meta[name="description"]'),
        keywords: getMetaContent('meta[name="keywords"]'),
        canonical: getAttribute('link[rel="canonical"]', 'href'),
        robots: getMetaContent('meta[name="robots"]'),
        viewport: getMetaContent('meta[name="viewport"]'),
        lang: document.documentElement.lang,
        charset: document.characterSet,
        ogTitle: getMetaContent('meta[property="og:title"]'),
        ogDescription: getMetaContent('meta[property="og:description"]'),
        ogType: getMetaContent('meta[property="og:type"]'),
        ogImage: getMetaContent('meta[property="og:image"]'),
        ogUrl: getMetaContent('meta[property="og:url"]'),
        twitterCard: getMetaContent('meta[name="twitter:card"]'),
        twitterTitle: getMetaContent('meta[name="twitter:title"]'),
        twitterDescription: getMetaContent('meta[name="twitter:description"]'),
        twitterImage: getMetaContent('meta[name="twitter:image"]'),
        structuredData,
        headings,
        images,
        links,
      };
    });

    // Get performance metrics
    const performance = await this.getPerformanceMetrics();

    return {
      ...metrics,
      performance,
    };
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(): Promise<SEOMetrics['performance']> {
    const performanceMetrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      
      return {
        loadTime: navigation.loadEventEnd - navigation.navigationStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        // Note: LCP, CLS, and FID require more complex measurement
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0,
      };
    });

    return performanceMetrics;
  }

  /**
   * Validate SEO metrics and identify issues
   */
  async validateSEO(metrics: SEOMetrics): Promise<SEOIssue[]> {
    const issues: SEOIssue[] = [];

    // Title validation
    if (!metrics.title) {
      issues.push({
        type: 'error',
        category: 'title',
        message: 'Missing page title',
        impact: 'high',
      });
    } else if (metrics.title.length < 30) {
      issues.push({
        type: 'warning',
        category: 'title',
        message: 'Title is too short (recommended: 30-60 characters)',
        impact: 'medium',
      });
    } else if (metrics.title.length > 60) {
      issues.push({
        type: 'warning',
        category: 'title',
        message: 'Title is too long (recommended: 30-60 characters)',
        impact: 'medium',
      });
    }

    // Description validation
    if (!metrics.description) {
      issues.push({
        type: 'error',
        category: 'description',
        message: 'Missing meta description',
        impact: 'high',
      });
    } else if (metrics.description.length < 120) {
      issues.push({
        type: 'warning',
        category: 'description',
        message: 'Meta description is too short (recommended: 120-160 characters)',
        impact: 'medium',
      });
    } else if (metrics.description.length > 160) {
      issues.push({
        type: 'warning',
        category: 'description',
        message: 'Meta description is too long (recommended: 120-160 characters)',
        impact: 'medium',
      });
    }

    // Canonical URL validation
    if (!metrics.canonical) {
      issues.push({
        type: 'warning',
        category: 'canonical',
        message: 'Missing canonical URL',
        impact: 'medium',
      });
    }

    // Robots validation
    if (!metrics.robots) {
      issues.push({
        type: 'info',
        category: 'robots',
        message: 'No robots meta tag found',
        impact: 'low',
      });
    }

    // Viewport validation
    if (!metrics.viewport) {
      issues.push({
        type: 'error',
        category: 'viewport',
        message: 'Missing viewport meta tag',
        impact: 'high',
      });
    } else if (!metrics.viewport.includes('width=device-width')) {
      issues.push({
        type: 'warning',
        category: 'viewport',
        message: 'Viewport should include width=device-width',
        impact: 'medium',
      });
    }

    // Language validation
    if (!metrics.lang) {
      issues.push({
        type: 'warning',
        category: 'language',
        message: 'Missing language attribute on html element',
        impact: 'medium',
      });
    }

    // Open Graph validation
    if (!metrics.ogTitle) {
      issues.push({
        type: 'warning',
        category: 'opengraph',
        message: 'Missing Open Graph title',
        impact: 'medium',
      });
    }

    if (!metrics.ogDescription) {
      issues.push({
        type: 'warning',
        category: 'opengraph',
        message: 'Missing Open Graph description',
        impact: 'medium',
      });
    }

    if (!metrics.ogImage) {
      issues.push({
        type: 'warning',
        category: 'opengraph',
        message: 'Missing Open Graph image',
        impact: 'medium',
      });
    }

    // Twitter Card validation
    if (!metrics.twitterCard) {
      issues.push({
        type: 'warning',
        category: 'twitter',
        message: 'Missing Twitter Card type',
        impact: 'medium',
      });
    }

    // Heading structure validation
    const h1Count = metrics.headings.filter(h => h.level === 'h1').length;
    if (h1Count === 0) {
      issues.push({
        type: 'error',
        category: 'headings',
        message: 'Missing H1 heading',
        impact: 'high',
      });
    } else if (h1Count > 1) {
      issues.push({
        type: 'warning',
        category: 'headings',
        message: 'Multiple H1 headings found',
        impact: 'medium',
      });
    }

    // Image alt text validation
    const imagesWithoutAlt = metrics.images.filter(img => !img.alt);
    if (imagesWithoutAlt.length > 0) {
      issues.push({
        type: 'warning',
        category: 'images',
        message: `${imagesWithoutAlt.length} images missing alt text`,
        impact: 'medium',
      });
    }

    // Structured data validation
    if (metrics.structuredData.length === 0) {
      issues.push({
        type: 'warning',
        category: 'structured-data',
        message: 'No structured data found',
        impact: 'medium',
      });
    }

    // Performance validation
    if (metrics.performance.loadTime > 3000) {
      issues.push({
        type: 'warning',
        category: 'performance',
        message: 'Page load time is slow (>3 seconds)',
        impact: 'high',
      });
    }

    if (metrics.performance.firstContentfulPaint > 2000) {
      issues.push({
        type: 'warning',
        category: 'performance',
        message: 'First Contentful Paint is slow (>2 seconds)',
        impact: 'high',
      });
    }

    return issues;
  }

  /**
   * Calculate SEO score based on issues
   */
  calculateSEOScore(issues: SEOIssue[]): number {
    let score = 100;

    issues.forEach(issue => {
      switch (issue.impact) {
        case 'high':
          score -= issue.type === 'error' ? 15 : 10;
          break;
        case 'medium':
          score -= issue.type === 'error' ? 10 : 5;
          break;
        case 'low':
          score -= issue.type === 'error' ? 5 : 2;
          break;
      }
    });

    return Math.max(0, score);
  }

  /**
   * Generate recommendations based on issues
   */
  generateRecommendations(issues: SEOIssue[]): string[] {
    const recommendations: string[] = [];

    const issuesByCategory = issues.reduce((acc, issue) => {
      if (!acc[issue.category]) {
        acc[issue.category] = [];
      }
      acc[issue.category].push(issue);
      return acc;
    }, {} as Record<string, SEOIssue[]>);

    // Title recommendations
    if (issuesByCategory.title) {
      recommendations.push('Optimize page title to be between 30-60 characters');
    }

    // Description recommendations
    if (issuesByCategory.description) {
      recommendations.push('Add or optimize meta description (120-160 characters)');
    }

    // Canonical recommendations
    if (issuesByCategory.canonical) {
      recommendations.push('Add canonical URL to prevent duplicate content issues');
    }

    // Open Graph recommendations
    if (issuesByCategory.opengraph) {
      recommendations.push('Add Open Graph meta tags for better social media sharing');
    }

    // Twitter Card recommendations
    if (issuesByCategory.twitter) {
      recommendations.push('Add Twitter Card meta tags for better Twitter sharing');
    }

    // Heading recommendations
    if (issuesByCategory.headings) {
      recommendations.push('Fix heading structure (use single H1, proper hierarchy)');
    }

    // Image recommendations
    if (issuesByCategory.images) {
      recommendations.push('Add alt text to all images for better accessibility and SEO');
    }

    // Structured data recommendations
    if (issuesByCategory['structured-data']) {
      recommendations.push('Add structured data (JSON-LD) to help search engines understand your content');
    }

    // Performance recommendations
    if (issuesByCategory.performance) {
      recommendations.push('Optimize page loading speed and Core Web Vitals');
    }

    return recommendations;
  }

  /**
   * Validate XML sitemap
   */
  async validateSitemap(sitemapUrl: string): Promise<{
    isValid: boolean;
    urls: string[];
    errors: string[];
  }> {
    try {
      const response = await this.page.goto(sitemapUrl);
      
      if (!response || response.status() !== 200) {
        return {
          isValid: false,
          urls: [],
          errors: [`Sitemap not accessible: ${response?.status()}`],
        };
      }

      const content = await response.text();
      const urls: string[] = [];
      const errors: string[] = [];

      // Basic XML validation
      if (!content.includes('<?xml') || !content.includes('<urlset')) {
        errors.push('Invalid XML sitemap format');
      }

      // Extract URLs
      const urlMatches = content.match(/<loc>(.*?)<\/loc>/g);
      if (urlMatches) {
        urlMatches.forEach(match => {
          const url = match.replace(/<\/?loc>/g, '');
          urls.push(url);
        });
      }

      // Validate each URL format
      urls.forEach(url => {
        try {
          new URL(url);
        } catch {
          errors.push(`Invalid URL format: ${url}`);
        }
      });

      return {
        isValid: errors.length === 0,
        urls,
        errors,
      };
    } catch (error) {
      return {
        isValid: false,
        urls: [],
        errors: [`Error validating sitemap: ${error}`],
      };
    }
  }

  /**
   * Validate robots.txt
   */
  async validateRobotsTxt(robotsUrl: string): Promise<{
    isValid: boolean;
    rules: string[];
    errors: string[];
  }> {
    try {
      const response = await this.page.goto(robotsUrl);
      
      if (!response || response.status() !== 200) {
        return {
          isValid: false,
          rules: [],
          errors: [`Robots.txt not accessible: ${response?.status()}`],
        };
      }

      const content = await response.text();
      const rules = content.split('\n').filter(line => line.trim());
      const errors: string[] = [];

      // Basic robots.txt validation
      const hasUserAgent = rules.some(rule => rule.toLowerCase().startsWith('user-agent:'));
      if (!hasUserAgent) {
        errors.push('Missing User-agent directive');
      }

      // Check for sitemap reference
      const hasSitemap = rules.some(rule => rule.toLowerCase().startsWith('sitemap:'));
      if (!hasSitemap) {
        errors.push('Missing Sitemap directive');
      }

      return {
        isValid: errors.length === 0,
        rules,
        errors,
      };
    } catch (error) {
      return {
        isValid: false,
        rules: [],
        errors: [`Error validating robots.txt: ${error}`],
      };
    }
  }

  /**
   * Test page indexability
   */
  async testIndexability(): Promise<{
    isIndexable: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    // Check robots meta tag
    const robotsContent = await this.page.locator('meta[name="robots"]').getAttribute('content');
    if (robotsContent) {
      if (robotsContent.includes('noindex')) {
        issues.push('Page has noindex directive');
      }
      if (robotsContent.includes('nofollow')) {
        issues.push('Page has nofollow directive');
      }
    }

    // Check for password protection or login requirements
    const hasPasswordField = await this.page.locator('input[type="password"]').count() > 0;
    const hasLoginForm = await this.page.locator('form[action*="login"], form[action*="signin"]').count() > 0;
    
    if (hasPasswordField || hasLoginForm) {
      issues.push('Page may require authentication');
    }

    // Check for redirects
    const currentUrl = this.page.url();
    const response = await this.page.goto(currentUrl);
    
    if (response && response.status() >= 300 && response.status() < 400) {
      issues.push(`Page redirects with status ${response.status()}`);
    }

    return {
      isIndexable: issues.length === 0,
      issues,
    };
  }

  /**
   * Analyze internal linking structure
   */
  async analyzeInternalLinks(): Promise<{
    totalLinks: number;
    internalLinks: number;
    externalLinks: number;
    brokenLinks: string[];
    recommendations: string[];
  }> {
    const links = await this.page.evaluate(() => {
      const linkElements = document.querySelectorAll('a[href]');
      const currentDomain = window.location.hostname;
      
      return Array.from(linkElements).map(link => ({
        href: (link as HTMLAnchorElement).href,
        text: link.textContent?.trim() || '',
        isInternal: (link as HTMLAnchorElement).hostname === currentDomain,
      }));
    });

    const totalLinks = links.length;
    const internalLinks = links.filter(link => link.isInternal).length;
    const externalLinks = totalLinks - internalLinks;
    const brokenLinks: string[] = [];
    const recommendations: string[] = [];

    // Check for broken links (basic check)
    for (const link of links.slice(0, 10)) { // Check first 10 links
      try {
        const response = await this.page.goto(link.href);
        if (response && response.status() >= 400) {
          brokenLinks.push(link.href);
        }
      } catch {
        brokenLinks.push(link.href);
      }
    }

    // Generate recommendations
    if (internalLinks < 3) {
      recommendations.push('Add more internal links to improve site navigation');
    }

    if (brokenLinks.length > 0) {
      recommendations.push('Fix broken links to improve user experience');
    }

    if (externalLinks > totalLinks * 0.3) {
      recommendations.push('Consider adding rel="nofollow" to external links');
    }

    return {
      totalLinks,
      internalLinks,
      externalLinks,
      brokenLinks,
      recommendations,
    };
  }
}

/**
 * SEO test configurations for different page types
 */
export const seoTestConfigs = {
  homepage: {
    requiredElements: ['h1', 'meta[name="description"]', 'title'],
    maxLoadTime: 2000,
    minScore: 90,
  },
  portfolio: {
    requiredElements: ['h1', 'meta[name="description"]', 'title', 'meta[property="og:image"]'],
    maxLoadTime: 3000,
    minScore: 85,
  },
  blog: {
    requiredElements: ['h1', 'meta[name="description"]', 'title', 'meta[name="author"]'],
    maxLoadTime: 2500,
    minScore: 80,
  },
  product: {
    requiredElements: ['h1', 'meta[name="description"]', 'title', 'script[type="application/ld+json"]'],
    maxLoadTime: 2000,
    minScore: 85,
  },
};