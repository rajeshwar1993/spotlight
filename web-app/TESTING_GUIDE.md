# Comprehensive Testing Guide for Spotlight

## Overview

This guide provides comprehensive documentation for the testing infrastructure implemented for the Spotlight portfolio platform. The testing suite ensures high-quality, secure, and performant applications through multiple layers of automated testing.

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Test Types](#test-types)
3. [Setup and Configuration](#setup-and-configuration)
4. [Running Tests](#running-tests)
5. [Writing Tests](#writing-tests)
6. [Quality Gates](#quality-gates)
7. [CI/CD Integration](#cicd-integration)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)
10. [Performance Guidelines](#performance-guidelines)

## Testing Strategy

### Testing Pyramid

Our testing strategy follows the testing pyramid approach:

```
    /\
   /  \    E2E Tests (Few)
  /____\   
 /      \  Integration Tests (Some)
/________\  Unit Tests (Many)
```

- **Unit Tests (70%)**: Fast, isolated tests for individual components and functions
- **Integration Tests (20%)**: Tests for API endpoints and component interactions
- **E2E Tests (10%)**: Full user journey tests across browsers

### Quality Assurance Levels

1. **Code Quality**: Linting, formatting, type checking
2. **Unit Testing**: Component and function testing with coverage
3. **Integration Testing**: API and database testing
4. **Security Testing**: XSS, CSRF, authentication vulnerabilities
5. **Performance Testing**: Load testing, lighthouse scores
6. **Accessibility Testing**: WCAG compliance
7. **Cross-Browser Testing**: Compatibility across browsers
8. **Visual Regression Testing**: UI consistency checks

## Test Types

### 1. Unit Tests

**Location**: `src/components/**/__tests__/`, `src/lib/**/__tests__/`
**Framework**: Vitest + React Testing Library
**Purpose**: Test individual components and utility functions

```typescript
// Example unit test
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 2. Integration Tests

**Location**: `src/tests/integration/`
**Framework**: Vitest + MSW (Mock Service Worker)
**Purpose**: Test API endpoints and component interactions

```typescript
// Example integration test
import { render, screen, waitFor } from '@testing-library/react';
import { server } from '../mocks/server';
import { rest } from 'msw';
import { PortfolioList } from '../PortfolioList';

describe('Portfolio List Integration', () => {
  it('fetches and displays portfolios', async () => {
    server.use(
      rest.get('/api/portfolios', (req, res, ctx) => {
        return res(ctx.json([
          { id: '1', title: 'John Doe', profession: 'actor' }
        ]));
      })
    );

    render(<PortfolioList />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
```

### 3. End-to-End Tests

**Location**: `src/tests/e2e/`
**Framework**: Playwright
**Purpose**: Test complete user workflows

```typescript
// Example E2E test
import { test, expect } from '@playwright/test';

test.describe('Portfolio Creation', () => {
  test('user can create a portfolio', async ({ page }) => {
    await page.goto('/create');
    
    await page.fill('[data-testid="full-name-input"]', 'John Doe');
    await page.fill('[data-testid="email-input"]', 'john@example.com');
    await page.selectOption('[data-testid="profession-select"]', 'actor');
    await page.click('[data-testid="continue-button"]');
    
    await expect(page.locator('[data-testid="template-selection"]')).toBeVisible();
  });
});
```

### 4. Security Tests

**Location**: `src/tests/e2e/security-testing.spec.ts`
**Framework**: Playwright with custom security utilities
**Purpose**: Test for common security vulnerabilities

```typescript
// Example security test
import { test, expect } from '@playwright/test';
import { SecurityTestingUtils } from './utils/security-testing-utils';

test.describe('Security Testing', () => {
  test('should prevent XSS attacks', async ({ page }) => {
    const securityUtils = new SecurityTestingUtils(page);
    
    await page.goto('/create');
    await page.fill('[data-testid="name-input"]', '<script>alert("XSS")</script>');
    await page.click('[data-testid="submit-button"]');
    
    // Verify script was not executed
    const xssVulnerabilities = await securityUtils.testXSSVulnerabilities();
    expect(xssVulnerabilities).toHaveLength(0);
  });
});
```

### 5. Performance Tests

**Location**: `src/tests/e2e/load-testing.spec.ts`
**Framework**: Playwright with performance utilities
**Purpose**: Test application performance under load

```typescript
// Example performance test
import { test, expect } from '@playwright/test';

test.describe('Performance Testing', () => {
  test('should load homepage within 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000);
  });
});
```

### 6. Accessibility Tests

**Location**: `src/test/accessibility.ts`
**Framework**: Axe-core with Playwright
**Purpose**: Ensure WCAG compliance

```typescript
// Example accessibility test
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility', () => {
  test('should have no accessibility violations', async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
    
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true }
    });
  });
});
```

### 7. Visual Regression Tests

**Location**: `src/tests/e2e/visual-regression.spec.ts`
**Framework**: Playwright with screenshot comparison
**Purpose**: Detect visual changes

```typescript
// Example visual regression test
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('homepage should match design', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('homepage.png', {
      threshold: 0.2,
      animations: 'disabled'
    });
  });
});
```

## Setup and Configuration

### Prerequisites

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Set up environment variables
cp .env.example .env.local
```

### Configuration Files

1. **`vitest.config.ts`** - Unit and integration test configuration
2. **`playwright.config.ts`** - E2E test configuration
3. **`src/test/setup.ts`** - Global test setup
4. **`src/test/utils.tsx`** - Test utilities and helpers

### Environment Setup

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Running Tests

### Local Development

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run specific test file
npm run test -- portfolio.test.ts

# Run tests for specific browser
npm run test:e2e -- --project=chromium
```

### Test Commands Overview

| Command | Description |
|---------|-------------|
| `npm run test` | Run all unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:ui` | Run tests with UI interface |
| `npm run test:e2e` | Run E2E tests |
| `npm run test:e2e:ui` | Run E2E tests with Playwright UI |
| `npm run test:e2e:headed` | Run E2E tests with browser UI |

### CI/CD Testing

Tests are automatically run in CI/CD pipeline with multiple quality gates:

1. **Code Quality Gate**: Linting, formatting, type checking
2. **Unit Test Gate**: Unit tests with coverage threshold
3. **Build Gate**: Build success and bundle size check
4. **E2E Test Gate**: Cross-browser E2E tests
5. **Security Gate**: Security vulnerability scanning
6. **Performance Gate**: Lighthouse score validation
7. **Accessibility Gate**: WCAG compliance check

## Writing Tests

### Unit Test Best Practices

```typescript
// ✅ Good: Descriptive test names
describe('UserProfile Component', () => {
  it('displays user name and email correctly', () => {
    // Test implementation
  });

  it('shows loading state while fetching data', () => {
    // Test implementation
  });

  it('handles error state gracefully', () => {
    // Test implementation
  });
});

// ✅ Good: Test user interactions
import { render, screen, fireEvent } from '@testing-library/react';

test('form submission calls onSubmit with correct data', () => {
  const handleSubmit = vi.fn();
  render(<ContactForm onSubmit={handleSubmit} />);
  
  fireEvent.change(screen.getByLabelText('Name'), { 
    target: { value: 'John Doe' } 
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  
  expect(handleSubmit).toHaveBeenCalledWith({
    name: 'John Doe'
  });
});
```

### E2E Test Best Practices

```typescript
// ✅ Good: Use data-testid for reliable selectors
test('user can create portfolio', async ({ page }) => {
  await page.goto('/create');
  
  await page.fill('[data-testid="name-input"]', 'John Doe');
  await page.click('[data-testid="submit-button"]');
  
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});

// ✅ Good: Wait for network to be idle
test('portfolio list loads correctly', async ({ page }) => {
  await page.goto('/portfolios');
  await page.waitForLoadState('networkidle');
  
  await expect(page.locator('[data-testid="portfolio-item"]')).toHaveCount(5);
});

// ✅ Good: Test across different browsers
test.describe('Cross-browser compatibility', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`works in ${browserName}`, async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('h1')).toBeVisible();
    });
  });
});
```

### Test Data Management

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

// Usage in tests
import { testUsers } from '../fixtures/users';

test('displays user information', () => {
  render(<UserProfile user={testUsers.actor} />);
  expect(screen.getByText('John Doe')).toBeInTheDocument();
});
```

## Quality Gates

### Coverage Thresholds

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
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

### Performance Thresholds

```typescript
// Performance requirements
const PERFORMANCE_THRESHOLDS = {
  LOAD_TIME: 2000,        // 2 seconds
  FCP: 1800,              // First Contentful Paint
  LCP: 2500,              // Largest Contentful Paint
  CLS: 0.1,               // Cumulative Layout Shift
  FID: 100,               // First Input Delay
  LIGHTHOUSE_SCORE: 90    // Lighthouse performance score
};
```

### Security Thresholds

```typescript
// Security requirements
const SECURITY_THRESHOLDS = {
  VULNERABILITY_SCORE: 85,
  CRITICAL_ISSUES: 0,
  HIGH_ISSUES: 2,
  MEDIUM_ISSUES: 5
};
```

## CI/CD Integration

### GitHub Actions Workflow

The CI/CD pipeline includes comprehensive quality gates:

```yaml
# .github/workflows/ci.yml
name: Comprehensive CI/CD Pipeline with Quality Gates

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # Quality Gate 1: Code Quality
  code-quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
      - name: Install dependencies
        run: npm ci
      - name: Run linting
        run: npm run lint
      - name: Run type checking
        run: npm run type-check

  # Quality Gate 2: Unit Tests
  unit-tests:
    needs: code-quality
    runs-on: ubuntu-latest
    steps:
      - name: Run unit tests
        run: npm run test:coverage
      - name: Check coverage threshold
        run: npm run test:coverage:check

  # Additional quality gates...
```

### Quality Gate Summary

Each quality gate must pass for deployment:

1. ✅ **Code Quality**: ESLint, TypeScript, Prettier
2. ✅ **Unit Tests**: Coverage > 80%
3. ✅ **Build**: Successful build, bundle size < 5MB
4. ✅ **E2E Tests**: Cross-browser compatibility
5. ✅ **Security**: Vulnerability scan score > 85
6. ✅ **Performance**: Lighthouse score > 90
7. ✅ **Accessibility**: WCAG 2.1 AA compliance

## Best Practices

### Test Organization

```
src/
├── components/
│   └── __tests__/          # Unit tests
├── lib/
│   └── __tests__/          # Utility tests
├── tests/
│   ├── e2e/               # E2E tests
│   ├── integration/       # Integration tests
│   ├── fixtures/          # Test data
│   ├── mocks/             # Mock handlers
│   └── utils/             # Test utilities
└── test/
    ├── setup.ts           # Global setup
    └── utils.tsx          # Test helpers
```

### Naming Conventions

```typescript
// ✅ Good: Descriptive test names
describe('UserAuthentication', () => {
  describe('when user provides valid credentials', () => {
    it('should log in successfully', () => {});
    it('should redirect to dashboard', () => {});
  });

  describe('when user provides invalid credentials', () => {
    it('should show error message', () => {});
    it('should not redirect', () => {});
  });
});

// ✅ Good: Test file naming
components/
├── Button.tsx
└── __tests__/
    └── Button.test.tsx

e2e/
├── user-authentication.spec.ts
├── portfolio-creation.spec.ts
└── cross-browser-compatibility.spec.ts
```

### Test Data Management

```typescript
// ✅ Good: Centralized test data
export const createTestUser = (overrides = {}) => ({
  id: 'test-user-1',
  name: 'Test User',
  email: 'test@example.com',
  ...overrides
});

// ✅ Good: Factory functions
export const createTestPortfolio = (user, overrides = {}) => ({
  id: 'test-portfolio-1',
  title: `${user.name} Portfolio`,
  userId: user.id,
  isPublished: true,
  ...overrides
});
```

### Mock Management

```typescript
// src/tests/mocks/handlers.ts
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

### Performance Testing

```typescript
// ✅ Good: Test performance metrics
test('page loads within performance budget', async ({ page }) => {
  const startTime = Date.now();
  
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  const loadTime = Date.now() - startTime;
  const performanceMetrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    return {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
    };
  });
  
  expect(loadTime).toBeLessThan(2000);
  expect(performanceMetrics.domContentLoaded).toBeLessThan(1000);
});
```

## Troubleshooting

### Common Issues

#### 1. Tests Failing in CI but Passing Locally

```bash
# Solution: Run tests with same environment
npm run test:ci

# Check for timing issues
npm run test:e2e -- --timeout=60000
```

#### 2. Flaky E2E Tests

```typescript
// ✅ Good: Wait for elements
await page.waitForSelector('[data-testid="loading"]', { state: 'detached' });
await page.waitForSelector('[data-testid="content"]', { state: 'visible' });

// ✅ Good: Use retry logic
await expect(async () => {
  await page.click('[data-testid="submit-button"]');
  await expect(page.locator('[data-testid="success"]')).toBeVisible();
}).toPass({ timeout: 10000 });
```

#### 3. Mock Service Worker Issues

```typescript
// src/test/setup.ts
import { server } from './mocks/server';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
```

#### 4. Memory Issues in Tests

```typescript
// ✅ Good: Clean up after tests
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
```

### Debug Tips

```typescript
// Debug E2E tests
await page.pause(); // Opens Playwright inspector
await page.screenshot({ path: 'debug.png' });
console.log(await page.content());

// Debug unit tests
import { screen } from '@testing-library/react';
screen.debug(); // Prints current DOM

// Debug with breakpoints
import { vi } from 'vitest';
vi.mock('module', () => ({
  default: vi.fn(() => console.log('Mock called'))
}));
```

## Performance Guidelines

### Test Performance

1. **Parallel Execution**: Run tests in parallel when possible
2. **Selective Testing**: Use `test.only()` for focused development
3. **Efficient Selectors**: Use data-testid for reliable selectors
4. **Resource Cleanup**: Clean up after each test

### CI/CD Performance

```yaml
# Optimize CI/CD performance
jobs:
  test:
    strategy:
      matrix:
        node-version: [18, 20]
        shard: [1, 2, 3, 4]
    runs-on: ubuntu-latest
    steps:
      - name: Run tests
        run: npm run test -- --shard=${{ matrix.shard }}/4
```

### Monitoring

```typescript
// Monitor test performance
const startTime = Date.now();
await runTest();
const duration = Date.now() - startTime;

if (duration > 5000) {
  console.warn(`Slow test detected: ${duration}ms`);
}
```

## Conclusion

This comprehensive testing infrastructure ensures high-quality software delivery through:

- **Multi-layered testing approach** with unit, integration, and E2E tests
- **Quality gates** that prevent deployment of subpar code
- **Security testing** to identify vulnerabilities
- **Performance testing** to ensure optimal user experience
- **Accessibility testing** to ensure inclusive design
- **Cross-browser compatibility** testing
- **Visual regression testing** to catch UI changes

By following this guide and best practices, the development team can maintain high code quality, catch issues early, and deliver a robust, secure, and performant application.

For additional support or questions, refer to the:
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [MSW Documentation](https://mswjs.io/)

---

*This document is maintained by the development team and should be updated as the testing infrastructure evolves.*