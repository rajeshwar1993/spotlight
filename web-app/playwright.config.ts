import { defineConfig, devices } from '@playwright/test';

/**
 * Enhanced Playwright configuration for comprehensive cross-browser testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './src/tests/e2e',
  /* Output directory for test results */
  outputDir: 'test-results/',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['github'],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    /* Video on failure */
    video: 'retain-on-failure',
    /* Enable screenshot comparison for visual regression testing */
    actionTimeout: 30000,
    navigationTimeout: 30000,
    /* Global test timeout */
    testIdAttribute: 'data-testid',
  },

  /* Configure projects for comprehensive browser coverage */
  projects: [
    /* Desktop Browsers */
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: 'chromium-1440',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
      },
    },

    /* Branded Browsers */
    {
      name: 'edge',
      use: { 
        ...devices['Desktop Edge'], 
        channel: 'msedge',
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'chrome',
      use: { 
        ...devices['Desktop Chrome'], 
        channel: 'chrome',
        viewport: { width: 1920, height: 1080 },
      },
    },

    /* Mobile Devices - Android */
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-chrome-landscape',
      use: { 
        ...devices['Pixel 5'],
        viewport: { width: 851, height: 393 },
      },
    },
    {
      name: 'galaxy-s21',
      use: { ...devices['Galaxy S21'] },
    },
    {
      name: 'galaxy-tab',
      use: { ...devices['Galaxy Tab S4'] },
    },

    /* Mobile Devices - iOS */
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'mobile-safari-landscape',
      use: { 
        ...devices['iPhone 12'],
        viewport: { width: 844, height: 390 },
      },
    },
    {
      name: 'iphone-13-pro',
      use: { ...devices['iPhone 13 Pro'] },
    },
    {
      name: 'iphone-se',
      use: { ...devices['iPhone SE'] },
    },
    {
      name: 'ipad',
      use: { ...devices['iPad Pro'] },
    },
    {
      name: 'ipad-landscape',
      use: { 
        ...devices['iPad Pro'],
        viewport: { width: 1366, height: 1024 },
      },
    },

    /* Tablet Devices */
    {
      name: 'tablet-chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },

    /* High DPI Displays */
    {
      name: 'chromium-2x',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 2,
      },
    },

    /* Accessibility Testing */
    {
      name: 'chromium-accessibility',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        reducedMotion: 'reduce',
        colorScheme: 'no-preference',
      },
    },

    /* Performance Testing */
    {
      name: 'chromium-slow-3g',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          args: ['--simulate-slow-3g'],
        },
      },
    },

    /* Different Screen Resolutions */
    {
      name: 'chromium-4k',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 3840, height: 2160 },
        deviceScaleFactor: 2,
      },
    },
    {
      name: 'chromium-1024',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1024, height: 768 },
        deviceScaleFactor: 1,
      },
    },
  ],

  /* Global test timeout */
  timeout: 60000,
  expect: {
    /* Timeout for expect() assertions */
    timeout: 10000,
    /* Threshold for screenshot comparisons */
    threshold: 0.2,
    /* Animation handling for visual tests */
    animations: 'disabled',
  },

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});