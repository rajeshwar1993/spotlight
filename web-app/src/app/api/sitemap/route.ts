import { NextResponse } from 'next/server';
import { APP_CONFIG } from '@/lib/constants';
import { portfolioService } from '@/lib/services/portfolio';

// Static routes that should be included in the sitemap
const STATIC_ROUTES = [
  '',
  '/auth/signin',
  '/auth/signup',
  '/examples',
  '/templates',
  '/pricing',
];

// Routes that require authentication (lower priority)
const AUTH_ROUTES = [
  '/dashboard',
  '/profile',
  '/profile/settings',
  '/create',
];

async function generatePortfolioUrls(): Promise<string> {
  try {
    const { data: portfolios, error } = await portfolioService.getPublishedPortfolios();
    
    if (error || !portfolios) {
      console.error('Error fetching portfolios for sitemap:', error);
      return '';
    }

    return portfolios.map(portfolio => `
  <url>
    <loc>${APP_CONFIG.url}/mypage/${portfolio.slug}</loc>
    <lastmod>${new Date(portfolio.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');
  } catch (error) {
    console.error('Error generating portfolio URLs:', error);
    return '';
  }
}

async function generateSitemapXML(): Promise<string> {
  const baseUrl = APP_CONFIG.url;
  const currentDate = new Date().toISOString();

  // Generate URL entries for static routes
  const staticUrls = STATIC_ROUTES.map(route => {
    const url = `${baseUrl}${route}`;
    const priority = route === '' ? '1.0' : '0.8';
    const changefreq = route === '' ? 'daily' : 'weekly';

    return `
  <url>
    <loc>${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('');

  // Generate URL entries for authenticated routes
  const authUrls = AUTH_ROUTES.map(route => {
    const url = `${baseUrl}${route}`;

    return `
  <url>
    <loc>${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
  }).join('');

  // Generate dynamic portfolio routes
  const portfolioUrls = await generatePortfolioUrls();

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticUrls}
  ${authUrls}
  ${portfolioUrls}
</urlset>`;
}

export async function GET() {
  try {
    const sitemap = await generateSitemapXML();

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}