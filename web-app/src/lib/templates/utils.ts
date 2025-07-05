import type { TemplateType, TemplateProps, PortfolioData } from './types';
import { TEMPLATE_CONFIGS, TEMPLATE_VALIDATIONS } from './config';
import { getTemplateConfig, validateTemplateData } from './registry';

/**
 * Template utility functions for the Spotlight portfolio system
 */

/**
 * Validate template data against schema
 */
export function validatePortfolioData(data: PortfolioData, templateType: TemplateType): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic validation
  if (!data.user) {
    errors.push('User data is required');
  } else {
    if (!data.user.full_name) {
      errors.push('User full name is required');
    }
    if (!data.user.profession) {
      warnings.push('User profession is recommended');
    }
  }

  if (!data.portfolio) {
    errors.push('Portfolio data is required');
  } else {
    if (!data.portfolio.title) {
      warnings.push('Portfolio title is recommended');
    }
    if (!data.portfolio.bio) {
      warnings.push('Portfolio bio is recommended');
    }
  }

  if (!data.contact_info?.email) {
    warnings.push('Contact email is recommended');
  }

  if (!data.images?.profile) {
    warnings.push('Profile image is recommended');
  }

  if (!data.images?.gallery || data.images.gallery.length === 0) {
    warnings.push('Gallery images are recommended');
  }

  // Template-specific validation
  const templateConfig = getTemplateConfig(templateType);
  if (templateConfig) {
    const templateValidation = validateTemplateData(data, templateType);
    if (!templateValidation.isValid) {
      errors.push(...templateValidation.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Calculate portfolio completion percentage
 */
export function calculatePortfolioCompletion(data: PortfolioData): {
  percentage: number;
  completed: string[];
  missing: string[];
} {
  const checks = [
    { key: 'user_name', label: 'Full Name', completed: !!data.user?.full_name },
    { key: 'user_profession', label: 'Profession', completed: !!data.user?.profession },
    { key: 'user_location', label: 'Location', completed: !!data.user?.location },
    { key: 'user_bio', label: 'User Bio', completed: !!data.user?.bio },
    { key: 'portfolio_title', label: 'Portfolio Title', completed: !!data.portfolio?.title },
    { key: 'portfolio_bio', label: 'Portfolio Bio', completed: !!data.portfolio?.bio },
    { key: 'profile_image', label: 'Profile Image', completed: !!data.images?.profile },
    { key: 'gallery_images', label: 'Gallery Images', completed: !!(data.images?.gallery && data.images.gallery.length > 0) },
    { key: 'contact_email', label: 'Contact Email', completed: !!data.contact_info?.email },
    { key: 'social_links', label: 'Social Links', completed: !!(data.social_links && Object.values(data.social_links).some(link => !!link)) },
    { key: 'skills', label: 'Skills', completed: !!(data.portfolio?.skills && data.portfolio.skills.length > 0) },
    { key: 'physical_details', label: 'Physical Details', completed: !!(data.portfolio?.height || data.portfolio?.eye_color || data.portfolio?.hair_color) }
  ];

  const completed = checks.filter(check => check.completed).map(check => check.label);
  const missing = checks.filter(check => !check.completed).map(check => check.label);
  const percentage = Math.round((completed.length / checks.length) * 100);

  return {
    percentage,
    completed,
    missing
  };
}

/**
 * Get template-specific recommendations
 */
export function getTemplateRecommendations(templateType: TemplateType, data: PortfolioData): {
  required: string[];
  recommended: string[];
  optional: string[];
} {
  const config = getTemplateConfig(templateType);
  if (!config) {
    return { required: [], recommended: [], optional: [] };
  }

  const recommendations = {
    required: [] as string[],
    recommended: [] as string[],
    optional: [] as string[]
  };

  // Template-specific recommendations
  switch (templateType) {
    case 'T1': // Classic Professional
      recommendations.required = ['Full Name', 'Profession', 'Profile Image'];
      recommendations.recommended = ['Portfolio Bio', 'Contact Email', 'Gallery Images', 'Skills'];
      recommendations.optional = ['Location', 'Social Links', 'Physical Details'];
      break;

    case 'T2': // Modern Bold
      recommendations.required = ['Full Name', 'Profession', 'Profile Image'];
      recommendations.recommended = ['Portfolio Bio', 'Gallery Images', 'Social Links', 'Skills'];
      recommendations.optional = ['Location', 'Contact Email', 'Physical Details'];
      break;

    case 'T3': // Minimal Elegant
      recommendations.required = ['Full Name', 'Profession'];
      recommendations.recommended = ['Profile Image', 'Portfolio Bio', 'Gallery Images'];
      recommendations.optional = ['Contact Email', 'Social Links', 'Skills', 'Physical Details'];
      break;

    case 'T4': // Creative Artistic
      recommendations.required = ['Full Name', 'Profession', 'Gallery Images'];
      recommendations.recommended = ['Profile Image', 'Portfolio Bio', 'Social Links', 'Skills'];
      recommendations.optional = ['Location', 'Contact Email', 'Physical Details'];
      break;

    default:
      recommendations.required = ['Full Name', 'Profession'];
      recommendations.recommended = ['Profile Image', 'Portfolio Bio', 'Gallery Images'];
      recommendations.optional = ['Contact Email', 'Social Links', 'Skills'];
  }

  return recommendations;
}

/**
 * Generate template preview URL
 */
export function generateTemplatePreviewUrl(templateType: TemplateType, portfolioId?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  if (portfolioId) {
    return `${baseUrl}/portfolio/${portfolioId}/preview?template=${templateType}`;
  }
  
  return `${baseUrl}/templates/${templateType}/preview`;
}

/**
 * Generate portfolio public URL
 */
export function generatePortfolioUrl(slug: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/${slug}`;
}

/**
 * Extract colors from template config
 */
export function getTemplateColors(templateType: TemplateType): {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
} {
  const config = getTemplateConfig(templateType);
  return config?.color_scheme || {
    primary: '#000000',
    secondary: '#666666',
    accent: '#0066cc',
    background: '#ffffff',
    text: '#000000'
  };
}

/**
 * Get template features list
 */
export function getTemplateFeatures(templateType: TemplateType): string[] {
  const config = getTemplateConfig(templateType);
  return config?.features.map(feature => feature.name) || [];
}

/**
 * Check if template supports feature
 */
export function templateSupportsFeature(templateType: TemplateType, featureName: string): boolean {
  const features = getTemplateFeatures(templateType);
  return features.includes(featureName);
}

/**
 * Get template category info
 */
export function getTemplateCategoryInfo(templateType: TemplateType): {
  category: string;
  description: string;
  bestFor: string[];
} {
  const config = getTemplateConfig(templateType);
  
  if (!config) {
    return {
      category: 'unknown',
      description: 'Template information not available',
      bestFor: []
    };
  }

  const categoryInfo = {
    professional: {
      description: 'Clean, traditional design suitable for corporate environments',
      bestFor: ['Corporate headshots', 'Traditional industries', 'Formal presentations']
    },
    bold: {
      description: 'Vibrant, dynamic design that makes a strong impression',
      bestFor: ['Creative industries', 'Social media presence', 'Dynamic portfolios']
    },
    minimal: {
      description: 'Clean, elegant design focused on content and typography',
      bestFor: ['Artistic work', 'Fashion', 'Refined aesthetic preferences']
    },
    creative: {
      description: 'Unique, artistic design for creative professionals',
      bestFor: ['Art direction', 'Experimental work', 'Unique artistic vision']
    }
  };

  return {
    category: config.category,
    description: categoryInfo[config.category]?.description || 'Template information not available',
    bestFor: categoryInfo[config.category]?.bestFor || []
  };
}

/**
 * Generate template metadata for SEO
 */
export function generateTemplateMetadata(templateType: TemplateType, data?: PortfolioData): {
  title: string;
  description: string;
  keywords: string[];
} {
  const config = getTemplateConfig(templateType);
  const userName = data?.user?.full_name || 'Professional';
  const userProfession = data?.user?.profession || 'Professional';
  
  return {
    title: data 
      ? `${userName} - ${userProfession} Portfolio`
      : `${config?.name || 'Template'} - Portfolio Template`,
    description: data
      ? `${userName}'s professional portfolio showcasing ${userProfession.toLowerCase()} work and experience.`
      : `${config?.description || 'Professional portfolio template'} - Create your professional portfolio with this template.`,
    keywords: [
      'portfolio',
      'professional',
      userProfession?.toLowerCase() || 'professional',
      config?.category || 'template',
      ...(data?.portfolio?.skills || []),
      ...(config?.features.map(f => f.name.toLowerCase()) || [])
    ]
  };
}

/**
 * Format template data for export
 */
export function formatTemplateDataForExport(data: PortfolioData, templateType: TemplateType): {
  templateType: TemplateType;
  data: PortfolioData;
  metadata: {
    exportedAt: string;
    version: string;
    templateConfig: any;
  };
} {
  const config = getTemplateConfig(templateType);
  
  return {
    templateType,
    data,
    metadata: {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      templateConfig: config
    }
  };
}

/**
 * Sanitize template data for security
 */
export function sanitizeTemplateData(data: PortfolioData): PortfolioData {
  // Remove potentially dangerous content
  const sanitizeString = (str: string | null | undefined): string | null => {
    if (!str) return null;
    
    // Remove script tags and dangerous HTML
    return str
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  };

  return {
    ...data,
    user: {
      ...data.user,
      full_name: sanitizeString(data.user?.full_name) || '',
      bio: sanitizeString(data.user?.bio),
      location: sanitizeString(data.user?.location)
    },
    portfolio: {
      ...data.portfolio,
      title: sanitizeString(data.portfolio?.title),
      bio: sanitizeString(data.portfolio?.bio),
      skills: data.portfolio?.skills?.map(skill => sanitizeString(skill)).filter(Boolean) as string[]
    },
    contact_info: {
      ...data.contact_info,
      email: sanitizeString(data.contact_info?.email),
      phone: sanitizeString(data.contact_info?.phone)
    }
  };
}

/**
 * Get template performance metrics
 */
export function getTemplatePerformanceMetrics(templateType: TemplateType): {
  complexity: 'low' | 'medium' | 'high';
  loadTime: 'fast' | 'medium' | 'slow';
  mobileOptimized: boolean;
  accessibilityScore: number;
} {
  const metrics = {
    T1: { complexity: 'low', loadTime: 'fast', mobileOptimized: true, accessibilityScore: 95 },
    T2: { complexity: 'medium', loadTime: 'medium', mobileOptimized: true, accessibilityScore: 90 },
    T3: { complexity: 'low', loadTime: 'fast', mobileOptimized: true, accessibilityScore: 98 },
    T4: { complexity: 'high', loadTime: 'medium', mobileOptimized: true, accessibilityScore: 85 }
  };

  return metrics[templateType] || { complexity: 'medium', loadTime: 'medium', mobileOptimized: true, accessibilityScore: 90 };
}