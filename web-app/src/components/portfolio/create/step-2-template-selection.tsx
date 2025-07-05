'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePortfolioCreation } from './portfolio-creation-context';
import { TemplateType } from '@/types';
import { getTemplateConfig } from '@/lib/templates/registry-simple';
import { cn } from '@/lib/utils';
import { StepNavigation } from './step-navigation';
import { TemplatePreview } from '@/components/templates/template-preview';

export function Step2TemplateSelection() {
  const router = useRouter();
  const { state, updateStep2, setStep, canProceedToStep } = usePortfolioCreation();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | undefined>(
    state.formData.step2.template_type
  );

  // Check if user can access this step
  useEffect(() => {
    if (!canProceedToStep(2)) {
      router.push('/create/step/1');
    }
  }, [canProceedToStep, router]);

  const templates: TemplateType[] = ['T1', 'T2', 'T3', 'T4'];

  const handleTemplateSelect = (templateType: TemplateType) => {
    setSelectedTemplate(templateType);
    updateStep2({ template_type: templateType });
  };

  const handleNext = async () => {
    if (!selectedTemplate) return;

    setIsLoading(true);
    try {
      // Move to next step
      setStep(3);
      router.push('/create/step/3');
    } catch (error) {
      console.error('Step 2 error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = !!selectedTemplate;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Step Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose your template
        </h2>
        <p className="text-lg text-gray-600">
          Select a design that best represents your professional style
        </p>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {templates.map((templateType) => {
          const config = getTemplateConfig(templateType);
          const isSelected = selectedTemplate === templateType;

          if (!config) return null;

          return (
            <Card
              key={templateType}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-lg',
                isSelected && 'ring-2 ring-blue-500 ring-offset-2 shadow-lg'
              )}
              onClick={() => handleTemplateSelect(templateType)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      {config.name}
                      <Badge variant="secondary" className="capitalize">
                        {config.category}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {config.description}
                    </CardDescription>
                  </div>
                  
                  {isSelected && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* Template Features */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {config.features.slice(0, 3).map((feature) => (
                    <Badge key={feature.id} variant="outline" className="text-xs">
                      {feature.name}
                    </Badge>
                  ))}
                  {config.features.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{config.features.length - 3} more
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Template Preview */}
                <div className="aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <TemplatePreview
                    templateType={templateType}
                    showControls={false}
                    showMetadata={false}
                    className="h-full"
                  />
                </div>

                {/* Selection Button */}
                <Button
                  className="w-full"
                  variant={isSelected ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTemplateSelect(templateType);
                  }}
                >
                  {isSelected ? (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Selected
                    </>
                  ) : (
                    'Select This Template'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Template Comparison Info */}
      {selectedTemplate && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {selectedTemplate}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {getTemplateConfig(selectedTemplate)?.name} Selected
                </h3>
                <p className="text-gray-600 mb-3">
                  {getTemplateConfig(selectedTemplate)?.description}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {getTemplateConfig(selectedTemplate)?.category}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {getTemplateConfig(selectedTemplate)?.features.length} features included
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <StepNavigation
        currentStep={2}
        canProceed={canProceed}
        isLoading={isLoading}
        onNext={handleNext}
        nextLabel="Continue to Portfolio Details"
      />

      {/* Progress Info */}
      <div className="text-center text-sm text-gray-500">
        <p>Step 2 of 3 • Your selection is automatically saved</p>
      </div>
    </div>
  );
}