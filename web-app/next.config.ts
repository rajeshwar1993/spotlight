import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import bundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: true,
});

const isProduction = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@heroicons/react', 'framer-motion'],
    // Enable parallel builds for better performance
    webVitalsAttribution: ['CLS', 'LCP', 'FCP', 'FID', 'TTFB'],
    // Enable edge runtime for better performance
    serverComponentsExternalPackages: ['@sentry/nextjs'],
    // Enable faster builds
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 768, 1024, 1280, 1600, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 768, 1024],
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
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.gravatar.com',
        port: '',
        pathname: '/avatar/**',
      },
    ],
    // Production image optimization
    minimumCacheTTL: isProduction ? 31536000 : 60, // 1 year in prod, 1 minute in dev
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Enable placeholder generation for better UX
    placeholder: 'blur',
    // Custom loader for production CDN
    ...(isProduction && {
      loader: 'custom',
      loaderFile: './src/lib/image-loader.ts',
    }),
  },

  // Optimize for static generation
  output: 'standalone',
  
  // Enable compression
  compress: true,
  
  // Optimize for production builds
  productionBrowserSourceMaps: false,
  
  // Enable SWC minification for better performance
  swcMinify: true,
  
  // Optimize for production performance
  poweredByHeader: false,
  generateEtags: true,
  
  // Enable static optimization
  trailingSlash: false,
  
  // Production optimizations
  ...(isProduction && {
    // Enable compiler optimizations
    compiler: {
      removeConsole: {
        exclude: ['error', 'warn'],
      },
      reactRemoveProperties: true,
    },
    // Enable static file optimization
    optimizeFonts: true,
    // Enable image optimization
    optimizeImages: true,
  }),
  
  // Enhanced bundle optimization
  webpack: (config, { dev, isServer, webpack }) => {
    // Production optimizations
    if (!dev) {
      // Enable tree shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Optimize chunk splitting
      if (!isServer) {
        config.optimization.splitChunks = {
          ...config.optimization.splitChunks,
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          maxAsyncRequests: 30,
          maxInitialRequests: 25,
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
            // Framework chunk for React and Next.js
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              priority: 40,
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
    }
    
    // Enable module concatenation for better performance
    config.optimization.concatenateModules = true;
    
    // Add custom plugins
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'process.env.VERCEL_ENV': JSON.stringify(process.env.VERCEL_ENV),
        'process.env.NEXT_PUBLIC_APP_URL': JSON.stringify(process.env.NEXT_PUBLIC_APP_URL),
      })
    );
    
    // Optimize SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    
    return config;
  },

  // Security headers
  async headers() {
    const headers = [
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
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
          },
        ],
      },
      // Cache headers for static assets
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache headers for images
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=3600',
          },
        ],
      },
      // Cache headers for portfolio pages
      {
        source: '/mypage/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: isProduction 
              ? 'public, s-maxage=60, stale-while-revalidate=300'
              : 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      // Cache headers for API routes
      {
        source: '/api/portfolios/slug/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: isProduction 
              ? 'public, s-maxage=60, stale-while-revalidate=300'
              : 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      // Cache headers for sitemap and robots
      {
        source: '/(sitemap.xml|robots.txt)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];

    // Add HSTS header in production
    if (isProduction) {
      headers[0].headers.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
      });
    }

    return headers;
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

// Sentry configuration
const sentryConfig = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: isProduction,
  disableLogger: isProduction,
  tunnelRoute: '/monitoring',
};

// Compose all the configurations
let config = withNextIntl(nextConfig);
config = withBundleAnalyzer(config);

// Add Sentry configuration in production
if (isProduction && process.env.SENTRY_DSN) {
  config = withSentryConfig(config, sentryConfig);
}

export default config;
