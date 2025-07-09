import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config/env-validation';
import { withSentryErrorHandling } from '@/lib/monitoring/sentry';

interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: number;
  session_id: string;
  user_id?: string;
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
      { message: 'Analytics tracking disabled in development' },
      { status: 200 }
    );
  }

  try {
    const data: AnalyticsEvent = await request.json();

    // Validate required fields
    if (!data.event || !data.properties || !data.timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Process the analytics event
    await processAnalyticsEvent(data, request);

    return NextResponse.json(
      { message: 'Analytics event processed' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing analytics event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processAnalyticsEvent(data: AnalyticsEvent, request: NextRequest) {
  const { event, properties, timestamp, session_id, user_id } = data;

  // Extract request metadata
  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || '';
  const ip = request.ip || 
    request.headers.get('x-forwarded-for') || 
    request.headers.get('x-real-ip') || 
    'unknown';

  // Extract device information
  const deviceInfo = extractDeviceInfo(userAgent);

  // Create analytics record
  const analyticsRecord = {
    event_name: event,
    properties,
    timestamp: new Date(timestamp).toISOString(),
    session_id,
    user_id,
    ip_address: anonymizeIP(ip),
    user_agent: userAgent,
    referer,
    device_type: deviceInfo.type,
    browser: deviceInfo.browser,
    os: deviceInfo.os,
    created_at: new Date().toISOString(),
  };

  // Store in database
  await storeAnalyticsEvent(analyticsRecord);

  // Process specific event types
  await processEventTypeSpecific(event, properties, analyticsRecord);

  // Send to external services
  await sendToExternalServices(analyticsRecord);
}

async function storeAnalyticsEvent(record: any) {
  // In production, store in database
  // For now, just log
  console.log('Analytics event:', record);
  
  // Would implement actual database storage:
  // await supabase.from('analytics_events').insert(record);
}

async function processEventTypeSpecific(eventName: string, properties: any, record: any) {
  switch (eventName) {
    case 'page_view':
      await processPageView(properties, record);
      break;
    
    case 'user_action':
      await processUserAction(properties, record);
      break;
    
    case 'conversion':
      await processConversion(properties, record);
      break;
    
    case 'error':
      await processError(properties, record);
      break;
    
    case 'performance':
      await processPerformanceMetric(properties, record);
      break;
    
    case 'business_metric':
      await processBusinessMetric(properties, record);
      break;
    
    case 'feature_usage':
      await processFeatureUsage(properties, record);
      break;
    
    case 'user_journey':
      await processUserJourney(properties, record);
      break;
  }
}

async function processPageView(properties: any, record: any) {
  // Track page view metrics
  const pageViewMetrics = {
    url: properties.url,
    title: properties.title,
    timestamp: record.timestamp,
    session_id: record.session_id,
    user_id: record.user_id,
    device_type: record.device_type,
    browser: record.browser,
  };

  console.log('Page view processed:', pageViewMetrics);
}

async function processUserAction(properties: any, record: any) {
  // Track user action patterns
  const actionMetrics = {
    action: properties.action,
    target: properties.target,
    timestamp: record.timestamp,
    session_id: record.session_id,
    user_id: record.user_id,
  };

  console.log('User action processed:', actionMetrics);
}

async function processConversion(properties: any, record: any) {
  // Track conversion events
  const conversionMetrics = {
    conversion_event: properties.conversion_event,
    conversion_value: properties.conversion_value,
    timestamp: record.timestamp,
    session_id: record.session_id,
    user_id: record.user_id,
  };

  console.log('Conversion processed:', conversionMetrics);
  
  // Send conversion alerts if valuable
  if (properties.conversion_value > 1000) {
    await sendConversionAlert(conversionMetrics);
  }
}

async function processError(properties: any, record: any) {
  // Track error patterns
  const errorMetrics = {
    error_message: properties.error_message,
    error_stack: properties.error_stack,
    timestamp: record.timestamp,
    session_id: record.session_id,
    user_id: record.user_id,
    url: properties.url,
  };

  console.log('Error processed:', errorMetrics);
  
  // Send error alerts for critical errors
  if (properties.severity === 'critical') {
    await sendErrorAlert(errorMetrics);
  }
}

async function processPerformanceMetric(properties: any, record: any) {
  // Track performance metrics
  const performanceMetrics = {
    metric: properties.metric,
    value: properties.value,
    timestamp: record.timestamp,
    session_id: record.session_id,
    user_id: record.user_id,
  };

  console.log('Performance metric processed:', performanceMetrics);
}

async function processBusinessMetric(properties: any, record: any) {
  // Track business metrics
  const businessMetrics = {
    metric: properties.metric,
    value: properties.value,
    timestamp: record.timestamp,
    session_id: record.session_id,
    user_id: record.user_id,
  };

  console.log('Business metric processed:', businessMetrics);
}

async function processFeatureUsage(properties: any, record: any) {
  // Track feature usage
  const featureMetrics = {
    feature: properties.feature,
    action: properties.action,
    timestamp: record.timestamp,
    session_id: record.session_id,
    user_id: record.user_id,
  };

  console.log('Feature usage processed:', featureMetrics);
}

async function processUserJourney(properties: any, record: any) {
  // Track user journey steps
  const journeyMetrics = {
    step: properties.step,
    timestamp: record.timestamp,
    session_id: record.session_id,
    user_id: record.user_id,
  };

  console.log('User journey processed:', journeyMetrics);
}

async function sendToExternalServices(record: any) {
  // Send to external analytics services
  // Would implement integrations with:
  // - Mixpanel
  // - Amplitude
  // - Google Analytics
  // - Custom analytics platforms
}

async function sendConversionAlert(conversionMetrics: any) {
  // Send high-value conversion alerts
  console.log('High-value conversion alert:', conversionMetrics);
  
  // Would implement actual alerting:
  // - Slack notification
  // - Email to sales team
  // - Dashboard notification
}

async function sendErrorAlert(errorMetrics: any) {
  // Send critical error alerts
  console.log('Critical error alert:', errorMetrics);
  
  // Would implement actual alerting:
  // - Slack notification
  // - PagerDuty alert
  // - Email to dev team
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

function anonymizeIP(ip: string): string {
  // Anonymize IP for privacy compliance
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  }
  return 'anonymized';
}

export const POST = withSentryErrorHandling(handler, 'analytics-track');