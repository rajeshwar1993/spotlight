import { TemplateType, Profession, Gender, PortfolioStatus } from '@/types';
import type { PortfolioData, TemplatePreviewData } from './types';

// Sample user data for template previews
const SAMPLE_USER = {
  id: 'preview-user-1',
  email: 'alex.rivera@example.com',
  full_name: 'Alex Rivera',
  profession: Profession.BOTH,
  gender: Gender.NON_BINARY,
  date_of_birth: '1995-06-15',
  location: 'Los Angeles, CA',
  bio: 'Passionate actor and model with 5+ years of experience in commercial, fashion, and theatrical work. Known for versatility, professionalism, and collaborative spirit.',
  phone: '+1 (555) 123-4567',
  website_url: 'https://alexrivera.com',
  social_links: {
    instagram: 'alexrivera_official',
    twitter: 'alexrivera',
    tiktok: 'alexr_creative',
    linkedin: 'alex-rivera-actor'
  },
  is_email_verified: true,
  is_profile_complete: true,
  created_at: '2023-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z'
};

// Sample portfolio data
const SAMPLE_PORTFOLIO = {
  id: 'preview-portfolio-1',
  user_id: 'preview-user-1',
  title: 'Alex Rivera - Actor & Model Portfolio',
  slug: 'alex-rivera',
  template: 'T1' as TemplateType,
  status: PortfolioStatus.PUBLISHED,
  bio: 'Dynamic performer with extensive experience in both commercial and artistic projects. Trained at prestigious institutions and featured in national campaigns.',
  skills: [
    'Method Acting',
    'Commercial Acting',
    'Fashion Modeling',
    'Dance',
    'Voiceover',
    'Stage Combat',
    'Improvisation',
    'Runway Modeling'
  ],
  experience_years: 5,
  height: '5\'8"',
  weight: '150 lbs',
  measurements: {
    chest: '38"',
    waist: '30"',
    hips: '36"',
    inseam: '32"'
  },
  hair_color: 'Dark Brown',
  eye_color: 'Green',
  clothing_size: 'M',
  shoe_size: '9',
  is_published: true,
  view_count: 2847,
  seo_title: 'Alex Rivera - Professional Actor & Model Portfolio',
  seo_description: 'Experienced actor and model specializing in commercial and fashion work. Available for casting in Los Angeles and nationwide.',
  seo_keywords: ['actor', 'model', 'Los Angeles', 'commercial', 'fashion', 'casting'],
  created_at: '2023-02-01T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z'
};

// Sample images
const SAMPLE_IMAGES = {
  profile: {
    id: 'preview-img-profile',
    user_id: 'preview-user-1',
    portfolio_id: 'preview-portfolio-1',
    type: 'PROFILE' as const,
    file_name: 'alex-rivera-headshot.jpg',
    file_path: '/samples/alex-rivera-headshot.jpg',
    file_size: 256000,
    width: 800,
    height: 800,
    alt_text: 'Alex Rivera professional headshot',
    is_primary: true,
    sort_order: 0,
    created_at: '2023-02-01T10:00:00Z',
    updated_at: '2023-02-01T10:00:00Z'
  },
  hero: {
    id: 'preview-img-hero',
    user_id: 'preview-user-1',
    portfolio_id: 'preview-portfolio-1',
    type: 'HERO' as const,
    file_name: 'alex-rivera-hero.jpg',
    file_path: '/samples/alex-rivera-hero.jpg',
    file_size: 512000,
    width: 1600,
    height: 900,
    alt_text: 'Alex Rivera in dramatic lighting for portfolio hero image',
    is_primary: false,
    sort_order: 0,
    created_at: '2023-02-01T10:00:00Z',
    updated_at: '2023-02-01T10:00:00Z'
  },
  gallery: [
    {
      id: 'preview-img-gallery-1',
      user_id: 'preview-user-1',
      portfolio_id: 'preview-portfolio-1',
      type: 'GALLERY' as const,
      file_name: 'alex-rivera-commercial-1.jpg',
      file_path: '/samples/alex-rivera-commercial-1.jpg',
      file_size: 384000,
      width: 1200,
      height: 800,
      alt_text: 'Alex Rivera in commercial shoot for tech company',
      is_primary: false,
      sort_order: 1,
      created_at: '2023-02-01T10:00:00Z',
      updated_at: '2023-02-01T10:00:00Z'
    },
    {
      id: 'preview-img-gallery-2',
      user_id: 'preview-user-1',
      portfolio_id: 'preview-portfolio-1',
      type: 'GALLERY' as const,
      file_name: 'alex-rivera-fashion-1.jpg',
      file_path: '/samples/alex-rivera-fashion-1.jpg',
      file_size: 420000,
      width: 1200,
      height: 1600,
      alt_text: 'Alex Rivera fashion modeling shot',
      is_primary: false,
      sort_order: 2,
      created_at: '2023-02-01T10:00:00Z',
      updated_at: '2023-02-01T10:00:00Z'
    },
    {
      id: 'preview-img-gallery-3',
      user_id: 'preview-user-1',
      portfolio_id: 'preview-portfolio-1',
      type: 'GALLERY' as const,
      file_name: 'alex-rivera-theatrical.jpg',
      file_path: '/samples/alex-rivera-theatrical.jpg',
      file_size: 356000,
      width: 1200,
      height: 800,
      alt_text: 'Alex Rivera in character for theatrical production',
      is_primary: false,
      sort_order: 3,
      created_at: '2023-02-01T10:00:00Z',
      updated_at: '2023-02-01T10:00:00Z'
    },
    {
      id: 'preview-img-gallery-4',
      user_id: 'preview-user-1',
      portfolio_id: 'preview-portfolio-1',
      type: 'GALLERY' as const,
      file_name: 'alex-rivera-lifestyle.jpg',
      file_path: '/samples/alex-rivera-lifestyle.jpg',
      file_size: 398000,
      width: 1200,
      height: 800,
      alt_text: 'Alex Rivera lifestyle modeling shot',
      is_primary: false,
      sort_order: 4,
      created_at: '2023-02-01T10:00:00Z',
      updated_at: '2023-02-01T10:00:00Z'
    }
  ]
};

// Base portfolio data for all templates
const BASE_PORTFOLIO_DATA: PortfolioData = {
  user: SAMPLE_USER,
  portfolio: SAMPLE_PORTFOLIO,
  images: SAMPLE_IMAGES,
  social_links: {
    instagram: 'https://instagram.com/alexrivera_official',
    twitter: 'https://twitter.com/alexrivera',
    tiktok: 'https://tiktok.com/@alexr_creative',
    linkedin: 'https://linkedin.com/in/alex-rivera-actor',
    website: 'https://alexrivera.com'
  },
  contact_info: {
    email: 'alex.rivera@example.com',
    phone: '+1 (555) 123-4567',
    location: 'Los Angeles, CA',
    agent: {
      name: 'Sarah Chen',
      email: 'sarah@talentplus.com',
      phone: '+1 (555) 987-6543'
    }
  },
  stats: {
    experience_years: 5,
    projects_completed: 23,
    view_count: 2847
  },
  availability: {
    status: 'available',
    location_preferences: ['Los Angeles', 'New York', 'Chicago', 'Atlanta'],
    rate_info: {
      per_hour: 150,
      per_day: 1200,
      currency: 'USD'
    }
  }
};

// Template-specific preview configurations
export const TEMPLATE_PREVIEW_DATA: Record<TemplateType, TemplatePreviewData> = {
  T1: {
    template_id: 'T1',
    sample_data: {
      ...BASE_PORTFOLIO_DATA,
      portfolio: {
        ...BASE_PORTFOLIO_DATA.portfolio,
        template: 'T1',
        bio: 'Experienced professional actor and model with a refined, classical approach to performance. Specializes in dramatic roles and high-end commercial work.'
      }
    },
    preview_modes: {
      desktop: true,
      tablet: true,
      mobile: true
    },
    interactive_features: [
      'Smooth scrolling navigation',
      'Image gallery lightbox',
      'Contact form integration',
      'Social media links'
    ]
  },

  T2: {
    template_id: 'T2',
    sample_data: {
      ...BASE_PORTFOLIO_DATA,
      portfolio: {
        ...BASE_PORTFOLIO_DATA.portfolio,
        template: 'T2',
        bio: 'Bold, contemporary performer pushing boundaries in both acting and modeling. Known for dynamic energy and striking visual presence across all media.'
      }
    },
    preview_modes: {
      desktop: true,
      tablet: true,
      mobile: true
    },
    interactive_features: [
      'Parallax scrolling effects',
      'Interactive portfolio grid',
      'Animated skill bars',
      'Video background support',
      'Advanced hover animations'
    ]
  },

  T3: {
    template_id: 'T3',
    sample_data: {
      ...BASE_PORTFOLIO_DATA,
      portfolio: {
        ...BASE_PORTFOLIO_DATA.portfolio,
        template: 'T3',
        bio: 'Minimalist artist focused on authentic, nuanced performances. Believes in the power of subtlety and emotional truth in every project.'
      }
    },
    preview_modes: {
      desktop: true,
      tablet: true,
      mobile: true
    },
    interactive_features: [
      'Elegant fade transitions',
      'Minimalist navigation',
      'Typography-focused design',
      'Clean contact integration'
    ]
  },

  T4: {
    template_id: 'T4',
    sample_data: {
      ...BASE_PORTFOLIO_DATA,
      portfolio: {
        ...BASE_PORTFOLIO_DATA.portfolio,
        template: 'T4',
        bio: 'Creative visionary exploring the intersection of performance and art. Passionate about experimental work, unique storytelling, and pushing creative boundaries.'
      }
    },
    preview_modes: {
      desktop: true,
      tablet: true,
      mobile: true
    },
    interactive_features: [
      'Creative layout animations',
      'Artistic image presentations',
      'Custom typography treatments',
      'Unique navigation patterns',
      'Gradient color overlays'
    ]
  }
};

// Helper function to get preview data by template
export function getTemplatePreviewData(templateId: TemplateType): TemplatePreviewData {
  return TEMPLATE_PREVIEW_DATA[templateId];
}

// Helper function to get sample portfolio data
export function getSamplePortfolioData(templateId: TemplateType): PortfolioData {
  return TEMPLATE_PREVIEW_DATA[templateId].sample_data;
}