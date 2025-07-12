import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { rateLimit } from '@/lib/security/headers';

/**
 * POST /api/analytics/launch
 * Track launch-specific analytics events
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, 'analytics', 100, 900); // 100 requests per 15 minutes
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value;
          },
        },
      }
    );
    const body = await request.json();

    const {
      event,
      properties = {},
      userId,
      sessionId,
      timestamp = Date.now(),
    } = body;

    // Validate required fields
    if (!event) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      );
    }

    // Get user info if authenticated
    let user = null;
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
    } catch (error) {
      // User not authenticated - that's okay for some events
    }

    // Prepare analytics data
    const analyticsData = {
      event_name: event,
      properties: properties,
      user_id: user?.id || userId || null,
      session_id: sessionId,
      timestamp: new Date(timestamp).toISOString(),
      user_agent: request.headers.get('user-agent'),
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      referrer: request.headers.get('referer'),
      created_at: new Date().toISOString(),
    };

    // Store in analytics table
    const { error: insertError } = await supabase
      .from('analytics_events')
      .insert([analyticsData]);

    if (insertError) {
      console.error('Failed to insert analytics event:', insertError);
      return NextResponse.json(
        { error: 'Failed to track event' },
        { status: 500 }
      );
    }

    // Process specific launch events
    await processLaunchEvent(supabase, event, properties, user?.id);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/launch
 * Get launch analytics data
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value;
          },
        },
      }
    );
    
    // Check if user is admin (for security)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // For now, only allow specific admin emails
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    if (!adminEmails.includes(user.email || '')) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '24h';
    const metric = searchParams.get('metric') || 'all';

    // Calculate time range
    const timeRanges = {
      '1h': 1,
      '24h': 24,
      '7d': 24 * 7,
      '30d': 24 * 30,
    };

    const hoursBack = timeRanges[timeframe as keyof typeof timeRanges] || 24;
    const startTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    // Get analytics data
    const { data: events, error } = await supabase
      .from('analytics_events')
      .select('*')
      .gte('timestamp', startTime.toISOString())
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Failed to fetch analytics events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch analytics data' },
        { status: 500 }
      );
    }

    // Process and aggregate data
    const analytics = processAnalyticsData(events || [], metric);

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Process specific launch events for additional tracking
 */
async function processLaunchEvent(
  supabase: any,
  event: string,
  properties: any,
  userId?: string
) {
  try {
    switch (event) {
      case 'launch_onboarding_complete':
        // Update user onboarding status
        if (userId) {
          await supabase
            .from('users')
            .update({ 
              onboarding_completed: true,
              onboarding_completed_at: new Date().toISOString()
            })
            .eq('id', userId);
        }
        break;

      case 'launch_first_portfolio_created':
        // Track first portfolio milestone
        if (userId) {
          await supabase
            .from('user_milestones')
            .insert([{
              user_id: userId,
              milestone: 'first_portfolio_created',
              achieved_at: new Date().toISOString(),
              properties: properties
            }]);
        }
        break;

      case 'launch_portfolio_published':
        // Track portfolio publish milestone
        if (userId) {
          await supabase
            .from('user_milestones')
            .insert([{
              user_id: userId,
              milestone: 'first_portfolio_published',
              achieved_at: new Date().toISOString(),
              properties: properties
            }]);
        }
        break;
    }
  } catch (error) {
    console.error('Failed to process launch event:', error);
    // Don't throw - analytics tracking should be resilient
  }
}

/**
 * Process and aggregate analytics data
 */
function processAnalyticsData(events: any[], metric: string) {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  // Group events by type
  const eventGroups = events.reduce((acc, event) => {
    const eventName = event.event_name;
    if (!acc[eventName]) {
      acc[eventName] = [];
    }
    acc[eventName].push(event);
    return acc;
  }, {});

  // Calculate metrics
  const metrics = {
    totalEvents: events.length,
    uniqueUsers: new Set(events.map(e => e.user_id).filter(Boolean)).size,
    uniqueSessions: new Set(events.map(e => e.session_id).filter(Boolean)).size,
    
    // Funnel metrics
    funnelSteps: calculateFunnelMetrics(events),
    
    // Onboarding metrics
    onboardingMetrics: calculateOnboardingMetrics(events),
    
    // Performance metrics
    performanceMetrics: calculatePerformanceMetrics(events),
    
    // Time-based analysis
    hourlyBreakdown: calculateHourlyBreakdown(events),
    
    // Top events
    topEvents: Object.entries(eventGroups)
      .map(([name, eventList]) => ({
        name,
        count: (eventList as any[]).length,
        uniqueUsers: new Set((eventList as any[]).map(e => e.user_id).filter(Boolean)).size
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
  };

  return metrics;
}

function calculateFunnelMetrics(events: any[]) {
  const funnelSteps = [
    'launch_page_view',
    'launch_onboarding_step',
    'launch_template_usage',
    'launch_first_portfolio_created',
    'launch_portfolio_published'
  ];

  return funnelSteps.map(step => {
    const stepEvents = events.filter(e => e.event_name === step);
    return {
      step,
      count: stepEvents.length,
      uniqueUsers: new Set(stepEvents.map(e => e.user_id).filter(Boolean)).size
    };
  });
}

function calculateOnboardingMetrics(events: any[]) {
  const onboardingEvents = events.filter(e => 
    e.event_name.includes('onboarding')
  );

  const completedOnboarding = events.filter(e => 
    e.event_name === 'launch_onboarding_complete'
  );

  const startedOnboarding = events.filter(e => 
    e.event_name === 'launch_onboarding_step' && 
    e.properties?.step === 'welcome'
  );

  return {
    started: startedOnboarding.length,
    completed: completedOnboarding.length,
    completionRate: startedOnboarding.length > 0 
      ? (completedOnboarding.length / startedOnboarding.length) * 100 
      : 0,
    avgTimeToComplete: calculateAverageOnboardingTime(events)
  };
}

function calculatePerformanceMetrics(events: any[]) {
  const performanceEvents = events.filter(e => 
    e.event_name === 'launch_performance_issue'
  );

  return {
    totalIssues: performanceEvents.length,
    issueTypes: performanceEvents.reduce((acc, event) => {
      const issueType = event.properties?.issue_type || 'unknown';
      acc[issueType] = (acc[issueType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
}

function calculateHourlyBreakdown(events: any[]) {
  const hourlyData = new Array(24).fill(0);
  
  events.forEach(event => {
    const hour = new Date(event.timestamp).getHours();
    hourlyData[hour]++;
  });

  return hourlyData.map((count, hour) => ({
    hour,
    count
  }));
}

function calculateAverageOnboardingTime(events: any[]) {
  // This would require more sophisticated tracking
  // For now, return a placeholder
  return 480; // 8 minutes average
}