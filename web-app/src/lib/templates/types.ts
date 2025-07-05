import { TemplateType, Portfolio, User, PortfolioImage } from '@/types';

// Enhanced template configuration interfaces
export interface TemplateFeature {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface TemplateConfig {
  id: TemplateType;
  name: string;
  description: string;
  category: 'professional' | 'creative' | 'minimal' | 'bold';
  features: TemplateFeature[];
  preview_image: string;
  color_scheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    heading: string;
    body: string;
    accent: string;
  };
  layout: {
    sections: string[];
    grid_columns: number;
    responsive_breakpoints: Record<string, number>;
  };
  customization_options: {
    colors: boolean;
    fonts: boolean;
    layout: boolean;
    sections: boolean;
  };
}

// Portfolio data structure for template rendering
export interface PortfolioData {
  user: User;
  portfolio: Portfolio;
  images: {
    profile?: PortfolioImage;
    hero?: PortfolioImage;
    gallery: PortfolioImage[];
  };
  social_links: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    linkedin?: string;
    website?: string;
  };
  contact_info: {
    email?: string;
    phone?: string;
    location?: string;
    agent?: {
      name: string;
      email: string;
      phone: string;
    };
  };
  stats: {
    experience_years: number;
    projects_completed?: number;
    view_count: number;
  };
  availability: {
    status: 'available' | 'busy' | 'unavailable';
    location_preferences?: string[];
    rate_info?: {
      per_hour?: number;
      per_day?: number;
      currency: string;
    };
  };
}

// Template component props interface
export interface TemplateProps {
  data: PortfolioData;
  isPreview?: boolean;
  isEditing?: boolean;
  className?: string;
  onSectionClick?: (sectionId: string) => void;
  customizations?: TemplateCustomizations;
}

// Template customization options
export interface TemplateCustomizations {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
  };
  fonts?: {
    heading?: string;
    body?: string;
    accent?: string;
  };
  layout?: {
    sections_order?: string[];
    sections_visibility?: Record<string, boolean>;
    grid_columns?: number;
  };
  animations?: {
    enabled: boolean;
    speed: 'slow' | 'normal' | 'fast';
  };
}

// Template section configuration
export interface TemplateSection {
  id: string;
  name: string;
  description: string;
  required: boolean;
  order: number;
  component: React.ComponentType<TemplateSectionProps>;
  props?: Record<string, unknown>;
}

export interface TemplateSectionProps {
  data: PortfolioData;
  isPreview?: boolean;
  isEditing?: boolean;
  customizations?: TemplateCustomizations;
  onEdit?: (sectionId: string, data: unknown) => void;
}

// Template preview data interface
export interface TemplatePreviewData {
  template_id: TemplateType;
  sample_data: PortfolioData;
  preview_modes: {
    desktop: boolean;
    tablet: boolean;
    mobile: boolean;
  };
  interactive_features: string[];
}

// Template registry interface
export interface TemplateRegistry {
  [key: string]: {
    config: TemplateConfig;
    component: React.ComponentType<TemplateProps>;
    sections: TemplateSection[];
    preview_data: TemplatePreviewData;
  };
}

// Template validation schema
export interface TemplateValidation {
  required_fields: string[];
  optional_fields: string[];
  image_requirements: {
    profile: {
      required: boolean;
      min_dimensions?: { width: number; height: number };
      aspect_ratio?: number;
    };
    hero: {
      required: boolean;
      min_dimensions?: { width: number; height: number };
      aspect_ratio?: number;
    };
    gallery: {
      min_count: number;
      max_count: number;
      min_dimensions?: { width: number; height: number };
    };
  };
  content_limits: {
    bio_max_length: number;
    skills_max_count: number;
    experience_min_years: number;
  };
}

// Template analytics interface
export interface TemplateAnalytics {
  template_id: TemplateType;
  usage_count: number;
  conversion_rate: number;
  average_completion_time: number;
  popular_customizations: string[];
  user_ratings: {
    average: number;
    count: number;
    distribution: Record<number, number>;
  };
}

// Export type helpers
export type TemplateComponent = React.ComponentType<TemplateProps>;
export type TemplateSectionComponent = React.ComponentType<TemplateSectionProps>;