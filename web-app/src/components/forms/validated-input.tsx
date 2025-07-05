'use client';

import { forwardRef } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isValid?: boolean;
  isRequired?: boolean;
  showValidationIcon?: boolean;
  helperText?: string;
  characterLimit?: number;
  characterCount?: number;
}

export const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({
    label,
    error,
    isValid,
    isRequired,
    showValidationIcon = true,
    helperText,
    characterLimit,
    characterCount,
    className,
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
    const isNearLimit = characterLimit ? currentLength > characterLimit * 0.9 : false;

    const getCharacterCountColor = () => {
      if (isOverLimit) return 'text-red-600';
      if (isNearLimit) return 'text-orange-600';
      return 'text-gray-500';
    };

    const getValidationIcon = () => {
      if (showSuccess) return <Check className="w-4 h-4 text-green-600" />;
      if (showError) return <X className="w-4 h-4 text-red-600" />;
      if (showWarning) return <AlertCircle className="w-4 h-4 text-orange-600" />;
      return null;
    };

    const getInputBorderColor = () => {
      if (showError) return 'border-red-500 focus:border-red-500';
      if (showSuccess) return 'border-green-500 focus:border-green-500';
      if (showWarning) return 'border-orange-500 focus:border-orange-500';
      return '';
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
          <Input
            ref={ref}
            className={cn(
              'pr-10',
              getInputBorderColor(),
              className
            )}
            {...props}
          />
          
          {showValidationIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {getValidationIcon()}
            </div>
          )}
        </div>

        {/* Character count and limit */}
        {characterLimit && (
          <div className="flex justify-between items-center">
            <div className="flex-1">
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>
            <p className={cn('text-sm', getCharacterCountColor())}>
              {currentLength}/{characterLimit}
            </p>
          </div>
        )}

        {/* Error message (when no character limit) */}
        {!characterLimit && error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {/* Helper text */}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}

        {/* Validation feedback */}
        {showSuccess && !error && (
          <p className="text-sm text-green-600">✓ Looks good!</p>
        )}
      </div>
    );
  }
);

ValidatedInput.displayName = 'ValidatedInput';