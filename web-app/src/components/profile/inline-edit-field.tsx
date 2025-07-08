'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Check, X, Edit, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineEditFieldProps {
  value: string;
  onSave: (newValue: string) => Promise<boolean>;
  placeholder?: string;
  type?: 'text' | 'textarea' | 'select';
  options?: { value: string; label: string }[];
  maxLength?: number;
  className?: string;
  displayClassName?: string;
  editClassName?: string;
  required?: boolean;
  validation?: (value: string) => string | null;
}

export function InlineEditField({
  value,
  onSave,
  placeholder = 'Click to edit',
  type = 'text',
  options = [],
  maxLength,
  className = '',
  displayClassName = '',
  editClassName = '',
  required = false,
  validation
}: InlineEditFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      const element = type === 'textarea' ? textareaRef.current : inputRef.current;
      if (element) {
        element.focus();
        if (type !== 'textarea') {
          element.select();
        }
      }
    }
  }, [isEditing, type]);

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setCurrentValue(value);
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    // Validation
    if (required && !currentValue.trim()) {
      setError('This field is required');
      return;
    }

    if (validation) {
      const validationError = validation(currentValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    if (currentValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const success = await onSave(currentValue);
      if (success) {
        setIsEditing(false);
      } else {
        setError('Failed to save changes');
      }
    } catch (err) {
      setError('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'textarea') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Enter' && e.ctrlKey && type === 'textarea') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const displayValue = value || placeholder;
  const isEmpty = !value;

  if (isEditing) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-start space-x-2">
          <div className="flex-1">
            {type === 'textarea' ? (
              <Textarea
                ref={textareaRef}
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={maxLength}
                className={cn('min-h-[80px]', editClassName)}
                disabled={isSaving}
              />
            ) : type === 'select' ? (
              <Select
                value={currentValue}
                onValueChange={setCurrentValue}
                disabled={isSaving}
              >
                <SelectTrigger className={editClassName}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                ref={inputRef}
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={maxLength}
                className={editClassName}
                disabled={isSaving}
              />
            )}
            
            {maxLength && (
              <div className="text-xs text-gray-500 mt-1">
                {currentValue.length}/{maxLength}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="h-8 w-8 p-0"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        
        {type === 'textarea' && (
          <p className="text-xs text-gray-500">
            Tip: Press Ctrl+Enter to save, Escape to cancel
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative cursor-pointer rounded px-2 py-1 hover:bg-gray-50 transition-colors',
        className
      )}
      onClick={handleEdit}
    >
      <div className={cn(
        'flex items-center justify-between',
        isEmpty && 'text-gray-500 italic',
        displayClassName
      )}>
        <span className="flex-1">
          {type === 'textarea' ? (
            <div className="whitespace-pre-wrap">{displayValue}</div>
          ) : (
            displayValue
          )}
        </span>
        <Edit className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
      </div>
      
      <div className="absolute inset-0 rounded border-2 border-transparent group-hover:border-gray-200 transition-colors pointer-events-none" />
    </div>
  );
}

// Specialized inline edit components for common use cases
export function InlineEditText(props: Omit<InlineEditFieldProps, 'type'>) {
  return <InlineEditField {...props} type="text" />;
}

export function InlineEditTextarea(props: Omit<InlineEditFieldProps, 'type'>) {
  return <InlineEditField {...props} type="textarea" />;
}

export function InlineEditSelect(props: Omit<InlineEditFieldProps, 'type'>) {
  return <InlineEditField {...props} type="select" />;
}