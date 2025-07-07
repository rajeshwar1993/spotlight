'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TemplateRenderer } from '@/components/templates/template-renderer';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  ExternalLink, 
  RefreshCcw,
  Eye
} from 'lucide-react';
import type { PortfolioData } from '@/lib/templates/types';
import { TemplateType } from '@/types';

type PreviewMode = 'desktop' | 'tablet' | 'mobile';

interface PreviewContainerProps {
  portfolioData: PortfolioData;
  shareableLink?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export function PreviewContainer({
  portfolioData,
  shareableLink,
  onRefresh,
  isRefreshing = false,
  className = ''
}: PreviewContainerProps) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');

  const getPreviewModeIcon = (mode: PreviewMode) => {
    switch (mode) {
      case 'desktop':
        return <Monitor className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
    }
  };

  const getPreviewModeClass = (mode: PreviewMode) => {
    switch (mode) {
      case 'desktop':
        return 'w-full max-w-none';
      case 'tablet':
        return 'w-full max-w-3xl mx-auto';
      case 'mobile':
        return 'w-full max-w-sm mx-auto';
    }
  };

  const getContainerScale = (mode: PreviewMode) => {
    switch (mode) {
      case 'desktop':
        return 'scale-100';
      case 'tablet':
        return 'scale-90';
      case 'mobile':
        return 'scale-75';
    }
  };

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      {/* Preview Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Eye className="h-4 w-4" />
            <span>Real-time</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Preview Mode Toggle */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {(['desktop', 'tablet', 'mobile'] as PreviewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setPreviewMode(mode)}
                className={`flex items-center space-x-1 px-2 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  previewMode === mode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} preview`}
              >
                {getPreviewModeIcon(mode)}
                <span className="hidden sm:inline capitalize">{mode}</span>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                title="Refresh preview"
              >
                <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
            
            {shareableLink && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(shareableLink, '_blank')}
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className={`transition-all duration-300 ${getPreviewModeClass(previewMode)}`}>
          {/* Browser Chrome */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="bg-white rounded-md px-3 py-1.5 text-sm text-gray-600 font-mono border min-w-0 flex-1 max-w-md">
                  <span className="truncate">
                    {shareableLink || `mypage/${portfolioData.portfolio.slug}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Template Preview */}
            <div className={`overflow-hidden transition-transform duration-300 ${getContainerScale(previewMode)}`}>
              <div className="bg-white">
                <TemplateRenderer
                  templateType={portfolioData.portfolio.template as TemplateType}
                  data={portfolioData}
                  isPreview={true}
                  isEditing={true}
                  className="min-h-[600px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Info */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Template: {portfolioData.portfolio.template}</span>
            <span>Mode: {previewMode}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Status: {portfolioData.portfolio.status}</span>
            <span>Auto-updating</span>
          </div>
        </div>
      </div>
    </div>
  );
}