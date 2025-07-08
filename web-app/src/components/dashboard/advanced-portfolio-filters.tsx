'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { TemplateType, PortfolioStatus } from '@/types';

export interface FilterState {
  search: string;
  status: PortfolioStatus | 'all';
  template: TemplateType | 'all';
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  viewCountRange: [number, number];
  sortBy: 'created_at' | 'updated_at' | 'view_count' | 'title';
  sortOrder: 'asc' | 'desc';
  tags: string[];
  isPublished: boolean | null;
  hasImages: boolean | null;
  minViewCount: number;
  maxViewCount: number;
}

export interface SavedFilter {
  id: string;
  name: string;
  filters: FilterState;
  createdAt: string;
}

interface AdvancedPortfolioFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onSaveFilter?: (name: string, filters: FilterState) => void;
  savedFilters?: SavedFilter[];
  onLoadFilter?: (filters: FilterState) => void;
  onDeleteSavedFilter?: (filterId: string) => void;
  className?: string;
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  status: 'all',
  template: 'all',
  dateRange: { from: undefined, to: undefined },
  viewCountRange: [0, 1000],
  sortBy: 'updated_at',
  sortOrder: 'desc',
  tags: [],
  isPublished: null,
  hasImages: null,
  minViewCount: 0,
  maxViewCount: 1000,
};

export function AdvancedPortfolioFilters({
  filters,
  onFiltersChange,
  onSaveFilter,
  savedFilters = [],
  onLoadFilter,
  onDeleteSavedFilter,
  className
}: AdvancedPortfolioFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  // Mock search suggestions (in real app, this would come from API)
  const mockSuggestions = [
    'actor portfolio',
    'model headshots',
    'theater experience',
    'commercial work',
    'fashion modeling',
    'film & television',
    'voice over',
    'dance performance'
  ];

  const updateFilter = useCallback((key: keyof FilterState, value: unknown) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  }, [filters, onFiltersChange]);

  const handleSearchChange = (value: string) => {
    updateFilter('search', value);
    
    // Show suggestions if there's input
    if (value.length > 0) {
      const suggestions = mockSuggestions.filter(s => 
        s.toLowerCase().includes(value.toLowerCase())
      );
      setSearchSuggestions(suggestions);
      setShowSearchSuggestions(true);
    } else {
      setShowSearchSuggestions(false);
    }
  };

  const handleViewCountRangeChange = (values: number[]) => {
    updateFilter('viewCountRange', values);
    updateFilter('minViewCount', values[0]);
    updateFilter('maxViewCount', values[1]);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status !== 'all') count++;
    if (filters.template !== 'all') count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.viewCountRange[0] > 0 || filters.viewCountRange[1] < 1000) count++;
    if (filters.isPublished !== null) count++;
    if (filters.hasImages !== null) count++;
    if (filters.tags.length > 0) count++;
    return count;
  };

  const clearAllFilters = () => {
    onFiltersChange(DEFAULT_FILTERS);
  };

  const handleSaveFilter = () => {
    if (saveFilterName.trim() && onSaveFilter) {
      onSaveFilter(saveFilterName.trim(), filters);
      setSaveFilterName('');
      setShowSaveDialog(false);
    }
  };

  const removeTag = (tag: string) => {
    updateFilter('tags', filters.tags.filter(t => t !== tag));
  };

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      updateFilter('tags', [...filters.tags, tag]);
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFilterCount()} active
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {getActiveFilterCount() > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Basic Filters - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-2 relative">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search portfolios..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
                onFocus={() => setShowSearchSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
              />
              
              {/* Search Suggestions */}
              {showSearchSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 bg-white border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                      onClick={() => {
                        handleSearchChange(suggestion);
                        setShowSearchSuggestions(false);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Template Filter */}
          <div className="space-y-2">
            <Label>Template</Label>
            <Select value={filters.template} onValueChange={(value) => updateFilter('template', value)}>
              <SelectTrigger>
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
          </div>

          {/* Sort */}
          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select 
              value={`${filters.sortBy}-${filters.sortOrder}`} 
              onValueChange={(value) => {
                const [field, order] = value.split('-') as [typeof filters.sortBy, typeof filters.sortOrder];
                updateFilter('sortBy', field);
                updateFilter('sortOrder', order);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated_at-desc">Recently Updated</SelectItem>
                <SelectItem value="created_at-desc">Recently Created</SelectItem>
                <SelectItem value="view_count-desc">Most Views</SelectItem>
                <SelectItem value="view_count-asc">Least Views</SelectItem>
                <SelectItem value="title-asc">Title A-Z</SelectItem>
                <SelectItem value="title-desc">Title Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters - Collapsible */}
        {isExpanded && (
          <div className="space-y-6 pt-4 border-t">
            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {filters.dateRange.from ? format(filters.dateRange.from, 'MMM dd, yyyy') : 'From'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.from}
                      onSelect={(date) => updateFilter('dateRange', { ...filters.dateRange, from: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <span className="text-gray-400">to</span>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {filters.dateRange.to ? format(filters.dateRange.to, 'MMM dd, yyyy') : 'To'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.to}
                      onSelect={(date) => updateFilter('dateRange', { ...filters.dateRange, to: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                {(filters.dateRange.from || filters.dateRange.to) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateFilter('dateRange', { from: undefined, to: undefined })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* View Count Range */}
            <div className="space-y-3">
              <Label>View Count Range</Label>
              <div className="px-2">
                <Slider
                  value={filters.viewCountRange}
                  onValueChange={handleViewCountRangeChange}
                  min={0}
                  max={1000}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{filters.viewCountRange[0]} views</span>
                  <span>{filters.viewCountRange[1]} views</span>
                </div>
              </div>
            </div>

            {/* Boolean Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label>Publication Status</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="published"
                      checked={filters.isPublished === true}
                      onCheckedChange={(checked) => 
                        updateFilter('isPublished', checked ? true : null)
                      }
                    />
                    <Label htmlFor="published" className="text-sm">Published only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="unpublished"
                      checked={filters.isPublished === false}
                      onCheckedChange={(checked) => 
                        updateFilter('isPublished', checked ? false : null)
                      }
                    />
                    <Label htmlFor="unpublished" className="text-sm">Unpublished only</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Media Content</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasImages"
                    checked={filters.hasImages === true}
                    onCheckedChange={(checked) => 
                      updateFilter('hasImages', checked ? true : null)
                    }
                  />
                  <Label htmlFor="hasImages" className="text-sm">Has images only</Label>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <Label>Tags</Label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {filters.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {['Actor', 'Model', 'Theater', 'Commercial', 'Fashion', 'Film', 'TV', 'Voice Over'].map((tag) => (
                    !filters.tags.includes(tag) && (
                      <Button
                        key={tag}
                        variant="outline"
                        size="sm"
                        onClick={() => addTag(tag)}
                        className="text-xs"
                      >
                        + {tag}
                      </Button>
                    )
                  ))}
                </div>
              </div>
            </div>

            {/* Saved Filters */}
            {savedFilters.length > 0 && (
              <div className="space-y-3">
                <Label>Saved Filters</Label>
                <div className="flex flex-wrap gap-2">
                  {savedFilters.map((savedFilter) => (
                    <div key={savedFilter.id} className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onLoadFilter?.(savedFilter.filters)}
                        className="text-xs"
                      >
                        {savedFilter.name}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteSavedFilter?.(savedFilter.id)}
                        className="p-1 h-auto text-red-500 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save Filter */}
            <div className="space-y-3 pt-4 border-t">
              <Label>Save Current Filter</Label>
              {showSaveDialog ? (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Filter name..."
                    value={saveFilterName}
                    onChange={(e) => setSaveFilterName(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSaveFilter} disabled={!saveFilterName.trim()}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowSaveDialog(false);
                      setSaveFilterName('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowSaveDialog(true)}
                  disabled={getActiveFilterCount() === 0}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Current Filters
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}