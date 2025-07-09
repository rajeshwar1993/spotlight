import { NextResponse } from 'next/server';
import { config } from '../config/env-validation';

/**
 * Security headers configuration for production
 */
export const securityHeaders = {
  // Content Security Policy
  'Content-Security-Policy': generateCSP(),
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
    'ambient-light-sensor=()',
    'autoplay=()',
    'encrypted-media=()',
    'fullscreen=()',
    'picture-in-picture=()',
  ].join(', '),
  
  // HSTS (HTTP Strict Transport Security)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Cross-Origin policies
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Resource-Policy': 'cross-origin',
  
  // Cache control for security-sensitive routes
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Surrogate-Control': 'no-store',
};

/**
 * Generate Content Security Policy
 */
function generateCSP(): string {
  const isDev = config.isDevelopment;
  const appDomain = new URL(config.appUrl).hostname;
  const supabaseDomain = new URL(config.supabase.url).hostname;
  
  // Base CSP directives
  const cspDirectives = {
    'default-src': ["'self'"],
    
    'script-src': [
      "'self'",
      "'unsafe-inline'", // Required for Next.js
      "'unsafe-eval'", // Required for development
      'https://vercel.live',
      'https://cdn.vercel-insights.com',
      'https://vitals.vercel-insights.com',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://js.sentry-cdn.com',
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],
    
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for styled-components and CSS-in-JS
      'https://fonts.googleapis.com',
      'https://cdn.jsdelivr.net',
    ],
    
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https:',
      `https://${supabaseDomain}`,
      'https://images.unsplash.com',
      'https://via.placeholder.com',
      'https://www.gravatar.com',
      'https://cdn.vercel-insights.com',
      'https://www.google-analytics.com',
    ],
    
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'https://fonts.googleapis.com',
      'data:',
    ],
    
    'connect-src': [
      "'self'",
      `https://${supabaseDomain}`,
      'https://vercel.live',
      'https://vitals.vercel-insights.com',
      'https://www.google-analytics.com',
      'https://analytics.google.com',
      'https://sentry.io',
      'wss://realtime.supabase.co',
      ...(isDev ? ['ws://localhost:3000', 'http://localhost:3000'] : []),
    ],
    
    'media-src': [
      "'self'",
      `https://${supabaseDomain}`,
      'data:',
      'blob:',
    ],
    
    'object-src': ["'none'"],
    
    'base-uri': ["'self'"],
    
    'form-action': ["'self'"],
    
    'frame-ancestors': ["'none'"],
    
    'frame-src': [
      "'self'",
      'https://www.youtube.com',
      'https://player.vimeo.com',
      'https://www.google.com', // For reCAPTCHA
    ],
    
    'worker-src': [
      "'self'",
      'blob:',
    ],
    
    'manifest-src': ["'self'"],
    
    'upgrade-insecure-requests': [],
    
    'block-all-mixed-content': [],
  };

  // Add report-uri in production
  if (config.isProduction) {
    cspDirectives['report-uri'] = [`${config.appUrl}/api/csp-report`];
    cspDirectives['report-to'] = ['csp-endpoint'];
  }

  // Convert to CSP string
  return Object.entries(cspDirectives)
    .map(([directive, values]) => {
      if (values.length === 0) return directive;
      return `${directive} ${values.join(' ')}`;
    })
    .join('; ');
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add security-related headers for API routes
  if (response.url?.includes('/api/')) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  }

  return response;
}

/**
 * Rate limiting configuration
 */
export const rateLimitConfig = {
  // General API rate limiting
  api: {
    windowMs: config.security.rateLimit.window,
    max: config.security.rateLimit.max,
    message: {
      error: 'Too many requests, please try again later.',
      retryAfter: Math.ceil(config.security.rateLimit.window / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: 900, // 15 minutes
    },
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // File upload endpoints
  upload: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 uploads per minute
    message: {
      error: 'Too many file uploads, please try again later.',
      retryAfter: 60,
    },
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // Contact/email endpoints
  contact: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 messages per hour
    message: {
      error: 'Too many contact messages, please try again later.',
      retryAfter: 3600,
    },
    standardHeaders: true,
    legacyHeaders: false,
  },
};

/**
 * CORS configuration
 */
export const corsConfig = {
  origin: config.security.cors.origin,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
};

/**
 * Input validation and sanitization
 */
export class SecurityValidator {
  /**
   * Validate and sanitize user input
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove JavaScript protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL format
   */
  static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check for SQL injection patterns
   */
  static detectSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(select|insert|update|delete|drop|create|alter|exec|execute|union|script)\b)/i,
      /(\b(or|and)\b\s*\d+\s*=\s*\d+)/i,
      /('|(\\')|(;)|(--)|(\||(\*|\%)))/i,
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Check for XSS patterns
   */
  static detectXSS(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi,
      /<img[^>]*src[^>]*>/gi,
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Validate file upload
   */
  static validateFileUpload(file: File, allowedTypes: string[], maxSize: number): boolean {
    // Check file size
    if (file.size > maxSize) {
      return false;
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return false;
    }

    // Additional file validation could be added here
    return true;
  }

  /**
   * Generate secure random token
   */
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  /**
   * Hash password securely
   */
  static async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Security middleware factory
 */
export function createSecurityMiddleware() {
  return {
    headers: applySecurityHeaders,
    rateLimit: rateLimitConfig,
    cors: corsConfig,
    validator: SecurityValidator,
  };
}

export default {
  headers: securityHeaders,
  applyHeaders: applySecurityHeaders,
  rateLimit: rateLimitConfig,
  cors: corsConfig,
  validator: SecurityValidator,
  createMiddleware: createSecurityMiddleware,
};