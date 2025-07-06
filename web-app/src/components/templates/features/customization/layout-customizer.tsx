'use client';

import React, { useState, useCallback } from 'react';
import { TemplateType } from '@/types';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  Layout, 
  RotateCcw, 
  GripVertical,
  Eye,
  EyeOff,
  Grid,
  Columns,
  Rows,
  ArrowUp,
  ArrowDown,
  Settings,
  Monitor,
  Tablet,
  Smartphone
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getTemplateConfig, getTemplateSections } from '@/lib/templates/registry';

interface LayoutCustomizerProps {
  templateType: TemplateType;
  currentLayout?: Record<string, any>;
  onLayoutChange: (layout: Record<string, any>) => void;
  className?: string;
}

export function LayoutCustomizer({
  templateType,
  currentLayout = {},
  onLayoutChange,
  className
}: LayoutCustomizerProps) {
  const [activeDevice, setActiveDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [draggedSection, setDraggedSection] = useState<string | null>(null);

  const templateConfig = getTemplateConfig(templateType);
  const templateSections = getTemplateSections(templateType);
  
  if (!templateConfig) return null;

  const currentSectionOrder = currentLayout.sections_order || 
    templateSections.map(section => section.id);
  
  const currentSectionVisibility = currentLayout.sections_visibility || 
    templateSections.reduce((acc, section) => ({ 
      ...acc, 
      [section.id]: true 
    }), {});

  const currentGridColumns = currentLayout.grid_columns || 
    templateConfig.layout.grid_columns;

  const handleSectionOrderChange = useCallback((newOrder: string[]) => {
    const newLayout = {
      ...currentLayout,
      sections_order: newOrder
    };
    onLayoutChange(newLayout);
  }, [currentLayout, onLayoutChange]);

  const handleSectionVisibilityChange = useCallback((sectionId: string, visible: boolean) => {
    const newLayout = {
      ...currentLayout,
      sections_visibility: {
        ...currentSectionVisibility,
        [sectionId]: visible
      }
    };
    onLayoutChange(newLayout);
  }, [currentLayout, currentSectionVisibility, onLayoutChange]);

  const handleGridColumnsChange = useCallback((columns: number) => {
    const newLayout = {
      ...currentLayout,
      grid_columns: columns
    };
    onLayoutChange(newLayout);
  }, [currentLayout, onLayoutChange]);

  const handleReset = useCallback(() => {
    onLayoutChange({});
  }, [onLayoutChange]);

  const moveSectionUp = useCallback((index: number) => {
    if (index > 0) {
      const newOrder = [...currentSectionOrder];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      handleSectionOrderChange(newOrder);
    }
  }, [currentSectionOrder, handleSectionOrderChange]);

  const moveSectionDown = useCallback((index: number) => {
    if (index < currentSectionOrder.length - 1) {
      const newOrder = [...currentSectionOrder];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      handleSectionOrderChange(newOrder);
    }
  }, [currentSectionOrder, handleSectionOrderChange]);

  const getSectionInfo = useCallback((sectionId: string) => {
    return templateSections.find(section => section.id === sectionId);
  }, [templateSections]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Layout Customization
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
          Customize section order, visibility, and layout structure
        </p>
      </div>

      {/* Device Preview Toggle */}
      <div className="flex items-center gap-2 justify-center">
        <div className="flex items-center gap-1 border rounded-lg p-1">
          {([
            { device: 'desktop', icon: Monitor },
            { device: 'tablet', icon: Tablet },
            { device: 'mobile', icon: Smartphone }
          ] as const).map(({ device, icon: Icon }) => (
            <Button
              key={device}
              variant={activeDevice === device ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveDevice(device)}
              className="text-xs"
            >
              <Icon className="h-3 w-3 mr-1" />
              {device}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="sections" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="spacing">Spacing</TabsTrigger>
        </TabsList>

        {/* Section Management */}
        <TabsContent value="sections" className="space-y-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Section Order & Visibility</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentSectionOrder.map((sectionId: string, index: number) => {
                    const sectionInfo = getSectionInfo(sectionId);
                    if (!sectionInfo) return null;

                    const isVisible = currentSectionVisibility[sectionId];
                    const isRequired = sectionInfo.required;

                    return (
                      <div
                        key={sectionId}
                        className={cn(
                          'flex items-center gap-3 p-3 border rounded-lg transition-all',
                          isVisible ? 'bg-white' : 'bg-gray-50 opacity-60',
                          draggedSection === sectionId && 'shadow-lg scale-105'
                        )}
                        draggable
                        onDragStart={() => setDraggedSection(sectionId)}
                        onDragEnd={() => setDraggedSection(null)}
                      >
                        {/* Drag Handle */}
                        <div className="cursor-move text-gray-400">
                          <GripVertical className="h-4 w-4" />
                        </div>

                        {/* Section Info */}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{sectionInfo.name}</span>
                            {isRequired && (
                              <Badge variant="secondary" className="text-xs">
                                Required
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              #{index + 1}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">{sectionInfo.description}</p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2">
                          {/* Move Buttons */}
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveSectionUp(index)}
                              disabled={index === 0}
                              className="h-6 w-6 p-0"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveSectionDown(index)}
                              disabled={index === currentSectionOrder.length - 1}
                              className="h-6 w-6 p-0"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Visibility Toggle */}
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={isVisible}
                              onCheckedChange={(checked) => 
                                handleSectionVisibilityChange(sectionId, checked)
                              }
                              disabled={isRequired}
                            />
                            {isVisible ? (
                              <Eye className="h-4 w-4 text-green-600" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Alert className="mt-4">
                  <AlertDescription className="text-xs">
                    Drag sections to reorder them. Required sections cannot be hidden.
                    Changes are applied immediately to the preview.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Section Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Section Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {templateSections.length}
                    </p>
                    <p className="text-xs text-gray-600">Total Sections</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {Object.values(currentSectionVisibility).filter(Boolean).length}
                    </p>
                    <p className="text-xs text-gray-600">Visible</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">
                      {templateSections.filter(s => s.required).length}
                    </p>
                    <p className="text-xs text-gray-600">Required</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Grid Layout */}
        <TabsContent value="grid" className="space-y-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Grid Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Grid Columns</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[currentGridColumns]}
                      onValueChange={([value]) => handleGridColumnsChange(value || 1)}
                      min={1}
                      max={4}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 w-8">{currentGridColumns}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Adjust the number of columns for content layout
                  </p>
                </div>

                {/* Grid Preview */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="text-xs text-gray-600 mb-2">Preview:</p>
                  <div 
                    className="grid gap-2"
                    style={{ gridTemplateColumns: `repeat(${currentGridColumns}, 1fr)` }}
                  >
                    {Array.from({ length: currentGridColumns }).map((_, index) => (
                      <div
                        key={index}
                        className="h-16 bg-blue-100 rounded border-2 border-dashed border-blue-300 flex items-center justify-center"
                      >
                        <span className="text-xs text-blue-600">Col {index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Responsive Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Responsive Behavior</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {([
                    { device: 'desktop', label: 'Desktop', icon: Monitor, breakpoint: '1024px+' },
                    { device: 'tablet', label: 'Tablet', icon: Tablet, breakpoint: '768px - 1023px' },
                    { device: 'mobile', label: 'Mobile', icon: Smartphone, breakpoint: '< 768px' }
                  ] as const).map(({ device, label, icon: Icon, breakpoint }) => (
                    <div key={device} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-gray-600" />
                        <div>
                          <p className="font-medium text-sm">{label}</p>
                          <p className="text-xs text-gray-500">{breakpoint}</p>
                        </div>
                      </div>
                      <Select defaultValue={device === 'desktop' ? '2' : device === 'tablet' ? '2' : '1'}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 col</SelectItem>
                          <SelectItem value="2">2 col</SelectItem>
                          <SelectItem value="3">3 col</SelectItem>
                          <SelectItem value="4">4 col</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Spacing Configuration */}
        <TabsContent value="spacing" className="space-y-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Section Spacing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'section_gap', label: 'Between Sections', min: 0, max: 100, unit: 'px' },
                  { key: 'content_padding', label: 'Content Padding', min: 0, max: 60, unit: 'px' },
                  { key: 'container_margin', label: 'Container Margin', min: 0, max: 40, unit: 'px' }
                ].map(({ key, label, min, max, unit }) => (
                  <div key={key} className="space-y-2">
                    <Label>{label}</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        defaultValue={[20]}
                        min={min}
                        max={max}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-600 w-12">20{unit}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Container Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Max Container Width</Label>
                  <Select defaultValue="1200">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1024">1024px (Compact)</SelectItem>
                      <SelectItem value="1200">1200px (Standard)</SelectItem>
                      <SelectItem value="1400">1400px (Wide)</SelectItem>
                      <SelectItem value="full">Full Width</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="center-content">Center Content</Label>
                  <Switch id="center-content" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="full-width-sections">Full Width Sections</Label>
                  <Switch id="full-width-sections" />
                </div>
              </CardContent>
            </Card>

            {/* Spacing Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Spacing Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 border-2 border-dashed border-gray-300 p-4 rounded-lg">
                  <div className="bg-blue-100 p-4 rounded border">
                    <p className="text-sm font-medium">Section 1</p>
                    <p className="text-xs text-gray-600">Content with padding</p>
                  </div>
                  <div className="bg-green-100 p-4 rounded border">
                    <p className="text-sm font-medium">Section 2</p>
                    <p className="text-xs text-gray-600">Gap between sections</p>
                  </div>
                  <div className="bg-purple-100 p-4 rounded border">
                    <p className="text-sm font-medium">Section 3</p>
                    <p className="text-xs text-gray-600">Container margins apply</p>
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