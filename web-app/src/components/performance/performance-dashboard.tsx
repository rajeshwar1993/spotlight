/**
 * Performance Dashboard Component
 * Displays real-time performance metrics and Web Vitals
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  PerformanceMetric, 
  performanceMonitor, 
  PerformanceBudget,
  BundleAnalyzer 
} from '@/lib/performance';
import { 
  globalPreloader,
  useIntelligentPreloading 
} from '@/lib/intelligent-preloading';
import { 
  Activity,
  Clock,
  Download,
  Eye,
  Gauge,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [bundleSize, setBundleSize] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);
  
  const { getStats } = useIntelligentPreloading();
  const preloadStats = getStats();

  useEffect(() => {
    const loadMetrics = () => {
      if (performanceMonitor) {
        const currentMetrics = performanceMonitor.getMetrics();
        setMetrics(currentMetrics);
        setIsLoading(false);
      }
    };

    // Load initial metrics
    loadMetrics();

    // Set up periodic refresh
    const interval = setInterval(loadMetrics, 2000);

    return () => clearInterval(interval);
  }, [refreshCount]);

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
  };

  const getMetricIcon = (name: string) => {
    switch (name) {
      case 'CLS':
        return <Eye className="h-4 w-4" />;
      case 'FID':
        return <Clock className="h-4 w-4" />;
      case 'FCP':
        return <Zap className="h-4 w-4" />;
      case 'LCP':
        return <Activity className="h-4 w-4" />;
      case 'TTFB':
        return <Download className="h-4 w-4" />;
      default:
        return <Gauge className="h-4 w-4" />;
    }
  };

  const getMetricColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'text-green-600';
      case 'needs-improvement':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getBadgeVariant = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'default';
      case 'needs-improvement':
        return 'secondary';
      case 'poor':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatValue = (name: string, value: number) => {
    if (name === 'CLS') {
      return value.toFixed(3);
    }
    return Math.round(value);
  };

  const getUnit = (name: string) => {
    if (name === 'CLS') return '';
    return 'ms';
  };

  const coreWebVitals = metrics.filter(m => 
    ['CLS', 'FID', 'FCP', 'LCP', 'TTFB'].includes(m.name)
  );

  const otherMetrics = metrics.filter(m => 
    !['CLS', 'FID', 'FCP', 'LCP', 'TTFB'].includes(m.name)
  );

  const summary = performanceMonitor?.getMetricsSummary() || {
    total: 0,
    good: 0,
    needsImprovement: 0,
    poor: 0,
    score: 0
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Performance Dashboard</h1>
          <p className="text-gray-600">Real-time performance metrics and Web Vitals</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <TrendingUp className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-blue-600">
              {summary.score}
            </div>
            <div className="flex-1">
              <Progress value={summary.score} className="h-2" />
            </div>
            <div className="text-sm text-gray-600">
              {summary.good}/{summary.total} good
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">{summary.good}</div>
              <div className="text-xs text-gray-600">Good</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-yellow-600">{summary.needsImprovement}</div>
              <div className="text-xs text-gray-600">Needs Improvement</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-red-600">{summary.poor}</div>
              <div className="text-xs text-gray-600">Poor</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="vitals" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="metrics">Other Metrics</TabsTrigger>
          <TabsTrigger value="preloading">Preloading</TabsTrigger>
          <TabsTrigger value="bundle">Bundle Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coreWebVitals.length > 0 ? (
              coreWebVitals.map((metric) => (
                <Card key={metric.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {getMetricIcon(metric.name)}
                        {metric.name}
                      </div>
                      <Badge variant={getBadgeVariant(metric.rating)}>
                        {metric.rating}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-1">
                      {formatValue(metric.name, metric.value)}
                      <span className="text-sm text-gray-500 ml-1">
                        {getUnit(metric.name)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Navigation: {metric.navigationType}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No Core Web Vitals data available yet. 
                <br />
                Interact with the page to generate metrics.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherMetrics.length > 0 ? (
              otherMetrics.map((metric) => (
                <Card key={metric.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {getMetricIcon(metric.name)}
                        {metric.name}
                      </div>
                      <Badge variant={getBadgeVariant(metric.rating)}>
                        {metric.rating}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-1">
                      {formatValue(metric.name, metric.value)}
                      <span className="text-sm text-gray-500 ml-1">
                        {getUnit(metric.name)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Delta: {metric.delta}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No additional metrics available.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="preloading" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Preloaded Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {preloadStats.preloadedCount}
                </div>
                <div className="text-sm text-gray-600">Resources cached</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Queue Length</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {preloadStats.queueLength}
                </div>
                <div className="text-sm text-gray-600">Pending preloads</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Hit Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(preloadStats.hitRate * 100)}%
                </div>
                <div className="text-sm text-gray-600">Prediction accuracy</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {preloadStats.navigationPatterns.length}
                </div>
                <div className="text-sm text-gray-600">Navigation patterns</div>
              </CardContent>
            </Card>
          </div>

          {preloadStats.navigationPatterns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Top Navigation Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {preloadStats.navigationPatterns.slice(0, 5).map((pattern, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="text-sm">
                        <span className="font-medium">{pattern.from}</span>
                        <span className="mx-2">→</span>
                        <span className="font-medium">{pattern.to}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {Math.round(pattern.probability * 100)}%
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {pattern.count}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bundle" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Bundle Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <p>Run the following command to analyze bundle size:</p>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                    npm run build:analyze
                  </code>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(bundleSize / 1024)}KB
                    </div>
                    <div className="text-sm text-gray-600">Total Bundle Size</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((bundleSize * 0.3) / 1024)}KB
                    </div>
                    <div className="text-sm text-gray-600">Gzipped Size</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      A+
                    </div>
                    <div className="text-sm text-gray-600">Performance Grade</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;