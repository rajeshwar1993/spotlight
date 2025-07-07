'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  X, 
  User, 
  Palette, 
  MapPin, 
  Settings 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FilterPanelProps {
  filters: {
    profession: string;
    template: string;
    category: string;
    skills: string;
    location: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  className?: string;
}

export function FilterPanel({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  className = '' 
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const professionOptions = [
    { value: '', label: 'All Professionals' },
    { value: 'ACTOR', label: 'Actors' },
    { value: 'MODEL', label: 'Models' },
    { value: 'BOTH', label: 'Actor & Model' },
  ];

  const templateOptions = [
    { value: '', label: 'All Templates' },
    { value: 'T1', label: 'Template 1' },
    { value: 'T2', label: 'Template 2' },
    { value: 'T3', label: 'Template 3' },
    { value: 'T4', label: 'Template 4' },
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'professional', label: 'Professional' },
    { value: 'bold', label: 'Bold' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'creative', label: 'Creative' },
  ];

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="lg:hidden"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={`pt-0 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        <div className="space-y-6">
          {/* Profession Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4" />
              Profession
            </Label>
            <div className="space-y-2">
              {professionOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={filters.profession === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onFilterChange('profession', option.value)}
                  className="w-full justify-start"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Template Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Template
            </Label>
            <div className="space-y-2">
              {templateOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={filters.template === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onFilterChange('template', option.value)}
                  className="w-full justify-start"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Category Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Category
            </Label>
            <div className="space-y-2">
              {categoryOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={filters.category === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onFilterChange('category', option.value)}
                  className="w-full justify-start"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Location Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </Label>
            <Input
              placeholder="e.g., New York, Los Angeles..."
              value={filters.location}
              onChange={(e) => onFilterChange('location', e.target.value)}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Skills Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Skills</Label>
            <Input
              placeholder="e.g., Drama, Comedy, Dancing..."
              value={filters.skills}
              onChange={(e) => onFilterChange('skills', e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}