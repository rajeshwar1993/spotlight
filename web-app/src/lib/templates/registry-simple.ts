import { TemplateType } from '@/types';
import type { TemplateConfig, TemplateValidation, PortfolioData } from './types';
import { TEMPLATE_CONFIGS, TEMPLATE_VALIDATIONS } from './config';
import { TEMPLATE_PREVIEW_DATA } from './preview-data';
import React from 'react';

// Simple template registry without section components for now
export const TEMPLATE_REGISTRY_SIMPLE = {
  T1: {
    config: TEMPLATE_CONFIGS.T1,
    preview_data: TEMPLATE_PREVIEW_DATA.T1,
    validation: TEMPLATE_VALIDATIONS.T1
  },
  T2: {
    config: TEMPLATE_CONFIGS.T2,
    preview_data: TEMPLATE_PREVIEW_DATA.T2,
    validation: TEMPLATE_VALIDATIONS.T2
  },
  T3: {
    config: TEMPLATE_CONFIGS.T3,
    preview_data: TEMPLATE_PREVIEW_DATA.T3,
    validation: TEMPLATE_VALIDATIONS.T3
  },
  T4: {
    config: TEMPLATE_CONFIGS.T4,
    preview_data: TEMPLATE_PREVIEW_DATA.T4,
    validation: TEMPLATE_VALIDATIONS.T4
  }
};

/**
 * Get template configuration by type
 */
export function getTemplateConfig(templateType: TemplateType): TemplateConfig | null {
  return TEMPLATE_REGISTRY_SIMPLE[templateType]?.config || null;
}

/**
 * Get template preview data
 */
export function getTemplatePreview(templateType: TemplateType) {
  return TEMPLATE_REGISTRY_SIMPLE[templateType]?.preview_data || null;
}

/**
 * Get all available templates
 */
export function getAllTemplates(): TemplateType[] {
  return Object.keys(TEMPLATE_REGISTRY_SIMPLE) as TemplateType[];
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): TemplateType[] {
  return getAllTemplates().filter(templateType => {
    const config = getTemplateConfig(templateType);
    return config?.category === category;
  });
}

/**
 * Validate template data
 */
export function validateTemplateData(templateType: TemplateType, data: PortfolioData): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const validation = TEMPLATE_REGISTRY_SIMPLE[templateType]?.validation;
  
  if (!validation) {
    return { isValid: true, errors: [], warnings: [] };
  }

  const errors: string[] = [];

  // Basic validation rules
  if (validation.required_fields) {
    validation.required_fields.forEach(field => {
      if (field === 'user.full_name' && !data.user?.full_name) {
        errors.push('Full name is required');
      }
      if (field === 'portfolio.bio' && !data.portfolio?.bio) {
        errors.push('Portfolio bio is required');
      }
      if (field === 'images.profile' && !data.images?.profile) {
        errors.push('Profile image is required');
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: []
  };
}

/**
 * Get template component (dynamic import)
 */
export function getTemplateComponent(templateType: TemplateType) {
  switch (templateType) {
    case 'T1':
      return React.lazy(() => import('@/components/templates/t1'));
    case 'T2':
      return React.lazy(() => import('@/components/templates/t2'));
    case 'T3':
      return React.lazy(() => import('@/components/templates/t3'));
    case 'T4':
      return React.lazy(() => import('@/components/templates/t4'));
    default:
      return null;
  }
}