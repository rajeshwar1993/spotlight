import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow hover:bg-primary/90 active:scale-95',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-95',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground active:scale-95',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:scale-95',
        ghost: 
          'hover:bg-accent hover:text-accent-foreground active:scale-95',
        link: 
          'text-primary underline-offset-4 hover:underline',
        spotlight:
          'bg-gradient-to-r from-spotlight-600 to-spotlight-500 text-white shadow-spotlight hover:from-spotlight-700 hover:to-spotlight-600 active:scale-95',
        'spotlight-outline':
          'border-2 border-spotlight-500 text-spotlight-600 hover:bg-spotlight-50 dark:text-spotlight-400 dark:hover:bg-spotlight-950/30 active:scale-95',
        success:
          'bg-success text-success-foreground shadow-sm hover:bg-success/90 active:scale-95',
        warning:
          'bg-warning text-warning-foreground shadow-sm hover:bg-warning/90 active:scale-95',
        info:
          'bg-info text-info-foreground shadow-sm hover:bg-info/90 active:scale-95',
      },
      size: {
        xs: 'h-7 rounded px-2 text-xs [&_svg]:size-3',
        sm: 'h-8 rounded-md px-3 text-xs [&_svg]:size-3.5',
        default: 'h-9 px-4 py-2',
        lg: 'h-10 rounded-md px-8 text-base',
        xl: 'h-12 rounded-lg px-10 text-lg',
        icon: 'h-9 w-9',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-10 w-10',
        'icon-xl': 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    const isDisabled = disabled || loading;
    
    const buttonContent = (
      <>
        {loading && (
          <Loader2 className="animate-spin" />
        )}
        {!loading && leftIcon && leftIcon}
        
        {loading ? (loadingText || children) : children}
        
        {!loading && rightIcon && rightIcon}
      </>
    );
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {buttonContent}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
