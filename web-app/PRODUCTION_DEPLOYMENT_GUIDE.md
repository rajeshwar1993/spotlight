# Production Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Spotlight portfolio platform to production using Vercel with full monitoring, security, and performance optimization.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Production Configuration](#production-configuration)
4. [Deployment Process](#deployment-process)
5. [Monitoring Setup](#monitoring-setup)
6. [Security Configuration](#security-configuration)
7. [Performance Optimization](#performance-optimization)
8. [Health Checks](#health-checks)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance](#maintenance)

## Prerequisites

### Required Accounts and Services

- **Vercel Account**: For hosting and deployment
- **Supabase Account**: For database and authentication
- **Sentry Account**: For error monitoring and performance tracking
- **Domain**: Custom domain for production (optional)
- **GitHub Repository**: For CI/CD pipeline

### Required Tools

- Node.js 20+ 
- npm or yarn
- Git
- Vercel CLI
- Supabase CLI (optional)

## Environment Setup

### 1. Production Environment Variables

Create a `.env.production.local` file based on `.env.production.example`:

```bash
# Copy the example file
cp .env.production.example .env.production.local

# Edit with your production values
nano .env.production.local
```

### 2. Required Environment Variables

#### Core Application
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

#### Supabase Configuration
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

#### Authentication
```env
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-32-character-secret
```

#### Monitoring
```env
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=your-sentry-project
SENTRY_AUTH_TOKEN=your-sentry-auth-token
```

#### Analytics
```env
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 3. Vercel Configuration

Install Vercel CLI:
```bash
npm install -g vercel
```

Login to Vercel:
```bash
vercel login
```

Link your project:
```bash
vercel link
```

## Production Configuration

### 1. Supabase Setup

#### Database Configuration
```sql
-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Create production-specific indexes
CREATE INDEX IF NOT EXISTS idx_portfolios_published ON portfolios(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON portfolios(slug) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

#### Storage Configuration
```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('avatars', 'avatars', true),
  ('portfolios', 'portfolios', true),
  ('documents', 'documents', false);

-- Set up storage policies
CREATE POLICY "Avatar uploads are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Portfolio images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolios');
```

### 2. Security Configuration

#### Content Security Policy
The production CSP is automatically configured in `src/lib/security/headers.ts`. Key directives include:

- `script-src`: Limited to trusted sources
- `style-src`: Allow inline styles for components
- `img-src`: Optimized for CDN and storage providers
- `connect-src`: API and monitoring endpoints only

#### Rate Limiting
Production rate limits are configured in `src/lib/security/headers.ts`:

- General API: 100 requests per 15 minutes
- Authentication: 5 attempts per 15 minutes
- File uploads: 10 uploads per minute
- Contact forms: 3 messages per hour

### 3. Performance Configuration

#### Image Optimization
- WebP and AVIF formats enabled
- Responsive breakpoints configured
- Custom image loader for CDN optimization
- Lazy loading implemented

#### Bundle Optimization
- Code splitting by route and component type
- Tree shaking enabled
- Vendor chunk optimization
- Framework chunks separated

#### Caching Strategy
- Static assets: 1 year cache
- Dynamic content: 1 minute cache with 5 minute stale-while-revalidate
- API responses: 1 minute cache
- Images: 30 days cache

## Deployment Process

### 1. Automated Deployment (Recommended)

#### GitHub Actions Pipeline

The production deployment uses a comprehensive GitHub Actions workflow:

```yaml
# Triggers on push to main branch
on:
  push:
    branches: [ main ]
```

#### Quality Gates
1. **Code Quality**: ESLint, TypeScript, formatting
2. **Unit Tests**: 80% coverage requirement
3. **Build Analysis**: Bundle size checks
4. **E2E Tests**: Cross-browser compatibility
5. **Security Tests**: Vulnerability scanning
6. **Performance Tests**: Lighthouse scores > 90
7. **Accessibility Tests**: WCAG 2.1 AA compliance

#### Deployment Steps
1. Pre-deployment checks
2. Build and test
3. Security scanning
4. Performance testing
5. E2E testing
6. Deployment gate evaluation
7. Vercel deployment
8. Post-deployment verification

### 2. Manual Deployment

For manual deployments:

```bash
# 1. Build the application
npm run build

# 2. Test the build locally
npm run start

# 3. Deploy to Vercel
vercel --prod

# 4. Run post-deployment health checks
npm run health-check
```

### 3. Environment-Specific Deployments

#### Staging Deployment
```bash
# Deploy to staging
vercel --target staging

# Custom domain for staging
vercel alias [deployment-url] staging.your-domain.com
```

#### Production Deployment
```bash
# Deploy to production
vercel --prod

# Custom domain for production
vercel alias [deployment-url] your-domain.com
```

## Monitoring Setup

### 1. Sentry Configuration

#### Error Monitoring
- JavaScript errors captured automatically
- Server-side errors tracked
- Performance monitoring enabled
- Custom error boundaries implemented

#### Performance Monitoring
- Core Web Vitals tracked
- Database query performance
- API response times
- User session replay (in production)

### 2. Vercel Analytics

#### Real User Monitoring
```typescript
// Automatically enabled in production
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

#### Custom Analytics
```typescript
import { AnalyticsTracker } from '@/lib/monitoring/analytics';

// Track custom events
AnalyticsTracker.event('portfolio_created', {
  template: 'modern',
  profession: 'actor',
});

// Track business metrics
AnalyticsTracker.business('portfolio_published', 1);
```

### 3. Health Monitoring

#### Health Check Endpoints
- `/api/health`: Overall system health
- `/api/monitoring/dashboard`: Comprehensive monitoring data

#### Monitoring Dashboard
Access the production monitoring dashboard:
```bash
curl -H "Authorization: Bearer YOUR_MONITORING_API_KEY" \
  https://your-domain.com/api/monitoring/dashboard
```

## Security Configuration

### 1. HTTPS and SSL

#### Vercel SSL
- Automatic SSL certificates
- HTTPS redirects enabled
- HSTS headers configured

#### Custom Domain SSL
```bash
# Add custom domain with SSL
vercel domains add your-domain.com
```

### 2. Security Headers

Production security headers are automatically applied:
- `Strict-Transport-Security`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`: Restricted permissions

### 3. Authentication Security

#### JWT Configuration
```env
NEXTAUTH_SECRET=your-32-character-secret
SUPABASE_JWT_SECRET=your-jwt-secret
```

#### Session Management
- Secure session cookies
- Session timeout: 1 hour
- Refresh token rotation enabled
- Email verification required

### 4. Data Protection

#### GDPR Compliance
```env
GDPR_ENABLED=true
COOKIE_CONSENT_REQUIRED=true
```

#### Privacy Controls
- User data anonymization
- Right to be forgotten
- Data export functionality
- Privacy policy compliance

## Performance Optimization

### 1. Core Web Vitals Targets

- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms
- **Time to First Byte (TTFB)**: < 600ms

### 2. Bundle Optimization

#### Code Splitting
```typescript
// Dynamic imports for large components
const AdminDashboard = dynamic(() => import('@/components/admin/AdminDashboard'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

// Template lazy loading
const TemplateRenderer = dynamic(() => import('@/components/templates/TemplateRenderer'), {
  ssr: true,
  loading: () => <TemplateSkeleton />,
});
```

#### Tree Shaking
```javascript
// Import only what you need
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Avoid default imports for large libraries
import { format } from 'date-fns/format';
```

### 3. Image Optimization

#### Responsive Images
```typescript
import Image from 'next/image';

<Image
  src="/portfolio-image.jpg"
  alt="Portfolio image"
  width={800}
  height={600}
  priority // For above-the-fold images
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

#### CDN Optimization
```typescript
// Custom image loader with CDN
const imageLoader = ({ src, width, quality }) => {
  return `https://your-cdn.com/${src}?w=${width}&q=${quality || 75}`;
};
```

### 4. Caching Strategy

#### Static Assets
- CSS/JS files: 1 year cache
- Images: 30 days cache
- Fonts: 1 year cache

#### Dynamic Content
- Portfolio pages: 1 minute cache with 5 minute stale-while-revalidate
- API responses: 1 minute cache
- User-specific content: No cache

## Health Checks

### 1. Application Health

#### System Health Check
```bash
curl https://your-domain.com/api/health
```

Response example:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:00Z",
  "environment": "production",
  "services": {
    "database": { "status": "healthy" },
    "storage": { "status": "healthy" },
    "monitoring": { "status": "healthy" }
  },
  "performance": {
    "memory": { "used": 150, "total": 512 },
    "responseTime": 45
  }
}
```

### 2. Database Health

#### Connection Testing
```sql
-- Test database connectivity
SELECT 1 as health_check;

-- Check connection pool
SELECT count(*) as active_connections 
FROM pg_stat_activity 
WHERE state = 'active';
```

### 3. Performance Monitoring

#### Core Web Vitals
Monitor in production:
```typescript
import { reportWebVitals } from '@/lib/monitoring/analytics';

// Automatically report to analytics
export function reportWebVitals(metric) {
  // Send to analytics service
  reportWebVitals(metric);
}
```

#### Custom Metrics
```typescript
// Track custom performance metrics
PerformanceMonitor.recordTiming('api.portfolio.load', 150);
PerformanceMonitor.recordMetric('portfolio.created', 1);
```

## Troubleshooting

### 1. Common Issues

#### Build Failures
```bash
# Check build logs
vercel logs [deployment-url]

# Run build locally
npm run build

# Check for TypeScript errors
npm run type-check
```

#### Database Connection Issues
```bash
# Check database health
curl https://your-domain.com/api/health

# Verify environment variables
vercel env ls
```

#### Performance Issues
```bash
# Analyze bundle size
npm run build:analyze

# Check Lighthouse scores
npm run lighthouse

# Monitor Core Web Vitals
npm run test:performance
```

### 2. Error Debugging

#### Client-Side Errors
```typescript
// Check Sentry for client errors
// Navigate to: https://sentry.io/organizations/your-org/projects/spotlight/

// Debug in browser console
console.log('Current environment:', process.env.NODE_ENV);
```

#### Server-Side Errors
```bash
# Check Vercel function logs
vercel logs

# Check Supabase logs
supabase logs
```

### 3. Performance Debugging

#### Slow Page Loads
```bash
# Check bundle analyzer
npm run build:analyze

# Run performance tests
npm run test:performance

# Check network requests
# Use browser DevTools Network tab
```

#### Memory Issues
```bash
# Check memory usage
curl https://your-domain.com/api/health

# Monitor in production
# Use Vercel analytics and Sentry performance monitoring
```

## Maintenance

### 1. Regular Updates

#### Monthly Tasks
- Update dependencies: `npm update`
- Review security advisories: `npm audit`
- Check performance metrics
- Review error logs in Sentry
- Update environment variables if needed

#### Weekly Tasks
- Monitor health check endpoints
- Review analytics and usage metrics
- Check deployment pipeline status
- Review and respond to monitoring alerts

#### Daily Tasks
- Check error rates in Sentry
- Monitor performance metrics
- Review deployment logs
- Check uptime status

### 2. Security Updates

#### Dependency Updates
```bash
# Check for security vulnerabilities
npm audit

# Update vulnerable packages
npm audit fix

# Manual security updates
npm update package-name
```

#### Environment Security
```bash
# Rotate secrets regularly
# Update API keys
# Review access permissions
# Check SSL certificate expiration
```

### 3. Performance Monitoring

#### Continuous Monitoring
- Set up alerts for performance degradation
- Monitor Core Web Vitals trends
- Track error rates and response times
- Review user feedback and support tickets

#### Performance Optimization
- Regular bundle size analysis
- Image optimization review
- Database query performance analysis
- CDN performance monitoring

### 4. Backup and Recovery

#### Database Backups
```bash
# Set up automated backups in Supabase
# Configure backup retention policies
# Test restore procedures regularly
```

#### Configuration Backups
```bash
# Backup environment variables
vercel env ls > production-env-backup.txt

# Backup deployment configuration
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0
```

## Support and Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Sentry Documentation](https://docs.sentry.io)

### Monitoring URLs
- Production: `https://your-domain.com`
- Health Check: `https://your-domain.com/api/health`
- Monitoring Dashboard: `https://your-domain.com/api/monitoring/dashboard`
- Sentry: `https://sentry.io/organizations/your-org/projects/spotlight/`
- Vercel Analytics: `https://vercel.com/dashboard/analytics`

### Emergency Contacts
- DevOps Team: devops@your-company.com
- Security Team: security@your-company.com
- Support Team: support@your-company.com

---

*This deployment guide ensures a robust, secure, and performant production environment for the Spotlight portfolio platform.*