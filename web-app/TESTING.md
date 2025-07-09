# Testing Implementation Guide

## Overview
This document provides a comprehensive overview of the testing infrastructure implemented for the Spotlight portfolio platform. The testing suite includes unit tests, integration tests, E2E tests, accessibility tests, and performance regression tests.

## Testing Stack

### Core Testing Framework
- **Vitest**: Fast and modern testing framework
- **React Testing Library**: Component testing utilities
- **@testing-library/jest-dom**: DOM testing matchers
- **@testing-library/user-event**: User interaction simulation
- **jsdom**: Browser environment simulation

### Mocking and API Testing
- **MSW (Mock Service Worker)**: API mocking for tests
- **Custom test utilities**: Simplified component rendering

### End-to-End Testing
- **Playwright**: Cross-browser E2E testing
- **Multiple browser support**: Chrome, Firefox, Safari
- **Mobile testing**: iOS and Android simulation

### Performance Testing
- **Custom performance regression tests**: Ensure critical paths remain fast
- **Memory leak detection**: Prevent memory-related issues
- **Bundle size monitoring**: Track application size

### Accessibility Testing
- **Custom accessibility utilities**: WCAG compliance testing
- **Screen reader compatibility**: Ensure accessible UX
- **Keyboard navigation**: Test keyboard accessibility

## Test Organization

```
src/
├── test/
│   ├── setup.ts                 # Test environment setup
│   ├── utils.tsx                # Testing utilities
│   ├── accessibility.ts         # Accessibility testing utilities
│   ├── performance.test.ts      # Performance regression tests
│   ├── basic.test.tsx          # Basic sanity tests
│   └── mocks/
│       ├── handlers.ts          # MSW request handlers
│       └── server.ts            # MSW server setup
├── components/
│   └── **/__tests__/           # Component unit tests
├── lib/
│   └── **/__tests__/           # Service/utility tests
├── app/
│   └── **/__tests__/           # API route tests
└── tests/
    └── e2e/                    # End-to-end tests
```

## Running Tests

### Unit Tests
```bash
npm run test              # Run tests in watch mode
npm run test:run          # Run tests once
npm run test:coverage     # Run with coverage report
npm run test:ui           # Run with UI interface
```

### E2E Tests
```bash
npm run test:e2e          # Run E2E tests
npm run test:e2e:ui       # Run E2E tests with UI
npm run test:e2e:headed   # Run E2E tests in headed mode
```

### Performance Tests
```bash
npm run test:run src/test/performance.test.ts
```

## Test Types

### 1. Unit Tests
Test individual components and functions in isolation.

**Example: Button Component Test**
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '../button';

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

### 2. Integration Tests
Test API endpoints and service layer interactions.

**Example: Portfolio API Test**
```typescript
import { GET, POST } from '../portfolios/route';

describe('/api/portfolios', () => {
  it('returns portfolios for authenticated user', async () => {
    const response = await GET(request);
    expect(response.status).toBe(200);
  });
});
```

### 3. E2E Tests
Test complete user workflows across the application.

**Example: Portfolio Creation Flow**
```typescript
test('should complete portfolio creation flow', async ({ page }) => {
  await page.goto('/create');
  await page.fill('input[name="fullName"]', 'John Doe');
  await page.click('button:has-text("Continue")');
  // ... continue with full flow
});
```

### 4. Accessibility Tests
Ensure WCAG compliance and screen reader compatibility.

**Example: Accessibility Testing**
```typescript
import { testAccessibility } from '@/test/accessibility';

test('component is accessible', async () => {
  const result = await testAccessibility(<Component />);
  expect(result.passed).toBe(true);
});
```

### 5. Performance Tests
Monitor performance characteristics and prevent regressions.

**Example: Performance Testing**
```typescript
test('should render large lists efficiently', async () => {
  const renderTime = await measureExecutionTime(() => {
    // Performance-critical operation
  });
  expect(renderTime).toBeLessThan(100); // 100ms threshold
});
```

## Test Configuration

### Vitest Configuration
```typescript
// vitest.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

### Playwright Configuration
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './src/tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

## Mock Service Worker (MSW)

### API Mocking
MSW intercepts network requests and provides mock responses.

```typescript
// src/test/mocks/handlers.ts
export const handlers = [
  http.get('/api/portfolios', ({ request }) => {
    return HttpResponse.json({ portfolios: [mockPortfolio] });
  }),
  http.post('/api/portfolios', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ portfolio: { ...mockPortfolio, ...body } });
  }),
];
```

## CI/CD Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/ci.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm run test:run
      - name: Run E2E tests
        run: npm run test:e2e
```

## Performance Monitoring

### Core Web Vitals
- **FCP (First Contentful Paint)**: < 2s
- **LCP (Largest Contentful Paint)**: < 2.5s
- **CLS (Cumulative Layout Shift)**: < 0.1
- **FID (First Input Delay)**: < 100ms

### Bundle Size Monitoring
- **Main bundle**: < 100KB gzipped
- **Template chunks**: < 50KB gzipped each
- **Vendor chunks**: Efficient splitting

## Test Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Critical API endpoints
- **E2E Tests**: Main user workflows
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: No regressions

## Best Practices

### Writing Tests
1. **Test behavior, not implementation**
2. **Use descriptive test names**
3. **Follow AAA pattern (Arrange, Act, Assert)**
4. **Mock external dependencies**
5. **Test edge cases and error conditions**

### Test Structure
```typescript
describe('Component/Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('should do something specific', () => {
    // Arrange
    const props = { /* test props */ };
    
    // Act
    render(<Component {...props} />);
    
    // Assert
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

### Accessibility Testing
```typescript
import { testAccessibility } from '@/test/accessibility';

test('component meets accessibility standards', async () => {
  const result = await testAccessibility(<Component />);
  
  expect(result.passed).toBe(true);
  expect(result.errors).toHaveLength(0);
});
```

## Troubleshooting

### Common Issues

1. **Import errors**: Check path aliases in vitest.config.ts
2. **Mock not working**: Ensure mocks are in correct location
3. **Tests timing out**: Increase timeout in test configuration
4. **Coverage issues**: Check file patterns in coverage config

### Debug Tips

1. **Use screen.debug()**: Print current DOM state
2. **Add console.log**: Debug test execution
3. **Check test output**: Review error messages carefully
4. **Use --reporter=verbose**: Get detailed test output

## Continuous Improvement

### Monitoring
- Track test execution time
- Monitor coverage trends
- Review flaky tests
- Update test dependencies

### Maintenance
- Regular test cleanup
- Update test data
- Review test effectiveness
- Optimize slow tests

## Future Enhancements

1. **Visual regression testing**: Screenshot comparison
2. **API contract testing**: Schema validation
3. **Load testing**: Stress testing critical paths
4. **A/B testing**: Feature flag testing
5. **Internationalization testing**: Multi-language support

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

This testing infrastructure ensures high code quality, prevents regressions, and maintains excellent user experience across all platforms and devices.