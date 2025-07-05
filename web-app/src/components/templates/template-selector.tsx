'use client';

import React, { useState } from 'react';
import { TemplateType } from '@/types';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTemplateConfig, getTemplatesByCategory } from '@/lib/templates/registry';
import { TEMPLATE_CATEGORIES } from '@/lib/templates/config';
import { TemplatePreview, TemplateComparison } from './template-preview';

interface TemplateSelectorProps {
  selectedTemplate?: TemplateType;
  onTemplateSelect: (templateType: TemplateType) => void;
  showComparison?: boolean;
  className?: string;
}

export function TemplateSelector({
  selectedTemplate,
  onTemplateSelect,
  showComparison = false,
  className
}: TemplateSelectorProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'comparison'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const allTemplates: TemplateType[] = ['T1', 'T2', 'T3', 'T4'];
  
  const filteredTemplates = selectedCategory === 'all' 
    ? allTemplates 
    : getTemplatesByCategory(selectedCategory);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Choose Your Template</h2>
          <p className="text-gray-600 mt-1">
            Select a template that best represents your professional style
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
            <TabsList>
              <TabsTrigger value="grid" className="text-xs">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Grid
              </TabsTrigger>
              <TabsTrigger value="list" className="text-xs">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                List
              </TabsTrigger>
              {showComparison && (
                <TabsTrigger value="comparison" className="text-xs">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                  </svg>
                  Compare
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          All Templates
        </Button>
        {Object.entries(TEMPLATE_CATEGORIES).map(([key, category]) => (
          <Button
            key={key}
            variant={selectedCategory === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(key)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Template Display */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTemplates.map((templateType) => (
            <TemplatePreview
              key={templateType}
              templateType={templateType}
              onSelect={onTemplateSelect}
              selected={selectedTemplate === templateType}
              showControls={false}
              showMetadata={true}
            />
          ))}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredTemplates.map((templateType) => (
            <TemplateListItem
              key={templateType}
              templateType={templateType}
              selected={selectedTemplate === templateType}
              onSelect={onTemplateSelect}
            />
          ))}
        </div>
      )}

      {viewMode === 'comparison' && showComparison && (
        <TemplateComparison templates={filteredTemplates} />
      )}

      {/* Selection Summary */}
      {selectedTemplate && (
        <SelectedTemplateSummary
          templateType={selectedTemplate}
          onConfirm={() => {/* Handle confirmation */}}
          onChange={() => {/* Handle change */}}
        />
      )}
    </div>
  );
}

// Template List Item Component
interface TemplateListItemProps {
  templateType: TemplateType;
  selected: boolean;
  onSelect: (templateType: TemplateType) => void;
}

function TemplateListItem({ templateType, selected, onSelect }: TemplateListItemProps) {
  const config = getTemplateConfig(templateType);
  
  if (!config) return null;

  return (
    <Card className={cn(
      'transition-all duration-200 cursor-pointer hover:shadow-md',
      selected && 'ring-2 ring-blue-500 ring-offset-2'
    )} onClick={() => onSelect(templateType)}>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          {/* Preview Thumbnail */}
          <div className="w-full aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-2xl">{templateType}</span>
            </div>
          </div>

          {/* Template Info */}
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-gray-900">{config.name}</h3>
              <Badge variant="secondary" className="capitalize">
                {config.category}
              </Badge>
            </div>
            <p className="text-gray-600">{config.description}</p>
            <div className="flex flex-wrap gap-1">
              {config.features.slice(0, 3).map((feature) => (
                <Badge key={feature.id} variant="outline" className="text-xs">
                  {feature.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Selection Action */}
          <div className="flex justify-end">
            <Button
              variant={selected ? "default" : "outline"}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(templateType);
              }}
            >
              {selected ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Selected
                </>
              ) : (
                'Select'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Selected Template Summary Component
interface SelectedTemplateSummaryProps {
  templateType: TemplateType;
  onConfirm: () => void;
  onChange: () => void;
}

function SelectedTemplateSummary({ templateType, onConfirm, onChange }: SelectedTemplateSummaryProps) {
  const config = getTemplateConfig(templateType);
  
  if (!config) return null;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              {templateType}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Selected: {config.name}
              </h3>
              <p className="text-gray-600">{config.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="capitalize">
                  {config.category}
                </Badge>
                <span className="text-sm text-gray-500">
                  {config.features.length} features included
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onChange}>
              Change Template
            </Button>
            <Button onClick={onConfirm}>
              Continue with {config.name}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}