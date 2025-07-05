import { NextResponse } from 'next/server';
import { APP_CONFIG } from '@/lib/constants';

export async function GET() {
  const baseUrl = APP_CONFIG.url;
  
  const robotsTxt = `User-agent: *
Allow: /
Allow: /auth/signin
Allow: /auth/signup
Allow: /examples
Allow: /templates
Allow: /pricing

# Disallow private/authenticated areas
Disallow: /dashboard
Disallow: /profile
Disallow: /create
Disallow: /api
Disallow: /_next

# Disallow authentication callback routes
Disallow: /auth/callback
Disallow: /auth/reset-password
Disallow: /auth/verify

# Allow search engines to access portfolio pages (when implemented)
Allow: /mypage/

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay (optional)
Crawl-delay: 1
`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
    },
  });
}