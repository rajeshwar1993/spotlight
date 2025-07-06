'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TemplateType, PortfolioStatus } from '@/types';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Eye, 
  Edit, 
  Trash2, 
  Copy, 
  Plus,
  MoreHorizontal,
  Calendar,
  TrendingUp,
  ExternalLink,
  Settings
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { getTemplateConfig } from '@/lib/templates/registry';
import { format } from 'date-fns';

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

interface PortfolioListProps {
  onEdit?: (portfolio: Portfolio) => void;
  onDelete?: (portfolio: Portfolio) => void;
  onDuplicate?: (portfolio: Portfolio) => void;
  onStatusChange?: (portfolioId: string, status: PortfolioStatus) => void;
  className?: string;
}

export function PortfolioList({
  onEdit,
  onDelete,
  onDuplicate,
  onStatusChange,
  className
}: PortfolioListProps) {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PortfolioStatus | 'all'>('all');
  const [templateFilter, setTemplateFilter] = useState<TemplateType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'view_count' | 'title'>('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 0,
    hasMore: false
  });

  const fetchPortfolios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
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

      setPortfolios(data.data || []);
      setPagination(data.pagination || { totalCount: 0, totalPages: 0, hasMore: false });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolios');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter, templateFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  const handleStatusFilter = useCallback((status: PortfolioStatus | 'all') => {
    setStatusFilter(status);
    setPage(1);
  }, []);

  const handleTemplateFilter = useCallback((template: TemplateType | 'all') => {
    setTemplateFilter(template);
    setPage(1);
  }, []);

  const handleSort = useCallback((field: typeof sortBy, order: typeof sortOrder) => {
    setSortBy(field);
    setSortOrder(order);
    setPage(1);
  }, []);

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

  const getProfileImage = (portfolio: Portfolio) => {
    return portfolio.images?.find(img => img.type === 'PROFILE')?.url;
  };

  if (loading && portfolios.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="max-w-md mx-auto">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Portfolios</h2>
          <p className="text-gray-600">
            {pagination.totalCount} portfolio{pagination.totalCount !== 1 ? 's' : ''} total
          </p>
        </div>
        
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search portfolios..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
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
          
          <Select value={templateFilter} onValueChange={handleTemplateFilter}>
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
          
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
            const [field, order] = value.split('-') as [typeof sortBy, typeof sortOrder];
            handleSort(field, order);
          }}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated_at-desc">Recent</SelectItem>
              <SelectItem value="created_at-desc">Newest</SelectItem>
              <SelectItem value="title-asc">Title A-Z</SelectItem>
              <SelectItem value="view_count-desc">Most Views</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Portfolio Grid/List */}
      {portfolios.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No portfolios found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || statusFilter !== 'all' || templateFilter !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'Create your first portfolio to get started.'}
          </p>
          <Button onClick={() => window.location.href = '/create'}>
            Create Portfolio
          </Button>
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        )}>
          {portfolios.map((portfolio) => (
            <PortfolioCard
              key={portfolio.id}
              portfolio={portfolio}
              viewMode={viewMode}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {page} of {pagination.totalPages}
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
  );
}

// Portfolio Card Component
interface PortfolioCardProps {
  portfolio: Portfolio;
  viewMode: 'grid' | 'list';
  onEdit?: (portfolio: Portfolio) => void;
  onDelete?: (portfolio: Portfolio) => void;
  onDuplicate?: (portfolio: Portfolio) => void;
  onStatusChange?: (portfolioId: string, status: PortfolioStatus) => void;
}

function PortfolioCard({
  portfolio,
  viewMode,
  onEdit,
  onDelete,
  onDuplicate,
  onStatusChange
}: PortfolioCardProps) {
  const templateConfig = getTemplateConfig(portfolio.template);
  const profileImage = portfolio.images?.find(img => img.type === 'PROFILE')?.url;

  const handleStatusToggle = () => {
    const newStatus = portfolio.status === 'published' ? 'draft' : 'published';
    onStatusChange?.(portfolio.id, newStatus);
  };

  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
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
                <span>{portfolio.view_count} views</span>
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
                  <DropdownMenuItem onClick={() => onEdit?.(portfolio)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate?.(portfolio)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleStatusToggle}>
                    <Settings className="h-4 w-4 mr-2" />
                    {portfolio.status === 'published' ? 'Unpublish' : 'Publish'}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(portfolio)}
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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
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
        <div className="absolute top-2 left-2">
          <Badge className={getStatusColor(portfolio.status)}>
            {portfolio.status}
          </Badge>
        </div>
        
        {/* Quick Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                <DropdownMenuItem onClick={() => onEdit?.(portfolio)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate?.(portfolio)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleStatusToggle}>
                  <Settings className="h-4 w-4 mr-2" />
                  {portfolio.status === 'published' ? 'Unpublish' : 'Publish'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete?.(portfolio)}
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
            <Button size="sm" onClick={() => onEdit?.(portfolio)}>
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusColor(status: PortfolioStatus): string {
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
}