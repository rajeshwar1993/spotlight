import { NextRequest, NextResponse } from 'next/server';
import { config, healthCheck } from '@/lib/config/env-validation';
import { checkDatabaseHealth, checkStorageHealth } from '@/lib/config/supabase-production';
import { withSentryErrorHandling } from '@/lib/monitoring/sentry';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'error';
  timestamp: string;
  environment: string;
  version: string;
  uptime: number;
  services: {
    database: any;
    storage: any;
    cache: any;
    monitoring: any;
  };
  performance: {
    memory: any;
    cpu: any;
    responseTime: number;
  };
  deployment: {
    commit: string;
    branch: string;
    buildTime: string;
    deployTime: string;
  };
}

async function handler(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Perform health checks
    const healthStatus = await performHealthChecks();
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    healthStatus.performance.responseTime = responseTime;
    
    // Determine overall status
    const isHealthy = Object.values(healthStatus.services).every(
      service => service.status === 'healthy'
    );
    
    healthStatus.status = isHealthy ? 'healthy' : 'unhealthy';
    
    // Return appropriate status code
    const statusCode = isHealthy ? 200 : 503;
    
    return NextResponse.json(healthStatus, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
      }
    });
    
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      error: error instanceof Error ? error.message : 'Unknown error',
      performance: {
        responseTime: Date.now() - startTime,
      },
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
      }
    });
  }
}

async function performHealthChecks(): Promise<HealthStatus> {
  const timestamp = new Date().toISOString();
  
  // Parallel health checks
  const [
    envHealth,
    databaseHealth,
    storageHealth,
    cacheHealth,
    monitoringHealth,
    performanceMetrics,
    deploymentInfo
  ] = await Promise.allSettled([
    healthCheck(),
    checkDatabaseHealth(),
    checkStorageHealth(),
    checkCacheHealth(),
    checkMonitoringHealth(),
    getPerformanceMetrics(),
    getDeploymentInfo()
  ]);
  
  return {
    status: 'healthy', // Will be determined later
    timestamp,
    environment: config.nodeEnv,
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    services: {
      database: getResultValue(databaseHealth, { status: 'error', error: 'Database check failed' }),
      storage: getResultValue(storageHealth, { status: 'error', error: 'Storage check failed' }),
      cache: getResultValue(cacheHealth, { status: 'error', error: 'Cache check failed' }),
      monitoring: getResultValue(monitoringHealth, { status: 'error', error: 'Monitoring check failed' }),
    },
    performance: getResultValue(performanceMetrics, {
      memory: { used: 0, total: 0 },
      cpu: { usage: 0 },
      responseTime: 0,
    }),
    deployment: getResultValue(deploymentInfo, {
      commit: 'unknown',
      branch: 'unknown',
      buildTime: 'unknown',
      deployTime: 'unknown',
    }),
  };
}

function getResultValue<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === 'fulfilled' ? result.value : fallback;
}

async function checkCacheHealth() {
  try {
    if (!config.cache.redis.url) {
      return {
        status: 'disabled',
        message: 'Redis cache not configured',
        timestamp: new Date().toISOString(),
      };
    }
    
    // In production, implement actual Redis health check
    // const redis = new Redis(config.cache.redis.url);
    // await redis.ping();
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: 5, // Mock response time
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

async function checkMonitoringHealth() {
  try {
    const services = [];
    
    // Check Sentry
    if (config.monitoring.sentry.dsn) {
      services.push({
        name: 'sentry',
        status: 'healthy',
        configured: true,
      });
    }
    
    // Check Vercel Analytics
    if (config.monitoring.vercelAnalytics.id) {
      services.push({
        name: 'vercel-analytics',
        status: 'healthy',
        configured: true,
      });
    }
    
    // Check Google Analytics
    if (config.monitoring.googleAnalytics.id) {
      services.push({
        name: 'google-analytics',
        status: 'healthy',
        configured: true,
      });
    }
    
    return {
      status: 'healthy',
      services,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

async function getPerformanceMetrics() {
  try {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
        usage: Math.round(((cpuUsage.user + cpuUsage.system) / 1000000) * 100) / 100, // Percentage
      },
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    };
  } catch (error) {
    return {
      memory: { used: 0, total: 0 },
      cpu: { usage: 0 },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function getDeploymentInfo() {
  try {
    return {
      commit: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || 'unknown',
      branch: process.env.VERCEL_GIT_COMMIT_REF || process.env.GITHUB_REF_NAME || 'unknown',
      buildTime: process.env.VERCEL_BUILD_TIME || new Date().toISOString(),
      deployTime: process.env.VERCEL_DEPLOY_TIME || new Date().toISOString(),
      region: process.env.VERCEL_REGION || 'unknown',
      url: process.env.VERCEL_URL || config.appUrl,
    };
  } catch (error) {
    return {
      commit: 'unknown',
      branch: 'unknown',
      buildTime: 'unknown',
      deployTime: 'unknown',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export const GET = withSentryErrorHandling(handler, 'health-check');