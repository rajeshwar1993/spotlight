'use client';

import { Check, X, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RequirementRule {
  label: string;
  isMet: boolean;
  isRequired?: boolean;
}

interface FieldRequirementProps {
  requirements: RequirementRule[];
  title?: string;
  className?: string;
  showTitle?: boolean;
  compact?: boolean;
}

export function FieldRequirement({ 
  requirements, 
  title = "Requirements",
  className,
  showTitle = true,
  compact = false 
}: FieldRequirementProps) {
  const allRequiredMet = requirements
    .filter(req => req.isRequired !== false)
    .every(req => req.isMet);

  const getIcon = (isMet: boolean, isRequired: boolean = true) => {
    if (isMet) {
      return <Check className="w-3 h-3 text-green-600" />;
    }
    if (isRequired) {
      return <X className="w-3 h-3 text-red-600" />;
    }
    return <Circle className="w-3 h-3 text-gray-400" />;
  };

  const getTextColor = (isMet: boolean, isRequired: boolean = true) => {
    if (isMet) return 'text-green-600';
    if (isRequired) return 'text-red-600';
    return 'text-gray-500';
  };

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {allRequiredMet ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <X className="w-4 h-4 text-red-600" />
        )}
        <span className={cn(
          'text-sm',
          allRequiredMet ? 'text-green-600' : 'text-red-600'
        )}>
          {allRequiredMet ? 'All requirements met' : 'Missing requirements'}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {showTitle && (
        <h4 className="text-sm font-medium text-gray-700">{title}</h4>
      )}
      
      <div className="space-y-1">
        {requirements.map((requirement, index) => (
          <div key={index} className="flex items-center gap-2">
            {getIcon(requirement.isMet, requirement.isRequired)}
            <span className={cn(
              'text-xs',
              getTextColor(requirement.isMet, requirement.isRequired)
            )}>
              {requirement.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Progress indicator variant
interface FieldProgressProps {
  current: number;
  target: number;
  label: string;
  className?: string;
  showPercentage?: boolean;
}

export function FieldProgress({ 
  current, 
  target, 
  label, 
  className,
  showPercentage = false 
}: FieldProgressProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const isComplete = current >= target;

  const getProgressColor = () => {
    if (isComplete) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-600">{label}</span>
        {showPercentage && (
          <span className="text-xs text-gray-500">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className={cn('h-1.5 rounded-full transition-all duration-300', getProgressColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex justify-between items-center">
        <span className={cn(
          'text-xs',
          isComplete ? 'text-green-600' : 'text-gray-500'
        )}>
          {current} / {target}
        </span>
        {isComplete && (
          <Check className="w-3 h-3 text-green-600" />
        )}
      </div>
    </div>
  );
}

// Character requirement helper
export function useCharacterRequirements(
  value: string, 
  minLength?: number, 
  maxLength?: number
): RequirementRule[] {
  const requirements: RequirementRule[] = [];

  if (minLength) {
    requirements.push({
      label: `At least ${minLength} characters`,
      isMet: value.length >= minLength,
      isRequired: true,
    });
  }

  if (maxLength) {
    requirements.push({
      label: `Maximum ${maxLength} characters`,
      isMet: value.length <= maxLength,
      isRequired: true,
    });
  }

  // Common character-based requirements
  if (value.length > 0) {
    requirements.push({
      label: 'Contains text',
      isMet: value.trim().length > 0,
      isRequired: true,
    });
  }

  return requirements;
}