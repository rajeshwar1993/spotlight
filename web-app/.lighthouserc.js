module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'ready on',
      startServerReadyTimeout: 30000,
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        chromeFlags: '--no-sandbox --headless --disable-dev-shm-usage',
      },
    },
    assert: {
      assertions: {
        // Performance assertions
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        'categories:pwa': ['warn', { minScore: 0.8 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        
        // Resource hints
        'uses-rel-preload': 'warn',
        'uses-rel-preconnect': 'warn',
        'uses-rel-dns-prefetch': 'warn',
        
        // Images
        'modern-image-formats': 'warn',
        'uses-optimized-images': 'warn',
        'uses-responsive-images': 'warn',
        'efficient-animated-content': 'warn',
        
        // JavaScript
        'unused-javascript': 'warn',
        'unminified-javascript': 'error',
        'legacy-javascript': 'warn',
        
        // CSS
        'unused-css-rules': 'warn',
        'unminified-css': 'error',
        
        // Fonts
        'font-display': 'warn',
        'preload-fonts': 'warn',
        
        // Network
        'uses-text-compression': 'warn',
        'uses-long-cache-ttl': 'warn',
        
        // Accessibility
        'color-contrast': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        'button-name': 'error',
        'aria-allowed-attr': 'error',
        'aria-required-attr': 'error',
        'aria-valid-attr': 'error',
        'aria-valid-attr-value': 'error',
        'heading-order': 'warn',
        'meta-viewport': 'error',
        'duplicate-id-aria': 'error',
        'duplicate-id-active': 'error',
        
        // SEO
        'meta-description': 'error',
        'document-title': 'error',
        'html-has-lang': 'error',
        'html-lang-valid': 'error',
        'hreflang': 'warn',
        'canonical': 'warn',
        'robots-txt': 'warn',
        
        // Best Practices
        'is-on-https': 'error',
        'uses-http2': 'warn',
        'no-vulnerable-libraries': 'error',
        'csp-xss': 'warn',
        'password-inputs-can-be-pasted-into': 'warn',
        'image-aspect-ratio': 'warn',
        'image-size-responsive': 'warn',
        
        // PWA
        'installable-manifest': 'warn',
        'splash-screen': 'warn',
        'themed-omnibox': 'warn',
        'content-width': 'warn',
        'viewport': 'error',
        'without-javascript': 'warn',
        'apple-touch-icon': 'warn',
        'maskable-icon': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
      githubAppToken: process.env.LHCI_GITHUB_APP_TOKEN,
    },
  },
};