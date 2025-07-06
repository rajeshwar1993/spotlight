'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { TemplateType } from '@/types';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Palette,
  Type,
  Layout,
  Eye,
  RotateCcw,
  Save,
  Download,
  Upload,
  Settings,
  Wand2
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getTemplateConfig } from '@/lib/templates/registry';
import { ColorCustomizer } from './color-customizer';
import { FontCustomizer } from './font-customizer';
import { LayoutCustomizer } from './layout-customizer';
import { CustomizationPreview } from './customization-preview';
import type { PortfolioData, TemplateCustomizations } from '@/lib/templates/types';

interface TemplateCustomizerProps {
  templateType: TemplateType;
  portfolioData: PortfolioData;
  initialCustomizations?: TemplateCustomizations;
  onCustomizationsChange: (customizations: TemplateCustomizations) => void;
  onSave?: (customizations: TemplateCustomizations) => void;
  className?: string;
}

export function TemplateCustomizer({
  templateType,
  portfolioData,
  initialCustomizations,
  onCustomizationsChange,
  onSave,
  className
}: TemplateCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'colors' | 'fonts' | 'layout'>('colors');
  const [customizations, setCustomizations] = useState<TemplateCustomizations>(
    initialCustomizations || {}
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const templateConfig = getTemplateConfig(templateType);
  
  if (!templateConfig) {
    return null;
  }

  const supportedCustomizations = templateConfig.customization_options;

  const handleCustomizationChange = useCallback((
    type: keyof TemplateCustomizations,
    value: any
  ) => {
    const newCustomizations = {
      ...customizations,
      [type]: value
    };
    
    setCustomizations(newCustomizations);
    setHasUnsavedChanges(true);
    onCustomizationsChange(newCustomizations);
  }, [customizations, onCustomizationsChange]);

  const handleReset = useCallback(() => {
    const resetCustomizations = initialCustomizations || {};
    setCustomizations(resetCustomizations);
    setHasUnsavedChanges(false);
    onCustomizationsChange(resetCustomizations);
  }, [initialCustomizations, onCustomizationsChange]);

  const handleSave = useCallback(() => {
    onSave?.(customizations);
    setHasUnsavedChanges(false);
  }, [customizations, onSave]);

  const handleExport = useCallback(() => {
    const exportData = {
      templateType,
      customizations,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateType}-customizations.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [templateType, customizations]);

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        if (importData.customizations) {
          setCustomizations(importData.customizations);
          setHasUnsavedChanges(true);
          onCustomizationsChange(importData.customizations);
        }
      } catch (error) {
        console.error('Failed to import customizations:', error);
      }
    };
    reader.readAsText(file);
  }, [onCustomizationsChange]);

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'colors': return <Palette className="h-4 w-4" />;
      case 'fonts': return <Type className="h-4 w-4" />;
      case 'layout': return <Layout className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'colors': 
        return Object.keys(customizations.colors || {}).length;
      case 'fonts':
        return Object.keys(customizations.fonts || {}).length;
      case 'layout':
        return Object.keys(customizations.layout || {}).length;
      default:
        return 0;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={cn('gap-2', className)}>
          <Wand2 className="h-4 w-4" />
          Customize Template
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
              •
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Customize {templateConfig.name}
              </DialogTitle>
              <Badge variant="secondary" className="capitalize">
                {templateConfig.category}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Preview Mode Toggle */}
              <div className="flex items-center gap-1 border rounded-lg p-1">
                {(['desktop', 'tablet', 'mobile'] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={previewMode === mode ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewMode(mode)}
                    className="text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    {mode}
                  </Button>
                ))}
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-1">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                  id="import-customizations"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('import-customizations')?.click()}
                >
                  <Upload className="h-3 w-3" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                >
                  <Download className="h-3 w-3" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={!hasUnsavedChanges}
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
                
                {onSave && (
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={!hasUnsavedChanges}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Customization Panel */}
          <div className="w-80 border-r bg-gray-50 flex flex-col">
            <div className="p-4 border-b bg-white">
              <h3 className="font-semibold text-gray-900 mb-2">Customization Options</h3>
              
              {/* Customization Status */}
              <div className="space-y-2">
                {!supportedCustomizations.colors && !supportedCustomizations.fonts && !supportedCustomizations.layout && (
                  <Alert>
                    <AlertDescription className="text-xs">
                      This template has limited customization options.
                    </AlertDescription>
                  </Alert>
                )}
                
                {hasUnsavedChanges && (
                  <Alert>
                    <AlertDescription className="text-xs">
                      You have unsaved changes.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
                {supportedCustomizations.colors && (
                  <TabsTrigger value="colors" className="text-xs" disabled={!supportedCustomizations.colors}>
                    <div className="flex items-center gap-1">
                      {getTabIcon('colors')}
                      Colors
                      {getTabCount('colors') > 0 && (
                        <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                          {getTabCount('colors')}
                        </Badge>
                      )}
                    </div>
                  </TabsTrigger>
                )}
                
                {supportedCustomizations.fonts && (
                  <TabsTrigger value="fonts" className="text-xs" disabled={!supportedCustomizations.fonts}>
                    <div className="flex items-center gap-1">
                      {getTabIcon('fonts')}
                      Fonts
                      {getTabCount('fonts') > 0 && (
                        <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                          {getTabCount('fonts')}
                        </Badge>
                      )}
                    </div>
                  </TabsTrigger>
                )}
                
                {supportedCustomizations.layout && (
                  <TabsTrigger value="layout" className="text-xs" disabled={!supportedCustomizations.layout}>
                    <div className="flex items-center gap-1">
                      {getTabIcon('layout')}
                      Layout
                      {getTabCount('layout') > 0 && (
                        <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                          {getTabCount('layout')}
                        </Badge>
                      )}
                    </div>
                  </TabsTrigger>
                )}
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  {supportedCustomizations.colors && (
                    <TabsContent value="colors" className="p-4 mt-0">
                      <ColorCustomizer
                        templateType={templateType}
                        currentColors={customizations.colors}
                        onColorsChange={(colors) => handleCustomizationChange('colors', colors)}
                      />
                    </TabsContent>
                  )}

                  {supportedCustomizations.fonts && (
                    <TabsContent value="fonts" className="p-4 mt-0">
                      <FontCustomizer
                        templateType={templateType}
                        currentFonts={customizations.fonts}
                        onFontsChange={(fonts) => handleCustomizationChange('fonts', fonts)}
                      />
                    </TabsContent>
                  )}

                  {supportedCustomizations.layout && (
                    <TabsContent value="layout" className="p-4 mt-0">
                      <LayoutCustomizer
                        templateType={templateType}
                        currentLayout={customizations.layout}
                        onLayoutChange={(layout) => handleCustomizationChange('layout', layout)}
                      />
                    </TabsContent>
                  )}
                </ScrollArea>
              </div>
            </Tabs>
          </div>

          {/* Preview Panel */}
          <div className="flex-1 bg-white">
            <CustomizationPreview
              templateType={templateType}
              portfolioData={portfolioData}
              customizations={customizations}
              previewMode={previewMode}
            />
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              {hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Close
              </Button>
              {onSave && hasUnsavedChanges && (
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Preset management utilities
export const customizationPresets = {
  // Professional presets
  professional: {
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#3b82f6',
      background: '#ffffff',
      text: '#1e293b'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
      accent: 'Inter'
    }
  },
  
  // Creative presets
  creative: {
    colors: {
      primary: '#7c3aed',
      secondary: '#ec4899',
      accent: '#f59e0b',
      background: '#fef7ff',
      text: '#581c87'
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Source Sans Pro',
      accent: 'Playfair Display'
    }
  },
  
  // Minimal presets
  minimal: {
    colors: {
      primary: '#000000',
      secondary: '#6b7280',
      accent: '#374151',
      background: '#ffffff',
      text: '#111827'
    },
    fonts: {
      heading: 'Space Grotesk',
      body: 'Inter',
      accent: 'Space Grotesk'
    }
  },
  
  // Bold presets
  bold: {
    colors: {
      primary: '#dc2626',
      secondary: '#ea580c',
      accent: '#f59e0b',
      background: '#fef2f2',
      text: '#7f1d1d'
    },
    fonts: {
      heading: 'Oswald',
      body: 'Open Sans',
      accent: 'Oswald'
    }
  }
};

// Export utilities for managing customizations
export const customizationUtils = {
  validateCustomizations: (customizations: TemplateCustomizations): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];

    // Validate colors
    if (customizations.colors) {
      Object.entries(customizations.colors).forEach(([key, value]) => {
        if (typeof value !== 'string' || !value.match(/^#[0-9A-F]{6}$/i)) {
          errors.push(`Invalid color value for ${key}`);
        }
      });
    }

    // Validate fonts
    if (customizations.fonts) {
      Object.entries(customizations.fonts).forEach(([key, value]) => {
        if (typeof value !== 'string' || value.trim() === '') {
          errors.push(`Invalid font value for ${key}`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  generateCSSVariables: (customizations: TemplateCustomizations): Record<string, string> => {
    const cssVars: Record<string, string> = {};

    // Generate color variables
    if (customizations.colors) {
      Object.entries(customizations.colors).forEach(([key, value]) => {
        cssVars[`--template-color-${key}`] = value;
      });
    }

    // Generate font variables
    if (customizations.fonts) {
      Object.entries(customizations.fonts).forEach(([key, value]) => {
        cssVars[`--template-font-${key}`] = value;
      });
    }

    return cssVars;
  },

  applyCustomizations: (element: HTMLElement, customizations: TemplateCustomizations) => {
    const cssVars = customizationUtils.generateCSSVariables(customizations);
    Object.entries(cssVars).forEach(([property, value]) => {
      element.style.setProperty(property, value);
    });
  }
};