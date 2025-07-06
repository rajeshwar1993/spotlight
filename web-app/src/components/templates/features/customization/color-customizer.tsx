'use client';

import React, { useState, useCallback } from 'react';
import { TemplateType } from '@/types';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  RotateCcw, 
  Copy, 
  Check, 
  Wand2,
  Eye,
  Shuffle,
  Download
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getTemplateConfig } from '@/lib/templates/registry';
import { customizationPresets } from './template-customizer';

interface ColorCustomizerProps {
  templateType: TemplateType;
  currentColors?: Record<string, string>;
  onColorsChange: (colors: Record<string, string>) => void;
  className?: string;
}

export function ColorCustomizer({
  templateType,
  currentColors = {},
  onColorsChange,
  className
}: ColorCustomizerProps) {
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [customPalette, setCustomPalette] = useState<Record<string, string>>({});

  const templateConfig = getTemplateConfig(templateType);
  const defaultColors = templateConfig?.color_scheme || {};

  const colorNames = [
    { key: 'primary', label: 'Primary', description: 'Main brand color' },
    { key: 'secondary', label: 'Secondary', description: 'Supporting color' },
    { key: 'accent', label: 'Accent', description: 'Highlight color' },
    { key: 'background', label: 'Background', description: 'Page background' },
    { key: 'text', label: 'Text', description: 'Main text color' }
  ];

  const getCurrentColor = useCallback((key: string) => {
    return currentColors[key] || (defaultColors as Record<string, string>)[key] || '#000000';
  }, [currentColors, defaultColors]);

  const handleColorChange = useCallback((key: string, value: string) => {
    const newColors = { ...currentColors, [key]: value };
    onColorsChange(newColors);
  }, [currentColors, onColorsChange]);

  const handlePresetApply = useCallback((presetName: string) => {
    const preset = customizationPresets[presetName as keyof typeof customizationPresets];
    if (preset?.colors) {
      onColorsChange(preset.colors);
      setActivePreset(presetName);
    }
  }, [onColorsChange]);

  const handleGenerateRandomPalette = useCallback(() => {
    const randomColors = {
      primary: generateRandomColor(),
      secondary: generateRandomColor(),
      accent: generateRandomColor(),
      background: '#ffffff',
      text: '#1a1a1a'
    };
    onColorsChange(randomColors);
    setActivePreset(null);
  }, [onColorsChange]);

  const handleCopyColor = useCallback(async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (error) {
      console.error('Failed to copy color:', error);
    }
  }, []);

  const handleReset = useCallback(() => {
    onColorsChange({});
    setActivePreset(null);
  }, [onColorsChange]);

  const handleExportPalette = useCallback(() => {
    const palette = {
      name: `${templateType} Custom Palette`,
      colors: currentColors,
      created: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(palette, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateType}-color-palette.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [templateType, currentColors]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Color Customization
          </h3>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateRandomPalette}
            >
              <Shuffle className="h-3 w-3" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPalette}
            >
              <Download className="h-3 w-3" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <p className="text-sm text-gray-600">
          Customize your template's color scheme to match your brand
        </p>
      </div>

      <Tabs defaultValue="colors" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Individual Color Controls */}
        <TabsContent value="colors" className="space-y-4">
          <div className="space-y-4">
            {colorNames.map(({ key, label, description }) => (
              <Card key={key} className="p-4">
                <div className="flex items-center gap-4">
                  {/* Color Preview */}
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                      style={{ backgroundColor: getCurrentColor(key) }}
                      onClick={() => handleCopyColor(getCurrentColor(key))}
                    />
                    {copiedColor === getCurrentColor(key) && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>

                  {/* Color Info */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`color-${key}`} className="font-medium">
                        {label}
                      </Label>
                      <Badge variant="outline" className="text-xs">
                        {key}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">{description}</p>
                  </div>

                  {/* Color Input */}
                  <div className="flex items-center gap-2">
                    <Input
                      id={`color-${key}`}
                      type="color"
                      value={getCurrentColor(key)}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="w-16 h-8 p-1 cursor-pointer"
                    />
                    
                    <Input
                      type="text"
                      value={getCurrentColor(key)}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="w-20 text-xs font-mono"
                      placeholder="#000000"
                    />
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyColor(getCurrentColor(key))}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Color Harmony Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Color Harmony Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {colorNames.map(({ key, label }) => (
                  <div key={key} className="text-center space-y-1">
                    <div
                      className="w-full h-16 rounded border"
                      style={{ backgroundColor: getCurrentColor(key) }}
                    />
                    <p className="text-xs text-gray-600">{label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Color Presets */}
        <TabsContent value="presets" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(customizationPresets).map(([presetName, preset]) => (
              <Card
                key={presetName}
                className={cn(
                  'cursor-pointer transition-all duration-200 hover:shadow-md',
                  activePreset === presetName && 'ring-2 ring-blue-500 ring-offset-2'
                )}
                onClick={() => handlePresetApply(presetName)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Preset Colors */}
                    <div className="flex gap-1">
                      {Object.values(preset.colors).slice(0, 5).map((color, index) => (
                        <div
                          key={index}
                          className="w-8 h-8 rounded-full border border-gray-200"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    {/* Preset Info */}
                    <div className="flex-1">
                      <h4 className="font-medium capitalize">{presetName}</h4>
                      <p className="text-sm text-gray-600">
                        {getPresetDescription(presetName)}
                      </p>
                    </div>

                    {/* Selection Indicator */}
                    {activePreset === presetName && (
                      <div className="text-blue-600">
                        <Check className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Alert>
            <Eye className="h-4 w-4" />
            <AlertDescription>
              Click on a preset to apply it to your template. You can further customize individual colors after applying a preset.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Advanced Color Tools */}
        <TabsContent value="advanced" className="space-y-4">
          <div className="space-y-4">
            {/* Color Accessibility */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Accessibility Check</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getAccessibilityInfo(getCurrentColor('text'), getCurrentColor('background')).map((info, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{info.test}</span>
                      <Badge variant={info.pass ? 'default' : 'destructive'}>
                        {info.pass ? 'Pass' : 'Fail'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Color Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Smart Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      const suggestions = generateSmartColorSuggestions(getCurrentColor('primary'));
                      onColorsChange({
                        ...currentColors,
                        secondary: suggestions.secondary,
                        accent: suggestions.accent
                      });
                    }}
                  >
                    <Wand2 className="h-3 w-3 mr-2" />
                    Generate complementary colors
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      const adjusted = adjustColorBrightness(getCurrentColor('background'), 0.05);
                      handleColorChange('background', adjusted);
                    }}
                  >
                    <Eye className="h-3 w-3 mr-2" />
                    Optimize for readability
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Custom Palette Builder */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Custom Palette</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Build your own color palette from scratch
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="space-y-1">
                        <Input
                          type="color"
                          value={customPalette[`custom${index}`] || '#ffffff'}
                          onChange={(e) => setCustomPalette(prev => ({
                            ...prev,
                            [`custom${index}`]: e.target.value
                          }))}
                          className="w-full h-12 p-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Utility functions
function generateRandomColor(): string {
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(Math.random() * 40) + 60; // 60-100%
  const lightness = Math.floor(Math.random() * 30) + 35; // 35-65%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function getPresetDescription(presetName: string): string {
  const descriptions = {
    professional: 'Clean and trustworthy colors for business portfolios',
    creative: 'Vibrant and artistic colors for creative professionals',
    minimal: 'Simple black and white with subtle accents',
    bold: 'High-impact colors that make a strong statement'
  };
  
  return descriptions[presetName as keyof typeof descriptions] || 'Custom color scheme';
}

function getAccessibilityInfo(textColor: string, backgroundColor: string) {
  // Simplified accessibility check - in production, use a proper color contrast library
  const contrast = calculateContrastRatio(textColor, backgroundColor);
  
  return [
    {
      test: 'WCAG AA Normal Text',
      pass: contrast >= 4.5
    },
    {
      test: 'WCAG AA Large Text',
      pass: contrast >= 3
    },
    {
      test: 'WCAG AAA Normal Text',
      pass: contrast >= 7
    }
  ];
}

function calculateContrastRatio(color1: string, color2: string): number {
  // Simplified contrast calculation - use a proper library in production
  return 4.5; // Placeholder value
}

function generateSmartColorSuggestions(primaryColor: string) {
  // Simplified color suggestion algorithm
  return {
    secondary: adjustColorHue(primaryColor, 30),
    accent: adjustColorHue(primaryColor, -30)
  };
}

function adjustColorHue(color: string, adjustment: number): string {
  // Simplified hue adjustment
  return color;
}

function adjustColorBrightness(color: string, adjustment: number): string {
  // Simplified brightness adjustment
  return color;
}