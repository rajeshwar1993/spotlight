'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Search, Filter } from 'lucide-react';

interface ResultsHeaderProps {
  totalCount: number;
  currentPage: number;
  totalPages: number;
  filters: {
    search: string;
    profession: string;
    template: string;
    category: string;
    skills: string;
    location: string;
  };
  onRemoveFilter: (key: string) => void;
  onClearAllFilters: () => void;
  className?: string;
}

export function ResultsHeader({ 
  totalCount, 
  currentPage, 
  totalPages, 
  filters, 
  onRemoveFilter, 
  onClearAllFilters,
  className = ''
}: ResultsHeaderProps) {
  const activeFilters = Object.entries(filters)
    .filter(([, value]) => value !== '')
    .map(([key, value]) => ({ key, value }));

  const getFilterLabel = (key: string, value: string) => {
    switch (key) {
      case 'search':
        return `Search: "${value}"`;
      case 'profession':
        return `Profession: ${value}`;
      case 'template':
        return `Template: ${value}`;
      case 'category':
        return `Category: ${value}`;
      case 'skills':
        return `Skills: "${value}"`;
      case 'location':
        return `Location: "${value}"`;
      default:
        return `${key}: ${value}`;
    }
  };

  const getFilterIcon = (key: string) => {
    switch (key) {
      case 'search':
        return <Search className="w-3 h-3" />;
      default:
        return <Filter className="w-3 h-3" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {totalCount === 0 ? 'No portfolios found' : `${totalCount.toLocaleString()} portfolios`}
          </h2>
          {totalPages > 1 && (
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>
        
        {activeFilters.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAllFilters}
            className="text-gray-600 hover:text-gray-800"
          >
            <X className="w-4 h-4 mr-2" />
            Clear all filters
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Filter className="w-4 h-4" />
            Active filters:
          </span>
          {activeFilters.map(({ key, value }) => (
            <Badge
              key={key}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              {getFilterIcon(key)}
              <span className="text-xs">{getFilterLabel(key, value)}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveFilter(key)}
                className="h-4 w-4 p-0 hover:bg-gray-300 ml-1"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Empty State Message */}
      {totalCount === 0 && activeFilters.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            No portfolios match your current filters. Try adjusting your search criteria.
          </p>
          <Button
            variant="outline"
            onClick={onClearAllFilters}
            className="mx-auto"
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}