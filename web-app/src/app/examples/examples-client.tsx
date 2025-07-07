'use client';

import { useState, useEffect, useCallback } from 'react';
import { SearchInput } from '@/components/discovery/search-input';
import { FilterPanel } from '@/components/discovery/filter-panel';
import { SortSelector } from '@/components/discovery/sort-selector';
import { ResultsHeader } from '@/components/discovery/results-header';
import { PaginationControls } from '@/components/discovery/pagination-controls';
import { PortfolioCard } from '@/components/discovery/portfolio-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  Users, 
  Loader2, 
  AlertCircle, 
  Grid3X3, 
  List 
} from 'lucide-react';

interface Portfolio {
  id: string;
  title: string;
  slug: string;
  bio: string;
  template: string;
  location?: string;
  skills?: string;
  viewCount: number;
  createdAt: string;
  category: string;
  user: {
    id: string;
    fullName: string;
    profession: string;
    avatarUrl?: string;
  };
  images: {
    hero?: {
      file_path: string;
      alt_text: string;
    };
    profile?: {
      file_path: string;
      alt_text: string;
    };
    gallery?: Array<{
      file_path: string;
      alt_text: string;
    }>;
  };
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface Filters {
  search: string;
  profession: string;
  template: string;
  category: string;
  skills: string;
  location: string;
}

export default function ExamplesClient() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });
  
  const [filters, setFilters] = useState<Filters>({
    search: '',
    profession: '',
    template: '',
    category: '',
    skills: '',
    location: '',
  });
  
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchPortfolios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      
      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      params.append('sortBy', sortBy);
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      
      const response = await fetch(`/api/portfolios/discover?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setPortfolios(result.data);
        setPagination(result.pagination);
      } else {
        setError(result.error || 'Failed to fetch portfolios');
      }
    } catch (err) {
      setError('Failed to fetch portfolios');
      console.error('Error fetching portfolios:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
  };

  const handleRemoveFilter = (key: string) => {
    setFilters(prev => ({ ...prev, [key]: '' }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleClearAllFilters = () => {
    setFilters({
      search: '',
      profession: '',
      template: '',
      category: '',
      skills: '',
      location: '',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  };

  const handleShare = (portfolio: Portfolio) => {
    if (navigator.share) {
      navigator.share({
        title: `${portfolio.user.fullName}'s Portfolio`,
        text: portfolio.bio,
        url: `${window.location.origin}/mypage/${portfolio.slug}`,
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/mypage/${portfolio.slug}`);
      // You could show a toast here
    }
  };

  const handleFavorite = (portfolio: Portfolio) => {
    // Implement favorite functionality
    console.log('Favorited:', portfolio);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Search className="w-6 h-6 text-blue-600" />
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Portfolio Discovery
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Discover Amazing Portfolios
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore portfolios from talented actors and models. Find inspiration, discover new talent, and see what&apos;s possible with Spotlight.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Search */}
              <SearchInput
                value={filters.search}
                onChange={(value) => handleFilterChange('search', value)}
                placeholder="Search portfolios, names, skills..."
              />
              
              {/* Filters */}
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearAllFilters}
              />
              
              {/* Sort */}
              <SortSelector
                value={sortBy}
                onChange={setSortBy}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <ResultsHeader
                  totalCount={pagination.totalCount}
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  filters={filters}
                  onRemoveFilter={handleRemoveFilter}
                  onClearAllFilters={handleClearAllFilters}
                />
                
                {/* View Mode Toggle */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading portfolios...</span>
                </div>
              )}

              {/* Error State */}
              {error && (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Failed to load portfolios
                      </h3>
                      <p className="text-gray-600 mb-4">{error}</p>
                      <Button onClick={fetchPortfolios}>
                        Try Again
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Empty State */}
              {!loading && !error && portfolios.length === 0 && (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No portfolios found
                      </h3>
                      <p className="text-gray-600 mb-4">
                        No portfolios match your current search and filter criteria.
                      </p>
                      <Button onClick={handleClearAllFilters}>
                        Clear Filters
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Portfolio Grid */}
              {!loading && !error && portfolios.length > 0 && (
                <>
                  <div className={
                    viewMode === 'grid' 
                      ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                      : 'space-y-4'
                  }>
                    {portfolios.map((portfolio) => (
                      <PortfolioCard
                        key={portfolio.id}
                        portfolio={portfolio}
                        onShare={handleShare}
                        onFavorite={handleFavorite}
                        className={viewMode === 'list' ? 'max-w-none' : ''}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  <PaginationControls
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    pageSize={pagination.limit}
                    totalCount={pagination.totalCount}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    className="mt-8"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}