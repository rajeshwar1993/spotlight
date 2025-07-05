'use client';

import { forwardRef } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ValidatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  isValid?: boolean;
  isRequired?: boolean;
  showValidationIcon?: boolean;
  helperText?: string;
  characterLimit?: number;
  characterMinimum?: number;
  characterCount?: number;
  showCharacterProgress?: boolean;
}

export const ValidatedTextarea = forwardRef<HTMLTextAreaElement, ValidatedTextareaProps>(
  ({
    label,
    error,
    isValid,
    isRequired,
    showValidationIcon = true,
    helperText,
    characterLimit,
    characterMinimum,
    characterCount,
    className,
    showCharacterProgress = false,
    ...props
  }, ref) => {
    const hasError = Boolean(error);
    const hasValue = Boolean(props.value);
    const showSuccess = isValid && hasValue && !hasError;
    const showError = hasError;
    const showWarning = !hasError && !isValid && hasValue;

    // Character count logic
    const currentLength = characterCount ?? (props.value?.toString().length || 0);
    const isOverLimit = characterLimit ? currentLength > characterLimit : false;
    const isUnderMinimum = characterMinimum ? currentLength < characterMinimum : false;
    const isNearLimit = characterLimit ? currentLength > characterLimit * 0.9 : false;

    const getCharacterCountColor = () => {
      if (isOverLimit) return 'text-red-600';
      if (isUnderMinimum) return 'text-orange-600';
      if (isNearLimit) return 'text-orange-600';
      return 'text-gray-500';
    };

    const getValidationIcon = () => {
      if (showSuccess) return <Check className="w-4 h-4 text-green-600" />;
      if (showError) return <X className="w-4 h-4 text-red-600" />;
      if (showWarning) return <AlertCircle className="w-4 h-4 text-orange-600" />;
      return null;
    };

    const getTextareaBorderColor = () => {
      if (showError) return 'border-red-500 focus:border-red-500';
      if (showSuccess) return 'border-green-500 focus:border-green-500';
      if (showWarning) return 'border-orange-500 focus:border-orange-500';
      return '';
    };

    const getCharacterProgressWidth = () => {
      if (!characterLimit) return 0;
      return Math.min((currentLength / characterLimit) * 100, 100);
    };

    const getProgressBarColor = () => {
      if (isOverLimit) return 'bg-red-500';
      if (isNearLimit) return 'bg-orange-500';
      return 'bg-green-500';
    };

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={props.id} className="text-sm font-medium">
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        
        <div className="relative">
          <Textarea
            ref={ref}
            className={cn(
              'resize-none',
              getTextareaBorderColor(),
              className
            )}
            {...props}
          />
          
          {showValidationIcon && (
            <div className="absolute top-3 right-3">
              {getValidationIcon()}
            </div>
          )}
        </div>

        {/* Character progress bar */}
        {showCharacterProgress && characterLimit && (
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className={cn('h-1 rounded-full transition-all duration-300', getProgressBarColor())}
              style={{ width: `${getCharacterProgressWidth()}%` }}
            />
          </div>
        )}

        {/* Character count and requirements */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            
            {/* Character minimum indicator */}
            {characterMinimum && !error && (
              <div className="text-sm">
                {isUnderMinimum ? (
                  <p className="text-orange-600">
                    {characterMinimum - currentLength} more characters needed
                  </p>
                ) : (
                  <p className="text-green-600">
                    ✓ Minimum length met
                  </p>
                )}
              </div>
            )}
            
            {/* Helper text */}
            {helperText && !error && !characterMinimum && (
              <p className="text-sm text-gray-500">{helperText}</p>
            )}
          </div>
          
          {/* Character count */}
          {characterLimit && (
            <p className={cn('text-sm ml-2', getCharacterCountColor())}>
              {currentLength}/{characterLimit}
            </p>
          )}
        </div>

        {/* Validation feedback */}
        {showSuccess && !error && (
          <p className="text-sm text-green-600">✓ Looks good!</p>
        )}
      </div>
    );
  }
);

ValidatedTextarea.displayName = 'ValidatedTextarea';