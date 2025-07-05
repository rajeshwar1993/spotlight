'use client';

import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ValidationMessageType = 'error' | 'warning' | 'success' | 'info';

interface ValidationMessageProps {
  type: ValidationMessageType;
  message: string;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const typeConfig = {
  error: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  success: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  info: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
};

const sizeConfig = {
  sm: {
    padding: 'p-2',
    textSize: 'text-xs',
    iconSize: 'w-3 h-3',
  },
  md: {
    padding: 'p-3',
    textSize: 'text-sm',
    iconSize: 'w-4 h-4',
  },
  lg: {
    padding: 'p-4',
    textSize: 'text-base',
    iconSize: 'w-5 h-5',
  },
};

export function ValidationMessage({
  type,
  message,
  className,
  showIcon = true,
  size = 'md',
}: ValidationMessageProps) {
  const config = typeConfig[type];
  const sizeSettings = sizeConfig[size];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-md border',
        config.bgColor,
        config.borderColor,
        sizeSettings.padding,
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {showIcon && (
        <Icon 
          className={cn(
            config.color,
            sizeSettings.iconSize,
            'flex-shrink-0 mt-0.5'
          )}
        />
      )}
      <p className={cn(config.color, sizeSettings.textSize, 'leading-relaxed')}>
        {message}
      </p>
    </div>
  );
}

// Preset components for common use cases
export function ErrorMessage({ message, className, ...props }: Omit<ValidationMessageProps, 'type'>) {
  return <ValidationMessage type="error" message={message} className={className} {...props} />;
}

export function WarningMessage({ message, className, ...props }: Omit<ValidationMessageProps, 'type'>) {
  return <ValidationMessage type="warning" message={message} className={className} {...props} />;
}

export function SuccessMessage({ message, className, ...props }: Omit<ValidationMessageProps, 'type'>) {
  return <ValidationMessage type="success" message={message} className={className} {...props} />;
}

export function InfoMessage({ message, className, ...props }: Omit<ValidationMessageProps, 'type'>) {
  return <ValidationMessage type="info" message={message} className={className} {...props} />;
}