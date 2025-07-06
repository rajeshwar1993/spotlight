'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TemplateType } from '@/types';
import { cn } from '@/lib/utils';
// CSS-only animations version
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TemplatePreview } from '../../template-preview';
import type { PortfolioData, TemplateCustomizations } from '@/lib/templates/types';

interface TemplateTransitionProps {
  fromTemplate: TemplateType;
  toTemplate: TemplateType;
  portfolioData: PortfolioData;
  customizations?: TemplateCustomizations;
  mode: 'preview' | 'switch';
  onComplete: (success: boolean, error?: string) => void;
  className?: string;
}

export function TemplateTransition({
  fromTemplate,
  toTemplate,
  portfolioData,
  customizations,
  mode,
  onComplete,
  className
}: TemplateTransitionProps) {
  const [stage, setStage] = useState<'preparing' | 'transitioning' | 'completed' | 'error'>('preparing');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  const transitionSteps = [
    { id: 'validate', label: 'Validating template compatibility', duration: 800 },
    { id: 'migrate', label: 'Migrating portfolio data', duration: 1200 },
    { id: 'customize', label: 'Applying customizations', duration: 600 },
    { id: 'render', label: 'Rendering new template', duration: 1000 },
    { id: 'optimize', label: 'Optimizing performance', duration: 400 }
  ];

  const executeTransition = useCallback(async () => {
    try {
      setStage('transitioning');
      let currentProgress = 0;

      for (const step of transitionSteps) {
        setCurrentStep(step.label);
        
        // Simulate step execution
        const stepProgress = 100 / transitionSteps.length;
        const startProgress = currentProgress;
        const endProgress = currentProgress + stepProgress;
        
        // Animate progress over step duration
        const startTime = Date.now();
        const animateProgress = () => {
          const elapsed = Date.now() - startTime;
          const stepProgressRatio = Math.min(elapsed / step.duration, 1);
          const animatedProgress = startProgress + (stepProgressRatio * stepProgress);
          
          setProgress(animatedProgress);
          
          if (stepProgressRatio < 1) {
            requestAnimationFrame(animateProgress);
          }
        };
        
        requestAnimationFrame(animateProgress);
        
        // Wait for step to complete
        await new Promise(resolve => setTimeout(resolve, step.duration));
        
        currentProgress = endProgress;
      }

      setProgress(100);
      setStage('completed');
      onComplete(true);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Template transition failed');
      setStage('error');
      onComplete(false, err instanceof Error ? err.message : 'Template transition failed');
    }
  }, [fromTemplate, toTemplate, onComplete, transitionSteps]);

  const handleRetry = useCallback(() => {
    setStage('preparing');
    setProgress(0);
    setCurrentStep('');
    setError(null);
    setTimeout(executeTransition, 1000);
  }, [executeTransition]);

  useEffect(() => {
    if (stage === 'preparing') {
      const timer = setTimeout(executeTransition, 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [stage, executeTransition]);

  const getTransitionClass = () => {
    switch (stage) {
      case 'preparing':
        return 'animate-fade-in-scale';
      case 'transitioning':
        return 'animate-slide-in-right';
      case 'completed':
        return 'animate-slide-up';
      case 'error':
        return 'animate-fade-in-scale';
      default:
        return 'animate-fade-in';
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className={cn('transition-all duration-500', getTransitionClass())}>
        {stage === 'preparing' && (
          <div className="flex-1 flex items-center justify-center animate-fade-in">
            <Card className="w-full max-w-md">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Preparing Transition
                    </h3>
                    <p className="text-sm text-gray-600">
                      Getting ready to switch from {fromTemplate} to {toTemplate}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {stage === 'transitioning' && (
          <div className="flex-1 flex flex-col animate-slide-in-right">
            <Card className="mb-4">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Transitioning Templates
                    </h3>
                    <span className="text-sm text-gray-500">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  
                  <Progress value={progress} className="w-full" />
                  
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-600">{currentStep}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-gray-500">From</p>
                      <p className="font-medium">{fromTemplate}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500">To</p>
                      <p className="font-medium">{toTemplate}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Template Preview During Transition */}
            <div className="flex-1 relative overflow-hidden rounded-lg border">
              <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{ opacity: 1 - (progress / 100) }}
              >
                <TemplatePreview
                  templateType={fromTemplate}
                  showControls={false}
                  className="h-full"
                />
              </div>
              
              <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{ opacity: progress / 100 }}
              >
                <TemplatePreview
                  templateType={toTemplate}
                  showControls={false}
                  className="h-full"
                />
              </div>
              
              {/* Transition overlay */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-slide-shimmer"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  width: '30%'
                }}
              />
            </div>
          </div>
        )}

        {stage === 'completed' && (
          <div className="flex-1 flex flex-col animate-slide-up">
            <Card className="mb-4 border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Transition Complete!
                    </h3>
                    <p className="text-sm text-gray-600">
                      Your portfolio has been successfully switched to {toTemplate}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex-1 rounded-lg border overflow-hidden">
              <TemplatePreview
                templateType={toTemplate}
                showControls={false}
                className="h-full"
              />
            </div>
          </div>
        )}

        {stage === 'error' && (
          <div className="flex-1 flex items-center justify-center animate-fade-in">
            <Card className="w-full max-w-md border-red-200">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Transition Failed
                    </h3>
                    <p className="text-sm text-gray-600">
                      {error || 'An error occurred during template transition'}
                    </p>
                  </div>
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your original template and data remain unchanged.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" onClick={handleRetry}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                    <Button onClick={() => onComplete(false, error || 'User cancelled')}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// Template transition utilities
export const templateTransitionUtils = {
  // Validate if transition is possible
  validateTransition: (from: TemplateType, to: TemplateType, data: PortfolioData): {
    isValid: boolean;
    warnings: string[];
    requirements: string[];
  } => {
    const warnings: string[] = [];
    const requirements: string[] = [];

    // Check for potential data loss
    if (from === 'T4' && to !== 'T4') {
      warnings.push('Creative sections may not display the same way in other templates');
    }

    if (from === 'T2' && to === 'T3') {
      warnings.push('Bold styling will be replaced with minimal design');
    }

    // Check for missing required data
    if (to === 'T1' && !data.images.profile) {
      requirements.push('Profile image required for Professional template');
    }

    if (to === 'T2' && (!data.images.hero || data.images.gallery.length < 3)) {
      requirements.push('Hero image and at least 3 gallery images required for Modern Bold template');
    }

    return {
      isValid: requirements.length === 0,
      warnings,
      requirements
    };
  },

  // Estimate transition duration
  estimateTransitionTime: (from: TemplateType, to: TemplateType, dataSize: number): number => {
    const baseTime = 2000; // 2 seconds
    const dataSizeMultiplier = Math.min(dataSize / 1000, 2); // Max 2x for large data
    const complexityMultiplier = from === to ? 1 : 1.5;
    
    return baseTime * dataSizeMultiplier * complexityMultiplier;
  },

  // Generate transition animation config
  getTransitionConfig: (from: TemplateType, to: TemplateType) => {
    const configs = {
      'T1->T2': { type: 'slide', direction: 'right', duration: 0.8 },
      'T2->T1': { type: 'slide', direction: 'left', duration: 0.8 },
      'T1->T3': { type: 'fade', duration: 0.6 },
      'T3->T1': { type: 'fade', duration: 0.6 },
      'T2->T4': { type: 'zoom', duration: 1.0 },
      'T4->T2': { type: 'zoom', duration: 1.0 },
      default: { type: 'fade', duration: 0.7 }
    };
    
    const key = `${from}->${to}` as keyof typeof configs;
    return configs[key] || configs.default;
  }
};