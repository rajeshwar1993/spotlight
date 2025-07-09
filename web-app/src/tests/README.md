# Testing Infrastructure

This directory contains the comprehensive testing infrastructure for the Spotlight application, implementing multiple layers of automated testing to ensure high quality, security, and performance.

## Quick Start

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run all tests
npm run test

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

## Directory Structure

```
src/tests/
├── e2e/                          # End-to-end tests
│   ├── utils/                    # E2E testing utilities
│   │   ├── cross-browser-utils.ts
│   │   ├── seo-validation-utils.ts
│   │   └── security-testing-utils.ts
│   ├── cross-browser-compatibility.spec.ts
│   ├── email-verification-flows.spec.ts
│   ├── load-testing.spec.ts
│   ├── mobile-touch-interactions.spec.ts
│   ├── security-testing.spec.ts
│   ├── seo-validation.spec.ts
│   └── visual-regression.spec.ts
├── qa-dashboard/                 # QA dashboard
│   └── index.html
└── README.md
```

## Test Categories

### 1. 🧪 Unit Tests
- **Location**: `src/components/**/__tests__/`
- **Framework**: Vitest + React Testing Library
- **Coverage**: Individual components and utilities
- **Run**: `npm run test`

### 2. 🔗 Integration Tests
- **Location**: `src/tests/integration/`
- **Framework**: Vitest + MSW
- **Coverage**: API endpoints and component interactions
- **Run**: `npm run test:integration`

### 3. 🌐 End-to-End Tests
- **Location**: `src/tests/e2e/`
- **Framework**: Playwright
- **Coverage**: Complete user workflows
- **Run**: `npm run test:e2e`

### 4. 🔒 Security Tests
- **Location**: `src/tests/e2e/security-testing.spec.ts`
- **Framework**: Playwright + Custom Security Utils
- **Coverage**: XSS, CSRF, authentication vulnerabilities
- **Run**: `npm run test:e2e -- security-testing.spec.ts`

### 5. ⚡ Performance Tests
- **Location**: `src/tests/e2e/load-testing.spec.ts`
- **Framework**: Playwright + Performance Utils
- **Coverage**: Load testing, performance metrics
- **Run**: `npm run test:e2e -- load-testing.spec.ts`

### 6. 🎨 Visual Regression Tests
- **Location**: `src/tests/e2e/visual-regression.spec.ts`
- **Framework**: Playwright Screenshots
- **Coverage**: UI consistency across browsers
- **Run**: `npm run test:e2e -- visual-regression.spec.ts`

### 7. 📱 Mobile Tests
- **Location**: `src/tests/e2e/mobile-touch-interactions.spec.ts`
- **Framework**: Playwright Mobile
- **Coverage**: Touch interactions, responsive design
- **Run**: `npm run test:e2e -- mobile-touch-interactions.spec.ts`

### 8. 🔍 SEO Tests
- **Location**: `src/tests/e2e/seo-validation.spec.ts`
- **Framework**: Playwright + SEO Utils
- **Coverage**: Meta tags, structured data, performance
- **Run**: `npm run test:e2e -- seo-validation.spec.ts`

## Testing Utilities

### Cross-Browser Testing Utils

```typescript
import { CrossBrowserTestUtils } from './utils/cross-browser-utils';

const utils = new CrossBrowserTestUtils(page);
const browserInfo = await utils.getBrowserInfo();
const featureSupport = await utils.testCSSFeatureSupport(['display: grid']);
```

### SEO Validation Utils

```typescript
import { SEOValidationUtils } from './utils/seo-validation-utils';

const seoUtils = new SEOValidationUtils(page);
const seoResult = await seoUtils.analyzeSEO();
const sitemapResult = await seoUtils.validateSitemap('/sitemap.xml');
```

### Security Testing Utils

```typescript
import { SecurityTestingUtils } from './utils/security-testing-utils';

const securityUtils = new SecurityTestingUtils(page);
const securityResult = await securityUtils.runSecurityTests();
const xssVulnerabilities = await securityUtils.testXSSVulnerabilities();
```

## Test Configuration

### Playwright Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './src/tests/e2e',
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
    // ... more configurations
  ],
});
```

### Vitest Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
```

## Quality Gates

Our CI/CD pipeline includes comprehensive quality gates:

### 1. 📝 Code Quality Gate
- ✅ ESLint passing
- ✅ TypeScript compilation
- ✅ Code formatting (Prettier)
- ✅ No unused dependencies

### 2. 🧪 Unit Test Gate
- ✅ All unit tests passing
- ✅ Coverage threshold met (80%)
- ✅ No flaky tests

### 3. 🏗️ Build Gate
- ✅ Successful build
- ✅ Bundle size within limits
- ✅ No build warnings

### 4. 🌐 E2E Test Gate
- ✅ Cross-browser compatibility
- ✅ Critical user flows working
- ✅ Mobile responsiveness

### 5. 🔒 Security Gate
- ✅ No critical vulnerabilities
- ✅ Security score > 85
- ✅ Authentication flows secure

### 6. ⚡ Performance Gate
- ✅ Lighthouse score > 90
- ✅ Load time < 2 seconds
- ✅ Core Web Vitals passing

### 7. ♿ Accessibility Gate
- ✅ WCAG 2.1 AA compliance
- ✅ Screen reader compatibility
- ✅ Keyboard navigation

## Running Tests

### Local Development

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test -- portfolio.test.ts

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run specific E2E test
npm run test:e2e -- security-testing.spec.ts

# Run tests for specific browser
npm run test:e2e -- --project=chromium
```

### CI/CD Pipeline

Tests are automatically run in our comprehensive CI/CD pipeline:

```yaml
# GitHub Actions workflow runs:
1. Code Quality checks
2. Unit tests with coverage
3. Build analysis
4. Cross-browser E2E tests
5. Security testing
6. Performance testing
7. Accessibility testing
8. Quality gate summary
9. Deployment (if all gates pass)
```

## Writing Tests

### Unit Test Example

```typescript
// src/components/Button/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### E2E Test Example

```typescript
// src/tests/e2e/portfolio-creation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Portfolio Creation', () => {
  test('user can create a portfolio', async ({ page }) => {
    await page.goto('/create');
    
    await page.fill('[data-testid="name-input"]', 'John Doe');
    await page.fill('[data-testid="email-input"]', 'john@example.com');
    await page.selectOption('[data-testid="profession-select"]', 'actor');
    
    await page.click('[data-testid="continue-button"]');
    await expect(page.locator('[data-testid="template-selection"]')).toBeVisible();
  });
});
```

### Security Test Example

```typescript
// src/tests/e2e/security-testing.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Security Testing', () => {
  test('should prevent XSS attacks', async ({ page }) => {
    await page.goto('/create');
    
    const xssPayload = '<script>alert("XSS")</script>';
    await page.fill('[data-testid="name-input"]', xssPayload);
    await page.click('[data-testid="submit-button"]');
    
    // Verify script was not executed
    const bodyContent = await page.textContent('body');
    expect(bodyContent).not.toContain('<script>');
  });
});
```

## Test Data Management

### Mock Data

```typescript
// src/test/fixtures/users.ts
export const testUsers = {
  actor: {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    profession: 'actor'
  },
  model: {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    profession: 'model'
  }
};
```

### MSW Handlers

```typescript
// src/test/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/portfolios', (req, res, ctx) => {
    return res(ctx.json([
      { id: '1', title: 'John Doe', profession: 'actor' }
    ]));
  }),

  rest.post('/api/auth/signin', (req, res, ctx) => {
    return res(ctx.json({ 
      user: { id: '1', email: 'test@example.com' } 
    }));
  })
];
```

## Performance Monitoring

### Core Web Vitals

We monitor and test for:
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms
- **Total Blocking Time (TBT)**: < 300ms

### Bundle Size Monitoring

```typescript
// Bundle size limits
const BUNDLE_SIZE_LIMITS = {
  main: '500KB',
  vendor: '1MB',
  total: '2MB'
};
```

## Security Testing

### Vulnerability Types Tested

1. **XSS (Cross-Site Scripting)**
   - Reflected XSS
   - Stored XSS
   - DOM-based XSS

2. **CSRF (Cross-Site Request Forgery)**
   - Token validation
   - Origin header validation
   - SameSite cookie attributes

3. **Injection Attacks**
   - SQL injection
   - NoSQL injection
   - Command injection

4. **Authentication Security**
   - Password policies
   - Session management
   - Rate limiting

5. **Information Disclosure**
   - Sensitive file exposure
   - Error message leakage
   - Debug information

## QA Dashboard

Access the QA dashboard at: `src/tests/qa-dashboard/index.html`

The dashboard provides:
- 📊 Real-time test results
- 🔍 Security scan results
- ⚡ Performance metrics
- 📈 Coverage reports
- 🌐 Cross-browser compatibility
- 📱 Mobile test results

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Clean up after each test
- Use fresh test data

### 2. Reliable Selectors
- Use `data-testid` attributes
- Avoid CSS selectors that may change
- Use semantic selectors when possible

### 3. Performance
- Run tests in parallel
- Use efficient waiting strategies
- Clean up resources

### 4. Maintainability
- Use descriptive test names
- Keep tests simple and focused
- Use helper functions and utilities

### 5. Coverage
- Aim for 80%+ code coverage
- Focus on critical paths
- Test edge cases and error conditions

## Troubleshooting

### Common Issues

1. **Flaky Tests**
   - Use proper wait strategies
   - Disable animations
   - Check for timing issues

2. **CI/CD Failures**
   - Check environment variables
   - Verify dependencies
   - Review resource limits

3. **Browser Compatibility**
   - Test across all supported browsers
   - Check for browser-specific issues
   - Use appropriate polyfills

### Debug Commands

```bash
# Run tests with debug output
npm run test -- --verbose

# Run E2E tests with UI
npm run test:e2e:ui

# Run specific test with debug
npm run test:e2e -- --debug security-testing.spec.ts

# Generate coverage report
npm run test:coverage
```

## Contributing

When adding new tests:

1. Follow the existing patterns
2. Add appropriate documentation
3. Ensure tests are reliable and fast
4. Update this README if needed
5. Add new test categories to CI/CD pipeline

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [MSW Documentation](https://mswjs.io/)
- [Main Testing Guide](../TESTING_GUIDE.md)

---

*This testing infrastructure ensures high-quality, secure, and performant software delivery through comprehensive automated testing.*