/**
 * Progressive form component for multi-step forms with optimized loading
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  progressiveFormLoader, 
  useProgressiveLoading,
  ProgressiveLoadingState 
} from '@/lib/progressive-loading';
import { ChevronLeft, ChevronRight, Loader2, CheckCircle, Circle } from 'lucide-react';

interface FormStep {
  id: number;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  isLoaded?: boolean;
  isValid?: boolean;
  data?: any;
}

interface ProgressiveFormProps {
  steps: Omit<FormStep, 'component'>[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onSubmit: (data: any) => void;
  formData: any;
  onDataChange: (data: any) => void;
  isSubmitting?: boolean;
  className?: string;
}

/**
 * Step indicator component
 */
const StepIndicator = ({ 
  steps, 
  currentStep, 
  onStepClick 
}: { 
  steps: FormStep[]; 
  currentStep: number; 
  onStepClick: (step: number) => void;
}) => (
  <div className="flex items-center justify-between mb-8">
    {steps.map((step, index) => (
      <div key={step.id} className="flex items-center">
        <button
          onClick={() => onStepClick(step.id)}
          disabled={!step.isLoaded}
          className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
            step.id === currentStep
              ? 'bg-blue-600 border-blue-600 text-white'
              : step.isValid
              ? 'bg-green-600 border-green-600 text-white'
              : step.isLoaded
              ? 'bg-white border-gray-300 text-gray-600 hover:border-blue-300'
              : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {step.isValid ? (
            <CheckCircle className="h-5 w-5" />
          ) : step.isLoaded ? (
            <Circle className="h-5 w-5" />
          ) : (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </button>
        
        {index < steps.length - 1 && (
          <div className={`flex-1 h-0.5 mx-4 ${
            step.isValid ? 'bg-green-600' : 'bg-gray-200'
          }`} />
        )}
      </div>
    ))}
  </div>
);

/**
 * Step content loading skeleton
 */
const StepContentSkeleton = () => (
  <Card className="w-full">
    <CardHeader>
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-64" />
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-20 w-full" />
      </div>
    </CardContent>
  </Card>
);

/**
 * Progressive form hook
 */
const useProgressiveForm = (stepCount: number) => {
  const [loadedSteps, setLoadedSteps] = useState<Set<number>>(new Set());
  const [stepComponents, setStepComponents] = useState<Map<number, React.ComponentType<any>>>(new Map());
  const [loadingSteps, setLoadingSteps] = useState<Set<number>>(new Set());

  const loadStep = useCallback(async (stepNumber: number) => {
    if (loadedSteps.has(stepNumber) || loadingSteps.has(stepNumber)) return;

    setLoadingSteps(prev => new Set(prev).add(stepNumber));
    
    try {
      const component = await progressiveFormLoader.loadStep(stepNumber);
      setStepComponents(prev => new Map(prev).set(stepNumber, component));
      setLoadedSteps(prev => new Set(prev).add(stepNumber));
    } catch (error) {
      console.error(`Failed to load step ${stepNumber}:`, error);
    } finally {
      setLoadingSteps(prev => {
        const newSet = new Set(prev);
        newSet.delete(stepNumber);
        return newSet;
      });
    }
  }, [loadedSteps, loadingSteps]);

  const preloadAdjacentSteps = useCallback((currentStep: number) => {
    progressiveFormLoader.preloadAdjacentSteps(currentStep);
  }, []);

  const isStepLoaded = useCallback((stepNumber: number) => {
    return loadedSteps.has(stepNumber);
  }, [loadedSteps]);

  const isStepLoading = useCallback((stepNumber: number) => {
    return loadingSteps.has(stepNumber);
  }, [loadingSteps]);

  const getStepComponent = useCallback((stepNumber: number) => {
    return stepComponents.get(stepNumber);
  }, [stepComponents]);

  return {
    loadStep,
    preloadAdjacentSteps,
    isStepLoaded,
    isStepLoading,
    getStepComponent,
  };
};

/**
 * Progressive form component
 */
export const ProgressiveForm = ({
  steps: initialSteps,
  currentStep,
  onStepChange,
  onSubmit,
  formData,
  onDataChange,
  isSubmitting = false,
  className = '',
}: ProgressiveFormProps) => {
  const router = useRouter();
  const [steps, setSteps] = useState<FormStep[]>(
    initialSteps.map(step => ({ ...step, component: () => null, isLoaded: false }))
  );

  const {
    loadStep,
    preloadAdjacentSteps,
    isStepLoaded,
    isStepLoading,
    getStepComponent,
  } = useProgressiveForm(steps.length);

  // Load current step and preload adjacent steps
  useEffect(() => {
    loadStep(currentStep);
    preloadAdjacentSteps(currentStep);
  }, [currentStep, loadStep, preloadAdjacentSteps]);

  // Update step loading states
  useEffect(() => {
    setSteps(prevSteps => 
      prevSteps.map(step => ({
        ...step,
        isLoaded: isStepLoaded(step.id),
        component: getStepComponent(step.id) || (() => null),
      }))
    );
  }, [isStepLoaded, getStepComponent]);

  const currentStepData = steps.find(step => step.id === currentStep);
  const CurrentStepComponent = currentStepData?.component || (() => null);

  const handleNext = () => {
    if (currentStep < steps.length) {
      onStepChange(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      onStepChange(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    if (isStepLoaded(stepId)) {
      onStepChange(stepId);
    }
  };

  const handleDataChange = (stepData: any) => {
    const newFormData = { ...formData, [`step${currentStep}`]: stepData };
    onDataChange(newFormData);
    
    // Update step validation state
    setSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === currentStep 
          ? { ...step, isValid: true, data: stepData }
          : step
      )
    );
  };

  const handleSubmit = () => {
    if (currentStep === steps.length) {
      onSubmit(formData);
    } else {
      handleNext();
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">
            Step {currentStep} of {steps.length}
          </h2>
          <Badge variant="secondary">
            {Math.round(progress)}% Complete
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step indicator */}
      <StepIndicator
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />

      {/* Step content */}
      <div className="mb-8">
        {currentStepData && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">{currentStepData.title}</h3>
              <p className="text-gray-600">{currentStepData.description}</p>
            </div>

            {isStepLoading(currentStep) ? (
              <StepContentSkeleton />
            ) : isStepLoaded(currentStep) ? (
              <CurrentStepComponent
                data={formData[`step${currentStep}`]}
                onChange={handleDataChange}
                onNext={handleNext}
                onPrevious={handlePrevious}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading step content...</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              disabled={!isStepLoaded(currentStep) || isSubmitting}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !isStepLoaded(currentStep)}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Complete
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Progressive wizard component with auto-save
 */
export const ProgressiveWizard = ({
  steps,
  onComplete,
  autoSave = true,
  autoSaveInterval = 5000,
  className = '',
}: {
  steps: Omit<FormStep, 'component'>[];
  onComplete: (data: any) => void;
  autoSave?: boolean;
  autoSaveInterval?: number;
  className?: string;
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave) return;

    const interval = setInterval(() => {
      // Save to localStorage or send to server
      try {
        localStorage.setItem('progressive-form-data', JSON.stringify({
          currentStep,
          formData,
          timestamp: new Date().toISOString(),
        }));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [formData, currentStep, autoSave, autoSaveInterval]);

  // Load saved data on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('progressive-form-data');
      if (saved) {
        const { currentStep: savedStep, formData: savedData } = JSON.parse(saved);
        setCurrentStep(savedStep);
        setFormData(savedData);
      }
    } catch (error) {
      console.error('Failed to load saved data:', error);
    }
  }, []);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await onComplete(data);
      // Clear saved data on successful completion
      localStorage.removeItem('progressive-form-data');
    } catch (error) {
      console.error('Form submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={className}>
      <ProgressiveForm
        steps={steps}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        onSubmit={handleSubmit}
        formData={formData}
        onDataChange={setFormData}
        isSubmitting={isSubmitting}
      />
      
      {autoSave && lastSaved && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Last saved: {lastSaved.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default ProgressiveForm;