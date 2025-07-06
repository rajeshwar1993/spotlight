'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { TemplateType } from '@/types';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Check, Loader2, Shuffle, Eye, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getTemplateConfig, getAllTemplates } from '@/lib/templates/registry';
import { TemplatePreview } from '../../template-preview';
import { TemplateTransition } from './template-transition';
import { CompatibilityChecker } from './compatibility-checker';
import type { PortfolioData, TemplateCustomizations } from '@/lib/templates/types';

interface TemplateSwitcherProps {
  currentTemplate: TemplateType;
  portfolioData: PortfolioData;
  customizations?: TemplateCustomizations;
  onTemplateChange: (newTemplate: TemplateType, migrationResult?: any) => void;
  onPreviewEnd?: () => void;
  className?: string;
}

export function TemplateSwitcher({
  currentTemplate,
  portfolioData,
  customizations,
  onTemplateChange,
  onPreviewEnd,
  className
}: TemplateSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previewMode, setPreviewMode] = useState<'side-by-side' | 'overlay' | 'fullscreen'>('side-by-side');
  const [isTrialMode, setIsTrialMode] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);

  const availableTemplates = useMemo(() => {
    return getAllTemplates().filter(t => t !== currentTemplate);
  }, [currentTemplate]);

  const currentConfig = getTemplateConfig(currentTemplate);
  const selectedConfig = selectedTemplate ? getTemplateConfig(selectedTemplate) : null;

  const handleTemplateSelect = useCallback((templateType: TemplateType) => {
    setSelectedTemplate(templateType);
  }, []);

  const handleTryTemplate = useCallback((templateType: TemplateType) => {
    setSelectedTemplate(templateType);
    setIsTrialMode(true);
    setPreviewMode('overlay');
  }, []);

  const handleConfirmSwitch = useCallback(async () => {
    if (!selectedTemplate) return;

    setIsTransitioning(true);
    setTransitionProgress(0);

    try {
      // Simulate transition progress
      const progressInterval = setInterval(() => {
        setTransitionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Perform the actual template switch
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTransitionProgress(100);
      onTemplateChange(selectedTemplate);
      
      // Close dialog after successful transition
      setTimeout(() => {
        setIsOpen(false);
        setSelectedTemplate(null);
        setIsTransitioning(false);
        setTransitionProgress(0);
        setIsTrialMode(false);
      }, 500);

    } catch (error) {
      console.error('Template switch failed:', error);
      setIsTransitioning(false);
      setTransitionProgress(0);
    }
  }, [selectedTemplate, onTemplateChange]);

  const handleCancelTrial = useCallback(() => {
    setIsTrialMode(false);
    setSelectedTemplate(null);
    setPreviewMode('side-by-side');
    onPreviewEnd?.();
  }, [onPreviewEnd]);

  if (!currentConfig) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={cn('gap-2', className)}>
          <Shuffle className="h-4 w-4" />
          Switch Template
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shuffle className="h-5 w-5" />
            Switch Template
          </DialogTitle>
        </DialogHeader>

        {isTransitioning && (
          <div className="p-6 border-b">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">
                  Switching to {selectedConfig?.name}...
                </span>
              </div>
              <Progress value={transitionProgress} className="w-full" />
              <p className="text-xs text-gray-600">
                Migrating your portfolio data and customizations
              </p>
            </div>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          {/* Template Selection Panel */}
          <div className={cn(
            'border-r bg-gray-50 overflow-y-auto transition-all duration-300',
            isTrialMode ? 'w-0 opacity-0' : 'w-1/3'
          )}>
            <div className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Current Template</h3>
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-sm font-bold">
                        {currentTemplate}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{currentConfig.name}</p>
                        <p className="text-xs text-gray-600 capitalize">{currentConfig.category}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Available Templates</h3>
                <div className="space-y-2">
                  {availableTemplates.map((templateType) => {
                    const config = getTemplateConfig(templateType);
                    if (!config) return null;

                    return (
                      <Card
                        key={templateType}
                        className={cn(
                          'cursor-pointer transition-all duration-200 hover:shadow-md',
                          selectedTemplate === templateType && 'ring-2 ring-blue-500 ring-offset-2'
                        )}
                        onClick={() => handleTemplateSelect(templateType)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center text-white text-sm font-bold">
                                {templateType}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{config.name}</p>
                                <p className="text-xs text-gray-600 capitalize">{config.category}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTryTemplate(templateType);
                                }}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              {selectedTemplate === templateType && (
                                <Check className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Preview Controls */}
            <div className="border-b p-4 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  {isTrialMode ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Trial Mode</Badge>
                      <span className="text-sm text-gray-600">
                        Previewing {selectedConfig?.name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {selectedTemplate ? `Comparing with ${selectedConfig?.name}` : 'Select a template to preview'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isTrialMode && (
                    <Button size="sm" variant="outline" onClick={handleCancelTrial}>
                      <X className="h-3 w-3 mr-1" />
                      End Trial
                    </Button>
                  )}
                  
                  {!isTrialMode && (
                    <Tabs value={previewMode} onValueChange={(value) => setPreviewMode(value as any)}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="side-by-side" className="text-xs">Side by Side</TabsTrigger>
                        <TabsTrigger value="overlay" className="text-xs">Overlay</TabsTrigger>
                        <TabsTrigger value="fullscreen" className="text-xs">Fullscreen</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-hidden">
              {selectedTemplate && (
                <div className="h-full">
                  {isTrialMode ? (
                    <TemplateTransition
                      fromTemplate={currentTemplate}
                      toTemplate={selectedTemplate}
                      portfolioData={portfolioData}
                      customizations={customizations}
                      mode="preview"
                      onComplete={() => {}}
                    />
                  ) : (
                    <TemplateComparison
                      currentTemplate={currentTemplate}
                      selectedTemplate={selectedTemplate}
                      portfolioData={portfolioData}
                      customizations={customizations}
                      mode={previewMode}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Compatibility Check & Actions */}
        {selectedTemplate && !isTrialMode && (
          <div className="border-t p-4 bg-gray-50">
            <div className="space-y-4">
              <CompatibilityChecker
                fromTemplate={currentTemplate}
                toTemplate={selectedTemplate}
                portfolioData={portfolioData}
                customizations={customizations}
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleTryTemplate(selectedTemplate)}
                    disabled={isTransitioning}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Try This Template
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={isTransitioning}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmSwitch}
                    disabled={isTransitioning}
                  >
                    {isTransitioning ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Switching...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Switch Template
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Template Comparison Component
interface TemplateComparisonProps {
  currentTemplate: TemplateType;
  selectedTemplate: TemplateType;
  portfolioData: PortfolioData;
  customizations?: TemplateCustomizations;
  mode: 'side-by-side' | 'overlay' | 'fullscreen';
}

function TemplateComparison({
  currentTemplate,
  selectedTemplate,
  portfolioData,
  customizations,
  mode
}: TemplateComparisonProps) {
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);

  if (mode === 'side-by-side') {
    return (
      <div className="grid grid-cols-2 gap-4 h-full p-4">
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Current Template</div>
          <div className="border rounded-lg overflow-hidden h-full">
            <TemplatePreview
              templateType={currentTemplate}
              showControls={false}
              className="h-full"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">New Template</div>
          <div className="border rounded-lg overflow-hidden h-full">
            <TemplatePreview
              templateType={selectedTemplate}
              showControls={false}
              className="h-full"
            />
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'overlay') {
    return (
      <div className="relative h-full">
        <div className="absolute inset-0">
          <TemplatePreview
            templateType={currentTemplate}
            showControls={false}
            className="h-full"
          />
        </div>
        
        <div 
          className="absolute inset-0 transition-opacity duration-300"
          style={{ opacity: overlayOpacity }}
        >
          <TemplatePreview
            templateType={selectedTemplate}
            showControls={false}
            className="h-full"
          />
        </div>
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2">
          <div className="flex items-center gap-2 text-xs">
            <span>Current</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
              className="w-20"
            />
            <span>New</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <TemplatePreview
        templateType={selectedTemplate}
        showControls={false}
        className="h-full"
      />
    </div>
  );
}