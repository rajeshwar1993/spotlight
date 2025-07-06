'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { TemplateType } from '@/types';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  Maximize,
  Minimize,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TemplatePreview } from '../../template-preview';
import { customizationUtils } from './template-customizer';
import type { PortfolioData, TemplateCustomizations } from '@/lib/templates/types';

interface CustomizationPreviewProps {
  templateType: TemplateType;
  portfolioData: PortfolioData;
  customizations: TemplateCustomizations;
  previewMode?: 'desktop' | 'tablet' | 'mobile';
  className?: string;
}

export function CustomizationPreview({
  templateType,
  portfolioData,
  customizations,
  previewMode = 'desktop',
  className
}: CustomizationPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCustomizations, setShowCustomizations] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setPreviewKey(prev => prev + 1);
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const handleFullscreenToggle = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const getPreviewDimensions = useCallback(() => {
    switch (previewMode) {
      case 'mobile':
        return { width: '375px', height: '812px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      case 'desktop':
      default:
        return { width: '100%', height: '100%' };
    }
  }, [previewMode]);

  const cssVariables = customizationUtils.generateCSSVariables(customizations);

  useEffect(() => {
    // Apply customizations to preview container
    const previewContainer = document.getElementById(`preview-${templateType}-${previewKey}`);
    if (previewContainer) {
      customizationUtils.applyCustomizations(previewContainer, customizations);
    }
  }, [customizations, templateType, previewKey]);

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="w-full h-full bg-white relative">
          {/* Fullscreen Controls */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={cn('h-3 w-3', isLoading && 'animate-spin')} />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleFullscreenToggle}
            >
              <Minimize className="h-3 w-3" />
            </Button>
          </div>

          <div 
            id={`preview-${templateType}-${previewKey}`}
            className="w-full h-full"
            style={cssVariables}
          >
            <TemplatePreview
              key={previewKey}
              templateType={templateType}
              showControls={false}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* Preview Header */}
      <div className="border-b p-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">Live Preview</h3>
            <Badge variant="outline" className="capitalize">
              {previewMode}
            </Badge>
            {Object.keys(customizations).length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {Object.keys(customizations).length} customizations
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Customization Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCustomizations(prev => !prev)}
            >
              {showCustomizations ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
            </Button>

            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={cn('h-3 w-3', isLoading && 'animate-spin')} />
            </Button>

            {/* Fullscreen */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleFullscreenToggle}
            >
              <Maximize className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Customization Summary */}
      {showCustomizations && Object.keys(customizations).length > 0 && (
        <div className="border-b p-3 bg-gray-50">
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700">Active Customizations:</p>
            <div className="flex flex-wrap gap-1">
              {customizations.colors && (
                <Badge variant="outline" className="text-xs">
                  Colors ({Object.keys(customizations.colors).length})
                </Badge>
              )}
              {customizations.fonts && (
                <Badge variant="outline" className="text-xs">
                  Fonts ({Object.keys(customizations.fonts).length})
                </Badge>
              )}
              {customizations.layout && (
                <Badge variant="outline" className="text-xs">
                  Layout ({Object.keys(customizations.layout).length})
                </Badge>
              )}
              {customizations.animations && (
                <Badge variant="outline" className="text-xs">
                  Animations
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview Content */}
      <div className="flex-1 overflow-hidden bg-gray-100 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm text-gray-600">Updating preview...</span>
            </div>
          </div>
        )}

        <div className="h-full flex items-center justify-center p-4">
          <div
            className={cn(
              'bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300',
              previewMode === 'mobile' && 'w-96 h-[600px]',
              previewMode === 'tablet' && 'w-[600px] h-[800px]',
              previewMode === 'desktop' && 'w-full h-full max-w-none'
            )}
            style={previewMode !== 'desktop' ? getPreviewDimensions() : undefined}
          >
            <div 
              id={`preview-${templateType}-${previewKey}`}
              className="w-full h-full"
              style={cssVariables}
            >
              <TemplatePreview
                key={previewKey}
                templateType={templateType}
                showControls={false}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* Device Frame (for mobile/tablet) */}
        {previewMode !== 'desktop' && (
          <div className="absolute bottom-4 left-4">
            <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1 shadow-md text-xs">
              {previewMode === 'mobile' && <Smartphone className="h-3 w-3" />}
              {previewMode === 'tablet' && <Tablet className="h-3 w-3" />}
              <span className="capitalize">{previewMode} View</span>
              <span className="text-gray-500">
                {getPreviewDimensions().width} × {getPreviewDimensions().height}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Preview Footer */}
      <div className="border-t p-3 bg-white">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-4">
            <span>Template: {templateType}</span>
            {Object.keys(customizations).length > 0 && (
              <span>• Customizations applied</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Performance Indicator */}
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Optimized</span>
            </div>
          </div>
        </div>
      </div>

      {/* No Customizations State */}
      {Object.keys(customizations).length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6 text-center">
              <div className="space-y-3">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <Eye className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Preview Your Customizations</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Start customizing colors, fonts, or layout to see live changes here.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Performance optimization component for preview updates
export function OptimizedCustomizationPreview({
  templateType,
  portfolioData,
  customizations,
  previewMode = 'desktop',
  className
}: CustomizationPreviewProps) {
  const [debouncedCustomizations, setDebouncedCustomizations] = useState(customizations);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCustomizations(customizations);
    }, 300); // Debounce updates to prevent excessive re-renders

    return () => clearTimeout(timer);
  }, [customizations]);

  return (
    <CustomizationPreview
      templateType={templateType}
      portfolioData={portfolioData}
      customizations={debouncedCustomizations}
      previewMode={previewMode}
      className={className}
    />
  );
}

// Preview comparison component for before/after views
export function CustomizationComparison({
  templateType,
  portfolioData,
  originalCustomizations = {},
  newCustomizations,
  className
}: {
  templateType: TemplateType;
  portfolioData: PortfolioData;
  originalCustomizations?: TemplateCustomizations;
  newCustomizations: TemplateCustomizations;
  className?: string;
}) {
  return (
    <div className={cn('grid grid-cols-2 gap-4 h-full', className)}>
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Before</h4>
        <div className="border rounded-lg overflow-hidden h-full">
          <CustomizationPreview
            templateType={templateType}
            portfolioData={portfolioData}
            customizations={originalCustomizations}
            previewMode="desktop"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">After</h4>
        <div className="border rounded-lg overflow-hidden h-full">
          <CustomizationPreview
            templateType={templateType}
            portfolioData={portfolioData}
            customizations={newCustomizations}
            previewMode="desktop"
          />
        </div>
      </div>
    </div>
  );
}