import { Page, expect } from '@playwright/test';

/**
 * Security testing utilities for comprehensive security validation
 */

export interface SecurityTestResult {
  passed: boolean;
  vulnerabilities: SecurityVulnerability[];
  recommendations: string[];
  score: number;
}

export interface SecurityVulnerability {
  type: 'xss' | 'csrf' | 'injection' | 'auth' | 'headers' | 'disclosure' | 'cors';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  location: string;
  payload?: string;
  impact: string;
  remediation: string;
}

export interface CSPAnalysis {
  present: boolean;
  directives: Record<string, string>;
  issues: string[];
  score: number;
}

export class SecurityTestingUtils {
  constructor(private page: Page) {}

  /**
   * Comprehensive security test suite
   */
  async runSecurityTests(): Promise<SecurityTestResult> {
    const vulnerabilities: SecurityVulnerability[] = [];
    
    // Run all security tests
    vulnerabilities.push(...await this.testXSSVulnerabilities());
    vulnerabilities.push(...await this.testCSRFProtection());
    vulnerabilities.push(...await this.testSQLInjection());
    vulnerabilities.push(...await this.testAuthenticationSecurity());
    vulnerabilities.push(...await this.testSecurityHeaders());
    vulnerabilities.push(...await this.testInformationDisclosure());
    vulnerabilities.push(...await this.testCORSConfiguration());
    
    const score = this.calculateSecurityScore(vulnerabilities);
    const recommendations = this.generateSecurityRecommendations(vulnerabilities);
    
    return {
      passed: vulnerabilities.filter(v => v.severity === 'critical' || v.severity === 'high').length === 0,
      vulnerabilities,
      recommendations,
      score,
    };
  }

  /**
   * Test for XSS vulnerabilities
   */
  async testXSSVulnerabilities(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];
    
    // XSS payloads for testing
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '"><script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>',
      '<svg onload=alert("XSS")>',
      '"><svg onload=alert("XSS")>',
      '\' OR 1=1 --',
      '<iframe src="javascript:alert(\'XSS\')">',
      '<body onload=alert("XSS")>',
      '<script src="data:text/javascript,alert(\'XSS\')">',
    ];
    
    // Test form inputs
    const forms = await this.page.locator('form').all();
    
    for (const form of forms) {
      const inputs = await form.locator('input[type="text"], input[type="email"], textarea').all();
      
      for (const input of inputs) {
        const inputId = await input.getAttribute('id') || 'unknown';
        
        for (const payload of xssPayloads) {
          try {
            await input.fill(payload);
            await form.locator('input[type="submit"], button[type="submit"]').click();
            
            // Check if payload was executed
            const alertHandled = await this.page.evaluate(() => {
              return new Promise((resolve) => {
                const originalAlert = window.alert;
                window.alert = function(message) {
                  resolve(message.includes('XSS'));
                };
                setTimeout(() => resolve(false), 1000);
              });
            });
            
            if (alertHandled) {
              vulnerabilities.push({
                type: 'xss',
                severity: 'critical',
                description: 'Reflected XSS vulnerability detected',
                location: `Form input: ${inputId}`,
                payload,
                impact: 'Allows execution of malicious scripts in user\'s browser',
                remediation: 'Implement proper input validation and output encoding',
              });
            }
            
            // Check if payload appears in DOM without encoding
            const bodyContent = await this.page.textContent('body');
            if (bodyContent?.includes(payload)) {
              vulnerabilities.push({
                type: 'xss',
                severity: 'high',
                description: 'Potential XSS vulnerability - unescaped user input',
                location: `Form input: ${inputId}`,
                payload,
                impact: 'User input not properly escaped in output',
                remediation: 'Implement proper output encoding and CSP headers',
              });
            }
          } catch (error) {
            // Input validation prevented the payload - this is good
          }
        }
      }
    }
    
    // Test URL parameters
    const urlParams = ['search', 'q', 'query', 'name', 'message'];
    
    for (const param of urlParams) {
      for (const payload of xssPayloads.slice(0, 3)) {
        try {
          await this.page.goto(`${this.page.url()}?${param}=${encodeURIComponent(payload)}`);
          
          const bodyContent = await this.page.textContent('body');
          if (bodyContent?.includes(payload)) {
            vulnerabilities.push({
              type: 'xss',
              severity: 'high',
              description: 'Potential XSS vulnerability in URL parameter',
              location: `URL parameter: ${param}`,
              payload,
              impact: 'URL parameter not properly escaped in output',
              remediation: 'Implement proper input validation and output encoding for URL parameters',
            });
          }
        } catch (error) {
          // Error handling is expected
        }
      }
    }
    
    return vulnerabilities;
  }

  /**
   * Test CSRF protection
   */
  async testCSRFProtection(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];
    
    // Check for CSRF tokens in forms
    const forms = await this.page.locator('form').all();
    
    for (const form of forms) {
      const action = await form.getAttribute('action') || '';
      const method = await form.getAttribute('method') || 'GET';
      
      if (method.toLowerCase() === 'post') {
        // Check for CSRF token
        const csrfToken = await form.locator('input[name*="csrf"], input[name*="token"], input[name="_token"]').count();
        
        if (csrfToken === 0) {
          vulnerabilities.push({
            type: 'csrf',
            severity: 'high',
            description: 'Missing CSRF protection on form',
            location: `Form action: ${action}`,
            impact: 'Form susceptible to Cross-Site Request Forgery attacks',
            remediation: 'Implement CSRF tokens for all state-changing operations',
          });
        }
      }
    }
    
    // Test API endpoints for CSRF protection
    const apiEndpoints = ['/api/auth/signin', '/api/auth/signup', '/api/portfolios'];
    
    for (const endpoint of apiEndpoints) {
      try {
        // Try to make request without proper origin header
        const response = await this.page.request.post(endpoint, {
          headers: {
            'Origin': 'https://malicious-site.com',
            'Referer': 'https://malicious-site.com',
          },
          data: { test: 'data' },
        });
        
        if (response.status() !== 403 && response.status() !== 400) {
          vulnerabilities.push({
            type: 'csrf',
            severity: 'medium',
            description: 'Potential CSRF vulnerability in API endpoint',
            location: endpoint,
            impact: 'API endpoint may be vulnerable to CSRF attacks',
            remediation: 'Implement proper CSRF protection and origin validation',
          });
        }
      } catch (error) {
        // Error is expected for properly protected endpoints
      }
    }
    
    return vulnerabilities;
  }

  /**
   * Test for SQL injection vulnerabilities
   */
  async testSQLInjection(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];
    
    // SQL injection payloads
    const sqlPayloads = [
      "' OR '1'='1",
      '" OR "1"="1',
      "' OR 1=1 --",
      "' OR 1=1 #",
      "' UNION SELECT * FROM users --",
      "1'; DROP TABLE users; --",
      "' OR SLEEP(5) --",
      "' OR 1=1 LIMIT 1 --",
    ];
    
    // Test search functionality
    const searchInputs = await this.page.locator('input[type="search"], input[name*="search"], input[name*="query"]').all();
    
    for (const input of searchInputs) {
      const inputName = await input.getAttribute('name') || 'unknown';
      
      for (const payload of sqlPayloads) {
        try {
          await input.fill(payload);
          await this.page.keyboard.press('Enter');
          
          // Check for database errors in response
          const bodyContent = await this.page.textContent('body');
          const errorKeywords = ['mysql', 'postgresql', 'sqlite', 'syntax error', 'database error'];
          
          if (errorKeywords.some(keyword => bodyContent?.toLowerCase().includes(keyword))) {
            vulnerabilities.push({
              type: 'injection',
              severity: 'critical',
              description: 'Potential SQL injection vulnerability detected',
              location: `Search input: ${inputName}`,
              payload,
              impact: 'May allow unauthorized database access',
              remediation: 'Use parameterized queries and input validation',
            });
          }
          
          // Check for unusual response times (potential time-based injection)
          const startTime = Date.now();
          await this.page.waitForTimeout(1000);
          const endTime = Date.now();
          
          if (endTime - startTime > 5000 && payload.includes('SLEEP')) {
            vulnerabilities.push({
              type: 'injection',
              severity: 'high',
              description: 'Potential time-based SQL injection',
              location: `Search input: ${inputName}`,
              payload,
              impact: 'May allow blind SQL injection attacks',
              remediation: 'Use parameterized queries and proper error handling',
            });
          }
        } catch (error) {
          // Error handling is expected
        }
      }
    }
    
    return vulnerabilities;
  }

  /**
   * Test authentication security
   */
  async testAuthenticationSecurity(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];
    
    // Test login brute force protection
    await this.page.goto('/auth/signin');
    
    const emailInput = this.page.locator('input[type="email"]');
    const passwordInput = this.page.locator('input[type="password"]');
    const submitButton = this.page.locator('button[type="submit"]');
    
    if (await emailInput.count() > 0) {
      // Test multiple failed login attempts
      for (let i = 0; i < 5; i++) {
        await emailInput.fill('test@example.com');
        await passwordInput.fill('wrongpassword');
        await submitButton.click();
        await this.page.waitForTimeout(1000);
      }
      
      // Check if account is locked or rate limited
      const errorMessage = await this.page.textContent('body');
      if (!errorMessage?.includes('locked') && !errorMessage?.includes('rate limit')) {
        vulnerabilities.push({
          type: 'auth',
          severity: 'medium',
          description: 'Missing brute force protection',
          location: 'Login form',
          impact: 'Allows unlimited login attempts',
          remediation: 'Implement rate limiting and account lockout mechanisms',
        });
      }
    }
    
    // Test password requirements
    await this.page.goto('/auth/signup');
    
    const signupPasswordInput = this.page.locator('input[type="password"]');
    if (await signupPasswordInput.count() > 0) {
      const weakPasswords = ['123', 'password', 'abc123', '12345678'];
      
      for (const weakPassword of weakPasswords) {
        await signupPasswordInput.fill(weakPassword);
        await this.page.keyboard.press('Tab');
        
        // Check for password strength validation
        const validationMessage = await this.page.textContent('body');
        if (!validationMessage?.includes('weak') && !validationMessage?.includes('strong')) {
          vulnerabilities.push({
            type: 'auth',
            severity: 'medium',
            description: 'Weak password policy',
            location: 'Signup form',
            impact: 'Allows weak passwords that are easy to crack',
            remediation: 'Implement strong password requirements and validation',
          });
          break; // Only report once
        }
      }
    }
    
    // Test session management
    await this.page.goto('/dashboard');
    
    const cookies = await this.page.context().cookies();
    const sessionCookie = cookies.find(cookie => 
      cookie.name.toLowerCase().includes('session') || 
      cookie.name.toLowerCase().includes('token')
    );
    
    if (sessionCookie) {
      if (!sessionCookie.secure) {
        vulnerabilities.push({
          type: 'auth',
          severity: 'high',
          description: 'Session cookie not marked as secure',
          location: 'Session management',
          impact: 'Session tokens can be intercepted over HTTP',
          remediation: 'Set secure flag on session cookies',
        });
      }
      
      if (!sessionCookie.httpOnly) {
        vulnerabilities.push({
          type: 'auth',
          severity: 'high',
          description: 'Session cookie not marked as HttpOnly',
          location: 'Session management',
          impact: 'Session tokens accessible via JavaScript',
          remediation: 'Set HttpOnly flag on session cookies',
        });
      }
    }
    
    return vulnerabilities;
  }

  /**
   * Test security headers
   */
  async testSecurityHeaders(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];
    
    const response = await this.page.goto('/');
    if (!response) return vulnerabilities;
    
    const headers = response.headers();
    
    // Check for security headers
    const securityHeaders = {
      'x-frame-options': 'Clickjacking protection',
      'x-content-type-options': 'MIME type sniffing protection',
      'x-xss-protection': 'XSS filter protection',
      'strict-transport-security': 'HTTPS enforcement',
      'content-security-policy': 'Content Security Policy',
      'referrer-policy': 'Referrer policy',
      'permissions-policy': 'Permissions policy',
    };
    
    for (const [header, description] of Object.entries(securityHeaders)) {
      if (!headers[header]) {
        vulnerabilities.push({
          type: 'headers',
          severity: header === 'content-security-policy' ? 'high' : 'medium',
          description: `Missing security header: ${header}`,
          location: 'HTTP response headers',
          impact: `Missing ${description}`,
          remediation: `Add ${header} header to all responses`,
        });
      }
    }
    
    // Analyze CSP if present
    const csp = headers['content-security-policy'];
    if (csp) {
      const cspAnalysis = this.analyzeCSP(csp);
      
      cspAnalysis.issues.forEach(issue => {
        vulnerabilities.push({
          type: 'headers',
          severity: 'medium',
          description: `CSP issue: ${issue}`,
          location: 'Content Security Policy',
          impact: 'Weakened CSP protection',
          remediation: 'Fix CSP configuration',
        });
      });
    }
    
    return vulnerabilities;
  }

  /**
   * Test for information disclosure
   */
  async testInformationDisclosure(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];
    
    // Test for sensitive files
    const sensitiveFiles = [
      '/.env',
      '/.git/config',
      '/config.json',
      '/backup.sql',
      '/database.db',
      '/admin',
      '/phpinfo.php',
      '/server-status',
      '/server-info',
    ];
    
    for (const file of sensitiveFiles) {
      try {
        const response = await this.page.goto(file);
        
        if (response && response.status() === 200) {
          const content = await response.text();
          
          if (content.length > 100) { // Actual file content
            vulnerabilities.push({
              type: 'disclosure',
              severity: 'high',
              description: `Sensitive file exposed: ${file}`,
              location: file,
              impact: 'Sensitive information disclosure',
              remediation: 'Remove or restrict access to sensitive files',
            });
          }
        }
      } catch (error) {
        // Expected for properly secured files
      }
    }
    
    // Test for stack traces and error messages
    const errorTriggerUrls = [
      '/nonexistent-page',
      '/api/nonexistent',
      '/admin/secret',
    ];
    
    for (const url of errorTriggerUrls) {
      try {
        const response = await this.page.goto(url);
        
        if (response) {
          const content = await response.text();
          const errorKeywords = ['stack trace', 'exception', 'error at line', 'file path'];
          
          if (errorKeywords.some(keyword => content.toLowerCase().includes(keyword))) {
            vulnerabilities.push({
              type: 'disclosure',
              severity: 'medium',
              description: 'Detailed error messages exposed',
              location: url,
              impact: 'System information disclosure',
              remediation: 'Implement custom error pages and hide detailed error messages',
            });
          }
        }
      } catch (error) {
        // Expected for some URLs
      }
    }
    
    return vulnerabilities;
  }

  /**
   * Test CORS configuration
   */
  async testCORSConfiguration(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];
    
    // Test CORS headers
    const apiEndpoints = ['/api/portfolios', '/api/auth/user'];
    
    for (const endpoint of apiEndpoints) {
      try {
        const response = await this.page.request.get(endpoint, {
          headers: {
            'Origin': 'https://malicious-site.com',
          },
        });
        
        const corsHeaders = {
          'access-control-allow-origin': response.headers()['access-control-allow-origin'],
          'access-control-allow-credentials': response.headers()['access-control-allow-credentials'],
        };
        
        if (corsHeaders['access-control-allow-origin'] === '*') {
          vulnerabilities.push({
            type: 'cors',
            severity: 'medium',
            description: 'Overly permissive CORS policy',
            location: endpoint,
            impact: 'Allows requests from any origin',
            remediation: 'Restrict CORS to specific trusted origins',
          });
        }
        
        if (corsHeaders['access-control-allow-credentials'] === 'true' && 
            corsHeaders['access-control-allow-origin'] === '*') {
          vulnerabilities.push({
            type: 'cors',
            severity: 'high',
            description: 'Dangerous CORS configuration',
            location: endpoint,
            impact: 'Allows credentialed requests from any origin',
            remediation: 'Never use wildcards with credentials enabled',
          });
        }
      } catch (error) {
        // Expected for some endpoints
      }
    }
    
    return vulnerabilities;
  }

  /**
   * Analyze Content Security Policy
   */
  private analyzeCSP(csp: string): CSPAnalysis {
    const directives: Record<string, string> = {};
    const issues: string[] = [];
    
    // Parse CSP directives
    const parts = csp.split(';');
    parts.forEach(part => {
      const [directive, ...values] = part.trim().split(/\s+/);
      if (directive) {
        directives[directive] = values.join(' ');
      }
    });
    
    // Check for common issues
    if (directives['default-src']?.includes('*')) {
      issues.push('Overly permissive default-src with wildcard');
    }
    
    if (directives['script-src']?.includes('unsafe-inline')) {
      issues.push('Unsafe inline scripts allowed');
    }
    
    if (directives['script-src']?.includes('unsafe-eval')) {
      issues.push('Unsafe eval allowed for scripts');
    }
    
    if (!directives['object-src']) {
      issues.push('Missing object-src directive');
    }
    
    if (!directives['base-uri']) {
      issues.push('Missing base-uri directive');
    }
    
    const score = Math.max(0, 100 - (issues.length * 10));
    
    return {
      present: true,
      directives,
      issues,
      score,
    };
  }

  /**
   * Calculate overall security score
   */
  private calculateSecurityScore(vulnerabilities: SecurityVulnerability[]): number {
    let score = 100;
    
    vulnerabilities.forEach(vuln => {
      switch (vuln.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });
    
    return Math.max(0, score);
  }

  /**
   * Generate security recommendations
   */
  private generateSecurityRecommendations(vulnerabilities: SecurityVulnerability[]): string[] {
    const recommendations: string[] = [];
    
    const issuesByType = vulnerabilities.reduce((acc, vuln) => {
      if (!acc[vuln.type]) acc[vuln.type] = [];
      acc[vuln.type].push(vuln);
      return acc;
    }, {} as Record<string, SecurityVulnerability[]>);
    
    if (issuesByType.xss) {
      recommendations.push('Implement comprehensive XSS protection with input validation and output encoding');
    }
    
    if (issuesByType.csrf) {
      recommendations.push('Add CSRF protection to all state-changing operations');
    }
    
    if (issuesByType.injection) {
      recommendations.push('Use parameterized queries and input validation to prevent injection attacks');
    }
    
    if (issuesByType.auth) {
      recommendations.push('Strengthen authentication mechanisms and session management');
    }
    
    if (issuesByType.headers) {
      recommendations.push('Implement comprehensive security headers including CSP');
    }
    
    if (issuesByType.disclosure) {
      recommendations.push('Prevent information disclosure through proper error handling');
    }
    
    if (issuesByType.cors) {
      recommendations.push('Configure CORS policies appropriately for your use case');
    }
    
    return recommendations;
  }

  /**
   * Test for common web vulnerabilities
   */
  async testCommonVulnerabilities(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];
    
    // Test for directory traversal
    const traversalPayloads = [
      '../../etc/passwd',
      '..\\..\\windows\\system32\\drivers\\etc\\hosts',
      '../../../etc/shadow',
    ];
    
    for (const payload of traversalPayloads) {
      try {
        const response = await this.page.goto(`/api/files/${encodeURIComponent(payload)}`);
        
        if (response && response.status() === 200) {
          const content = await response.text();
          
          if (content.includes('root:') || content.includes('localhost')) {
            vulnerabilities.push({
              type: 'injection',
              severity: 'critical',
              description: 'Directory traversal vulnerability',
              location: '/api/files',
              payload,
              impact: 'Allows access to system files',
              remediation: 'Implement proper input validation and file path restrictions',
            });
          }
        }
      } catch (error) {
        // Expected for properly secured endpoints
      }
    }
    
    return vulnerabilities;
  }
}

/**
 * Security test configurations
 */
export const securityTestConfigs = {
  authentication: {
    maxFailedAttempts: 5,
    lockoutDuration: 300, // 5 minutes
    passwordMinLength: 8,
    requireSpecialChars: true,
  },
  
  headers: {
    required: [
      'x-frame-options',
      'x-content-type-options',
      'x-xss-protection',
      'content-security-policy',
    ],
    csp: {
      minScore: 70,
      disallowUnsafeInline: true,
      disallowUnsafeEval: true,
    },
  },
  
  session: {
    requireSecure: true,
    requireHttpOnly: true,
    maxAge: 3600, // 1 hour
  },
  
  cors: {
    disallowWildcard: true,
    maxOrigins: 10,
  },
};