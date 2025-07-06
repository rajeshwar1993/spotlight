'use client';

import React, { useState, useMemo } from 'react';
import { TemplateType } from '@/types';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplateRenderer } from './template-renderer';
import { getTemplateConfig, getTemplatePreview } from '@/lib/templates/registry-simple';
import { getSamplePortfolioData } from '@/lib/templates/preview-data';

interface TemplatePreviewProps {
  templateType: TemplateType;
  className?: string;
  showControls?: boolean;
  showMetadata?: boolean;
  onSelect?: (templateType: TemplateType) => void;
  selected?: boolean;
}

export function TemplatePreview({
  templateType,
  className,
  showControls = true,
  showMetadata = true,
  onSelect,
  selected = false
}: TemplatePreviewProps) {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const templateConfig = useMemo(() => getTemplateConfig(templateType), [templateType]);
  const previewData = useMemo(() => getTemplatePreview(templateType), [templateType]);
  const sampleData = useMemo(() => getSamplePortfolioData(templateType), [templateType]);

  if (!templateConfig || !previewData || !sampleData) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-500">Template preview not available</p>
        </CardContent>
      </Card>
    );
  }

  const previewSizes = {
    desktop: 'w-full',
    tablet: 'w-[768px] mx-auto',
    mobile: 'w-[375px] mx-auto'
  };

  const previewScales = {
    desktop: 'scale-100',
    tablet: 'scale-75',
    mobile: 'scale-50'
  };

  return (
    <Card className={cn(
      'w-full transition-all duration-200',
      selected && 'ring-2 ring-blue-500 ring-offset-2',
      onSelect && 'cursor-pointer hover:shadow-lg',
      className
    )}>
      {/* Template Metadata */}
      {showMetadata && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                {templateConfig.name}
                <Badge variant="secondary" className="capitalize">
                  {templateConfig.category}
                </Badge>
              </CardTitle>
              <CardDescription className="mt-2">
                {templateConfig.description}
              </CardDescription>
            </div>
            
            {onSelect && (
              <Button
                onClick={() => onSelect(templateType)}
                variant={selected ? "default" : "outline"}
                className="ml-4"
              >
                {selected ? 'Selected' : 'Select'}
              </Button>
            )}
          </div>

          {/* Template Features */}
          <div className="flex flex-wrap gap-2 mt-4">
            {templateConfig.features.slice(0, 4).map((feature) => (
              <Badge key={feature.id} variant="outline" className="text-xs">
                {feature.name}
              </Badge>
            ))}
            {templateConfig.features.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{templateConfig.features.length - 4} more
              </Badge>
            )}
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0">
        {/* Preview Controls */}
        {showControls && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              {/* Device Preview Tabs */}
              <Tabs value={previewMode} onValueChange={(value) => setPreviewMode(value as any)}>
                <TabsList className="grid w-fit grid-cols-3">
                  <TabsTrigger value="desktop" className="text-xs">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                    </svg>
                    Desktop
                  </TabsTrigger>
                  <TabsTrigger value="tablet" className="text-xs">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm4 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    Tablet
                  </TabsTrigger>
                  <TabsTrigger value="mobile" className="text-xs">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    Mobile
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Preview Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="text-xs"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Fullscreen
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Container */}
        <div className={cn(
          'relative overflow-hidden bg-white',
          isFullscreen ? 'fixed inset-0 z-50' : 'max-h-[600px]'
        )}>
          {isFullscreen && (
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsFullscreen(false)}
              >
                ✕ Close
              </Button>
            </div>
          )}

          <div className={cn(
            'transition-all duration-300 origin-top',
            previewSizes[previewMode],
            !isFullscreen && previewScales[previewMode]
          )}>
            <TemplateRenderer
              templateType={templateType}
              data={sampleData}
              isPreview={true}
              className="min-h-[1200px]"
            />
          </div>
        </div>

        {/* Preview Features */}
        {showMetadata && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Template Features:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              {previewData.interactive_features.map((feature: string, index: number) => (
                <div key={index} className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Template Selector Component
interface TemplateSelectorProps {
  templates?: TemplateType[];
  selectedTemplate?: TemplateType;
  onSelect: (templateType: TemplateType) => void;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function TemplateSelector({
  templates = ['T1', 'T2', 'T3', 'T4'],
  selectedTemplate,
  onSelect,
  className,
  columns = 2
}: TemplateSelectorProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn('grid gap-6', gridCols[columns], className)}>
      {templates.map((templateType) => (
        <TemplatePreview
          key={templateType}
          templateType={templateType}
          onSelect={onSelect}
          selected={selectedTemplate === templateType}
          showControls={false}
          showMetadata={true}
        />
      ))}
    </div>
  );
}

// Template Comparison Component
interface TemplateComparisonProps {
  templates: TemplateType[];
  className?: string;
}

export function TemplateComparison({ templates, className }: TemplateComparisonProps) {
  return (
    <div className={cn('space-y-8', className)}>
      {templates.map((templateType) => {
        const config = getTemplateConfig(templateType);
        if (!config) return null;

        return (
          <div key={templateType} className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Template Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {config.name}
                </h3>
                <p className="text-gray-600 mb-4">{config.description}</p>
                <Badge variant="secondary" className="capitalize">
                  {config.category}
                </Badge>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {config.features.map((feature) => (
                    <div key={feature.id} className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm text-gray-900">{feature.name}</p>
                        <p className="text-xs text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Best For:</h4>
                <p className="text-sm text-gray-600">
                  {config.category === 'professional' && 'Traditional industries, corporate headshots, formal presentations'}
                  {config.category === 'bold' && 'Creative industries, social media presence, dynamic portfolios'}
                  {config.category === 'minimal' && 'Artistic work, fashion, refined aesthetic preferences'}
                  {config.category === 'creative' && 'Art direction, experimental work, unique artistic vision'}
                </p>
              </div>
            </div>

            {/* Template Preview */}
            <div>
              <TemplatePreview
                templateType={templateType}
                showControls={true}
                showMetadata={false}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}