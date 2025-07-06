'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { TemplateType } from '@/types';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  Type, 
  RotateCcw, 
  Download,
  Eye,
  Wand2,
  Search,
  Star,
  Globe
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getTemplateConfig } from '@/lib/templates/registry';
import { customizationPresets } from './template-customizer';

interface FontCustomizerProps {
  templateType: TemplateType;
  currentFonts?: Record<string, string>;
  onFontsChange: (fonts: Record<string, string>) => void;
  className?: string;
}

export function FontCustomizer({
  templateType,
  currentFonts = {},
  onFontsChange,
  className
}: FontCustomizerProps) {
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());
  const [fontSettings, setFontSettings] = useState({
    size: 16,
    lineHeight: 1.5,
    letterSpacing: 0
  });

  const templateConfig = getTemplateConfig(templateType);
  const defaultFonts = templateConfig?.typography || {};

  const fontCategories = [
    { key: 'heading', label: 'Heading', description: 'Main headings and titles', preview: 'Portfolio Title' },
    { key: 'body', label: 'Body', description: 'Main content text', preview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
    { key: 'accent', label: 'Accent', description: 'Special text and captions', preview: 'Special Text' }
  ];

  const getCurrentFont = useCallback((key: string) => {
    return currentFonts[key] || (defaultFonts as Record<string, string>)[key] || 'Inter';
  }, [currentFonts, defaultFonts]);

  const handleFontChange = useCallback((key: string, value: string) => {
    const newFonts = { ...currentFonts, [key]: value };
    onFontsChange(newFonts);
    
    // Load the font if not already loaded
    if (!loadedFonts.has(value)) {
      loadGoogleFont(value);
      setLoadedFonts(prev => new Set([...prev, value]));
    }
  }, [currentFonts, onFontsChange, loadedFonts]);

  const handlePresetApply = useCallback((presetName: string) => {
    const preset = customizationPresets[presetName as keyof typeof customizationPresets];
    if (preset?.fonts) {
      onFontsChange(preset.fonts);
      setActivePreset(presetName);
      
      // Load all fonts in the preset
      Object.values(preset.fonts).forEach(font => {
        if (!loadedFonts.has(font)) {
          loadGoogleFont(font);
          setLoadedFonts(prev => new Set([...prev, font]));
        }
      });
    }
  }, [onFontsChange, loadedFonts]);

  const handleReset = useCallback(() => {
    onFontsChange({});
    setActivePreset(null);
  }, [onFontsChange]);

  const filteredFonts = googleFonts.filter(font =>
    font.family.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    // Load currently selected fonts
    Object.values(currentFonts).forEach(font => {
      if (!loadedFonts.has(font)) {
        loadGoogleFont(font);
        setLoadedFonts(prev => new Set([...prev, font]));
      }
    });
  }, [currentFonts, loadedFonts]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Type className="h-5 w-5" />
            Font Customization
          </h3>
          
          <div className="flex items-center gap-1">
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
          Choose fonts that reflect your personal style and ensure excellent readability
        </p>
      </div>

      <Tabs defaultValue="fonts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fonts">Fonts</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Individual Font Controls */}
        <TabsContent value="fonts" className="space-y-4">
          <div className="space-y-4">
            {fontCategories.map(({ key, label, description, preview }) => (
              <Card key={key}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {label} Font
                        <Badge variant="outline" className="text-xs">
                          {key}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{description}</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Font Selection */}
                  <div className="space-y-2">
                    <Label htmlFor={`font-${key}`}>Font Family</Label>
                    <div className="flex gap-2">
                      <Select
                        value={getCurrentFont(key)}
                        onValueChange={(value) => handleFontChange(key, value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select a font" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {/* Popular fonts first */}
                          <div className="border-b pb-2 mb-2">
                            <p className="text-xs text-gray-600 px-2 py-1 font-medium">Popular</p>
                            {popularFonts.map((font) => (
                              <SelectItem key={font.family} value={font.family}>
                                <div className="flex items-center gap-2">
                                  <span style={{ fontFamily: font.family }}>{font.family}</span>
                                  {font.isPopular && <Star className="h-3 w-3 text-yellow-500" />}
                                </div>
                              </SelectItem>
                            ))}
                          </div>
                          
                          {/* All fonts */}
                          <div className="relative">
                            <div className="sticky top-0 bg-white border-b pb-2 mb-2">
                              <div className="relative">
                                <Search className="h-3 w-3 absolute left-2 top-2.5 text-gray-400" />
                                <Input
                                  placeholder="Search fonts..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  className="pl-8 text-xs"
                                />
                              </div>
                            </div>
                            
                            {filteredFonts.slice(0, 50).map((font) => (
                              <SelectItem key={font.family} value={font.family}>
                                <div className="flex items-center gap-2">
                                  <span style={{ fontFamily: font.family }}>{font.family}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {font.category}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </div>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Font Preview */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <p
                      className="text-gray-900"
                      style={{
                        fontFamily: getCurrentFont(key),
                        fontSize: key === 'heading' ? '24px' : key === 'body' ? '16px' : '14px',
                        fontWeight: key === 'heading' ? '600' : '400'
                      }}
                    >
                      {preview}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {getCurrentFont(key)} - {getFontInfo(getCurrentFont(key)).category}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Typography Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Typography Hierarchy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div style={{ fontFamily: getCurrentFont('heading') }}>
                  <h1 className="text-3xl font-bold text-gray-900">Main Heading</h1>
                  <h2 className="text-2xl font-semibold text-gray-800 mt-2">Sub Heading</h2>
                  <h3 className="text-xl font-medium text-gray-700 mt-2">Section Title</h3>
                </div>
                
                <div style={{ fontFamily: getCurrentFont('body') }}>
                  <p className="text-gray-600 leading-relaxed">
                    This is how your body text will look with the selected font. It should be highly readable 
                    and comfortable for extended reading. The font should complement your heading font while 
                    maintaining excellent legibility across all devices.
                  </p>
                </div>
                
                <div style={{ fontFamily: getCurrentFont('accent') }}>
                  <p className="text-sm text-gray-500">
                    Accent text • Captions • Metadata • Special elements
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Font Presets */}
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
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium capitalize">{presetName} Typography</h4>
                      {activePreset === presetName && (
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    
                    {/* Font Preview */}
                    <div className="space-y-2">
                      <div style={{ fontFamily: preset.fonts.heading }}>
                        <p className="text-lg font-semibold">
                          {preset.fonts.heading} - Heading
                        </p>
                      </div>
                      <div style={{ fontFamily: preset.fonts.body }}>
                        <p className="text-sm text-gray-600">
                          {preset.fonts.body} - Body text for readability
                        </p>
                      </div>
                      <div style={{ fontFamily: preset.fonts.accent }}>
                        <p className="text-xs text-gray-500">
                          {preset.fonts.accent} - Accent text
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Alert>
            <Eye className="h-4 w-4" />
            <AlertDescription>
              Font presets are carefully chosen combinations that work well together and provide excellent readability across all devices.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Typography Settings */}
        <TabsContent value="settings" className="space-y-4">
          <div className="space-y-6">
            {/* Global Typography Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Global Typography Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Base Font Size</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[fontSettings.size]}
                      onValueChange={([value]) => setFontSettings(prev => ({ ...prev, size: value || 16 }))}
                      min={12}
                      max={24}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 w-12">{fontSettings.size}px</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Line Height</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[fontSettings.lineHeight]}
                      onValueChange={([value]) => setFontSettings(prev => ({ ...prev, lineHeight: value || 1.5 }))}
                      min={1.2}
                      max={2.0}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 w-12">{fontSettings.lineHeight}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Letter Spacing</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[fontSettings.letterSpacing]}
                      onValueChange={([value]) => setFontSettings(prev => ({ ...prev, letterSpacing: value || 0 }))}
                      min={-0.05}
                      max={0.1}
                      step={0.01}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 w-12">{fontSettings.letterSpacing}em</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Font Loading Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Font Loading</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Loaded Fonts</span>
                  <Badge variant="secondary">{loadedFonts.size}</Badge>
                </div>
                
                <div className="space-y-1">
                  {Array.from(loadedFonts).map(font => (
                    <div key={font} className="flex items-center gap-2 text-sm">
                      <Globe className="h-3 w-3 text-green-500" />
                      <span style={{ fontFamily: font }}>{font}</span>
                    </div>
                  ))}
                </div>
                
                <Alert>
                  <AlertDescription className="text-xs">
                    Fonts are loaded from Google Fonts for optimal performance and reliability.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Font Pairing Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Smart Pairing Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      const suggestions = getFontPairingSuggestions(getCurrentFont('heading'));
                      onFontsChange({
                        ...currentFonts,
                        body: suggestions.body,
                        accent: suggestions.accent
                      });
                    }}
                  >
                    <Wand2 className="h-3 w-3 mr-2" />
                    Generate font pairing for "{getCurrentFont('heading')}"
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Font data and utilities
const popularFonts = [
  { family: 'Inter', category: 'sans-serif', isPopular: true },
  { family: 'Roboto', category: 'sans-serif', isPopular: true },
  { family: 'Open Sans', category: 'sans-serif', isPopular: true },
  { family: 'Lato', category: 'sans-serif', isPopular: true },
  { family: 'Montserrat', category: 'sans-serif', isPopular: true },
  { family: 'Playfair Display', category: 'serif', isPopular: true },
  { family: 'Source Sans Pro', category: 'sans-serif', isPopular: true },
  { family: 'Oswald', category: 'sans-serif', isPopular: true }
];

const googleFonts = [
  ...popularFonts,
  { family: 'Poppins', category: 'sans-serif' },
  { family: 'Nunito', category: 'sans-serif' },
  { family: 'Raleway', category: 'sans-serif' },
  { family: 'Ubuntu', category: 'sans-serif' },
  { family: 'Merriweather', category: 'serif' },
  { family: 'Lora', category: 'serif' },
  { family: 'PT Sans', category: 'sans-serif' },
  { family: 'Source Code Pro', category: 'monospace' },
  { family: 'Fira Sans', category: 'sans-serif' },
  { family: 'Work Sans', category: 'sans-serif' },
  { family: 'Space Grotesk', category: 'sans-serif' },
  { family: 'DM Sans', category: 'sans-serif' },
  { family: 'Archivo', category: 'sans-serif' },
  { family: 'Crimson Text', category: 'serif' },
  { family: 'IBM Plex Sans', category: 'sans-serif' }
];

function loadGoogleFont(fontFamily: string) {
  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@300;400;500;600;700&display=swap`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

function getFontInfo(fontFamily: string) {
  return googleFonts.find(font => font.family === fontFamily) || 
         { family: fontFamily, category: 'sans-serif' };
}

function getFontPairingSuggestions(headingFont: string) {
  const pairings: Record<string, { body: string; accent: string }> = {
    'Playfair Display': { body: 'Source Sans Pro', accent: 'Source Sans Pro' },
    'Montserrat': { body: 'Open Sans', accent: 'Open Sans' },
    'Oswald': { body: 'Lato', accent: 'Lato' },
    'Merriweather': { body: 'Lato', accent: 'Lato' },
    'Inter': { body: 'Inter', accent: 'Inter' },
    'Roboto': { body: 'Roboto', accent: 'Roboto' }
  };
  
  return pairings[headingFont] || { body: 'Inter', accent: 'Inter' };
}