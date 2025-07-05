// Template exports for the Spotlight portfolio system
export { default as TemplateRenderer } from './template-renderer';
export { TemplatePreviewRenderer, MobileTemplateRenderer } from './template-renderer';

export { TemplateWrapper } from './template-wrapper';
export { TemplateLoadingSkeleton } from './template-loading';
export { TemplateErrorBoundary, useTemplateErrorHandler } from './template-error-boundary';

export {
  BaseTemplateLayout,
  TemplateSectionWrapper,
  TemplateHeroImage,
  TemplateProfileImage,
  TemplateGalleryGrid,
  TemplateSkillsList,
  TemplateSocialLinks,
  BaseTemplate
} from './base-template';

// Template components
export { default as T1Template } from './t1';
export { default as T2Template } from './t2';
export { default as T3Template } from './t3';
export { default as T4Template } from './t4';

// Template configuration and registry
export {
  TEMPLATE_CONFIGS,
  TEMPLATE_VALIDATIONS,
  TEMPLATE_CATEGORIES,
  DEFAULT_TEMPLATE_DATA
} from '@/lib/templates/config';

export {
  getTemplateConfig,
  getTemplateComponent,
  getTemplatePreview,
  getAllTemplates,
  getTemplatesByCategory,
  validateTemplateData
} from '@/lib/templates/registry-simple';

export {
  TEMPLATE_PREVIEW_DATA,
  getSamplePortfolioData
} from '@/lib/templates/preview-data';

// Template types
export type {
  TemplateConfig,
  TemplateProps,
  PortfolioData,
  TemplateCustomizations,
  TemplateSection,
  TemplateSectionProps,
  TemplateRegistry,
  TemplateValidation,
  TemplateAnalytics,
  TemplateComponent,
  TemplateSectionComponent
} from '@/lib/templates/types';

// Template utility exports
export {
  validatePortfolioData,
  calculatePortfolioCompletion,
  getTemplateRecommendations,
  generateTemplatePreviewUrl,
  generatePortfolioUrl,
  getTemplateColors,
  getTemplateFeatures,
  templateSupportsFeature,
  getTemplateCategoryInfo,
  generateTemplateMetadata,
  formatTemplateDataForExport,
  sanitizeTemplateData,
  getTemplatePerformanceMetrics
} from '@/lib/templates/utils';

export {
  useTemplateConfig,
  useTemplateValidation,
  usePortfolioCompletion,
  useTemplateRecommendations,
  useTemplateSelection,
  useTemplatePreview,
  useTemplateData,
  useTemplateLoader,
  useTemplateAnalytics
} from '@/lib/templates/hooks';

// Portfolio service exports
export {
  getPortfolio,
  getUserPortfolios,
  getPortfolioBySlug,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  getPortfolioImages,
  uploadPortfolioImage,
  deletePortfolioImage,
  getPortfolioData,
  isSlugAvailable,
  generateSlug
} from '@/lib/services/portfolio';

// CSS for templates (to be included in global styles)
export { TEMPLATE_CSS_VARIABLES } from './template-wrapper';