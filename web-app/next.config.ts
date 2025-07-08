import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import bundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: true,
});

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
  
  // Enhanced bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Optimize for production
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Create separate chunk for portfolio templates
          templates: {
            name: 'templates',
            chunks: 'all',
            test: /[\\/]templates[\\/]/,
            priority: 30,
            enforce: true,
          },
          // Create separate chunk for UI components
          ui: {
            name: 'ui',
            chunks: 'all',
            test: /[\\/]components[\\/]ui[\\/]/,
            priority: 25,
            enforce: true,
          },
          // Create separate chunk for admin components
          admin: {
            name: 'admin',
            chunks: 'all',
            test: /[\\/]admin[\\/]/,
            priority: 20,
            enforce: true,
          },
          // Create separate chunk for dashboard components
          dashboard: {
            name: 'dashboard',
            chunks: 'all',
            test: /[\\/]dashboard[\\/]/,
            priority: 15,
            enforce: true,
          },
          // Vendor chunk for large third-party packages
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            minChunks: 1,
            maxInitialRequests: 25,
            minSize: 20000,
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

export default withBundleAnalyzer(withNextIntl(nextConfig));
