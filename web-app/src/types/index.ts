// Core type definitions for the Spotlight application
import type { 
  Profession as DbProfession,
  GenderType as DbGenderType,
  ImageType as DbImageType,
  TemplateType as DbTemplateType,
  PortfolioStatus as DbPortfolioStatus
} from './database';

// Re-export database enums for consistency
export type Profession = DbProfession;
export type Gender = DbGenderType;
export type ImageType = DbImageType;
export type TemplateType = DbTemplateType;
export type PortfolioStatus = DbPortfolioStatus;

// Enum objects for use in components
export const Profession = {
  ACTOR: 'ACTOR' as const,
  MODEL: 'MODEL' as const,
  BOTH: 'BOTH' as const,
};

export const Gender = {
  MALE: 'MALE' as const,
  FEMALE: 'FEMALE' as const,
  NON_BINARY: 'NON_BINARY' as const,
  PREFER_NOT_TO_SAY: 'PREFER_NOT_TO_SAY' as const,
};

export const ImageType = {
  PROFILE: 'PROFILE' as const,
  HERO: 'HERO' as const,
  GALLERY: 'GALLERY' as const,
  INTERNAL: 'INTERNAL' as const,
};

export const TemplateType = {
  T1: 'T1' as const, // Classic Professional
  T2: 'T2' as const, // Modern Bold
  T3: 'T3' as const, // Minimal Elegant
  T4: 'T4' as const, // Creative Artistic
};

export const PortfolioStatus = {
  DRAFT: 'DRAFT' as const,
  PUBLISHED: 'PUBLISHED' as const,
  ARCHIVED: 'ARCHIVED' as const,
};

// Application-level interfaces (transformed from database types)
export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  profession?: Profession | null;
  gender?: Gender | null;
  date_of_birth?: string | null;
  location?: string | null;
  bio?: string | null;
  phone?: string | null;
  website_url?: string | null;
  social_links?: SocialLinks;
  is_email_verified: boolean;
  is_profile_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface SocialLinks {
  instagram?: string | null;
  twitter?: string | null;
  tiktok?: string | null;
  linkedin?: string | null;
}

export interface Portfolio {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  template: TemplateType;
  status: PortfolioStatus;
  bio?: string | null;
  skills?: string[] | null;
  experience_years: number;
  height?: string | null;
  weight?: string | null;
  measurements?: PortfolioMeasurements | null;
  hair_color?: string | null;
  eye_color?: string | null;
  clothing_size?: string | null;
  shoe_size?: string | null;
  is_published: boolean;
  view_count: number;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface PortfolioMeasurements {
  bust?: string;
  waist?: string;
  hips?: string;
  chest?: string;
  inseam?: string;
  neck?: string;
  sleeve?: string;
  [key: string]: string | undefined;
}

export interface PortfolioImage {
  id: string;
  user_id: string;
  portfolio_id?: string | null;
  type: ImageType;
  file_name: string;
  file_path: string;
  file_size: number;
  width?: number | null;
  height?: number | null;
  alt_text?: string | null;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  is_active: boolean;
  start_date: string;
  end_date?: string | null;
  created_at: string;
  updated_at: string;
}

// Form types
export interface CreatePortfolioForm {
  step1: {
    full_name: string;
    email: string;
    profession: Profession;
    location?: string;
  };
  step2: {
    template_type: TemplateType;
  };
  step3: {
    title: string;
    bio: string;
  };
}

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}
