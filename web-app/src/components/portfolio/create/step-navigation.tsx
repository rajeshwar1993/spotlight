'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepNavigationProps {
  currentStep: number;
  canProceed?: boolean;
  isLoading?: boolean;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
  showBack?: boolean;
  className?: string;
}

export function StepNavigation({
  currentStep,
  canProceed = false,
  isLoading = false,
  onNext,
  onBack,
  nextLabel,
  backLabel,
  showBack = true,
  className,
}: StepNavigationProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (currentStep > 1) {
      router.push(`/create/step/${currentStep - 1}`);
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else if (currentStep < 3) {
      router.push(`/create/step/${currentStep + 1}`);
    }
  };

  const getNextLabel = () => {
    if (nextLabel) return nextLabel;
    
    switch (currentStep) {
      case 1:
        return 'Continue to Template Selection';
      case 2:
        return 'Continue to Portfolio Details';
      case 3:
        return 'Create Portfolio';
      default:
        return 'Continue';
    }
  };

  const getBackLabel = () => {
    if (backLabel) return backLabel;
    
    switch (currentStep) {
      case 2:
        return 'Back to Basic Info';
      case 3:
        return 'Back to Template Selection';
      default:
        return 'Back';
    }
  };

  return (
    <div className={cn('flex items-center justify-between pt-6', className)}>
      {/* Back Button */}
      {showBack && currentStep > 1 ? (
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          {getBackLabel()}
        </Button>
      ) : (
        <div /> // Spacer for flex layout
      )}

      {/* Next Button */}
      <Button
        type="button"
        onClick={handleNext}
        disabled={!canProceed || isLoading}
        className="flex items-center gap-2 min-w-[180px]"
      >
        {isLoading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            {currentStep === 3 ? 'Creating...' : 'Loading...'}
          </>
        ) : (
          <>
            {getNextLabel()}
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}