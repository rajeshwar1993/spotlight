'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Mail, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface EmailVerificationBannerProps {
  isVisible?: boolean;
  isEmailVerified?: boolean;
  userEmail?: string;
  onDismiss?: () => void;
  onResendVerification?: () => Promise<void>;
  className?: string;
  variant?: 'default' | 'minimal' | 'prominent';
  showDismiss?: boolean;
  autoHide?: boolean;
}

export function EmailVerificationBanner({
  isVisible = true,
  isEmailVerified = false,
  userEmail,
  onDismiss,
  onResendVerification,
  className = '',
  variant = 'default',
  showDismiss = true,
  autoHide = false
}: EmailVerificationBannerProps) {
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { toast } = useToast();

  // Don't show if email is verified or if dismissed and auto-hide is enabled
  if (!isVisible || isEmailVerified || (isDismissed && autoHide)) {
    return null;
  }

  const handleResend = async () => {
    if (!onResendVerification) return;
    
    try {
      setIsResending(true);
      await onResendVerification();
      
      toast({
        title: 'Verification Email Sent',
        description: `We've sent a new verification email to ${userEmail || 'your email address'}.`,
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send verification email',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return 'border-amber-200 bg-amber-50 text-amber-800';
      case 'prominent':
        return 'border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-900 shadow-md';
      default:
        return 'border-amber-200 bg-amber-50 text-amber-800';
    }
  };

  return (
    <Alert className={cn(getVariantStyles(), className)}>
      <div className="flex items-start gap-3 w-full">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <AlertDescription className="text-sm font-medium text-amber-900 mb-1">
                Email Verification Required
              </AlertDescription>
              <AlertDescription className="text-sm text-amber-700 mb-3">
                Please verify your email address to publish portfolios and access all features.
                {userEmail && (
                  <>
                    {' '}We sent a verification email to <strong>{userEmail}</strong>.
                  </>
                )}
              </AlertDescription>
              
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResend}
                  disabled={isResending}
                  className="bg-white hover:bg-amber-50 border-amber-300 text-amber-800 hover:text-amber-900"
                >
                  {isResending ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  {isResending ? 'Sending...' : 'Resend Email'}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-amber-700 hover:text-amber-900 hover:bg-amber-100"
                  asChild
                >
                  <a href="mailto:" target="_blank" rel="noopener noreferrer">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Check Email
                  </a>
                </Button>
              </div>
            </div>
            
            {showDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="flex-shrink-0 text-amber-600 hover:text-amber-800 hover:bg-amber-100 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Alert>
  );
}

// Compact version for smaller spaces
interface CompactVerificationBannerProps {
  isVisible?: boolean;
  isEmailVerified?: boolean;
  onResendVerification?: () => Promise<void>;
  className?: string;
}

export function CompactVerificationBanner({
  isVisible = true,
  isEmailVerified = false,
  onResendVerification,
  className = ''
}: CompactVerificationBannerProps) {
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();

  if (!isVisible || isEmailVerified) {
    return null;
  }

  const handleResend = async () => {
    if (!onResendVerification) return;
    
    try {
      setIsResending(true);
      await onResendVerification();
      
      toast({
        title: 'Verification Email Sent',
        description: 'Please check your email for the verification link.',
        duration: 5000,
      });
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to send verification email',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-md text-sm',
      className
    )}>
      <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
      <span className="text-amber-800 flex-1">Email verification required</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleResend}
        disabled={isResending}
        className="h-auto py-1 px-2 text-xs text-amber-700 hover:text-amber-900 hover:bg-amber-100"
      >
        {isResending ? (
          <RefreshCw className="h-3 w-3 animate-spin" />
        ) : (
          'Verify'
        )}
      </Button>
    </div>
  );
}

// Success banner for when verification is completed
interface VerificationSuccessBannerProps {
  isVisible?: boolean;
  onDismiss?: () => void;
  className?: string;
  autoHideDuration?: number;
}

export function VerificationSuccessBanner({
  isVisible = false,
  onDismiss,
  className = '',
  autoHideDuration = 5000
}: VerificationSuccessBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  React.useEffect(() => {
    if (isVisible && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        setIsDismissed(true);
        onDismiss?.();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoHideDuration, onDismiss]);

  if (!isVisible || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <Alert className={cn('border-green-200 bg-green-50 text-green-800', className)}>
      <div className="flex items-start gap-3 w-full">
        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
        
        <div className="flex-1">
          <AlertDescription className="text-sm font-medium text-green-900 mb-1">
            Email Verified Successfully!
          </AlertDescription>
          <AlertDescription className="text-sm text-green-700">
            Your email has been verified. You can now publish portfolios and access all platform features.
          </AlertDescription>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="flex-shrink-0 text-green-600 hover:text-green-800 hover:bg-green-100 h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
}