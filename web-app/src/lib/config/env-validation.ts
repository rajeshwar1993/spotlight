import { z } from 'zod';

/**
 * Environment validation schema for production
 */
const envSchema = z.object({
  // Core Application
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_API_URL: z.string().url(),

  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().min(32),

  // Authentication
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),

  // Database
  SUPABASE_DB_URL: z.string().url().optional(),

  // Email Configuration
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.string().regex(/^\d+$/).optional(),
  SMTP_USER: z.string().email().optional(),
  SMTP_PASS: z.string().min(1).optional(),
  SMTP_FROM: z.string().email().optional(),

  // Storage
  NEXT_PUBLIC_SUPABASE_STORAGE_URL: z.string().url(),
  SUPABASE_STORAGE_KEY: z.string().min(1).optional(),

  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().min(1).optional(),
  SENTRY_PROJECT: z.string().min(1).optional(),
  SENTRY_AUTH_TOKEN: z.string().min(1).optional(),

  // Analytics
  NEXT_PUBLIC_VERCEL_ANALYTICS_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_GA_ID: z.string().min(1).optional(),

  // Security
  RATE_LIMIT_MAX: z.string().regex(/^\d+$/).optional(),
  RATE_LIMIT_WINDOW: z.string().regex(/^\d+$/).optional(),
  CORS_ORIGIN: z.string().min(1).optional(),

  // External Services
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),

  // Performance
  NEXT_PUBLIC_PERFORMANCE_MONITORING: z.string().optional(),
  LIGHTHOUSE_CI_TOKEN: z.string().min(1).optional(),

  // Caching
  REDIS_URL: z.string().url().optional(),
  REDIS_PASSWORD: z.string().min(1).optional(),

  // Feature Flags
  FEATURE_ADVANCED_ANALYTICS: z.string().optional(),
  FEATURE_SOCIAL_SHARING: z.string().optional(),
  FEATURE_REAL_TIME_UPDATES: z.string().optional(),
  FEATURE_PORTFOLIO_EXPORT: z.string().optional(),

  // Maintenance
  MAINTENANCE_MODE: z.string().optional(),
  MAINTENANCE_MESSAGE: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).optional(),

  // Compliance
  GDPR_ENABLED: z.string().optional(),
  COOKIE_CONSENT_REQUIRED: z.string().optional(),
});

/**
 * Validated environment variables
 */
export const env = envSchema.parse(process.env);

/**
 * Configuration object with parsed and validated environment variables
 */
export const config = {
  // Core Application
  nodeEnv: env.NODE_ENV,
  appUrl: env.NEXT_PUBLIC_APP_URL,
  apiUrl: env.NEXT_PUBLIC_API_URL,
  isProduction: env.NODE_ENV === 'production',
  isDevelopment: env.NODE_ENV === 'development',

  // Supabase
  supabase: {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    jwtSecret: env.SUPABASE_JWT_SECRET,
    storageUrl: env.NEXT_PUBLIC_SUPABASE_STORAGE_URL,
    storageKey: env.SUPABASE_STORAGE_KEY,
  },

  // Authentication
  auth: {
    nextAuthUrl: env.NEXTAUTH_URL,
    nextAuthSecret: env.NEXTAUTH_SECRET,
  },

  // Database
  database: {
    url: env.SUPABASE_DB_URL,
  },

  // Email
  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ? parseInt(env.SMTP_PORT) : 587,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.SMTP_FROM,
  },

  // Monitoring
  monitoring: {
    sentry: {
      dsn: env.SENTRY_DSN,
      org: env.SENTRY_ORG,
      project: env.SENTRY_PROJECT,
      authToken: env.SENTRY_AUTH_TOKEN,
    },
    vercelAnalytics: {
      id: env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID,
    },
    googleAnalytics: {
      id: env.NEXT_PUBLIC_GA_ID,
    },
  },

  // Security
  security: {
    rateLimit: {
      max: env.RATE_LIMIT_MAX ? parseInt(env.RATE_LIMIT_MAX) : 100,
      window: env.RATE_LIMIT_WINDOW ? parseInt(env.RATE_LIMIT_WINDOW) : 900000,
    },
    cors: {
      origin: env.CORS_ORIGIN?.split(',') || [env.NEXT_PUBLIC_APP_URL],
    },
  },

  // External Services
  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  },

  // Performance
  performance: {
    monitoring: env.NEXT_PUBLIC_PERFORMANCE_MONITORING === 'true',
    lighthouseToken: env.LIGHTHOUSE_CI_TOKEN,
  },

  // Caching
  cache: {
    redis: {
      url: env.REDIS_URL,
      password: env.REDIS_PASSWORD,
    },
  },

  // Feature Flags
  features: {
    advancedAnalytics: env.FEATURE_ADVANCED_ANALYTICS === 'true',
    socialSharing: env.FEATURE_SOCIAL_SHARING === 'true',
    realTimeUpdates: env.FEATURE_REAL_TIME_UPDATES === 'true',
    portfolioExport: env.FEATURE_PORTFOLIO_EXPORT === 'true',
  },

  // Maintenance
  maintenance: {
    mode: env.MAINTENANCE_MODE === 'true',
    message: env.MAINTENANCE_MESSAGE || 'We are currently performing maintenance. Please check back soon.',
  },

  // Logging
  logging: {
    level: env.LOG_LEVEL || 'info',
  },

  // Compliance
  compliance: {
    gdpr: env.GDPR_ENABLED === 'true',
    cookieConsent: env.COOKIE_CONSENT_REQUIRED === 'true',
  },
};

/**
 * Validate environment variables on startup
 */
export function validateEnvironment() {
  try {
    envSchema.parse(process.env);
    console.log('✅ Environment validation successful');
    return true;
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    
    if (config.isProduction) {
      throw new Error('Environment validation failed in production');
    }
    
    return false;
  }
}

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig() {
  const baseConfig = {
    ...config,
    timestamp: new Date().toISOString(),
  };

  if (config.isProduction) {
    return {
      ...baseConfig,
      debug: false,
      cache: {
        ...baseConfig.cache,
        ttl: 3600, // 1 hour
      },
    };
  }

  return {
    ...baseConfig,
    debug: true,
    cache: {
      ...baseConfig.cache,
      ttl: 60, // 1 minute
    },
  };
}

/**
 * Health check for critical services
 */
export async function healthCheck() {
  const checks = {
    environment: true,
    database: false,
    storage: false,
    monitoring: false,
  };

  try {
    // Validate environment
    checks.environment = validateEnvironment();

    // Check database connection
    if (config.supabase.url) {
      checks.database = true; // Would implement actual DB check
    }

    // Check storage
    if (config.supabase.storageUrl) {
      checks.storage = true; // Would implement actual storage check
    }

    // Check monitoring
    if (config.monitoring.sentry.dsn) {
      checks.monitoring = true; // Would implement actual monitoring check
    }

    return {
      status: Object.values(checks).every(Boolean) ? 'healthy' : 'unhealthy',
      checks,
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      checks,
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
    };
  }
}

export default config;