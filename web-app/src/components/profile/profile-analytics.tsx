'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Eye, 
  BarChart3, 
  Calendar,
  ExternalLink,
  Edit
} from 'lucide-react';
import Link from 'next/link';

interface Portfolio {
  id: string;
  title: string;
  slug: string;
  view_count: number;
  status: string;
  created_at: string;
  template: string;
}

interface ProfileStats {
  totalPortfolios: number;
  publishedPortfolios: number;
  totalViews: number;
  profileViews: number;
  avgPortfolioViews: number;
  thisMonthViews: number;
}

interface ProfileAnalyticsProps {
  stats: ProfileStats;
  portfolios: Portfolio[];
  loading: boolean;
}

export function ProfileAnalytics({ stats, portfolios, loading }: ProfileAnalyticsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Portfolio Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-40 bg-gray-200 rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort portfolios by views for ranking
  const sortedPortfolios = [...portfolios].sort((a, b) => b.view_count - a.view_count);
  
  // Calculate growth rate (mock data - in real app this would come from time series data)
  const growthRate = stats.thisMonthViews > 0 ? 
    Math.round((stats.thisMonthViews / Math.max(stats.totalViews - stats.thisMonthViews, 1)) * 100) : 0;

  // Calculate engagement metrics
  const publishedRate = stats.totalPortfolios > 0 ? 
    Math.round((stats.publishedPortfolios / stats.totalPortfolios) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Portfolio Analytics
          </div>
          <Button variant="outline" size="sm" disabled>
            <TrendingUp className="h-4 w-4 mr-1" />
            View Report
          </Button>
        </CardTitle>
        <CardDescription>
          Insights into your portfolio performance and audience engagement
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.totalViews.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Views</div>
            <div className="text-xs text-green-600 mt-1">+{growthRate}% this month</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.avgPortfolioViews}</div>
            <div className="text-sm text-gray-600">Avg Views</div>
            <div className="text-xs text-gray-500 mt-1">Per portfolio</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{publishedRate}%</div>
            <div className="text-sm text-gray-600">Published</div>
            <div className="text-xs text-gray-500 mt-1">{stats.publishedPortfolios} of {stats.totalPortfolios}</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{stats.thisMonthViews}</div>
            <div className="text-sm text-gray-600">This Month</div>
            <div className="text-xs text-gray-500 mt-1">New views</div>
          </div>
        </div>

        {/* Portfolio Performance Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Portfolio Performance</h4>
            <Link href="/dashboard/portfolios">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {portfolios.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="mb-2">No portfolios to analyze yet</p>
              <Link href="/create">
                <Button size="sm">Create Your First Portfolio</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-3 px-3 py-2 text-sm font-medium text-gray-500 border-b">
                <div className="col-span-1">#</div>
                <div className="col-span-5">Portfolio</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Views</div>
                <div className="col-span-2">Actions</div>
              </div>

              {/* Table Rows */}
              {sortedPortfolios.slice(0, 5).map((portfolio, index) => (
                <div key={portfolio.id} className="grid grid-cols-12 gap-3 px-3 py-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="col-span-1 flex items-center">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  </div>
                  
                  <div className="col-span-5 flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">
                      {portfolio.template}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{portfolio.title}</p>
                      <p className="text-xs text-gray-500">
                        Created {new Date(portfolio.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    <Badge variant={portfolio.status === 'published' ? 'default' : 'secondary'}>
                      {portfolio.status}
                    </Badge>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3 text-gray-400" />
                      <span className="font-medium">{portfolio.view_count.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="col-span-2 flex items-center space-x-1">
                    <Link href={`/mypage/${portfolio.slug}`} target="_blank">
                      <Button variant="ghost" size="sm" className="p-1">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/portfolios?edit=${portfolio.id}`}>
                      <Button variant="ghost" size="sm" className="p-1">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}

              {portfolios.length > 5 && (
                <div className="text-center pt-3">
                  <Link href="/dashboard/portfolios">
                    <Button variant="outline" size="sm">
                      View all {portfolios.length} portfolios
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Analytics Insights */}
        {portfolios.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium mb-3">Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Best Performing Template</p>
                <p className="text-xs text-blue-700 mt-1">
                  Template {sortedPortfolios[0]?.template} with {sortedPortfolios[0]?.view_count} views
                </p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-900">Publishing Rate</p>
                <p className="text-xs text-green-700 mt-1">
                  {publishedRate}% of your portfolios are published and live
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}