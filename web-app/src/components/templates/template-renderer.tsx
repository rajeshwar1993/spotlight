'use client';

import React, { Suspense, useMemo } from 'react';
import { TemplateType } from '@/types';
import type { TemplateProps, PortfolioData } from '@/lib/templates/types';
import { getTemplateComponent, getTemplateConfig, validateTemplateData } from '@/lib/templates/registry-simple';
import { TemplateWrapper } from './template-wrapper';
import { TemplateLoadingSkeleton } from './template-loading';
import { TemplateErrorBoundary } from './template-error-boundary';

interface TemplateRendererProps {
  templateType: TemplateType;
  data: PortfolioData;
  isPreview?: boolean;
  isEditing?: boolean;
  className?: string;
  onSectionClick?: (sectionId: string) => void;
  showValidationErrors?: boolean;
}

export function TemplateRenderer({
  templateType,
  data,
  isPreview = false,
  isEditing = false,
  className,
  onSectionClick,
  showValidationErrors = false
}: TemplateRendererProps) {
  // Get template configuration and component
  const templateConfig = useMemo(() => getTemplateConfig(templateType), [templateType]);
  const TemplateComponent = useMemo(() => getTemplateComponent(templateType), [templateType]);

  // Validate template data
  const validation = useMemo(() => {
    if (showValidationErrors) {
      return validateTemplateData(templateType, data);
    }
    return { isValid: true, errors: [], warnings: [] };
  }, [templateType, data, showValidationErrors]);

  // Handle missing template
  if (!templateConfig || !TemplateComponent) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-6xl mb-4">🎭</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Template Not Found
          </h3>
          <p className="text-gray-600">
            The template "{templateType}" could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  // Handle validation errors
  if (!validation.isValid && showValidationErrors) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="text-2xl mr-3">⚠️</div>
          <h3 className="text-lg font-semibold text-red-900">
            Template Validation Errors
          </h3>
        </div>
        <div className="space-y-2">
          {validation.errors.map((error, index) => (
            <p key={index} className="text-red-700 text-sm">
              • {error}
            </p>
          ))}
        </div>
        {validation.warnings.length > 0 && (
          <div className="mt-4 pt-4 border-t border-red-200">
            <h4 className="font-medium text-red-900 mb-2">Warnings:</h4>
            {validation.warnings.map((warning, index) => (
              <p key={index} className="text-red-600 text-sm">
                • {warning}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Template component props
  const templateProps: TemplateProps = {
    data,
    isPreview,
    isEditing,
    className,
    onSectionClick
  };

  return (
    <TemplateErrorBoundary templateType={templateType}>
      <TemplateWrapper
        templateConfig={templateConfig}
        isPreview={isPreview}
        isEditing={isEditing}
        className={className}
      >
        <Suspense fallback={<TemplateLoadingSkeleton templateType={templateType} />}>
          <TemplateComponent {...templateProps} />
        </Suspense>
        
        {/* Validation warnings (non-blocking) */}
        {validation.warnings.length > 0 && isEditing && (
          <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-sm shadow-lg z-50">
            <div className="flex items-center mb-2">
              <div className="text-lg mr-2">⚠️</div>
              <h4 className="font-medium text-yellow-900">Template Warnings</h4>
            </div>
            <div className="space-y-1">
              {validation.warnings.map((warning, index) => (
                <p key={index} className="text-yellow-700 text-xs">
                  {warning}
                </p>
              ))}
            </div>
          </div>
        )}
      </TemplateWrapper>
    </TemplateErrorBoundary>
  );
}

// Additional renderer variants for specific use cases
export function TemplatePreviewRenderer({
  templateType,
  data,
  className,
  showMetadata = false
}: {
  templateType: TemplateType;
  data: PortfolioData;
  className?: string;
  showMetadata?: boolean;
}) {
  const templateConfig = getTemplateConfig(templateType);

  return (
    <div className={className}>
      {showMetadata && templateConfig && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">{templateConfig.name}</h4>
              <p className="text-sm text-gray-600">{templateConfig.description}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {templateConfig.category}
              </span>
            </div>
          </div>
        </div>
      )}
      
      <TemplateRenderer
        templateType={templateType}
        data={data}
        isPreview={true}
        className="transform scale-95 origin-top"
      />
    </div>
  );
}

// Mobile-optimized renderer
export function MobileTemplateRenderer({
  templateType,
  data,
  className
}: {
  templateType: TemplateType;
  data: PortfolioData;
  className?: string;
}) {
  return (
    <div className={`max-w-sm mx-auto ${className}`}>
      <TemplateRenderer
        templateType={templateType}
        data={data}
        isPreview={true}
        className="scale-90 origin-top"
      />
    </div>
  );
}

export default TemplateRenderer;