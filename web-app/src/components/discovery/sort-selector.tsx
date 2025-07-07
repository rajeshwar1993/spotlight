'use client';

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowUpDown } from 'lucide-react';

interface SortOption {
  value: string;
  label: string;
  description: string;
}

interface SortSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const sortOptions: SortOption[] = [
  {
    value: 'popularity',
    label: 'Most Popular',
    description: 'Sorted by view count and engagement'
  },
  {
    value: 'recent',
    label: 'Most Recent',
    description: 'Newest portfolios first'
  },
  {
    value: 'alphabetical',
    label: 'Alphabetical',
    description: 'Sorted by portfolio title A-Z'
  },
  {
    value: 'views',
    label: 'Most Viewed',
    description: 'Highest view count first'
  },
];

export function SortSelector({ value, onChange, className = '' }: SortSelectorProps) {
  const selectedOption = sortOptions.find(option => option.value === value);

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium flex items-center gap-2">
        <ArrowUpDown className="w-4 h-4" />
        Sort By
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select sorting option">
            {selectedOption?.label || 'Most Popular'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex flex-col">
                <span className="font-medium">{option.label}</span>
                <span className="text-xs text-gray-500">{option.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}