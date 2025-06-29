// Core type definitions for the Spotlight application

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  gender?: Gender;
  location?: string;
  bio?: string;
  phone?: string;
  website?: string;
  social_links?: SocialLinks;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export enum UserRole {
  ACTOR = 'ACTOR',
  MODEL = 'MODEL',
  BOTH = 'BOTH',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  facebook?: string;
  linkedin?: string;
  tiktok?: string;
  youtube?: string;
}

export interface Portfolio {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  template_type: TemplateType;
  bio: string;
  is_published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export enum TemplateType {
  T1 = 'T1', // Classic Professional
  T2 = 'T2', // Modern Bold
  T3 = 'T3', // Minimal Elegant
  T4 = 'T4', // Creative Artistic
}

export interface PortfolioImage {
  id: string;
  portfolio_id: string;
  image_url: string;
  image_type: ImageType;
  title?: string;
  description?: string;
  sort_order: number;
  created_at: string;
}

export enum ImageType {
  HEADSHOT = 'HEADSHOT',
  FULL_BODY = 'FULL_BODY',
  PORTFOLIO = 'PORTFOLIO',
  PROFILE = 'PROFILE',
}

// Form types
export interface CreatePortfolioForm {
  step1: {
    full_name: string;
    email: string;
    role: UserRole;
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
