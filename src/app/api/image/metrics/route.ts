import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { metrics, sessionId, pageUrl, userAgent } = await request.json();

    if (!metrics || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Store metrics in database
    const { error: insertError } = await supabase
      .from('image_metrics')
      .insert({
        user_id: user.id,
        session_id: sessionId,
        page_url: pageUrl,
        user_agent: userAgent,
        metrics: metrics,
        timestamp: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Metrics insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to store metrics' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Metrics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const portfolioId = url.searchParams.get('portfolioId');
    const timeRange = url.searchParams.get('timeRange') || '7d';
    const aggregation = url.searchParams.get('aggregation') || 'summary';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '1h':
        startDate.setHours(startDate.getHours() - 1);
        break;
      case '24h':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Build query
    let query = supabase
      .from('image_metrics')
      .select('*')
      .eq('user_id', user.id)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString());

    if (portfolioId) {
      query = query.eq('portfolio_id', portfolioId);
    }

    const { data: metricsData, error: metricsError } = await query;

    if (metricsError) {
      console.error('Metrics query error:', metricsError);
      return NextResponse.json(
        { error: 'Failed to fetch metrics' },
        { status: 500 }
      );
    }

    // Process metrics based on aggregation type
    let processedMetrics;
    
    switch (aggregation) {
      case 'summary':
        processedMetrics = generateSummaryMetrics(metricsData);
        break;
      case 'detailed':
        processedMetrics = generateDetailedMetrics(metricsData);
        break;
      case 'performance':
        processedMetrics = generatePerformanceMetrics(metricsData);
        break;
      default:
        processedMetrics = generateSummaryMetrics(metricsData);
    }

    return NextResponse.json({
      success: true,
      timeRange,
      metrics: processedMetrics,
    });

  } catch (error) {
    console.error('Get metrics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateSummaryMetrics(data: any[]) {
  if (!data || data.length === 0) {
    return {
      totalImages: 0,
      averageLoadTime: 0,
      totalFileSize: 0,
      cacheHitRate: 0,
      formatDistribution: {},
    };
  }

  const allMetrics = data.flatMap(record => 
    Object.values(record.metrics || {})
  );

  const totalImages = allMetrics.length;
  const totalLoadTime = allMetrics.reduce((sum: number, metric: any) => 
    sum + (metric.loadTime || 0), 0
  );
  const averageLoadTime = totalImages > 0 ? totalLoadTime / totalImages : 0;

  const totalFileSize = allMetrics.reduce((sum: number, metric: any) => 
    sum + (metric.fileSize || 0), 0
  );

  const cacheHits = allMetrics.filter((metric: any) => metric.cacheHit).length;
  const cacheHitRate = totalImages > 0 ? cacheHits / totalImages : 0;

  const formatDistribution: Record<string, number> = {};
  allMetrics.forEach((metric: any) => {
    const format = metric.format || 'unknown';
    formatDistribution[format] = (formatDistribution[format] || 0) + 1;
  });

  return {
    totalImages,
    averageLoadTime,
    totalFileSize,
    cacheHitRate,
    formatDistribution,
  };
}

function generateDetailedMetrics(data: any[]) {
  return data.map(record => ({
    sessionId: record.session_id,
    pageUrl: record.page_url,
    timestamp: record.timestamp,
    metrics: record.metrics,
  }));
}

function generatePerformanceMetrics(data: any[]) {
  const allMetrics = data.flatMap(record => 
    Object.values(record.metrics || {})
  );

  // Calculate performance percentiles
  const loadTimes = allMetrics.map((metric: any) => metric.loadTime || 0).sort((a, b) => a - b);
  const fileSizes = allMetrics.map((metric: any) => metric.fileSize || 0).sort((a, b) => a - b);

  const getPercentile = (arr: number[], percentile: number) => {
    const index = Math.ceil(arr.length * percentile / 100) - 1;
    return arr[index] || 0;
  };

  return {
    loadTime: {
      p50: getPercentile(loadTimes, 50),
      p90: getPercentile(loadTimes, 90),
      p95: getPercentile(loadTimes, 95),
      p99: getPercentile(loadTimes, 99),
    },
    fileSize: {
      p50: getPercentile(fileSizes, 50),
      p90: getPercentile(fileSizes, 90),
      p95: getPercentile(fileSizes, 95),
      p99: getPercentile(fileSizes, 99),
    },
    recommendations: generateRecommendations(allMetrics),
  };
}

function generateRecommendations(metrics: any[]) {
  const recommendations: string[] = [];
  
  if (metrics.length === 0) return recommendations;

  const avgLoadTime = metrics.reduce((sum, m) => sum + (m.loadTime || 0), 0) / metrics.length;
  const avgFileSize = metrics.reduce((sum, m) => sum + (m.fileSize || 0), 0) / metrics.length;
  const cacheHitRate = metrics.filter(m => m.cacheHit).length / metrics.length;

  // Performance recommendations
  if (avgLoadTime > 2000) {
    recommendations.push('Consider optimizing image formats and sizes to reduce load times');
  }

  if (avgFileSize > 500 * 1024) {
    recommendations.push('Large average file size detected - implement better compression');
  }

  if (cacheHitRate < 0.7) {
    recommendations.push('Low cache hit rate - review cache headers and CDN configuration');
  }

  // Format recommendations
  const formatCounts: Record<string, number> = {};
  metrics.forEach(m => {
    const format = m.format || 'unknown';
    formatCounts[format] = (formatCounts[format] || 0) + 1;
  });

  const modernFormats = ['webp', 'avif'];
  const modernCount = modernFormats.reduce((sum, format) => sum + (formatCounts[format] || 0), 0);
  
  if (modernCount / metrics.length < 0.5) {
    recommendations.push('Consider using more modern image formats (WebP, AVIF) for better compression');
  }

  return recommendations;
}