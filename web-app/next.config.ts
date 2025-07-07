import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react'],
    // Enable parallel builds for better performance
    webVitalsAttribution: ['CLS', 'LCP'],
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 768, 1024, 1280, 1600],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Add Supabase storage domain for optimized image loading
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Optimize for static generation
  output: 'standalone',
  
  // Enable compression
  compress: true,
  
  // Optimize for production builds
  productionBrowserSourceMaps: false,
  
  // Optimize bundle analysis
  webpack: (config, { dev, isServer }) => {
    // Optimize for production
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Create separate chunk for portfolio templates
          templates: {
            name: 'templates',
            chunks: 'all',
            test: /[\\/]templates[\\/]/,
            priority: 20,
          },
          // Create separate chunk for UI components
          ui: {
            name: 'ui',
            chunks: 'all',
            test: /[\\/]components[\\/]ui[\\/]/,
            priority: 15,
          },
        },
      };
    }
    
    return config;
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      // Cache headers for portfolio pages
      {
        source: '/mypage/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
      // Cache headers for API routes
      {
        source: '/api/portfolios/slug/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },

  // Generate sitemap and optimize routing
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
      {
        source: '/robots.txt',
        destination: '/api/robots',
      },
    ];
  },
  
  // Redirect configuration for SEO
  async redirects() {
    return [
      {
        source: '/portfolio/:slug*',
        destination: '/mypage/:slug*',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
