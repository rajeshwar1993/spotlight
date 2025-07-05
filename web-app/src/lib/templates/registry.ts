import { TemplateType } from '@/types';
import type { TemplateRegistry, TemplateComponent } from './types';
import { TEMPLATE_CONFIGS, TEMPLATE_VALIDATIONS } from './config';
import { TEMPLATE_PREVIEW_DATA } from './preview-data';

// Template component imports (will be implemented next)
// Using dynamic imports for code splitting
const T1Template = React.lazy(() => import('@/components/templates/t1'));
const T2Template = React.lazy(() => import('@/components/templates/t2'));
const T3Template = React.lazy(() => import('@/components/templates/t3'));
const T4Template = React.lazy(() => import('@/components/templates/t4'));

import React from 'react';

// Template registry implementation
export const TEMPLATE_REGISTRY: TemplateRegistry = {
  T1: {
    config: TEMPLATE_CONFIGS.T1,
    component: T1Template as TemplateComponent,
    sections: [
      {
        id: 'hero',
        name: 'Hero Section',
        description: 'Main introduction with name and profession',
        required: true,
        order: 0,
        component: React.lazy(() => import('@/components/templates/sections/hero-section'))
      },
      {
        id: 'about',
        name: 'About',
        description: 'Biography and professional summary',
        required: true,
        order: 1,
        component: React.lazy(() => import('@/components/templates/sections/about-section'))
      },
      {
        id: 'experience',
        name: 'Experience',
        description: 'Professional experience and skills',
        required: false,
        order: 2,
        component: React.lazy(() => import('@/components/templates/sections/experience-section'))
      },
      {
        id: 'gallery',
        name: 'Gallery',
        description: 'Portfolio images and work samples',
        required: false,
        order: 3,
        component: React.lazy(() => import('@/components/templates/sections/gallery-section'))
      },
      {
        id: 'contact',
        name: 'Contact',
        description: 'Contact information and social links',
        required: true,
        order: 4,
        component: React.lazy(() => import('@/components/templates/sections/contact-section'))
      }
    ],
    preview_data: TEMPLATE_PREVIEW_DATA.T1
  },

  T2: {
    config: TEMPLATE_CONFIGS.T2,
    component: T2Template as TemplateComponent,
    sections: [
      {
        id: 'hero',
        name: 'Hero Section',
        description: 'Bold introduction with dynamic visuals',
        required: true,
        order: 0,
        component: React.lazy(() => import('@/components/templates/sections/hero-section'))
      },
      {
        id: 'showcase',
        name: 'Showcase',
        description: 'Featured work and highlights',
        required: false,
        order: 1,
        component: React.lazy(() => import('@/components/templates/sections/showcase-section'))
      },
      {
        id: 'skills',
        name: 'Skills',
        description: 'Professional skills and expertise',
        required: false,
        order: 2,
        component: React.lazy(() => import('@/components/templates/sections/skills-section'))
      },
      {
        id: 'portfolio',
        name: 'Portfolio',
        description: 'Complete portfolio gallery',
        required: true,
        order: 3,
        component: React.lazy(() => import('@/components/templates/sections/portfolio-section'))
      },
      {
        id: 'testimonials',
        name: 'Testimonials',
        description: 'Client and colleague testimonials',
        required: false,
        order: 4,
        component: React.lazy(() => import('@/components/templates/sections/testimonials-section'))
      },
      {
        id: 'contact',
        name: 'Contact',
        description: 'Contact information and booking',
        required: true,
        order: 5,
        component: React.lazy(() => import('@/components/templates/sections/contact-section'))
      }
    ],
    preview_data: TEMPLATE_PREVIEW_DATA.T2
  },

  T3: {
    config: TEMPLATE_CONFIGS.T3,
    component: T3Template as TemplateComponent,
    sections: [
      {
        id: 'hero',
        name: 'Hero Section',
        description: 'Minimal, elegant introduction',
        required: true,
        order: 0,
        component: React.lazy(() => import('@/components/templates/sections/hero-section'))
      },
      {
        id: 'intro',
        name: 'Introduction',
        description: 'Personal introduction and philosophy',
        required: true,
        order: 1,
        component: React.lazy(() => import('@/components/templates/sections/intro-section'))
      },
      {
        id: 'work',
        name: 'Work',
        description: 'Selected portfolio pieces',
        required: true,
        order: 2,
        component: React.lazy(() => import('@/components/templates/sections/work-section'))
      },
      {
        id: 'about',
        name: 'About',
        description: 'Detailed background information',
        required: false,
        order: 3,
        component: React.lazy(() => import('@/components/templates/sections/about-section'))
      },
      {
        id: 'contact',
        name: 'Contact',
        description: 'Simple contact information',
        required: true,
        order: 4,
        component: React.lazy(() => import('@/components/templates/sections/contact-section'))
      }
    ],
    preview_data: TEMPLATE_PREVIEW_DATA.T3
  },

  T4: {
    config: TEMPLATE_CONFIGS.T4,
    component: T4Template as TemplateComponent,
    sections: [
      {
        id: 'hero',
        name: 'Hero Section',
        description: 'Creative, artistic introduction',
        required: true,
        order: 0,
        component: React.lazy(() => import('@/components/templates/sections/hero-section'))
      },
      {
        id: 'creative_intro',
        name: 'Creative Introduction',
        description: 'Artistic statement and vision',
        required: true,
        order: 1,
        component: React.lazy(() => import('@/components/templates/sections/creative-intro-section'))
      },
      {
        id: 'portfolio_grid',
        name: 'Portfolio Grid',
        description: 'Creative portfolio layout',
        required: true,
        order: 2,
        component: React.lazy(() => import('@/components/templates/sections/portfolio-grid-section'))
      },
      {
        id: 'artistic_about',
        name: 'Artistic About',
        description: 'Creative background and experience',
        required: false,
        order: 3,
        component: React.lazy(() => import('@/components/templates/sections/artistic-about-section'))
      },
      {
        id: 'creative_contact',
        name: 'Creative Contact',
        description: 'Artistic contact presentation',
        required: true,
        order: 4,
        component: React.lazy(() => import('@/components/templates/sections/creative-contact-section'))
      }
    ],
    preview_data: TEMPLATE_PREVIEW_DATA.T4
  }
};

// Helper functions for template registry
export function getTemplateConfig(templateId: TemplateType) {
  return TEMPLATE_REGISTRY[templateId]?.config || null;
}

export function getTemplateComponent(templateId: TemplateType) {
  return TEMPLATE_REGISTRY[templateId]?.component || null;
}

export function getTemplateSections(templateId: TemplateType) {
  return TEMPLATE_REGISTRY[templateId]?.sections || [];
}

export function getTemplateValidation(templateId: TemplateType) {
  return TEMPLATE_VALIDATIONS[templateId] || null;
}

export function getTemplatePreview(templateId: TemplateType) {
  return TEMPLATE_REGISTRY[templateId]?.preview_data || null;
}

export function getAllTemplates() {
  return Object.keys(TEMPLATE_REGISTRY) as TemplateType[];
}

export function getTemplatesByCategory(category: string) {
  return getAllTemplates().filter(
    templateId => TEMPLATE_CONFIGS[templateId].category === category
  );
}

// Template validation helper
export function validateTemplateData(templateId: TemplateType, data: any): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const validation = getTemplateValidation(templateId);
  if (!validation) {
    return {
      isValid: false,
      errors: ['Template validation rules not found'],
      warnings: []
    };
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  for (const field of validation.required_fields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push(`Required field '${field}' is missing or empty`);
    }
  }

  // Check image requirements
  if (validation.image_requirements.profile.required && !data.images?.profile) {
    errors.push('Profile image is required for this template');
  }

  if (validation.image_requirements.hero.required && !data.images?.hero) {
    errors.push('Hero image is required for this template');
  }

  const galleryCount = data.images?.gallery?.length || 0;
  if (galleryCount < validation.image_requirements.gallery.min_count) {
    errors.push(
      `At least ${validation.image_requirements.gallery.min_count} gallery images are required`
    );
  }

  if (galleryCount > validation.image_requirements.gallery.max_count) {
    warnings.push(
      `You have ${galleryCount} gallery images, but only ${validation.image_requirements.gallery.max_count} will be displayed`
    );
  }

  // Check content limits
  if (data.portfolio?.bio && data.portfolio.bio.length > validation.content_limits.bio_max_length) {
    errors.push(
      `Bio must be no more than ${validation.content_limits.bio_max_length} characters`
    );
  }

  if (data.portfolio?.skills && data.portfolio.skills.length > validation.content_limits.skills_max_count) {
    warnings.push(
      `You have ${data.portfolio.skills.length} skills, but only ${validation.content_limits.skills_max_count} will be displayed prominently`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}