import { TemplateType } from '@/types';
import type { TemplateConfig, TemplateValidation } from './types';

// Template configurations for all available templates
export const TEMPLATE_CONFIGS: Record<TemplateType, TemplateConfig> = {
  T1: {
    id: 'T1',
    name: 'Classic Professional',
    description: 'A timeless, elegant design perfect for traditional portfolio presentations. Features clean lines, professional typography, and structured layouts.',
    category: 'professional',
    features: [
      {
        id: 'clean_layout',
        name: 'Clean Layout',
        description: 'Minimalist design with clear sections and professional spacing',
        icon: 'layout'
      },
      {
        id: 'traditional_typography',
        name: 'Traditional Typography',
        description: 'Classic serif fonts for a sophisticated look',
        icon: 'type'
      },
      {
        id: 'structured_sections',
        name: 'Structured Sections',
        description: 'Well-organized content blocks for easy navigation',
        icon: 'grid'
      },
      {
        id: 'print_friendly',
        name: 'Print Friendly',
        description: 'Optimized for both digital and print viewing',
        icon: 'printer'
      }
    ],
    preview_image: '/templates/t1-preview.jpg',
    color_scheme: {
      primary: '#2D3748',
      secondary: '#4A5568',
      accent: '#805AD5',
      background: '#FFFFFF',
      text: '#1A202C'
    },
    typography: {
      heading: 'Playfair Display',
      body: 'Inter',
      accent: 'Inter'
    },
    layout: {
      sections: ['hero', 'about', 'experience', 'gallery', 'contact'],
      grid_columns: 12,
      responsive_breakpoints: {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280
      }
    },
    customization_options: {
      colors: true,
      fonts: true,
      layout: false,
      sections: true
    }
  },

  T2: {
    id: 'T2',
    name: 'Modern Bold',
    description: 'A contemporary design with vibrant colors and dynamic layouts. Perfect for creative professionals who want to stand out.',
    category: 'bold',
    features: [
      {
        id: 'vibrant_colors',
        name: 'Vibrant Colors',
        description: 'Bold color schemes that capture attention',
        icon: 'palette'
      },
      {
        id: 'dynamic_layout',
        name: 'Dynamic Layout',
        description: 'Asymmetrical designs with modern grid systems',
        icon: 'layout'
      },
      {
        id: 'interactive_elements',
        name: 'Interactive Elements',
        description: 'Hover effects and smooth animations',
        icon: 'mouse'
      },
      {
        id: 'modern_typography',
        name: 'Modern Typography',
        description: 'Contemporary sans-serif fonts with strong hierarchy',
        icon: 'type'
      }
    ],
    preview_image: '/templates/t2-preview.jpg',
    color_scheme: {
      primary: '#E53E3E',
      secondary: '#D53F8C',
      accent: '#805AD5',
      background: '#1A202C',
      text: '#FFFFFF'
    },
    typography: {
      heading: 'Inter',
      body: 'Inter',
      accent: 'Fira Code'
    },
    layout: {
      sections: ['hero', 'showcase', 'skills', 'portfolio', 'testimonials', 'contact'],
      grid_columns: 16,
      responsive_breakpoints: {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        xxl: 1536
      }
    },
    customization_options: {
      colors: true,
      fonts: true,
      layout: true,
      sections: true
    }
  },

  T3: {
    id: 'T3',
    name: 'Minimal Elegant',
    description: 'A sophisticated minimalist approach with emphasis on white space and typography. Ideal for refined, artistic presentations.',
    category: 'minimal',
    features: [
      {
        id: 'minimal_design',
        name: 'Minimal Design',
        description: 'Clean, uncluttered layouts with focus on content',
        icon: 'minimize'
      },
      {
        id: 'elegant_typography',
        name: 'Elegant Typography',
        description: 'Carefully chosen fonts with perfect spacing',
        icon: 'type'
      },
      {
        id: 'white_space',
        name: 'Strategic White Space',
        description: 'Generous spacing for breathing room and focus',
        icon: 'square'
      },
      {
        id: 'subtle_animations',
        name: 'Subtle Animations',
        description: 'Refined micro-interactions for enhanced UX',
        icon: 'animation'
      }
    ],
    preview_image: '/templates/t3-preview.jpg',
    color_scheme: {
      primary: '#1A202C',
      secondary: '#718096',
      accent: '#4FD1C7',
      background: '#FAFAFA',
      text: '#2D3748'
    },
    typography: {
      heading: 'Playfair Display',
      body: 'Inter',
      accent: 'Inter'
    },
    layout: {
      sections: ['hero', 'intro', 'work', 'about', 'contact'],
      grid_columns: 12,
      responsive_breakpoints: {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280
      }
    },
    customization_options: {
      colors: false,
      fonts: true,
      layout: false,
      sections: true
    }
  },

  T4: {
    id: 'T4',
    name: 'Creative Artistic',
    description: 'An expressive, artistic template with unique layouts and creative elements. Perfect for artists and creative professionals.',
    category: 'creative',
    features: [
      {
        id: 'artistic_layout',
        name: 'Artistic Layout',
        description: 'Creative, non-traditional grid systems and compositions',
        icon: 'layout'
      },
      {
        id: 'unique_elements',
        name: 'Unique Elements',
        description: 'Custom design elements and creative components',
        icon: 'star'
      },
      {
        id: 'expressive_colors',
        name: 'Expressive Colors',
        description: 'Rich, artistic color palettes and gradients',
        icon: 'palette'
      },
      {
        id: 'creative_typography',
        name: 'Creative Typography',
        description: 'Mix of fonts and creative text treatments',
        icon: 'type'
      }
    ],
    preview_image: '/templates/t4-preview.jpg',
    color_scheme: {
      primary: '#9F7AEA',
      secondary: '#F093FB',
      accent: '#F6D55C',
      background: '#1A1B2E',
      text: '#E2E8F0'
    },
    typography: {
      heading: 'Playfair Display',
      body: 'Inter',
      accent: 'Fira Code'
    },
    layout: {
      sections: ['hero', 'creative_intro', 'portfolio_grid', 'artistic_about', 'creative_contact'],
      grid_columns: 12,
      responsive_breakpoints: {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280
      }
    },
    customization_options: {
      colors: true,
      fonts: true,
      layout: true,
      sections: true
    }
  }
};

// Template validation rules
export const TEMPLATE_VALIDATIONS: Record<TemplateType, TemplateValidation> = {
  T1: {
    required_fields: ['full_name', 'profession', 'bio'],
    optional_fields: ['location', 'experience_years', 'skills', 'contact_info'],
    image_requirements: {
      profile: {
        required: true,
        min_dimensions: { width: 400, height: 400 },
        aspect_ratio: 1
      },
      hero: {
        required: false,
        min_dimensions: { width: 1200, height: 600 },
        aspect_ratio: 2
      },
      gallery: {
        min_count: 0,
        max_count: 12,
        min_dimensions: { width: 600, height: 400 }
      }
    },
    content_limits: {
      bio_max_length: 500,
      skills_max_count: 10,
      experience_min_years: 0
    }
  },

  T2: {
    required_fields: ['full_name', 'profession', 'bio'],
    optional_fields: ['location', 'experience_years', 'skills', 'contact_info', 'testimonials'],
    image_requirements: {
      profile: {
        required: true,
        min_dimensions: { width: 500, height: 500 },
        aspect_ratio: 1
      },
      hero: {
        required: true,
        min_dimensions: { width: 1400, height: 800 },
        aspect_ratio: 1.75
      },
      gallery: {
        min_count: 3,
        max_count: 20,
        min_dimensions: { width: 800, height: 600 }
      }
    },
    content_limits: {
      bio_max_length: 800,
      skills_max_count: 15,
      experience_min_years: 0
    }
  },

  T3: {
    required_fields: ['full_name', 'profession', 'bio'],
    optional_fields: ['location', 'experience_years', 'website', 'contact_info'],
    image_requirements: {
      profile: {
        required: true,
        min_dimensions: { width: 400, height: 400 },
        aspect_ratio: 1
      },
      hero: {
        required: false,
        min_dimensions: { width: 1200, height: 800 },
        aspect_ratio: 1.5
      },
      gallery: {
        min_count: 0,
        max_count: 8,
        min_dimensions: { width: 600, height: 600 }
      }
    },
    content_limits: {
      bio_max_length: 300,
      skills_max_count: 8,
      experience_min_years: 0
    }
  },

  T4: {
    required_fields: ['full_name', 'profession', 'bio'],
    optional_fields: ['location', 'experience_years', 'skills', 'contact_info', 'artistic_statement'],
    image_requirements: {
      profile: {
        required: true,
        min_dimensions: { width: 500, height: 500 },
        aspect_ratio: 1
      },
      hero: {
        required: true,
        min_dimensions: { width: 1600, height: 900 },
        aspect_ratio: 1.78
      },
      gallery: {
        min_count: 5,
        max_count: 25,
        min_dimensions: { width: 800, height: 600 }
      }
    },
    content_limits: {
      bio_max_length: 1000,
      skills_max_count: 20,
      experience_min_years: 0
    }
  }
};

// Template categories for filtering
export const TEMPLATE_CATEGORIES = {
  professional: {
    name: 'Professional',
    description: 'Clean, business-appropriate designs',
    templates: ['T1']
  },
  bold: {
    name: 'Bold & Modern',
    description: 'Contemporary designs with striking visuals',
    templates: ['T2']
  },
  minimal: {
    name: 'Minimal',
    description: 'Clean, focused designs with lots of white space',
    templates: ['T3']
  },
  creative: {
    name: 'Creative',
    description: 'Artistic, expressive designs for creative professionals',
    templates: ['T4']
  }
} as const;

// Default template data structure
export const DEFAULT_TEMPLATE_DATA = {
  sections_order: {
    T1: ['hero', 'about', 'experience', 'gallery', 'contact'],
    T2: ['hero', 'showcase', 'skills', 'portfolio', 'testimonials', 'contact'],
    T3: ['hero', 'intro', 'work', 'about', 'contact'],
    T4: ['hero', 'creative_intro', 'portfolio_grid', 'artistic_about', 'creative_contact']
  },
  default_customizations: {
    animations: {
      enabled: true,
      speed: 'normal' as const
    }
  }
} as const;