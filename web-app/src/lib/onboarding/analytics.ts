import { AnalyticsTracker } from '../monitoring/analytics';

/**
 * Launch-specific analytics tracking
 */
export class LaunchAnalytics {
  /**
   * Track launch events
   */
  static trackLaunchEvent(event: string, properties?: Record<string, any>) {
    AnalyticsTracker.event(`launch_${event}`, {
      ...properties,
      category: 'Launch',
      timestamp: Date.now(),
    });
  }

  /**
   * Track onboarding progress
   */
  static trackOnboardingStep(step: string, properties?: Record<string, any>) {
    this.trackLaunchEvent('onboarding_step', {
      step,
      ...properties,
    });
  }

  /**
   * Track onboarding completion
   */
  static trackOnboardingComplete(timeSpent: number, stepsCompleted: number) {
    this.trackLaunchEvent('onboarding_complete', {
      time_spent_seconds: timeSpent,
      steps_completed: stepsCompleted,
      completion_rate: (stepsCompleted / 6) * 100, // Assuming 6 total steps
    });
  }

  /**
   * Track onboarding abandonment
   */
  static trackOnboardingAbandoned(step: string, timeSpent: number) {
    this.trackLaunchEvent('onboarding_abandoned', {
      abandoned_at_step: step,
      time_spent_seconds: timeSpent,
    });
  }

  /**
   * Track first portfolio creation
   */
  static trackFirstPortfolioCreated(timeFromSignup: number, template: string) {
    this.trackLaunchEvent('first_portfolio_created', {
      time_from_signup_minutes: Math.round(timeFromSignup / 60),
      template_selected: template,
    });
  }

  /**
   * Track portfolio publish
   */
  static trackPortfolioPublished(portfolioId: string, template: string, timeToPublish: number) {
    this.trackLaunchEvent('portfolio_published', {
      portfolio_id: portfolioId,
      template: template,
      time_to_publish_minutes: Math.round(timeToPublish / 60),
    });
  }

  /**
   * Track user journey funnel step
   */
  static trackFunnelStep(step: string, properties?: Record<string, any>) {
    this.trackLaunchEvent('funnel_step', {
      funnel_step: step,
      ...properties,
    });
  }

  /**
   * Track conversion events
   */
  static trackConversion(event: string, value?: number, properties?: Record<string, any>) {
    AnalyticsTracker.conversion(`launch_${event}`, value, {
      ...properties,
      category: 'Launch Conversion',
    });
  }

  /**
   * Track user feedback
   */
  static trackUserFeedback(rating: number, feedback?: string, step?: string) {
    this.trackLaunchEvent('user_feedback', {
      rating,
      feedback,
      feedback_step: step,
    });
  }

  /**
   * Track feature discovery
   */
  static trackFeatureDiscovery(feature: string, discoveryMethod: string) {
    this.trackLaunchEvent('feature_discovery', {
      feature,
      discovery_method: discoveryMethod,
    });
  }

  /**
   * Track template usage
   */
  static trackTemplateUsage(template: string, action: string) {
    this.trackLaunchEvent('template_usage', {
      template,
      action, // 'preview', 'select', 'customize'
    });
  }

  /**
   * Track help usage
   */
  static trackHelpUsage(helpType: string, helpItem: string) {
    this.trackLaunchEvent('help_usage', {
      help_type: helpType, // 'faq', 'tutorial', 'contact'
      help_item: helpItem,
    });
  }

  /**
   * Track search behavior
   */
  static trackSearch(query: string, resultsCount: number, source: string) {
    this.trackLaunchEvent('search', {
      search_query: query,
      results_count: resultsCount,
      search_source: source,
    });
  }

  /**
   * Track performance issues
   */
  static trackPerformanceIssue(issue: string, metric: number, threshold: number) {
    this.trackLaunchEvent('performance_issue', {
      issue_type: issue,
      metric_value: metric,
      threshold_value: threshold,
    });
  }

  /**
   * Track error occurrences
   */
  static trackError(error: string, context?: string) {
    this.trackLaunchEvent('error_occurred', {
      error_type: error,
      error_context: context,
    });
  }

  /**
   * Track page views with launch context
   */
  static trackPageView(page: string, isFirstVisit: boolean = false) {
    AnalyticsTracker.pageView(window.location.href, document.title);
    
    this.trackLaunchEvent('page_view', {
      page,
      is_first_visit: isFirstVisit,
      referrer: document.referrer,
    });
  }

  /**
   * Track session events
   */
  static trackSessionStart() {
    this.trackLaunchEvent('session_start', {
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  }

  static trackSessionEnd(duration: number) {
    this.trackLaunchEvent('session_end', {
      session_duration_minutes: Math.round(duration / 60),
    });
  }
}

/**
 * User Journey Tracking
 */
export class UserJourneyTracker {
  private static journeySteps: string[] = [];
  private static journeyStartTime: number = Date.now();

  /**
   * Start tracking user journey
   */
  static startJourney() {
    this.journeySteps = [];
    this.journeyStartTime = Date.now();
    LaunchAnalytics.trackLaunchEvent('journey_start');
  }

  /**
   * Track journey step
   */
  static trackStep(step: string, properties?: Record<string, any>) {
    this.journeySteps.push(step);
    
    LaunchAnalytics.trackFunnelStep(step, {
      step_number: this.journeySteps.length,
      time_from_start: Date.now() - this.journeyStartTime,
      ...properties,
    });
  }

  /**
   * Complete journey
   */
  static completeJourney(goal: string) {
    const totalTime = Date.now() - this.journeyStartTime;
    
    LaunchAnalytics.trackLaunchEvent('journey_complete', {
      goal_achieved: goal,
      total_steps: this.journeySteps.length,
      total_time_minutes: Math.round(totalTime / 60),
      journey_path: this.journeySteps.join(' -> '),
    });
  }

  /**
   * Abandon journey
   */
  static abandonJourney(reason?: string) {
    const totalTime = Date.now() - this.journeyStartTime;
    
    LaunchAnalytics.trackLaunchEvent('journey_abandoned', {
      abandon_reason: reason,
      steps_completed: this.journeySteps.length,
      time_spent_minutes: Math.round(totalTime / 60),
      last_step: this.journeySteps[this.journeySteps.length - 1],
    });
  }
}

/**
 * A/B Testing for Launch
 */
export class LaunchABTesting {
  /**
   * Track A/B test assignment
   */
  static trackTestAssignment(testName: string, variant: string) {
    LaunchAnalytics.trackLaunchEvent('ab_test_assignment', {
      test_name: testName,
      variant,
    });
  }

  /**
   * Track A/B test conversion
   */
  static trackTestConversion(testName: string, variant: string, goal: string) {
    LaunchAnalytics.trackConversion('ab_test_conversion', 1, {
      test_name: testName,
      variant,
      conversion_goal: goal,
    });
  }
}

/**
 * Real-time metrics collection
 */
export class RealTimeMetrics {
  private static metricsBuffer: Array<{ event: string; data: any; timestamp: number }> = [];
  private static batchSize = 10;
  private static flushInterval = 30000; // 30 seconds

  /**
   * Initialize real-time metrics
   */
  static init() {
    // Flush metrics periodically
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Add metric to buffer
   */
  static addMetric(event: string, data: any) {
    this.metricsBuffer.push({
      event,
      data,
      timestamp: Date.now(),
    });

    // Flush if buffer is full
    if (this.metricsBuffer.length >= this.batchSize) {
      this.flush();
    }
  }

  /**
   * Flush metrics to server
   */
  private static async flush() {
    if (this.metricsBuffer.length === 0) return;

    const metrics = [...this.metricsBuffer];
    this.metricsBuffer = [];

    try {
      await fetch('/api/analytics/real-time', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metrics }),
      });
    } catch (error) {
      console.error('Failed to flush real-time metrics:', error);
      // Re-add metrics to buffer for retry
      this.metricsBuffer.unshift(...metrics);
    }
  }
}

export default {
  LaunchAnalytics,
  UserJourneyTracker,
  LaunchABTesting,
  RealTimeMetrics,
};