import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config/env-validation';
import { withSentryErrorHandling } from '@/lib/monitoring/sentry';

interface WebVitalsData {
  name: string;
  value: number;
  id: string;
  label: string;
  timestamp: number;
  url: string;
  userAgent: string;
}

async function handler(request: NextRequest) {
  // Only accept POST requests
  if (request.method !== 'POST') {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  }

  // Only process in production
  if (!config.isProduction) {
    return NextResponse.json(
      { message: 'Web Vitals tracking disabled in development' },
      { status: 200 }
    );
  }

  try {
    const data: WebVitalsData = await request.json();

    // Validate required fields
    if (!data.name || !data.value || !data.id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate metric name
    const validMetrics = ['CLS', 'FID', 'FCP', 'LCP', 'TTFB', 'INP'];
    if (!validMetrics.includes(data.name)) {
      return NextResponse.json(
        { error: 'Invalid metric name' },
        { status: 400 }
      );
    }

    // Process the Web Vitals data
    await processWebVitals(data);

    return NextResponse.json(
      { message: 'Web Vitals data received' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing Web Vitals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processWebVitals(data: WebVitalsData) {
  const { name, value, id, label, timestamp, url, userAgent } = data;

  // Extract useful information from URL
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const searchParams = urlObj.searchParams;

  // Extract device information from user agent
  const deviceInfo = extractDeviceInfo(userAgent);

  // Create metrics record
  const metricsRecord = {
    metric_name: name,
    metric_value: value,
    metric_id: id,
    metric_label: label,
    timestamp: new Date(timestamp).toISOString(),
    page_url: url,
    page_path: pathname,
    device_type: deviceInfo.type,
    browser: deviceInfo.browser,
    os: deviceInfo.os,
    created_at: new Date().toISOString(),
  };

  // Store in database (would implement actual storage)
  console.log('Web Vitals metric:', metricsRecord);

  // Send to external services if configured
  if (config.monitoring.sentry.dsn) {
    // Send to Sentry
    // Would implement Sentry metrics API call
  }

  // Check for performance alerts
  await checkPerformanceAlerts(name, value, pathname);
}

function extractDeviceInfo(userAgent: string) {
  // Simple device detection (in production, use a proper library)
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
  const isTablet = /Tablet|iPad/i.test(userAgent);
  
  let browser = 'Unknown';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';

  let os = 'Unknown';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';

  return {
    type: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
    browser,
    os,
  };
}

async function checkPerformanceAlerts(metricName: string, value: number, pathname: string) {
  // Define performance thresholds
  const thresholds = {
    CLS: 0.1,      // Cumulative Layout Shift
    FID: 100,      // First Input Delay (ms)
    FCP: 1800,     // First Contentful Paint (ms)
    LCP: 2500,     // Largest Contentful Paint (ms)
    TTFB: 600,     // Time to First Byte (ms)
    INP: 200,      // Interaction to Next Paint (ms)
  };

  const threshold = thresholds[metricName as keyof typeof thresholds];
  if (threshold && value > threshold) {
    // Performance alert triggered
    const alert = {
      metric: metricName,
      value,
      threshold,
      pathname,
      severity: getSeverity(metricName, value, threshold),
      timestamp: new Date().toISOString(),
    };

    console.warn('Performance alert triggered:', alert);
    
    // Would send alert to monitoring system
    // e.g., Slack, PagerDuty, email, etc.
  }
}

function getSeverity(metricName: string, value: number, threshold: number): 'low' | 'medium' | 'high' | 'critical' {
  const ratio = value / threshold;
  
  if (ratio < 1.2) return 'low';
  if (ratio < 1.5) return 'medium';
  if (ratio < 2.0) return 'high';
  return 'critical';
}

export const POST = withSentryErrorHandling(handler, 'analytics-web-vitals');