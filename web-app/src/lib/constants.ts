// Application constants

export const APP_CONFIG = {
  name: 'Spotlight',
  description:
    'Create professional portfolios for actors and models in under 5 minutes',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

export const ROUTES = {
  home: '/',
  signup: '/auth/signup',
  signin: '/auth/signin',
  dashboard: '/dashboard',
  profile: '/profile',
  createPortfolio: '/create',
  portfolio: (slug: string) => `/mypage/${slug}`,
  preview: (id: string) => `/preview/${id}`,
  // Additional routes for navigation
  examples: '/examples',
  templates: '/templates',
  pricing: '/pricing',
} as const;

export const FORM_LIMITS = {
  fullName: { min: 2, max: 50 },
  bio: { min: 10, max: 500 },
  title: { min: 5, max: 100 },
  location: { max: 100 },
  website: { max: 200 },
} as const;

export const IMAGE_LIMITS = {
  maxFiles: 10,
  maxSize: 10 * 1024 * 1024, // 10MB
  dimensions: {
    minWidth: 400,
    minHeight: 400,
    maxWidth: 4000,
    maxHeight: 4000,
  },
} as const;

export const TEMPLATE_NAMES = {
  T1: 'Classic Professional',
  T2: 'Modern Bold',
  T3: 'Minimal Elegant',
  T4: 'Creative Artistic',
} as const;

export const PROFESSION_LABELS = {
  ACTOR: 'Actor',
  MODEL: 'Model',
  BOTH: 'Actor & Model',
} as const;

export const GENDER_LABELS = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
  PREFER_NOT_TO_SAY: 'Prefer not to say',
} as const;

export const IMAGE_TYPE_LABELS = {
  PROFILE: 'Profile Photo',
  HERO: 'Hero Image',
  GALLERY: 'Gallery Image',
  INTERNAL: 'Internal Use',
} as const;
