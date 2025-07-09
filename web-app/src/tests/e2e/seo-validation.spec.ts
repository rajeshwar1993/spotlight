import { test, expect } from '@playwright/test';
import { SEOValidationUtils, seoTestConfigs } from './utils/seo-validation-utils';

test.describe('SEO Validation Tests', () => {
  let seoUtils: SEOValidationUtils;
  
  test.beforeEach(async ({ page }) => {
    seoUtils = new SEOValidationUtils(page);
  });

  test.describe('Homepage SEO', () => {
    test('should have optimal SEO for homepage', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const seoResult = await seoUtils.analyzeSEO();
      
      console.log('Homepage SEO Analysis:', seoResult);
      
      // Check SEO score
      expect(seoResult.score).toBeGreaterThanOrEqual(seoTestConfigs.homepage.minScore);
      
      // Check required elements
      expect(seoResult.metrics.title).toBeTruthy();
      expect(seoResult.metrics.description).toBeTruthy();
      expect(seoResult.metrics.canonical).toBeTruthy();
      
      // Check title length
      expect(seoResult.metrics.title.length).toBeGreaterThan(30);
      expect(seoResult.metrics.title.length).toBeLessThan(60);
      
      // Check description length
      expect(seoResult.metrics.description.length).toBeGreaterThan(120);
      expect(seoResult.metrics.description.length).toBeLessThan(160);
      
      // Check Open Graph tags
      expect(seoResult.metrics.ogTitle).toBeTruthy();
      expect(seoResult.metrics.ogDescription).toBeTruthy();
      expect(seoResult.metrics.ogImage).toBeTruthy();
      
      // Check heading structure
      const h1Count = seoResult.metrics.headings.filter(h => h.level === 'h1').length;
      expect(h1Count).toBe(1);
      
      // Check performance
      expect(seoResult.metrics.performance.loadTime).toBeLessThan(seoTestConfigs.homepage.maxLoadTime);
    });

    test('should have valid structured data', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const seoResult = await seoUtils.analyzeSEO();
      
      // Should have structured data
      expect(seoResult.metrics.structuredData.length).toBeGreaterThan(0);
      
      // Check for Website schema
      const websiteSchema = seoResult.metrics.structuredData.find(
        schema => schema['@type'] === 'WebSite'
      );
      expect(websiteSchema).toBeTruthy();
      
      // Check for Organization schema
      const organizationSchema = seoResult.metrics.structuredData.find(
        schema => schema['@type'] === 'Organization'
      );
      expect(organizationSchema).toBeTruthy();
    });

    test('should have proper meta tags', async ({ page }) => {
      await page.goto('/');
      
      // Check viewport meta tag
      const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
      expect(viewport).toContain('width=device-width');
      
      // Check robots meta tag
      const robots = await page.locator('meta[name="robots"]').getAttribute('content');
      expect(robots).toBeTruthy();
      
      // Check language
      const lang = await page.locator('html').getAttribute('lang');
      expect(lang).toBeTruthy();
      
      // Check charset
      const charset = await page.locator('meta[charset]').getAttribute('charset');
      expect(charset).toBeTruthy();
    });
  });

  test.describe('Portfolio Pages SEO', () => {
    test('should have optimal SEO for portfolio pages', async ({ page }) => {
      await page.goto('/examples');
      await page.waitForLoadState('networkidle');
      
      // Click on first portfolio
      const firstPortfolio = page.locator('[data-testid="portfolio-card"]').first();
      await firstPortfolio.click();
      
      await page.waitForLoadState('networkidle');
      
      const seoResult = await seoUtils.analyzeSEO();
      
      console.log('Portfolio SEO Analysis:', seoResult);
      
      // Check SEO score
      expect(seoResult.score).toBeGreaterThanOrEqual(seoTestConfigs.portfolio.minScore);
      
      // Check required elements
      expect(seoResult.metrics.title).toBeTruthy();
      expect(seoResult.metrics.description).toBeTruthy();
      expect(seoResult.metrics.ogImage).toBeTruthy();
      
      // Check Person schema
      const personSchema = seoResult.metrics.structuredData.find(
        schema => schema['@type'] === 'Person'
      );
      expect(personSchema).toBeTruthy();
      
      // Check performance
      expect(seoResult.metrics.performance.loadTime).toBeLessThan(seoTestConfigs.portfolio.maxLoadTime);
    });

    test('should have unique meta tags for each portfolio', async ({ page }) => {
      await page.goto('/examples');
      await page.waitForLoadState('networkidle');
      
      // Get first portfolio data
      const firstPortfolio = page.locator('[data-testid="portfolio-card"]').first();
      await firstPortfolio.click();
      await page.waitForLoadState('networkidle');
      
      const firstSeoResult = await seoUtils.analyzeSEO();
      
      // Go back and check second portfolio
      await page.goBack();
      await page.waitForLoadState('networkidle');
      
      const secondPortfolio = page.locator('[data-testid="portfolio-card"]').nth(1);
      await secondPortfolio.click();
      await page.waitForLoadState('networkidle');
      
      const secondSeoResult = await seoUtils.analyzeSEO();
      
      // Meta tags should be different
      expect(firstSeoResult.metrics.title).not.toBe(secondSeoResult.metrics.title);
      expect(firstSeoResult.metrics.description).not.toBe(secondSeoResult.metrics.description);
      expect(firstSeoResult.metrics.ogTitle).not.toBe(secondSeoResult.metrics.ogTitle);
    });
  });

  test.describe('Image SEO', () => {
    test('should have proper alt text for images', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const seoResult = await seoUtils.analyzeSEO();
      
      // Check that all images have alt text
      const imagesWithoutAlt = seoResult.metrics.images.filter(img => !img.alt);
      expect(imagesWithoutAlt.length).toBe(0);
      
      // Check that alt text is descriptive (not empty or just filename)
      seoResult.metrics.images.forEach(img => {
        expect(img.alt.length).toBeGreaterThan(3);
        expect(img.alt).not.toMatch(/\.(jpg|jpeg|png|gif|webp)$/i);
      });
    });

    test('should have proper image dimensions', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const seoResult = await seoUtils.analyzeSEO();
      
      // Check that important images have width and height attributes
      const importantImages = seoResult.metrics.images.filter(img => 
        img.src.includes('hero') || img.src.includes('logo') || img.src.includes('featured')
      );
      
      importantImages.forEach(img => {
        expect(img.width || img.height).toBeTruthy();
      });
    });
  });

  test.describe('Technical SEO', () => {
    test('should have valid sitemap', async ({ page }) => {
      const sitemapResult = await seoUtils.validateSitemap('/sitemap.xml');
      
      console.log('Sitemap Validation:', sitemapResult);
      
      expect(sitemapResult.isValid).toBe(true);
      expect(sitemapResult.urls.length).toBeGreaterThan(0);
      expect(sitemapResult.errors.length).toBe(0);
      
      // Check that important pages are included
      const importantPages = ['/', '/create', '/examples', '/about'];
      importantPages.forEach(page => {
        const hasPage = sitemapResult.urls.some(url => url.includes(page));
        expect(hasPage).toBe(true);
      });
    });

    test('should have valid robots.txt', async ({ page }) => {
      const robotsResult = await seoUtils.validateRobotsTxt('/robots.txt');
      
      console.log('Robots.txt Validation:', robotsResult);
      
      expect(robotsResult.isValid).toBe(true);
      expect(robotsResult.errors.length).toBe(0);
      
      // Check that sitemap is referenced
      const hasSitemapReference = robotsResult.rules.some(rule => 
        rule.toLowerCase().includes('sitemap:')
      );
      expect(hasSitemapReference).toBe(true);
    });

    test('should be indexable', async ({ page }) => {
      await page.goto('/');
      
      const indexabilityResult = await seoUtils.testIndexability();
      
      console.log('Indexability Test:', indexabilityResult);
      
      expect(indexabilityResult.isIndexable).toBe(true);
      expect(indexabilityResult.issues.length).toBe(0);
    });

    test('should have proper canonical URLs', async ({ page }) => {
      const testPages = ['/', '/create', '/examples', '/about'];
      
      for (const testPage of testPages) {
        await page.goto(testPage);
        await page.waitForLoadState('networkidle');
        
        const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
        expect(canonical).toBeTruthy();
        expect(canonical).toContain(testPage);
      }
    });
  });

  test.describe('Internal Linking', () => {
    test('should have proper internal linking structure', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const linkingResult = await seoUtils.analyzeInternalLinks();
      
      console.log('Internal Linking Analysis:', linkingResult);
      
      // Should have reasonable number of internal links
      expect(linkingResult.internalLinks).toBeGreaterThan(5);
      
      // Should not have too many external links
      const externalLinkRatio = linkingResult.externalLinks / linkingResult.totalLinks;
      expect(externalLinkRatio).toBeLessThan(0.3);
      
      // Should have no broken links
      expect(linkingResult.brokenLinks.length).toBe(0);
    });

    test('should have proper navigation structure', async ({ page }) => {
      await page.goto('/');
      
      // Check main navigation
      const mainNav = page.locator('[data-testid="main-navigation"]');
      await expect(mainNav).toBeVisible();
      
      // Check breadcrumbs on deeper pages
      await page.goto('/examples');
      const breadcrumbs = page.locator('[data-testid="breadcrumbs"]');
      await expect(breadcrumbs).toBeVisible();
    });
  });

  test.describe('Mobile SEO', () => {
    test('should be mobile-friendly', async ({ page, browserName }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const seoResult = await seoUtils.analyzeSEO();
      
      // Check viewport meta tag
      expect(seoResult.metrics.viewport).toContain('width=device-width');
      
      // Check that content is accessible on mobile
      const mainContent = page.locator('main');
      await expect(mainContent).toBeVisible();
      
      // Check that buttons are touch-friendly
      const buttons = await page.locator('button, a').all();
      for (const button of buttons.slice(0, 5)) {
        const box = await button.boundingBox();
        if (box) {
          expect(Math.min(box.width, box.height)).toBeGreaterThan(44);
        }
      }
    });

    test('should have responsive images', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check for responsive image attributes
      const images = await page.locator('img').all();
      for (const img of images.slice(0, 5)) {
        const srcset = await img.getAttribute('srcset');
        const sizes = await img.getAttribute('sizes');
        
        // At least one responsive attribute should be present
        expect(srcset || sizes).toBeTruthy();
      }
    });
  });

  test.describe('Page Speed SEO', () => {
    test('should meet Core Web Vitals', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const seoResult = await seoUtils.analyzeSEO();
      
      // Check load time
      expect(seoResult.metrics.performance.loadTime).toBeLessThan(3000);
      
      // Check First Contentful Paint
      expect(seoResult.metrics.performance.firstContentfulPaint).toBeLessThan(2000);
      
      // Check DOM Content Loaded
      expect(seoResult.metrics.performance.domContentLoaded).toBeLessThan(1500);
    });

    test('should have optimized resource loading', async ({ page }) => {
      await page.goto('/');
      
      // Check for preload hints
      const preloadLinks = await page.locator('link[rel="preload"]').count();
      expect(preloadLinks).toBeGreaterThan(0);
      
      // Check for proper caching headers
      const response = await page.goto('/');
      const cacheControl = response?.headers()['cache-control'];
      expect(cacheControl).toBeTruthy();
    });
  });

  test.describe('Schema.org Markup', () => {
    test('should have valid JSON-LD structured data', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const seoResult = await seoUtils.analyzeSEO();
      
      // Should have structured data
      expect(seoResult.metrics.structuredData.length).toBeGreaterThan(0);
      
      // Validate JSON-LD format
      seoResult.metrics.structuredData.forEach(schema => {
        expect(schema['@context']).toBe('https://schema.org');
        expect(schema['@type']).toBeTruthy();
      });
    });

    test('should have proper LocalBusiness schema for business pages', async ({ page }) => {
      await page.goto('/about');
      await page.waitForLoadState('networkidle');
      
      const seoResult = await seoUtils.analyzeSEO();
      
      // Check for LocalBusiness schema
      const businessSchema = seoResult.metrics.structuredData.find(
        schema => schema['@type'] === 'LocalBusiness' || schema['@type'] === 'Organization'
      );
      
      if (businessSchema) {
        expect(businessSchema.name).toBeTruthy();
        expect(businessSchema.description).toBeTruthy();
      }
    });
  });

  test.describe('International SEO', () => {
    test('should have proper hreflang tags for multilingual sites', async ({ page }) => {
      await page.goto('/');
      
      // Check for hreflang tags
      const hreflangTags = await page.locator('link[hreflang]').count();
      
      // If site supports multiple languages, should have hreflang
      const languageSelector = page.locator('[data-testid="language-selector"]');
      const hasLanguageSelector = await languageSelector.count() > 0;
      
      if (hasLanguageSelector) {
        expect(hreflangTags).toBeGreaterThan(0);
      }
    });

    test('should have proper language declarations', async ({ page }) => {
      await page.goto('/');
      
      // Check HTML lang attribute
      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBeTruthy();
      expect(htmlLang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
      
      // Check if content language matches
      const contentLang = await page.locator('meta[http-equiv="content-language"]').getAttribute('content');
      if (contentLang) {
        expect(contentLang).toBe(htmlLang);
      }
    });
  });

  test.describe('SEO Monitoring', () => {
    test('should track SEO performance over time', async ({ page }) => {
      const pages = ['/', '/create', '/examples', '/about'];
      const results = [];
      
      for (const testPage of pages) {
        await page.goto(testPage);
        await page.waitForLoadState('networkidle');
        
        const seoResult = await seoUtils.analyzeSEO();
        results.push({
          page: testPage,
          score: seoResult.score,
          issues: seoResult.issues.length,
          loadTime: seoResult.metrics.performance.loadTime,
        });
      }
      
      console.log('SEO Performance Summary:', results);
      
      // All pages should meet minimum score
      results.forEach(result => {
        expect(result.score).toBeGreaterThanOrEqual(70);
        expect(result.loadTime).toBeLessThan(5000);
      });
    });
  });
});