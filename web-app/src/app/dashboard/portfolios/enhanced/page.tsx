'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/hooks/use-user';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Grid, 
  List, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  MoreHorizontal,
  TrendingUp,
  ExternalLink,
  Settings,
  BarChart3,
  ArrowLeft,
  CheckSquare,
  Download,
  Archive,
  RefreshCw,
  Target,
  Globe,
  Zap
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { CompactVerificationBanner } from '@/components/email-verification/verification-banner';
import { emailVerificationService } from '@/lib/services/email-verification';
import { getTemplateConfig } from '@/lib/templates/registry';
import { format, subDays, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { TemplateType, PortfolioStatus } from '@/types';

interface Portfolio {
  id: string;
  title: string;
  slug: string;
  template: TemplateType;
  status: PortfolioStatus;
  bio?: string;
  view_count: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  images?: Array<{
    id: string;
    url: string;
    type: string;
    alt_text?: string;
  }>;
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
}

export default function EnhancedPortfoliosDashboard() {
  const { user, loading, isAuthenticated } = useUser();
  
  // State management
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null);
  const [loadingPortfolios, setLoadingPortfolios] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // View and filter state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PortfolioStatus | 'all'>('all');
  const [templateFilter, setTemplateFilter] = useState<TemplateType | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d' | '90d'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'view_count' | 'title'>('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Bulk operations state
  const [selectedPortfolios, setSelectedPortfolios] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 0,
    hasMore: false
  });

  // Fetch portfolios with enhanced filtering
  const fetchPortfolios = useCallback(async () => {
    try {
      setLoadingPortfolios(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sortBy,
        sortOrder
      });

      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (templateFilter !== 'all') params.append('template', templateFilter);

      const response = await fetch(`/api/portfolios?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch portfolios');
      }

      let filteredPortfolios = data.data || [];

      // Apply date filter on frontend
      if (dateFilter !== 'all') {
        const days = parseInt(dateFilter.replace('d', ''));
        const cutoffDate = startOfDay(subDays(new Date(), days));
        filteredPortfolios = filteredPortfolios.filter((p: Portfolio) => 
          new Date(p.updated_at) >= cutoffDate
        );
      }

      setPortfolios(filteredPortfolios);
      setPagination(data.pagination || { totalCount: 0, totalPages: 0, hasMore: false });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolios');
    } finally {
      setLoadingPortfolios(false);
    }
  }, [page, searchQuery, statusFilter, templateFilter, dateFilter, sortBy, sortOrder]);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoadingAnalytics(true);
      
      // Since we don't have a dedicated analytics endpoint, calculate from portfolios
      const response = await fetch('/api/portfolios?limit=1000');
      const data = await response.json();
      
      if (response.ok && data.data) {
        const allPortfolios: Portfolio[] = data.data;
        
        const totalPortfolios = allPortfolios.length;
        const publishedPortfolios = allPortfolios.filter(p => p.status === 'published').length;
        const draftPortfolios = allPortfolios.filter(p => p.status === 'draft').length;
        const archivedPortfolios = allPortfolios.filter(p => p.status === 'archived').length;
        
        const totalViews = allPortfolios.reduce((sum, p) => sum + p.view_count, 0);
        const averageViews = totalPortfolios > 0 ? Math.round(totalViews / totalPortfolios) : 0;
        
        const topPerformer = allPortfolios.length > 0 
          ? allPortfolios.reduce((top, current) => 
              current.view_count > top.view_count ? current : top
            )
          : null;

        // Calculate recent views (last 7 days) - mock data since we don't have time-series
        const recentViews = Math.round(totalViews * 0.15); // Estimate 15% of views in last 7 days
        const previousViews = Math.round(totalViews * 0.12); // Previous 7 days estimate
        const viewGrowth = previousViews > 0 ? Math.round(((recentViews - previousViews) / previousViews) * 100) : 0;

        // Template distribution
        const templateDistribution: Record<string, number> = {};
        allPortfolios.forEach(p => {
          templateDistribution[p.template] = (templateDistribution[p.template] || 0) + 1;
        });

        // Mock view trends for last 7 days
        const viewTrends = Array.from({ length: 7 }, (_, i) => {
          const date = format(subDays(new Date(), 6 - i), 'MMM dd');
          const views = Math.round(Math.random() * 50 + 20); // Random data for demo
          return { date, views };
        });

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
          viewTrends
        });
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPortfolios();
      fetchAnalytics();
    }
  }, [isAuthenticated, fetchPortfolios, fetchAnalytics]);

  // Bulk operations
  const handleSelectAll = () => {
    if (selectedPortfolios.size === portfolios.length) {
      setSelectedPortfolios(new Set());
    } else {
      setSelectedPortfolios(new Set(portfolios.map(p => p.id)));
    }
  };

  const handleSelectPortfolio = (portfolioId: string) => {
    const newSelected = new Set(selectedPortfolios);
    if (newSelected.has(portfolioId)) {
      newSelected.delete(portfolioId);
    } else {
      newSelected.add(portfolioId);
    }
    setSelectedPortfolios(newSelected);
  };

  const handleBulkStatusChange = async (newStatus: PortfolioStatus) => {
    try {
      const promises = Array.from(selectedPortfolios).map(async (portfolioId) => {
        const response = await fetch(`/api/portfolios/${portfolioId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        return response.ok;
      });

      await Promise.all(promises);
      setSelectedPortfolios(new Set());
      fetchPortfolios();
      fetchAnalytics();
    } catch (error) {
      console.error('Bulk status change failed:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedPortfolios.size} portfolios? This action cannot be undone.`)) {
      return;
    }

    try {
      const promises = Array.from(selectedPortfolios).map(async (portfolioId) => {
        const response = await fetch(`/api/portfolios/${portfolioId}`, {
          method: 'DELETE'
        });
        return response.ok;
      });

      await Promise.all(promises);
      setSelectedPortfolios(new Set());
      fetchPortfolios();
      fetchAnalytics();
    } catch (error) {
      console.error('Bulk delete failed:', error);
    }
  };

  const handleResendVerification = async () => {
    return emailVerificationService.resendVerificationEmail();
  };

  if (loading || !isAuthenticated) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Email Verification Banner */}
          <CompactVerificationBanner
            isVisible={!user?.is_email_verified}
            isEmailVerified={user?.is_email_verified}
            onResendVerification={handleResendVerification}
            className="mb-6"
          />

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-4">
                <Link href="/dashboard/portfolios">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Standard View
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold">Enhanced Portfolio Dashboard</h1>
                  <p className="text-gray-600 mt-1">
                    Advanced analytics and portfolio management
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Portfolio
                </Button>
              </Link>
            </div>
          </div>

          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Portfolios</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loadingAnalytics ? '-' : analytics?.totalPortfolios || 0}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                {!loadingAnalytics && analytics && (
                  <div className="mt-2 flex text-xs text-gray-600">
                    <span className="text-green-600">{analytics.publishedPortfolios} published</span>
                    <span className="mx-2">•</span>
                    <span className="text-yellow-600">{analytics.draftPortfolios} drafts</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Views</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loadingAnalytics ? '-' : (analytics?.totalViews || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Eye className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                {!loadingAnalytics && analytics && (
                  <div className="mt-2 flex items-center text-xs">
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-green-600">
                      {analytics.viewGrowth > 0 ? '+' : ''}{analytics.viewGrowth}% vs last week
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Views</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loadingAnalytics ? '-' : analytics?.averageViews || 0}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Target className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-600">Per portfolio</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Top Performer</p>
                    <p className="text-lg font-bold text-gray-900 truncate">
                      {loadingAnalytics ? '-' : analytics?.topPerformer?.title || 'None'}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Zap className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
                {!loadingAnalytics && analytics?.topPerformer && (
                  <p className="mt-2 text-xs text-gray-600">
                    {analytics.topPerformer.view_count} views
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Filters and Controls */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search portfolios..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PortfolioStatus | 'all')}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={templateFilter} onValueChange={(value) => setTemplateFilter(value as TemplateType | 'all')}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Templates</SelectItem>
                      <SelectItem value="T1">T1 - Classic</SelectItem>
                      <SelectItem value="T2">T2 - Modern</SelectItem>
                      <SelectItem value="T3">T3 - Minimal</SelectItem>
                      <SelectItem value="T4">T4 - Creative</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as '7d' | '30d' | '90d' | 'all')}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                    const [field, order] = value.split('-') as [typeof sortBy, typeof sortOrder];
                    setSortBy(field);
                    setSortOrder(order);
                  }}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="updated_at-desc">Recent</SelectItem>
                      <SelectItem value="created_at-desc">Newest</SelectItem>
                      <SelectItem value="view_count-desc">Most Views</SelectItem>
                      <SelectItem value="title-asc">Title A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* View Mode */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Bulk Operations */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSelectMode(!isSelectMode)}
                  >
                    {isSelectMode ? (
                      <>
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Cancel Selection
                      </>
                    ) : (
                      <>
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Select Mode
                      </>
                    )}
                  </Button>

                  {isSelectMode && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                      >
                        {selectedPortfolios.size === portfolios.length ? 'Deselect All' : 'Select All'}
                      </Button>

                      {selectedPortfolios.size > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {selectedPortfolios.size} selected
                          </span>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                Bulk Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleBulkStatusChange('published')}>
                                <Globe className="h-4 w-4 mr-2" />
                                Publish Selected
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleBulkStatusChange('draft')}>
                                <Edit className="h-4 w-4 mr-2" />
                                Mark as Draft
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleBulkStatusChange('archived')}>
                                <Archive className="h-4 w-4 mr-2" />
                                Archive Selected
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={handleBulkDelete}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Selected
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      fetchPortfolios();
                      fetchAnalytics();
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  
                  <Button variant="outline" size="sm" disabled>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Grid/List */}
          {loadingPortfolios ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : portfolios.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No portfolios found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || statusFilter !== 'all' || templateFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Create your first portfolio to get started.'}
              </p>
              <Link href="/create">
                <Button>Create Portfolio</Button>
              </Link>
            </div>
          ) : (
            <div className={cn(
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            )}>
              {portfolios.map((portfolio) => (
                <EnhancedPortfolioCard
                  key={portfolio.id}
                  portfolio={portfolio}
                  viewMode={viewMode}
                  isSelected={selectedPortfolios.has(portfolio.id)}
                  isSelectMode={isSelectMode}
                  onSelect={handleSelectPortfolio}
                  onRefresh={() => {
                    fetchPortfolios();
                    fetchAnalytics();
                  }}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <p className="text-sm text-gray-600">
                Showing {((page - 1) * 12) + 1} to {Math.min(page * 12, pagination.totalCount)} of {pagination.totalCount} portfolios
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasMore}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

// Enhanced Portfolio Card Component
interface EnhancedPortfolioCardProps {
  portfolio: Portfolio;
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  isSelectMode: boolean;
  onSelect: (portfolioId: string) => void;
  onRefresh: () => void;
}

function EnhancedPortfolioCard({
  portfolio,
  viewMode,
  isSelected,
  isSelectMode,
  onSelect,
  onRefresh
}: EnhancedPortfolioCardProps) {
  const templateConfig = getTemplateConfig(portfolio.template);
  const profileImage = portfolio.images?.find(img => img.type === 'PROFILE')?.url;

  const handleStatusToggle = async () => {
    try {
      const newStatus = portfolio.status === 'published' ? 'draft' : 'published';
      const response = await fetch(`/api/portfolios/${portfolio.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this portfolio? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/portfolios/${portfolio.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to delete portfolio:', error);
    }
  };

  const getStatusColor = (status: PortfolioStatus) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (viewMode === 'list') {
    return (
      <Card className={cn(
        "overflow-hidden hover:shadow-md transition-all",
        isSelected && "ring-2 ring-blue-500"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Selection Checkbox */}
            {isSelectMode && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelect(portfolio.id)}
                className="flex-shrink-0"
              />
            )}

            {/* Thumbnail */}
            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt={portfolio.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Eye className="h-6 w-6" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">{portfolio.title}</h3>
                <Badge className={getStatusColor(portfolio.status)}>
                  {portfolio.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                {portfolio.bio || 'No description'}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{templateConfig?.name}</span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {portfolio.view_count}
                </span>
                <span>{format(new Date(portfolio.updated_at), 'MMM d, yyyy')}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" asChild>
                <a href={`/mypage/${portfolio.slug}`} target="_blank">
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/portfolio/${portfolio.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleStatusToggle}>
                    <Settings className="h-4 w-4 mr-2" />
                    {portfolio.status === 'published' ? 'Unpublish' : 'Publish'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "overflow-hidden hover:shadow-lg transition-all group",
      isSelected && "ring-2 ring-blue-500"
    )}>
      {/* Selection Checkbox */}
      {isSelectMode && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(portfolio.id)}
            className="bg-white shadow-sm"
          />
        </div>
      )}

      {/* Thumbnail */}
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        {profileImage ? (
          <img 
            src={profileImage} 
            alt={portfolio.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Eye className="h-8 w-8" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <Badge className={getStatusColor(portfolio.status)}>
            {portfolio.status}
          </Badge>
        </div>
        
        {/* Quick Actions */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
            <Button size="sm" variant="secondary" asChild>
              <a href={`/mypage/${portfolio.slug}`} target="_blank">
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/portfolio/${portfolio.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleStatusToggle}>
                  <Settings className="h-4 w-4 mr-2" />
                  {portfolio.status === 'published' ? 'Unpublish' : 'Publish'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{portfolio.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {portfolio.bio || 'No description'}
          </p>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{templateConfig?.name}</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{portfolio.view_count}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {format(new Date(portfolio.updated_at), 'MMM d, yyyy')}
            </span>
            <Link href={`/portfolio/${portfolio.id}/edit`}>
              <Button size="sm">
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}