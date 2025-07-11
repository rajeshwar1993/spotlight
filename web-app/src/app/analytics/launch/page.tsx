'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Eye, 
  Clock, 
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { LaunchMetrics } from '@/components/analytics/launch-dashboard';

interface LaunchStats {
  totalUsers: number;
  newUsersToday: number;
  portfoliosCreated: number;
  portfoliosCreatedToday: number;
  onboardingCompletionRate: number;
  avgTimeToFirstPortfolio: number;
  errorRate: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface ConversionFunnel {
  step: string;
  users: number;
  conversionRate: number;
  dropOffRate: number;
}

interface PerformanceMetrics {
  avgResponseTime: number;
  p95ResponseTime: number;
  uptime: number;
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
}

const MOCK_LAUNCH_STATS: LaunchStats = {
  totalUsers: 1247,
  newUsersToday: 89,
  portfoliosCreated: 456,
  portfoliosCreatedToday: 23,
  onboardingCompletionRate: 78.5,
  avgTimeToFirstPortfolio: 8.2,
  errorRate: 0.3,
  systemHealth: 'healthy'
};

const MOCK_CONVERSION_FUNNEL: ConversionFunnel[] = [
  { step: 'Landing Page Visit', users: 1500, conversionRate: 100, dropOffRate: 0 },
  { step: 'Account Registration', users: 1200, conversionRate: 80, dropOffRate: 20 },
  { step: 'Email Verification', users: 1080, conversionRate: 72, dropOffRate: 8 },
  { step: 'Onboarding Started', users: 950, conversionRate: 63.3, dropOffRate: 8.7 },
  { step: 'Template Selected', users: 820, conversionRate: 54.7, dropOffRate: 8.6 },
  { step: 'Portfolio Created', users: 650, conversionRate: 43.3, dropOffRate: 11.4 },
  { step: 'Portfolio Published', users: 456, conversionRate: 30.4, dropOffRate: 12.9 }
];

const MOCK_PERFORMANCE: PerformanceMetrics = {
  avgResponseTime: 245,
  p95ResponseTime: 890,
  uptime: 99.8,
  coreWebVitals: {
    lcp: 1.8,
    fid: 45,
    cls: 0.05
  }
};

export default function LaunchAnalyticsPage() {
  const [stats, setStats] = useState<LaunchStats>(MOCK_LAUNCH_STATS);
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnel[]>(MOCK_CONVERSION_FUNNEL);
  const [performance, setPerformance] = useState<PerformanceMetrics>(MOCK_PERFORMANCE);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, fetch from your analytics API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to refresh analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Launch Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time metrics and insights for the Spotlight platform launch
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
          <Button
            onClick={refreshData}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Status */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              {getHealthIcon(stats.systemHealth)}
              <span className="ml-2">System Health</span>
            </CardTitle>
            <Badge variant={stats.systemHealth === 'healthy' ? 'default' : 'destructive'}>
              {stats.systemHealth.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{performance.uptime}%</p>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{performance.avgResponseTime}ms</p>
              <p className="text-sm text-muted-foreground">Avg Response Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.errorRate}%</p>
              <p className="text-sm text-muted-foreground">Error Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{performance.coreWebVitals.lcp}s</p>
              <p className="text-sm text-muted-foreground">LCP</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newUsersToday} new today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolios Created</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.portfoliosCreated.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.portfoliosCreatedToday} new today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onboarding Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.onboardingCompletionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time to First Portfolio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgTimeToFirstPortfolio} min</div>
            <p className="text-xs text-muted-foreground">
              Average time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="funnel" className="space-y-6">
        <TabsList>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          <TabsTrigger value="user-journey">User Journey</TabsTrigger>
          <TabsTrigger value="real-time">Real-time Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="funnel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Conversion Funnel</CardTitle>
              <CardDescription>
                Track user progression through the signup and portfolio creation process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionFunnel.map((step, index) => (
                  <div key={step.step} className="flex items-center space-x-4">
                    <div className="w-4 h-4 rounded-full bg-spotlight-600 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{step.step}</h4>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm font-medium">{step.users.toLocaleString()} users</span>
                          <Badge variant="secondary">{step.conversionRate.toFixed(1)}%</Badge>
                          {step.dropOffRate > 0 && (
                            <span className="text-sm text-red-600">-{step.dropOffRate.toFixed(1)}%</span>
                          )}
                        </div>
                      </div>
                      <div className="mt-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-spotlight-600 h-2 rounded-full transition-all"
                          style={{ width: `${step.conversionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals</CardTitle>
                <CardDescription>Performance metrics for user experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Largest Contentful Paint (LCP)</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono">{performance.coreWebVitals.lcp}s</span>
                    <Badge variant={performance.coreWebVitals.lcp < 2.5 ? 'default' : 'destructive'}>
                      {performance.coreWebVitals.lcp < 2.5 ? 'Good' : 'Needs Work'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>First Input Delay (FID)</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono">{performance.coreWebVitals.fid}ms</span>
                    <Badge variant={performance.coreWebVitals.fid < 100 ? 'default' : 'destructive'}>
                      {performance.coreWebVitals.fid < 100 ? 'Good' : 'Needs Work'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cumulative Layout Shift (CLS)</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono">{performance.coreWebVitals.cls}</span>
                    <Badge variant={performance.coreWebVitals.cls < 0.1 ? 'default' : 'destructive'}>
                      {performance.coreWebVitals.cls < 0.1 ? 'Good' : 'Needs Work'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
                <CardDescription>API and page response performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Average Response Time</span>
                  <span className="font-mono">{performance.avgResponseTime}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>95th Percentile</span>
                  <span className="font-mono">{performance.p95ResponseTime}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Uptime</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono">{performance.uptime}%</span>
                    <Badge variant={performance.uptime > 99.5 ? 'default' : 'destructive'}>
                      {performance.uptime > 99.5 ? 'Excellent' : 'Needs Attention'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="user-journey" className="space-y-6">
          <LaunchMetrics />
        </TabsContent>

        <TabsContent value="real-time" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Activity</CardTitle>
              <CardDescription>Live user activity and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Real-time Activity Feed</h3>
                <p className="text-muted-foreground">
                  Live activity tracking will be implemented with WebSocket connections
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}