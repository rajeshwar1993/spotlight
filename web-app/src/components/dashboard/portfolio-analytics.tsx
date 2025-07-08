'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  Clock,
  Target,
  Zap,
  Globe,
  MapPin,
  Share2,
  Download,
  RefreshCw,
  ExternalLink,
  Edit,
  Archive
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { TemplateType, PortfolioStatus } from '@/types';

interface Portfolio {
  id: string;
  title: string;
  slug: string;
  template: TemplateType;
  status: PortfolioStatus;
  view_count: number;
  created_at: string;
  updated_at: string;
}

interface PortfolioAnalytics {
  totalPortfolios: number;
  publishedPortfolios: number;
  draftPortfolios: number;
  archivedPortfolios: number;
  totalViews: number;
  averageViews: number;
  topPerformer: Portfolio | null;
  recentViews: number;
  viewGrowth: number;
  templateDistribution: Record<string, number>;
  viewTrends: Array<{ date: string; views: number }>;
  performanceMetrics: {
    conversionRate: number;
    averageTimeOnPage: number;
    bounceRate: number;
    topTrafficSources: Array<{ source: string; percentage: number }>;
    deviceBreakdown: Array<{ device: string; percentage: number }>;
    geographicDistribution: Array<{ country: string; views: number }>;
  };
}

interface PortfolioAnalyticsProps {
  className?: string;
}

export function PortfolioAnalytics({ className }: PortfolioAnalyticsProps) {
  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch portfolios data
      const response = await fetch('/api/portfolios?limit=1000');
      const data = await response.json();
      
      if (response.ok && data.data) {
        const portfolios: Portfolio[] = data.data;
        
        // Calculate basic metrics
        const totalPortfolios = portfolios.length;
        const publishedPortfolios = portfolios.filter(p => p.status === 'published').length;
        const draftPortfolios = portfolios.filter(p => p.status === 'draft').length;
        const archivedPortfolios = portfolios.filter(p => p.status === 'archived').length;
        
        const totalViews = portfolios.reduce((sum, p) => sum + p.view_count, 0);
        const averageViews = totalPortfolios > 0 ? Math.round(totalViews / totalPortfolios) : 0;
        
        const topPerformer = portfolios.length > 0 
          ? portfolios.reduce((top, current) => 
              current.view_count > top.view_count ? current : top
            )
          : null;

        // Calculate time-based metrics
        const days = parseInt(timeRange.replace(/[^\d]/g, ''));
        const recentViews = Math.round(totalViews * 0.15); // Estimate
        const previousViews = Math.round(totalViews * 0.12);
        const viewGrowth = previousViews > 0 ? Math.round(((recentViews - previousViews) / previousViews) * 100) : 0;

        // Template distribution
        const templateDistribution: Record<string, number> = {};
        portfolios.forEach(p => {
          templateDistribution[p.template] = (templateDistribution[p.template] || 0) + 1;
        });

        // Generate view trends
        const viewTrends = Array.from({ length: days > 30 ? 12 : days }, (_, i) => {
          const date = days > 30 
            ? format(subDays(new Date(), (11 - i) * 30), 'MMM')
            : format(subDays(new Date(), days - 1 - i), 'MMM dd');
          const views = Math.round(Math.random() * 100 + 50);
          return { date, views };
        });

        // Mock performance metrics (in real app, this would come from analytics service)
        const performanceMetrics = {
          conversionRate: Math.round(Math.random() * 15 + 5), // 5-20%
          averageTimeOnPage: Math.round(Math.random() * 180 + 120), // 2-5 minutes
          bounceRate: Math.round(Math.random() * 30 + 20), // 20-50%
          topTrafficSources: [
            { source: 'Direct', percentage: 35 },
            { source: 'Google Search', percentage: 28 },
            { source: 'Social Media', percentage: 20 },
            { source: 'Referrals', percentage: 17 }
          ],
          deviceBreakdown: [
            { device: 'Mobile', percentage: 60 },
            { device: 'Desktop', percentage: 35 },
            { device: 'Tablet', percentage: 5 }
          ],
          geographicDistribution: [
            { country: 'United States', views: Math.round(totalViews * 0.4) },
            { country: 'United Kingdom', views: Math.round(totalViews * 0.15) },
            { country: 'Canada', views: Math.round(totalViews * 0.12) },
            { country: 'Australia', views: Math.round(totalViews * 0.08) },
            { country: 'Germany', views: Math.round(totalViews * 0.07) },
            { country: 'Others', views: Math.round(totalViews * 0.18) }
          ]
        };

        setAnalytics({
          totalPortfolios,
          publishedPortfolios,
          draftPortfolios,
          archivedPortfolios,
          totalViews,
          averageViews,
          topPerformer,
          recentViews,
          viewGrowth,
          templateDistribution,
          viewTrends,
          performanceMetrics
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading && !analytics) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-gray-600">Failed to load analytics data</p>
        <Button onClick={handleRefresh} variant="outline" className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Portfolio Analytics</h2>
          <p className="text-gray-600">Detailed insights into your portfolio performance</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as '7d' | '30d' | '90d' | '1y')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm" disabled>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.totalViews.toLocaleString()}
                </p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Eye className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs">
              {analytics.viewGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={analytics.viewGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {analytics.viewGrowth > 0 ? '+' : ''}{analytics.viewGrowth}% vs previous period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.performanceMetrics.conversionRate}%
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <Target className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-600">Portfolio views to inquiries</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Time on Page</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDuration(analytics.performanceMetrics.averageTimeOnPage)}
                </p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-600">How long visitors stay</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.performanceMetrics.bounceRate}%
                </p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Zap className="h-4 w-4 text-orange-600" />
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-600">Single-page visits</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* View Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              View Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {analytics.viewTrends.map((trend, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-blue-500 rounded-t-sm min-h-1"
                    style={{
                      height: `${(trend.views / Math.max(...analytics.viewTrends.map(t => t.views))) * 200}px`
                    }}
                  />
                  <span className="text-xs text-gray-600 mt-2 text-center">
                    {trend.date}
                  </span>
                  <span className="text-xs text-gray-900 font-medium">
                    {trend.views}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Top Performing Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topPerformer ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {analytics.topPerformer.title}
                  </h3>
                  <p className="text-gray-600">
                    {analytics.topPerformer.view_count.toLocaleString()} total views
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Performance Score</p>
                    <p className="text-2xl font-bold text-green-700">
                      {Math.round((analytics.topPerformer.view_count / analytics.totalViews) * 100)}%
                    </p>
                  </div>
                  
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Template</p>
                    <p className="text-lg font-bold text-blue-700">
                      {analytics.topPerformer.template}
                    </p>
                  </div>
                </div>
                
                <Button className="w-full" asChild>
                  <a href={`/mypage/${analytics.topPerformer.slug}`} target="_blank">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Portfolio
                  </a>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No published portfolios yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Template Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Template Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.templateDistribution).map(([template, count]) => {
                const percentage = Math.round((count / analytics.totalPortfolios) * 100);
                return (
                  <div key={template} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{template}</span>
                      <span className="text-gray-600">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Share2 className="h-5 w-5 mr-2" />
              Traffic Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.performanceMetrics.topTrafficSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: [
                          '#3B82F6', '#10B981', '#F59E0B', '#EF4444'
                        ][index]
                      }}
                    />
                    <span className="text-sm font-medium">{source.source}</span>
                  </div>
                  <span className="text-sm text-gray-600">{source.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device & Geographic Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Device Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.performanceMetrics.deviceBreakdown.map((device, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{device.device}</span>
                    <span className="text-gray-600">{device.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${device.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.performanceMetrics.geographicDistribution.map((geo, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{geo.country}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{geo.views.toLocaleString()}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-green-500 h-1 rounded-full"
                        style={{
                          width: `${(geo.views / analytics.totalViews) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                <Globe className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{analytics.publishedPortfolios}</p>
              <p className="text-sm text-gray-600">Published Portfolios</p>
              <Badge className="mt-2 bg-green-100 text-green-800">
                {Math.round((analytics.publishedPortfolios / analytics.totalPortfolios) * 100)}% of total
              </Badge>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-3">
                <Edit className="h-8 w-8 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{analytics.draftPortfolios}</p>
              <p className="text-sm text-gray-600">Draft Portfolios</p>
              <Badge className="mt-2 bg-yellow-100 text-yellow-800">
                {Math.round((analytics.draftPortfolios / analytics.totalPortfolios) * 100)}% of total
              </Badge>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
                <Archive className="h-8 w-8 text-gray-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{analytics.archivedPortfolios}</p>
              <p className="text-sm text-gray-600">Archived Portfolios</p>
              <Badge className="mt-2 bg-gray-100 text-gray-800">
                {Math.round((analytics.archivedPortfolios / analytics.totalPortfolios) * 100)}% of total
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}