/**
 * Performance regression detection and alerting system
 */

export interface PerformanceSnapshot {
  timestamp: string;
  bundleSize: {
    total: number;
    gzipped: number;
    chunks: Record<string, number>;
  };
  lighthouse: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    fcp: number;
    lcp: number;
    cls: number;
    fid: number;
    ttfb: number;
  };
  loadTimes: Record<string, number>;
  userMetrics: {
    averageLoadTime: number;
    bounceRate: number;
    conversionRate: number;
    errorRate: number;
  };
  buildInfo: {
    commit: string;
    branch: string;
    buildNumber: string;
    nodeVersion: string;
    nextVersion: string;
  };
}

export interface RegressionAlert {
  type: 'bundle_size' | 'performance' | 'load_time' | 'user_metrics';
  severity: 'low' | 'medium' | 'high' | 'critical';
  metric: string;
  previousValue: number;
  currentValue: number;
  change: number;
  threshold: number;
  message: string;
  recommendations: string[];
}

export interface RegressionConfig {
  bundleSize: {
    totalSizeThreshold: number; // 10% increase
    chunkSizeThreshold: number; // 15% increase
    gzippedSizeThreshold: number; // 10% increase
  };
  performance: {
    lighthouseScoreThreshold: number; // 5 point decrease
    fcpThreshold: number; // 200ms increase
    lcpThreshold: number; // 300ms increase
    clsThreshold: number; // 0.02 increase
    fidThreshold: number; // 50ms increase
    ttfbThreshold: number; // 100ms increase
  };
  loadTimes: {
    averageThreshold: number; // 500ms increase
    p95Threshold: number; // 1000ms increase
  };
  userMetrics: {
    bounceRateThreshold: number; // 5% increase
    conversionRateThreshold: number; // 2% decrease
    errorRateThreshold: number; // 1% increase
  };
}

export class PerformanceRegressionDetector {
  private config: RegressionConfig;
  private baselineSnapshot: PerformanceSnapshot | null = null;
  private alerts: RegressionAlert[] = [];

  constructor(config?: Partial<RegressionConfig>) {
    this.config = {
      bundleSize: {
        totalSizeThreshold: 0.1, // 10%
        chunkSizeThreshold: 0.15, // 15%
        gzippedSizeThreshold: 0.1, // 10%
      },
      performance: {
        lighthouseScoreThreshold: 5,
        fcpThreshold: 200,
        lcpThreshold: 300,
        clsThreshold: 0.02,
        fidThreshold: 50,
        ttfbThreshold: 100,
      },
      loadTimes: {
        averageThreshold: 500,
        p95Threshold: 1000,
      },
      userMetrics: {
        bounceRateThreshold: 0.05, // 5%
        conversionRateThreshold: 0.02, // 2%
        errorRateThreshold: 0.01, // 1%
      },
      ...config,
    };
  }

  /**
   * Set baseline snapshot for comparison
   */
  setBaseline(snapshot: PerformanceSnapshot): void {
    this.baselineSnapshot = snapshot;
  }

  /**
   * Load baseline from storage
   */
  async loadBaseline(): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('performance-baseline');
        if (stored) {
          this.baselineSnapshot = JSON.parse(stored);
        }
      }
    } catch (error) {
      console.error('Failed to load baseline:', error);
    }
  }

  /**
   * Save baseline to storage
   */
  async saveBaseline(snapshot: PerformanceSnapshot): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('performance-baseline', JSON.stringify(snapshot));
      }
      this.baselineSnapshot = snapshot;
    } catch (error) {
      console.error('Failed to save baseline:', error);
    }
  }

  /**
   * Detect regressions by comparing current snapshot with baseline
   */
  detectRegressions(currentSnapshot: PerformanceSnapshot): RegressionAlert[] {
    this.alerts = [];

    if (!this.baselineSnapshot) {
      console.warn('No baseline snapshot available for regression detection');
      return [];
    }

    // Check bundle size regressions
    this.checkBundleSizeRegressions(currentSnapshot);

    // Check performance regressions
    this.checkPerformanceRegressions(currentSnapshot);

    // Check load time regressions
    this.checkLoadTimeRegressions(currentSnapshot);

    // Check user metrics regressions
    this.checkUserMetricsRegressions(currentSnapshot);

    return this.alerts;
  }

  /**
   * Check bundle size regressions
   */
  private checkBundleSizeRegressions(current: PerformanceSnapshot): void {
    const baseline = this.baselineSnapshot!;

    // Total size regression
    const totalSizeChange = (current.bundleSize.total - baseline.bundleSize.total) / baseline.bundleSize.total;
    if (totalSizeChange > this.config.bundleSize.totalSizeThreshold) {
      this.alerts.push({
        type: 'bundle_size',
        severity: this.getSeverity(totalSizeChange, this.config.bundleSize.totalSizeThreshold),
        metric: 'total_size',
        previousValue: baseline.bundleSize.total,
        currentValue: current.bundleSize.total,
        change: totalSizeChange,
        threshold: this.config.bundleSize.totalSizeThreshold,
        message: `Bundle size increased by ${(totalSizeChange * 100).toFixed(1)}%`,
        recommendations: [
          'Review recent changes for unnecessary dependencies',
          'Run bundle analyzer to identify large modules',
          'Consider code splitting for large features',
          'Check for duplicate dependencies',
        ],
      });
    }

    // Gzipped size regression
    const gzippedSizeChange = (current.bundleSize.gzipped - baseline.bundleSize.gzipped) / baseline.bundleSize.gzipped;
    if (gzippedSizeChange > this.config.bundleSize.gzippedSizeThreshold) {
      this.alerts.push({
        type: 'bundle_size',
        severity: this.getSeverity(gzippedSizeChange, this.config.bundleSize.gzippedSizeThreshold),
        metric: 'gzipped_size',
        previousValue: baseline.bundleSize.gzipped,
        currentValue: current.bundleSize.gzipped,
        change: gzippedSizeChange,
        threshold: this.config.bundleSize.gzippedSizeThreshold,
        message: `Gzipped bundle size increased by ${(gzippedSizeChange * 100).toFixed(1)}%`,
        recommendations: [
          'Optimize compression settings',
          'Remove dead code',
          'Minify JavaScript and CSS',
        ],
      });
    }

    // Individual chunk regressions
    Object.entries(current.bundleSize.chunks).forEach(([chunk, size]) => {
      const baselineSize = baseline.bundleSize.chunks[chunk];
      if (baselineSize) {
        const chunkChange = (size - baselineSize) / baselineSize;
        if (chunkChange > this.config.bundleSize.chunkSizeThreshold) {
          this.alerts.push({
            type: 'bundle_size',
            severity: this.getSeverity(chunkChange, this.config.bundleSize.chunkSizeThreshold),
            metric: `chunk_${chunk}`,
            previousValue: baselineSize,
            currentValue: size,
            change: chunkChange,
            threshold: this.config.bundleSize.chunkSizeThreshold,
            message: `Chunk ${chunk} size increased by ${(chunkChange * 100).toFixed(1)}%`,
            recommendations: [
              `Review changes to ${chunk}`,
              'Consider splitting large chunks',
              'Remove unused code from chunk',
            ],
          });
        }
      }
    });
  }

  /**
   * Check performance regressions
   */
  private checkPerformanceRegressions(current: PerformanceSnapshot): void {
    const baseline = this.baselineSnapshot!;

    // Lighthouse performance score
    const performanceChange = baseline.lighthouse.performance - current.lighthouse.performance;
    if (performanceChange > this.config.performance.lighthouseScoreThreshold) {
      this.alerts.push({
        type: 'performance',
        severity: this.getSeverity(performanceChange / 100, this.config.performance.lighthouseScoreThreshold / 100),
        metric: 'lighthouse_performance',
        previousValue: baseline.lighthouse.performance,
        currentValue: current.lighthouse.performance,
        change: -performanceChange / 100,
        threshold: this.config.performance.lighthouseScoreThreshold / 100,
        message: `Lighthouse performance score decreased by ${performanceChange} points`,
        recommendations: [
          'Optimize Core Web Vitals',
          'Reduce JavaScript execution time',
          'Optimize images and assets',
          'Eliminate render-blocking resources',
        ],
      });
    }

    // Core Web Vitals regressions
    this.checkCoreWebVitalsRegressions(current);
  }

  /**
   * Check Core Web Vitals regressions
   */
  private checkCoreWebVitalsRegressions(current: PerformanceSnapshot): void {
    const baseline = this.baselineSnapshot!;

    const vitalsChecks = [
      { metric: 'fcp', threshold: this.config.performance.fcpThreshold, name: 'First Contentful Paint' },
      { metric: 'lcp', threshold: this.config.performance.lcpThreshold, name: 'Largest Contentful Paint' },
      { metric: 'fid', threshold: this.config.performance.fidThreshold, name: 'First Input Delay' },
      { metric: 'ttfb', threshold: this.config.performance.ttfbThreshold, name: 'Time to First Byte' },
    ];

    vitalsChecks.forEach(({ metric, threshold, name }) => {
      const currentValue = current.lighthouse[metric as keyof typeof current.lighthouse] as number;
      const baselineValue = baseline.lighthouse[metric as keyof typeof baseline.lighthouse] as number;
      const change = currentValue - baselineValue;

      if (change > threshold) {
        this.alerts.push({
          type: 'performance',
          severity: this.getSeverity(change / threshold, 1),
          metric,
          previousValue: baselineValue,
          currentValue,
          change: change / baselineValue,
          threshold: threshold / baselineValue,
          message: `${name} increased by ${change}ms`,
          recommendations: this.getVitalsRecommendations(metric),
        });
      }
    });

    // CLS is different (lower is better)
    const clsChange = current.lighthouse.cls - baseline.lighthouse.cls;
    if (clsChange > this.config.performance.clsThreshold) {
      this.alerts.push({
        type: 'performance',
        severity: this.getSeverity(clsChange / this.config.performance.clsThreshold, 1),
        metric: 'cls',
        previousValue: baseline.lighthouse.cls,
        currentValue: current.lighthouse.cls,
        change: clsChange / baseline.lighthouse.cls,
        threshold: this.config.performance.clsThreshold / baseline.lighthouse.cls,
        message: `Cumulative Layout Shift increased by ${clsChange.toFixed(3)}`,
        recommendations: [
          'Add size attributes to images',
          'Reserve space for ads and embeds',
          'Avoid inserting content above existing content',
          'Use CSS transform instead of changing layout properties',
        ],
      });
    }
  }

  /**
   * Check load time regressions
   */
  private checkLoadTimeRegressions(current: PerformanceSnapshot): void {
    const baseline = this.baselineSnapshot!;

    Object.entries(current.loadTimes).forEach(([page, currentTime]) => {
      const baselineTime = baseline.loadTimes[page];
      if (baselineTime) {
        const change = currentTime - baselineTime;
        if (change > this.config.loadTimes.averageThreshold) {
          this.alerts.push({
            type: 'load_time',
            severity: this.getSeverity(change / this.config.loadTimes.averageThreshold, 1),
            metric: `load_time_${page}`,
            previousValue: baselineTime,
            currentValue: currentTime,
            change: change / baselineTime,
            threshold: this.config.loadTimes.averageThreshold / baselineTime,
            message: `${page} load time increased by ${change}ms`,
            recommendations: [
              'Enable caching for static assets',
              'Optimize database queries',
              'Reduce API response times',
              'Implement lazy loading',
            ],
          });
        }
      }
    });
  }

  /**
   * Check user metrics regressions
   */
  private checkUserMetricsRegressions(current: PerformanceSnapshot): void {
    const baseline = this.baselineSnapshot!;

    // Bounce rate increase
    const bounceRateChange = current.userMetrics.bounceRate - baseline.userMetrics.bounceRate;
    if (bounceRateChange > this.config.userMetrics.bounceRateThreshold) {
      this.alerts.push({
        type: 'user_metrics',
        severity: this.getSeverity(bounceRateChange / this.config.userMetrics.bounceRateThreshold, 1),
        metric: 'bounce_rate',
        previousValue: baseline.userMetrics.bounceRate,
        currentValue: current.userMetrics.bounceRate,
        change: bounceRateChange / baseline.userMetrics.bounceRate,
        threshold: this.config.userMetrics.bounceRateThreshold / baseline.userMetrics.bounceRate,
        message: `Bounce rate increased by ${(bounceRateChange * 100).toFixed(1)}%`,
        recommendations: [
          'Improve page load speed',
          'Optimize mobile experience',
          'Review content relevance',
          'Fix broken links and errors',
        ],
      });
    }

    // Conversion rate decrease
    const conversionRateChange = baseline.userMetrics.conversionRate - current.userMetrics.conversionRate;
    if (conversionRateChange > this.config.userMetrics.conversionRateThreshold) {
      this.alerts.push({
        type: 'user_metrics',
        severity: this.getSeverity(conversionRateChange / this.config.userMetrics.conversionRateThreshold, 1),
        metric: 'conversion_rate',
        previousValue: baseline.userMetrics.conversionRate,
        currentValue: current.userMetrics.conversionRate,
        change: -conversionRateChange / baseline.userMetrics.conversionRate,
        threshold: this.config.userMetrics.conversionRateThreshold / baseline.userMetrics.conversionRate,
        message: `Conversion rate decreased by ${(conversionRateChange * 100).toFixed(1)}%`,
        recommendations: [
          'Optimize checkout flow',
          'Improve form usability',
          'Reduce page load times',
          'A/B test critical paths',
        ],
      });
    }

    // Error rate increase
    const errorRateChange = current.userMetrics.errorRate - baseline.userMetrics.errorRate;
    if (errorRateChange > this.config.userMetrics.errorRateThreshold) {
      this.alerts.push({
        type: 'user_metrics',
        severity: this.getSeverity(errorRateChange / this.config.userMetrics.errorRateThreshold, 1),
        metric: 'error_rate',
        previousValue: baseline.userMetrics.errorRate,
        currentValue: current.userMetrics.errorRate,
        change: errorRateChange / baseline.userMetrics.errorRate,
        threshold: this.config.userMetrics.errorRateThreshold / baseline.userMetrics.errorRate,
        message: `Error rate increased by ${(errorRateChange * 100).toFixed(1)}%`,
        recommendations: [
          'Review error logs',
          'Fix JavaScript errors',
          'Improve error handling',
          'Monitor API endpoints',
        ],
      });
    }
  }

  /**
   * Get severity based on change magnitude
   */
  private getSeverity(change: number, threshold: number): 'low' | 'medium' | 'high' | 'critical' {
    const ratio = change / threshold;
    
    if (ratio >= 3) return 'critical';
    if (ratio >= 2) return 'high';
    if (ratio >= 1.5) return 'medium';
    return 'low';
  }

  /**
   * Get recommendations for Core Web Vitals
   */
  private getVitalsRecommendations(metric: string): string[] {
    const recommendations: Record<string, string[]> = {
      fcp: [
        'Eliminate render-blocking resources',
        'Minify CSS and JavaScript',
        'Remove unused CSS',
        'Preload key resources',
      ],
      lcp: [
        'Optimize images',
        'Preload important resources',
        'Reduce server response times',
        'Remove render-blocking JavaScript',
      ],
      fid: [
        'Minimize main thread work',
        'Reduce JavaScript execution time',
        'Break up long tasks',
        'Use a web worker',
      ],
      ttfb: [
        'Optimize server performance',
        'Use a CDN',
        'Cache resources',
        'Minimize redirects',
      ],
    };

    return recommendations[metric] || [];
  }

  /**
   * Get alerts summary
   */
  getAlertsSummary(): {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    byType: Record<string, number>;
  } {
    const summary = {
      total: this.alerts.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      byType: {} as Record<string, number>,
    };

    this.alerts.forEach(alert => {
      summary[alert.severity]++;
      summary.byType[alert.type] = (summary.byType[alert.type] || 0) + 1;
    });

    return summary;
  }

  /**
   * Clear all alerts
   */
  clearAlerts(): void {
    this.alerts = [];
  }
}

/**
 * Performance monitoring service
 */
export class PerformanceMonitoringService {
  private detector: PerformanceRegressionDetector;
  private alertCallbacks: Array<(alerts: RegressionAlert[]) => void> = [];

  constructor(config?: Partial<RegressionConfig>) {
    this.detector = new PerformanceRegressionDetector(config);
  }

  /**
   * Initialize monitoring
   */
  async initialize(): Promise<void> {
    await this.detector.loadBaseline();
  }

  /**
   * Create performance snapshot
   */
  createSnapshot(data: {
    bundleSize: any;
    lighthouse: any;
    loadTimes: any;
    userMetrics: any;
    buildInfo: any;
  }): PerformanceSnapshot {
    return {
      timestamp: new Date().toISOString(),
      ...data,
    };
  }

  /**
   * Monitor performance and detect regressions
   */
  async monitor(snapshot: PerformanceSnapshot): Promise<RegressionAlert[]> {
    const alerts = this.detector.detectRegressions(snapshot);
    
    // Notify callbacks
    this.alertCallbacks.forEach(callback => callback(alerts));
    
    // Log alerts
    if (alerts.length > 0) {
      console.warn(`Performance regression detected: ${alerts.length} alert(s)`);
      alerts.forEach(alert => {
        console.warn(`[${alert.severity.toUpperCase()}] ${alert.message}`);
      });
    }

    return alerts;
  }

  /**
   * Update baseline
   */
  async updateBaseline(snapshot: PerformanceSnapshot): Promise<void> {
    await this.detector.saveBaseline(snapshot);
  }

  /**
   * Subscribe to alerts
   */
  onAlert(callback: (alerts: RegressionAlert[]) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Unsubscribe from alerts
   */
  offAlert(callback: (alerts: RegressionAlert[]) => void): void {
    const index = this.alertCallbacks.indexOf(callback);
    if (index > -1) {
      this.alertCallbacks.splice(index, 1);
    }
  }
}

// Global instance
export const performanceMonitoring = new PerformanceMonitoringService();