'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { TemplateConfig } from '@/lib/templates/types';

interface TemplateWrapperProps {
  templateConfig: TemplateConfig;
  isPreview?: boolean;
  isEditing?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function TemplateWrapper({
  templateConfig,
  isPreview = false,
  isEditing = false,
  className,
  children
}: TemplateWrapperProps) {
  // Generate CSS custom properties for template colors and fonts
  const cssVariables = {
    '--template-primary': templateConfig.color_scheme.primary,
    '--template-secondary': templateConfig.color_scheme.secondary,
    '--template-accent': templateConfig.color_scheme.accent,
    '--template-background': templateConfig.color_scheme.background,
    '--template-text': templateConfig.color_scheme.text,
    '--template-font-heading': templateConfig.typography.heading,
    '--template-font-body': templateConfig.typography.body,
    '--template-font-accent': templateConfig.typography.accent,
  } as React.CSSProperties;

  // Base classes for all templates
  const baseClasses = cn(
    'template-wrapper',
    'w-full',
    'min-h-screen',
    'relative',
    'overflow-hidden',
    // Template-specific classes
    `template-${templateConfig.id.toLowerCase()}`,
    `template-category-${templateConfig.category}`,
    // Conditional classes
    {
      'template-preview': isPreview,
      'template-editing': isEditing,
      'template-production': !isPreview && !isEditing,
    },
    className
  );

  // Wrapper attributes for accessibility and SEO
  const wrapperProps = {
    'data-template': templateConfig.id,
    'data-template-name': templateConfig.name,
    'data-template-category': templateConfig.category,
    'data-preview': isPreview,
    'data-editing': isEditing,
  };

  return (
    <div
      className={baseClasses}
      style={cssVariables}
      {...wrapperProps}
    >
      {/* Template-specific background elements */}
      <TemplateBackground templateConfig={templateConfig} />
      
      {/* Main template content */}
      <div className="template-content relative z-10">
        {children}
      </div>
      
      {/* Template overlay for editing mode */}
      {isEditing && <TemplateEditingOverlay />}
      
      {/* Preview watermark */}
      {isPreview && <TemplatePreviewWatermark />}
    </div>
  );
}

// Background component for template-specific effects
function TemplateBackground({ templateConfig }: { templateConfig: TemplateConfig }) {
  const backgroundStyles = {
    backgroundColor: templateConfig.color_scheme.background,
  };

  // Template-specific background patterns
  const renderBackgroundPattern = () => {
    switch (templateConfig.id) {
      case 'T1':
        return (
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent" />
          </div>
        );
      
      case 'T2':
        return (
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-current to-transparent" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-current to-transparent" />
          </div>
        );
      
      case 'T3':
        return (
          <div className="absolute inset-0 opacity-3">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-transparent to-gray-50" />
          </div>
        );
      
      case 'T4':
        return (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 blur-3xl" />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
      className="template-background absolute inset-0 z-0"
      style={backgroundStyles}
    >
      {renderBackgroundPattern()}
    </div>
  );
}

// Editing overlay for template modification
function TemplateEditingOverlay() {
  return (
    <div className="template-editing-overlay absolute inset-0 z-50 pointer-events-none">
      {/* Grid overlay for alignment */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-12 gap-4 h-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border-l border-blue-300 border-dashed" />
          ))}
        </div>
      </div>
      
      {/* Corner indicators */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-blue-500" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-blue-500" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-blue-500" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-blue-500" />
    </div>
  );
}

// Preview watermark
function TemplatePreviewWatermark() {
  return (
    <div className="template-preview-watermark absolute top-4 right-4 z-50 pointer-events-none">
      <div className="bg-black/10 backdrop-blur-sm px-3 py-1 rounded-full">
        <span className="text-xs font-medium text-gray-600">Preview</span>
      </div>
    </div>
  );
}

// Template-specific utility classes (to be included in global CSS)
export const TEMPLATE_CSS_VARIABLES = `
  .template-wrapper {
    /* Template color scheme variables */
    --template-primary: #2D3748;
    --template-secondary: #4A5568;
    --template-accent: #805AD5;
    --template-background: #FFFFFF;
    --template-text: #1A202C;
    
    /* Template typography variables */
    --template-font-heading: 'Playfair Display', serif;
    --template-font-body: 'Inter', sans-serif;
    --template-font-accent: 'Inter', sans-serif;
    
    /* Template spacing variables */
    --template-section-spacing: 4rem;
    --template-content-max-width: 1200px;
    --template-grid-gap: 2rem;
  }

  /* Template-specific styles */
  .template-t1 {
    font-family: var(--template-font-body);
    color: var(--template-text);
    background-color: var(--template-background);
  }

  .template-t1 h1, .template-t1 h2, .template-t1 h3 {
    font-family: var(--template-font-heading);
    color: var(--template-primary);
  }

  .template-t2 {
    font-family: var(--template-font-body);
    color: var(--template-text);
    background-color: var(--template-background);
  }

  .template-t2 h1, .template-t2 h2, .template-t2 h3 {
    font-family: var(--template-font-heading);
    font-weight: 700;
  }

  .template-t3 {
    font-family: var(--template-font-body);
    color: var(--template-text);
    background-color: var(--template-background);
    line-height: 1.7;
  }

  .template-t3 h1, .template-t3 h2, .template-t3 h3 {
    font-family: var(--template-font-heading);
    font-weight: 400;
    letter-spacing: -0.025em;
  }

  .template-t4 {
    font-family: var(--template-font-body);
    color: var(--template-text);
    background-color: var(--template-background);
  }

  .template-t4 h1, .template-t4 h2, .template-t4 h3 {
    font-family: var(--template-font-heading);
    background: linear-gradient(135deg, var(--template-accent), var(--template-secondary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Responsive template adjustments */
  @media (max-width: 768px) {
    .template-wrapper {
      --template-section-spacing: 2rem;
      --template-grid-gap: 1rem;
    }
  }

  /* Print styles */
  @media print {
    .template-wrapper {
      background: white !important;
      color: black !important;
    }
    
    .template-preview-watermark,
    .template-editing-overlay {
      display: none !important;
    }
  }
`;