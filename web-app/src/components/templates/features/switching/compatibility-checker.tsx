'use client';

import React, { useMemo } from 'react';
import { TemplateType } from '@/types';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Image, 
  Type, 
  Layout, 
  Palette,
  Zap
} from 'lucide-react';
import { getTemplateConfig, getTemplateValidation } from '@/lib/templates/registry';
import type { PortfolioData, TemplateCustomizations } from '@/lib/templates/types';

interface CompatibilityCheckerProps {
  fromTemplate: TemplateType;
  toTemplate: TemplateType;
  portfolioData: PortfolioData;
  customizations?: TemplateCustomizations;
  className?: string;
}

export function CompatibilityChecker({
  fromTemplate,
  toTemplate,
  portfolioData,
  customizations,
  className
}: CompatibilityCheckerProps) {
  const compatibilityReport = useMemo(() => {
    return generateCompatibilityReport(fromTemplate, toTemplate, portfolioData, customizations);
  }, [fromTemplate, toTemplate, portfolioData, customizations]);

  const getCompatibilityIcon = (level: CompatibilityLevel) => {
    switch (level) {
      case 'excellent':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'good':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCompatibilityColor = (level: CompatibilityLevel) => {
    switch (level) {
      case 'excellent':
        return 'border-green-200 bg-green-50';
      case 'good':
        return 'border-blue-200 bg-blue-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Overall Compatibility Score */}
      <Card className={getCompatibilityColor(compatibilityReport.overall.level)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            {getCompatibilityIcon(compatibilityReport.overall.level)}
            Compatibility Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Score</span>
              <span className={cn('text-lg font-bold', getScoreColor(compatibilityReport.overall.score))}>
                {compatibilityReport.overall.score}%
              </span>
            </div>
            
            <Progress 
              value={compatibilityReport.overall.score} 
              className="w-full"
            />
            
            <p className="text-sm text-gray-600">
              {compatibilityReport.overall.summary}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Compatibility Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {compatibilityReport.areas.map((area) => (
          <Card key={area.id} className={getCompatibilityColor(area.level)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {area.icon}
                <span className="font-medium text-sm">{area.name}</span>
                <Badge
                  variant={area.level === 'excellent' || area.level === 'good' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {area.level}
                </Badge>
              </div>
              
              <p className="text-xs text-gray-600 mb-2">{area.description}</p>
              
              {area.issues.length > 0 && (
                <div className="space-y-1">
                  {area.issues.map((issue, index) => (
                    <div key={index} className="flex items-start gap-2">
                      {issue.type === 'warning' ? (
                        <AlertTriangle className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-xs text-gray-700">{issue.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Migration Summary */}
      {compatibilityReport.migration.changes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4" />
              Migration Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                The following changes will be made during the template switch:
              </div>
              
              <div className="space-y-2">
                {compatibilityReport.migration.changes.map((change, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className={cn(
                      'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                      change.type === 'addition' ? 'bg-green-500' :
                      change.type === 'modification' ? 'bg-blue-500' :
                      change.type === 'removal' ? 'bg-red-500' : 'bg-gray-500'
                    )} />
                    <div>
                      <p className="text-sm font-medium">{change.title}</p>
                      <p className="text-xs text-gray-600">{change.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {compatibilityReport.recommendations.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <strong>Recommendations:</strong>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {compatibilityReport.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Types for compatibility analysis
type CompatibilityLevel = 'excellent' | 'good' | 'warning' | 'error';

interface CompatibilityIssue {
  type: 'warning' | 'error';
  message: string;
}

interface CompatibilityArea {
  id: string;
  name: string;
  description: string;
  level: CompatibilityLevel;
  score: number;
  icon: React.ReactNode;
  issues: CompatibilityIssue[];
}

interface MigrationChange {
  type: 'addition' | 'modification' | 'removal';
  title: string;
  description: string;
}

interface CompatibilityReport {
  overall: {
    score: number;
    level: CompatibilityLevel;
    summary: string;
  };
  areas: CompatibilityArea[];
  migration: {
    changes: MigrationChange[];
    estimatedDuration: number;
  };
  recommendations: string[];
}

// Generate comprehensive compatibility report
function generateCompatibilityReport(
  fromTemplate: TemplateType,
  toTemplate: TemplateType,
  portfolioData: PortfolioData,
  customizations?: TemplateCustomizations
): CompatibilityReport {
  const fromConfig = getTemplateConfig(fromTemplate);
  const toConfig = getTemplateConfig(toTemplate);
  const toValidation = getTemplateValidation(toTemplate);
  
  if (!fromConfig || !toConfig || !toValidation) {
    return {
      overall: { score: 0, level: 'error', summary: 'Template configuration not found' },
      areas: [],
      migration: { changes: [], estimatedDuration: 0 },
      recommendations: []
    };
  }

  const areas: CompatibilityArea[] = [];
  const migrationChanges: MigrationChange[] = [];
  const recommendations: string[] = [];

  // 1. Image Compatibility
  const imageCompatibility = analyzeImageCompatibility(portfolioData, toValidation);
  areas.push({
    id: 'images',
    name: 'Images',
    description: 'Profile, hero, and gallery image requirements',
    level: imageCompatibility.level,
    score: imageCompatibility.score,
    icon: <Image className="h-4 w-4" />,
    issues: imageCompatibility.issues
  });

  // 2. Content Compatibility
  const contentCompatibility = analyzeContentCompatibility(portfolioData, toValidation);
  areas.push({
    id: 'content',
    name: 'Content',
    description: 'Text content and field requirements',
    level: contentCompatibility.level,
    score: contentCompatibility.score,
    icon: <Type className="h-4 w-4" />,
    issues: contentCompatibility.issues
  });

  // 3. Layout Compatibility
  const layoutCompatibility = analyzeLayoutCompatibility(fromConfig, toConfig);
  areas.push({
    id: 'layout',
    name: 'Layout',
    description: 'Section arrangement and structure',
    level: layoutCompatibility.level,
    score: layoutCompatibility.score,
    icon: <Layout className="h-4 w-4" />,
    issues: layoutCompatibility.issues
  });

  // 4. Style Compatibility
  const styleCompatibility = analyzeStyleCompatibility(fromConfig, toConfig, customizations);
  areas.push({
    id: 'style',
    name: 'Styling',
    description: 'Colors, fonts, and visual customizations',
    level: styleCompatibility.level,
    score: styleCompatibility.score,
    icon: <Palette className="h-4 w-4" />,
    issues: styleCompatibility.issues
  });

  // Generate migration changes
  migrationChanges.push(...generateMigrationChanges(fromConfig, toConfig, portfolioData));

  // Generate recommendations
  recommendations.push(...generateRecommendations(fromTemplate, toTemplate, portfolioData, areas));

  // Calculate overall score
  const averageScore = areas.reduce((sum, area) => sum + area.score, 0) / areas.length;
  const overallLevel = getOverallCompatibilityLevel(averageScore, areas);

  return {
    overall: {
      score: Math.round(averageScore),
      level: overallLevel,
      summary: generateOverallSummary(overallLevel, fromTemplate, toTemplate)
    },
    areas,
    migration: {
      changes: migrationChanges,
      estimatedDuration: estimateMigrationDuration(migrationChanges)
    },
    recommendations
  };
}

function analyzeImageCompatibility(portfolioData: PortfolioData, validation: any): {
  level: CompatibilityLevel;
  score: number;
  issues: CompatibilityIssue[];
} {
  const issues: CompatibilityIssue[] = [];
  let score = 100;

  // Check profile image
  if (validation.image_requirements.profile.required && !portfolioData.images.profile) {
    issues.push({
      type: 'error',
      message: 'Profile image is required for this template'
    });
    score -= 25;
  }

  // Check hero image
  if (validation.image_requirements.hero.required && !portfolioData.images.hero) {
    issues.push({
      type: 'error',
      message: 'Hero image is required for this template'
    });
    score -= 25;
  }

  // Check gallery images
  const galleryCount = portfolioData.images.gallery.length;
  if (galleryCount < validation.image_requirements.gallery.min_count) {
    issues.push({
      type: 'error',
      message: `At least ${validation.image_requirements.gallery.min_count} gallery images required`
    });
    score -= 20;
  }

  if (galleryCount > validation.image_requirements.gallery.max_count) {
    issues.push({
      type: 'warning',
      message: `Only ${validation.image_requirements.gallery.max_count} gallery images will be displayed`
    });
    score -= 10;
  }

  const level = score >= 90 ? 'excellent' : score >= 75 ? 'good' : score >= 60 ? 'warning' : 'error';
  return { level, score, issues };
}

function analyzeContentCompatibility(portfolioData: PortfolioData, validation: any): {
  level: CompatibilityLevel;
  score: number;
  issues: CompatibilityIssue[];
} {
  const issues: CompatibilityIssue[] = [];
  let score = 100;

  // Check required fields
  for (const field of validation.required_fields) {
    const fieldValue = getNestedValue(portfolioData, field);
    if (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
      issues.push({
        type: 'error',
        message: `Required field '${field}' is missing`
      });
      score -= 15;
    }
  }

  // Check content limits
  if (portfolioData.portfolio?.bio && portfolioData.portfolio.bio.length > validation.content_limits.bio_max_length) {
    issues.push({
      type: 'warning',
      message: `Bio exceeds ${validation.content_limits.bio_max_length} character limit`
    });
    score -= 10;
  }

  const level = score >= 90 ? 'excellent' : score >= 75 ? 'good' : score >= 60 ? 'warning' : 'error';
  return { level, score, issues };
}

function analyzeLayoutCompatibility(fromConfig: any, toConfig: any): {
  level: CompatibilityLevel;
  score: number;
  issues: CompatibilityIssue[];
} {
  const issues: CompatibilityIssue[] = [];
  let score = 100;

  // Check section compatibility
  const fromSections = fromConfig.layout.sections;
  const toSections = toConfig.layout.sections;
  
  const missingSections = fromSections.filter((section: string) => !toSections.includes(section));
  if (missingSections.length > 0) {
    issues.push({
      type: 'warning',
      message: `Sections not available in new template: ${missingSections.join(', ')}`
    });
    score -= missingSections.length * 15;
  }

  // Check grid compatibility
  if (fromConfig.layout.grid_columns !== toConfig.layout.grid_columns) {
    issues.push({
      type: 'warning',
      message: 'Grid layout will be adjusted to match new template'
    });
    score -= 10;
  }

  const level = score >= 90 ? 'excellent' : score >= 75 ? 'good' : score >= 60 ? 'warning' : 'error';
  return { level, score, issues };
}

function analyzeStyleCompatibility(fromConfig: any, toConfig: any, customizations?: TemplateCustomizations): {
  level: CompatibilityLevel;
  score: number;
  issues: CompatibilityIssue[];
} {
  const issues: CompatibilityIssue[] = [];
  let score = 100;

  // Check customization compatibility
  if (customizations) {
    if (customizations.colors && !toConfig.customization_options.colors) {
      issues.push({
        type: 'warning',
        message: 'Color customizations not supported in new template'
      });
      score -= 15;
    }

    if (customizations.fonts && !toConfig.customization_options.fonts) {
      issues.push({
        type: 'warning',
        message: 'Font customizations not supported in new template'
      });
      score -= 15;
    }

    if (customizations.layout && !toConfig.customization_options.layout) {
      issues.push({
        type: 'warning',
        message: 'Layout customizations not supported in new template'
      });
      score -= 15;
    }
  }

  // Check style category compatibility
  if (fromConfig.category !== toConfig.category) {
    issues.push({
      type: 'warning',
      message: `Switching from ${fromConfig.category} to ${toConfig.category} style`
    });
    score -= 10;
  }

  const level = score >= 90 ? 'excellent' : score >= 75 ? 'good' : score >= 60 ? 'warning' : 'error';
  return { level, score, issues };
}

function generateMigrationChanges(fromConfig: any, toConfig: any, portfolioData: PortfolioData): MigrationChange[] {
  const changes: MigrationChange[] = [];

  // Section changes
  const fromSections = fromConfig.layout.sections;
  const toSections = toConfig.layout.sections;
  
  const addedSections = toSections.filter((section: string) => !fromSections.includes(section));
  const removedSections = fromSections.filter((section: string) => !toSections.includes(section));

  addedSections.forEach((section: string) => {
    changes.push({
      type: 'addition',
      title: `Add ${section} section`,
      description: `New section will be added with default content`
    });
  });

  removedSections.forEach((section: string) => {
    changes.push({
      type: 'removal',
      title: `Remove ${section} section`,
      description: `Section content will be preserved but not displayed`
    });
  });

  // Style changes
  if (fromConfig.category !== toConfig.category) {
    changes.push({
      type: 'modification',
      title: 'Update visual styling',
      description: `Change from ${fromConfig.category} to ${toConfig.category} design style`
    });
  }

  return changes;
}

function generateRecommendations(
  fromTemplate: TemplateType,
  toTemplate: TemplateType,
  portfolioData: PortfolioData,
  areas: CompatibilityArea[]
): string[] {
  const recommendations: string[] = [];

  // Image recommendations
  const imageArea = areas.find(a => a.id === 'images');
  if (imageArea && imageArea.score < 80) {
    recommendations.push('Consider adding missing images for better template compatibility');
  }

  // Content recommendations
  const contentArea = areas.find(a => a.id === 'content');
  if (contentArea && contentArea.score < 80) {
    recommendations.push('Complete all required fields for optimal display');
  }

  // Template-specific recommendations
  if (toTemplate === 'T1') {
    recommendations.push('Professional template works best with formal language and complete contact information');
  } else if (toTemplate === 'T2') {
    recommendations.push('Modern Bold template benefits from high-quality images and dynamic content');
  } else if (toTemplate === 'T3') {
    recommendations.push('Minimal template emphasizes clean, concise content and elegant imagery');
  } else if (toTemplate === 'T4') {
    recommendations.push('Creative template allows for artistic expression and unique content presentation');
  }

  return recommendations;
}

function getOverallCompatibilityLevel(score: number, areas: CompatibilityArea[]): CompatibilityLevel {
  const hasErrors = areas.some(area => area.level === 'error');
  if (hasErrors) return 'error';
  
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'warning';
  return 'error';
}

function generateOverallSummary(level: CompatibilityLevel, fromTemplate: TemplateType, toTemplate: TemplateType): string {
  switch (level) {
    case 'excellent':
      return `${fromTemplate} to ${toTemplate} transition is fully compatible with no issues`;
    case 'good':
      return `${fromTemplate} to ${toTemplate} transition is mostly compatible with minor adjustments`;
    case 'warning':
      return `${fromTemplate} to ${toTemplate} transition requires attention to several compatibility issues`;
    case 'error':
      return `${fromTemplate} to ${toTemplate} transition has critical compatibility issues that need resolution`;
    default:
      return 'Compatibility analysis unavailable';
  }
}

function estimateMigrationDuration(changes: MigrationChange[]): number {
  return changes.length * 500 + 2000; // Base time + time per change
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}