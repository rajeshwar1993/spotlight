import { createClient } from '@supabase/supabase-js';
import { config } from './env-validation';

/**
 * Production Supabase configuration
 */
export const supabaseConfig = {
  url: config.supabase.url,
  anonKey: config.supabase.anonKey,
  serviceRoleKey: config.supabase.serviceRoleKey,
  
  // Production-specific client options
  clientOptions: {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'X-Client-Info': 'spotlight-portfolio-web',
      },
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  },

  // Production database settings
  databaseConfig: {
    connectionPooling: {
      enabled: true,
      maxConnections: 20,
      minConnections: 5,
      acquireTimeoutMillis: 30000,
      idleTimeoutMillis: 300000,
    },
    queryTimeout: 30000,
    statementTimeout: 30000,
    lockTimeout: 30000,
  },

  // Storage configuration
  storageConfig: {
    buckets: {
      avatars: {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 2 * 1024 * 1024, // 2MB
      },
      portfolios: {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
      },
      documents: {
        public: false,
        allowedMimeTypes: ['application/pdf', 'application/msword'],
        fileSizeLimit: 10 * 1024 * 1024, // 10MB
      },
    },
    cdn: {
      enabled: true,
      cacheTtl: 3600, // 1 hour
      imageOptimization: {
        enabled: true,
        formats: ['webp', 'avif'],
        quality: 80,
      },
    },
  },

  // Security configuration
  securityConfig: {
    rls: {
      enabled: true,
      policies: {
        enforceOwnership: true,
        enableAuditLog: true,
      },
    },
    auth: {
      enableSignups: true,
      enableEmailConfirmation: true,
      enablePhoneConfirmation: false,
      minPasswordLength: 8,
      sessionTimeout: 3600, // 1 hour
      refreshTokenRotation: true,
    },
    cors: {
      allowedOrigins: config.security.cors.origin,
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    },
  },

  // Monitoring configuration
  monitoringConfig: {
    enableMetrics: true,
    enableLogs: true,
    logLevel: config.logging.level,
    alerts: {
      errorRate: {
        threshold: 0.05, // 5%
        window: 300, // 5 minutes
      },
      responseTime: {
        threshold: 1000, // 1 second
        window: 300, // 5 minutes
      },
      connectionPool: {
        threshold: 0.8, // 80% utilization
        window: 300, // 5 minutes
      },
    },
  },

  // Backup configuration
  backupConfig: {
    enabled: true,
    schedule: {
      full: '0 2 * * 0', // Weekly full backup
      incremental: '0 */6 * * *', // Every 6 hours
    },
    retention: {
      daily: 7,
      weekly: 4,
      monthly: 12,
    },
    compression: true,
    encryption: true,
  },
};

/**
 * Create production Supabase client with enhanced configuration
 */
export const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  supabaseConfig.clientOptions
);

/**
 * Create service role client for admin operations
 */
export const supabaseAdmin = createClient(
  supabaseConfig.url,
  supabaseConfig.serviceRoleKey,
  {
    ...supabaseConfig.clientOptions,
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Database connection health check
 */
export async function checkDatabaseHealth() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
      .single();

    if (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: Date.now(),
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Storage health check
 */
export async function checkStorageHealth() {
  try {
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      status: 'healthy',
      buckets: data?.length || 0,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get database performance metrics
 */
export async function getDatabaseMetrics() {
  try {
    const { data, error } = await supabaseAdmin
      .from('pg_stat_database')
      .select('*')
      .eq('datname', 'postgres')
      .single();

    if (error) {
      throw error;
    }

    return {
      connections: data?.numbackends || 0,
      transactions: data?.xact_commit || 0,
      rollbacks: data?.xact_rollback || 0,
      reads: data?.blks_read || 0,
      hits: data?.blks_hit || 0,
      hitRatio: data?.blks_hit / (data?.blks_read + data?.blks_hit) || 0,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Initialize production database settings
 */
export async function initializeProductionDatabase() {
  try {
    // Set statement timeout
    await supabaseAdmin.rpc('set_statement_timeout', {
      timeout: supabaseConfig.databaseConfig.statementTimeout,
    });

    // Set lock timeout
    await supabaseAdmin.rpc('set_lock_timeout', {
      timeout: supabaseConfig.databaseConfig.lockTimeout,
    });

    // Enable row level security on all tables
    if (supabaseConfig.securityConfig.rls.enabled) {
      await supabaseAdmin.rpc('enable_rls_all_tables');
    }

    console.log('✅ Production database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize production database:', error);
    return false;
  }
}

/**
 * Setup storage buckets for production
 */
export async function setupStorageBuckets() {
  try {
    const { buckets } = supabaseConfig.storageConfig;

    for (const [bucketName, config] of Object.entries(buckets)) {
      // Create bucket if it doesn't exist
      const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: config.public,
        allowedMimeTypes: config.allowedMimeTypes,
        fileSizeLimit: config.fileSizeLimit,
      });

      if (createError && !createError.message.includes('already exists')) {
        throw createError;
      }

      // Set bucket policy
      if (config.public) {
        await supabaseAdmin.storage
          .from(bucketName)
          .createSignedUrl('test', 60); // Test bucket access
      }
    }

    console.log('✅ Storage buckets configured successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to setup storage buckets:', error);
    return false;
  }
}

/**
 * Production-ready Supabase client factory
 */
export function createProductionSupabaseClient() {
  if (!config.isProduction) {
    console.warn('⚠️ Production Supabase client used in non-production environment');
  }

  return {
    client: supabase,
    admin: supabaseAdmin,
    config: supabaseConfig,
    healthCheck: {
      database: checkDatabaseHealth,
      storage: checkStorageHealth,
    },
    metrics: {
      database: getDatabaseMetrics,
    },
    init: {
      database: initializeProductionDatabase,
      storage: setupStorageBuckets,
    },
  };
}

export default createProductionSupabaseClient;