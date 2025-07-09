import { test, expect } from '@playwright/test';
import { SecurityTestingUtils, securityTestConfigs } from './utils/security-testing-utils';

test.describe('Security Testing Suite', () => {
  let securityUtils: SecurityTestingUtils;
  
  test.beforeEach(async ({ page }) => {
    securityUtils = new SecurityTestingUtils(page);
    await page.goto('/');
  });

  test.describe('XSS Protection Tests', () => {
    test('should prevent XSS attacks in form inputs', async ({ page }) => {
      await page.goto('/create');
      
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '"><script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        '<svg onload=alert("XSS")>',
      ];
      
      const nameInput = page.locator('[data-testid="full-name-input"]');
      const emailInput = page.locator('[data-testid="email-input"]');
      
      for (const payload of xssPayloads) {
        // Test name input
        await nameInput.fill(payload);
        await page.click('[data-testid="continue-button"]');
        
        // Check that script was not executed
        const alertFired = await page.evaluate(() => {
          return new Promise((resolve) => {
            const originalAlert = window.alert;
            let alertCalled = false;
            
            window.alert = function(message) {
              alertCalled = true;
              originalAlert(message);
            };
            
            setTimeout(() => {
              window.alert = originalAlert;
              resolve(alertCalled);
            }, 1000);
          });
        });
        
        expect(alertFired).toBe(false);
        
        // Check that payload is properly escaped in DOM
        const bodyContent = await page.textContent('body');
        expect(bodyContent).not.toContain('<script>');
        expect(bodyContent).not.toContain('javascript:');
        
        // Clear input for next test
        await nameInput.fill('');
      }
    });

    test('should prevent XSS in URL parameters', async ({ page }) => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '<img src=x onerror=alert("XSS")>',
      ];
      
      for (const payload of xssPayloads) {
        await page.goto(`/search?q=${encodeURIComponent(payload)}`);
        
        // Check that script was not executed
        const alertFired = await page.evaluate(() => {
          return new Promise((resolve) => {
            const originalAlert = window.alert;
            let alertCalled = false;
            
            window.alert = function(message) {
              alertCalled = true;
              originalAlert(message);
            };
            
            setTimeout(() => {
              window.alert = originalAlert;
              resolve(alertCalled);
            }, 1000);
          });
        });
        
        expect(alertFired).toBe(false);
      }
    });

    test('should have proper Content Security Policy', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();
      
      // Check CSP header exists
      const csp = headers?.['content-security-policy'];
      expect(csp).toBeTruthy();
      
      // Check for basic CSP directives
      expect(csp).toContain('default-src');
      expect(csp).toContain('script-src');
      expect(csp).toContain('style-src');
      expect(csp).toContain('img-src');
      
      // Check that unsafe-inline is not allowed for scripts
      expect(csp).not.toContain('script-src \'unsafe-inline\'');
      expect(csp).not.toContain('script-src * \'unsafe-inline\'');
    });
  });

  test.describe('CSRF Protection Tests', () => {
    test('should have CSRF tokens in forms', async ({ page }) => {
      await page.goto('/auth/signin');
      
      // Check for CSRF token in login form
      const loginForm = page.locator('form');
      const csrfToken = await loginForm.locator('input[name*="csrf"], input[name*="token"], input[name="_token"]').count();
      
      expect(csrfToken).toBeGreaterThan(0);
    });

    test('should reject requests without proper CSRF tokens', async ({ page }) => {
      // Test API endpoint without CSRF token
      const response = await page.request.post('/api/auth/signin', {
        data: {
          email: 'test@example.com',
          password: 'password123',
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Should be rejected due to missing CSRF token
      expect(response.status()).toBe(403);
    });

    test('should validate origin header for state-changing operations', async ({ page }) => {
      const response = await page.request.post('/api/portfolios', {
        data: { title: 'Test Portfolio' },
        headers: {
          'Origin': 'https://malicious-site.com',
          'Referer': 'https://malicious-site.com/attack',
        },
      });
      
      // Should be rejected due to invalid origin
      expect(response.status()).toBeGreaterThanOrEqual(400);
    });
  });

  test.describe('Authentication Security Tests', () => {
    test('should have secure password requirements', async ({ page }) => {
      await page.goto('/auth/signup');
      
      const passwordInput = page.locator('[data-testid="password-input"]');
      const weakPasswords = ['123', 'password', 'abc123', '12345678'];
      
      for (const weakPassword of weakPasswords) {
        await passwordInput.fill(weakPassword);
        await page.keyboard.press('Tab');
        
        // Check for password strength validation
        const errorMessage = page.locator('[data-testid="password-error"]');
        await expect(errorMessage).toBeVisible();
        
        const errorText = await errorMessage.textContent();
        expect(errorText?.toLowerCase()).toContain('weak');
      }
    });

    test('should implement rate limiting for login attempts', async ({ page }) => {
      await page.goto('/auth/signin');
      
      const emailInput = page.locator('[data-testid="email-input"]');
      const passwordInput = page.locator('[data-testid="password-input"]');
      const submitButton = page.locator('[data-testid="signin-button"]');
      
      // Attempt multiple failed logins
      for (let i = 0; i < 6; i++) {
        await emailInput.fill('test@example.com');
        await passwordInput.fill('wrongpassword');
        await submitButton.click();
        await page.waitForTimeout(1000);
      }
      
      // Should show rate limiting message
      const rateLimitMessage = page.locator('[data-testid="rate-limit-message"]');
      await expect(rateLimitMessage).toBeVisible();
    });

    test('should have secure session management', async ({ page }) => {
      await page.goto('/dashboard');
      
      const cookies = await page.context().cookies();
      const sessionCookie = cookies.find(cookie => 
        cookie.name.toLowerCase().includes('session') || 
        cookie.name.toLowerCase().includes('token')
      );
      
      if (sessionCookie) {
        // Check secure flag
        expect(sessionCookie.secure).toBe(true);
        
        // Check HttpOnly flag
        expect(sessionCookie.httpOnly).toBe(true);
        
        // Check SameSite attribute
        expect(sessionCookie.sameSite).toBe('strict');
      }
    });

    test('should expire sessions after inactivity', async ({ page }) => {
      // Mock expired session
      await page.route('/api/auth/user', (route) => {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Session expired' }),
        });
      });
      
      await page.goto('/dashboard');
      
      // Should redirect to login
      await expect(page).toHaveURL('/auth/signin');
    });
  });

  test.describe('Input Validation Tests', () => {
    test('should validate and sanitize all form inputs', async ({ page }) => {
      await page.goto('/create');
      
      // Test malicious inputs
      const maliciousInputs = [
        '<script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '../../etc/passwd',
        '${7*7}',
        '{{7*7}}',
        '<%= 7*7 %>',
        '#{7*7}',
      ];
      
      const nameInput = page.locator('[data-testid="full-name-input"]');
      const bioTextarea = page.locator('[data-testid="bio-textarea"]');
      
      for (const maliciousInput of maliciousInputs) {
        await nameInput.fill(maliciousInput);
        await bioTextarea.fill(maliciousInput);
        await page.click('[data-testid="continue-button"]');
        
        // Check that malicious content was not executed
        const bodyContent = await page.textContent('body');
        expect(bodyContent).not.toContain('<script>');
        expect(bodyContent).not.toContain('javascript:');
        expect(bodyContent).not.toContain('root:');
        expect(bodyContent).not.toContain('49'); // 7*7
      }
    });

    test('should validate file uploads', async ({ page }) => {
      await page.goto('/create');
      
      // Navigate to image upload step
      await page.fill('[data-testid="full-name-input"]', 'John Doe');
      await page.fill('[data-testid="email-input"]', 'john@example.com');
      await page.locator('[data-testid="profession-select"]').selectOption('actor');
      await page.click('[data-testid="continue-button"]');
      
      // Select a template
      await page.click('[data-testid="template-t1"]');
      await page.click('[data-testid="continue-button"]');
      
      // Test malicious file upload
      const fileInput = page.locator('[data-testid="image-upload-input"]');
      
      // Create a malicious file
      const maliciousFile = Buffer.from('<?php system($_GET["cmd"]); ?>');
      
      await fileInput.setInputFiles({
        name: 'malicious.php',
        mimeType: 'application/x-php',
        buffer: maliciousFile,
      });
      
      // Should show file type error
      const errorMessage = page.locator('[data-testid="file-error"]');
      await expect(errorMessage).toBeVisible();
      expect(await errorMessage.textContent()).toContain('Invalid file type');
    });

    test('should prevent SQL injection in search', async ({ page }) => {
      await page.goto('/examples');
      
      const searchInput = page.locator('[data-testid="search-input"]');
      const sqlPayloads = [
        "' OR '1'='1",
        '" OR "1"="1',
        "' OR 1=1 --",
        "' UNION SELECT * FROM users --",
      ];
      
      for (const payload of sqlPayloads) {
        await searchInput.fill(payload);
        await page.keyboard.press('Enter');
        
        // Check that no database errors are exposed
        const bodyContent = await page.textContent('body');
        const errorKeywords = ['mysql', 'postgresql', 'syntax error', 'database error'];
        
        errorKeywords.forEach(keyword => {
          expect(bodyContent?.toLowerCase()).not.toContain(keyword);
        });
      }
    });
  });

  test.describe('Security Headers Tests', () => {
    test('should have all required security headers', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();
      
      // Check for required security headers
      expect(headers?.['x-frame-options']).toBeTruthy();
      expect(headers?.['x-content-type-options']).toBe('nosniff');
      expect(headers?.['x-xss-protection']).toBeTruthy();
      expect(headers?.['strict-transport-security']).toBeTruthy();
      expect(headers?.['content-security-policy']).toBeTruthy();
      expect(headers?.['referrer-policy']).toBeTruthy();
    });

    test('should have proper HSTS configuration', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();
      
      const hsts = headers?.['strict-transport-security'];
      expect(hsts).toBeTruthy();
      expect(hsts).toContain('max-age=');
      expect(hsts).toContain('includeSubDomains');
    });

    test('should have proper X-Frame-Options', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();
      
      const xFrameOptions = headers?.['x-frame-options'];
      expect(xFrameOptions).toBeTruthy();
      expect(['DENY', 'SAMEORIGIN']).toContain(xFrameOptions);
    });

    test('should have proper Referrer Policy', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();
      
      const referrerPolicy = headers?.['referrer-policy'];
      expect(referrerPolicy).toBeTruthy();
      expect(['strict-origin-when-cross-origin', 'no-referrer', 'same-origin']).toContain(referrerPolicy);
    });
  });

  test.describe('Information Disclosure Tests', () => {
    test('should not expose sensitive files', async ({ page }) => {
      const sensitiveFiles = [
        '/.env',
        '/.git/config',
        '/config.json',
        '/database.json',
        '/package.json',
        '/next.config.js',
      ];
      
      for (const file of sensitiveFiles) {
        const response = await page.goto(file);
        
        // Should not be accessible
        expect(response?.status()).not.toBe(200);
      }
    });

    test('should not expose detailed error messages', async ({ page }) => {
      const errorUrls = [
        '/nonexistent-page',
        '/api/nonexistent-endpoint',
        '/admin/secret-area',
      ];
      
      for (const url of errorUrls) {
        const response = await page.goto(url);
        
        if (response?.status() === 500) {
          const content = await response.text();
          
          // Should not contain stack traces or file paths
          expect(content).not.toContain('stack trace');
          expect(content).not.toContain('at Object.');
          expect(content).not.toContain('node_modules');
          expect(content).not.toContain('src/');
        }
      }
    });

    test('should not expose server information', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();
      
      // Should not expose server details
      expect(headers?.['server']).toBeFalsy();
      expect(headers?.['x-powered-by']).toBeFalsy();
    });
  });

  test.describe('CORS Configuration Tests', () => {
    test('should have proper CORS configuration', async ({ page }) => {
      const response = await page.request.get('/api/portfolios', {
        headers: {
          'Origin': 'https://trusted-domain.com',
        },
      });
      
      const corsHeaders = response.headers();
      
      // Should not use wildcard for all origins
      expect(corsHeaders['access-control-allow-origin']).not.toBe('*');
      
      // Should validate specific origins
      if (corsHeaders['access-control-allow-origin']) {
        expect(corsHeaders['access-control-allow-origin']).toContain('https://');
      }
    });

    test('should reject requests from untrusted origins', async ({ page }) => {
      const response = await page.request.get('/api/portfolios', {
        headers: {
          'Origin': 'https://malicious-site.com',
        },
      });
      
      // Should either reject or not include CORS headers
      const corsOrigin = response.headers()['access-control-allow-origin'];
      expect(corsOrigin).not.toBe('https://malicious-site.com');
    });
  });

  test.describe('API Security Tests', () => {
    test('should require authentication for protected endpoints', async ({ page }) => {
      const protectedEndpoints = [
        '/api/portfolios',
        '/api/user/profile',
        '/api/admin/users',
      ];
      
      for (const endpoint of protectedEndpoints) {
        const response = await page.request.get(endpoint);
        
        // Should require authentication
        expect(response.status()).toBe(401);
      }
    });

    test('should validate API input parameters', async ({ page }) => {
      const response = await page.request.post('/api/portfolios', {
        data: {
          title: '<script>alert("XSS")</script>',
          description: 'A'.repeat(10000), // Extremely long description
        },
      });
      
      // Should validate and reject malicious/invalid input
      expect(response.status()).toBeGreaterThanOrEqual(400);
    });

    test('should implement rate limiting on API endpoints', async ({ page }) => {
      const endpoint = '/api/auth/signin';
      const requests = [];
      
      // Make multiple rapid requests
      for (let i = 0; i < 10; i++) {
        requests.push(
          page.request.post(endpoint, {
            data: {
              email: 'test@example.com',
              password: 'wrongpassword',
            },
          })
        );
      }
      
      const responses = await Promise.all(requests);
      
      // Should rate limit after several requests
      const rateLimitedResponses = responses.filter(r => r.status() === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  test.describe('Comprehensive Security Test', () => {
    test('should pass comprehensive security assessment', async ({ page }) => {
      await page.goto('/');
      
      const securityResult = await securityUtils.runSecurityTests();
      
      console.log('Security Assessment Results:', {
        score: securityResult.score,
        vulnerabilities: securityResult.vulnerabilities.length,
        criticalIssues: securityResult.vulnerabilities.filter(v => v.severity === 'critical').length,
        highIssues: securityResult.vulnerabilities.filter(v => v.severity === 'high').length,
      });
      
      // Should have no critical vulnerabilities
      const criticalVulns = securityResult.vulnerabilities.filter(v => v.severity === 'critical');
      expect(criticalVulns.length).toBe(0);
      
      // Should have minimal high-severity vulnerabilities
      const highVulns = securityResult.vulnerabilities.filter(v => v.severity === 'high');
      expect(highVulns.length).toBeLessThanOrEqual(2);
      
      // Should have a good security score
      expect(securityResult.score).toBeGreaterThanOrEqual(70);
      
      // Should pass overall security test
      expect(securityResult.passed).toBe(true);
    });
  });
});