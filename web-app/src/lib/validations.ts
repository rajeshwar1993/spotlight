import { z } from 'zod';
import { Profession, Gender, TemplateType, ImageType, PortfolioStatus } from '@/types';
import { FORM_LIMITS } from './constants';

// Authentication schemas
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z
    .string()
    .min(
      FORM_LIMITS.fullName.min,
      `Name must be at least ${FORM_LIMITS.fullName.min} characters`
    )
    .max(
      FORM_LIMITS.fullName.max,
      `Name must be no more than ${FORM_LIMITS.fullName.max} characters`
    ),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Portfolio creation schemas
export const portfolioStep1Schema = z.object({
  full_name: z
    .string()
    .min(
      FORM_LIMITS.fullName.min,
      `Name must be at least ${FORM_LIMITS.fullName.min} characters`
    )
    .max(
      FORM_LIMITS.fullName.max,
      `Name must be no more than ${FORM_LIMITS.fullName.max} characters`
    ),
  email: z.string().email('Invalid email address'),
  profession: z.nativeEnum(Profession, { required_error: 'Please select a profession' }),
  location: z
    .string()
    .max(
      FORM_LIMITS.location.max,
      `Location must be no more than ${FORM_LIMITS.location.max} characters`
    )
    .optional(),
});

export const portfolioStep2Schema = z.object({
  template_type: z.nativeEnum(TemplateType, {
    required_error: 'Please select a template',
  }),
});

export const portfolioStep3Schema = z.object({
  title: z
    .string()
    .min(
      FORM_LIMITS.title.min,
      `Title must be at least ${FORM_LIMITS.title.min} characters`
    )
    .max(
      FORM_LIMITS.title.max,
      `Title must be no more than ${FORM_LIMITS.title.max} characters`
    ),
  bio: z
    .string()
    .min(
      FORM_LIMITS.bio.min,
      `Bio must be at least ${FORM_LIMITS.bio.min} characters`
    )
    .max(
      FORM_LIMITS.bio.max,
      `Bio must be no more than ${FORM_LIMITS.bio.max} characters`
    ),
});

export const createPortfolioSchema = z.object({
  step1: portfolioStep1Schema,
  step2: portfolioStep2Schema,
  step3: portfolioStep3Schema,
});

// Profile update schema
export const updateProfileSchema = z.object({
  full_name: z
    .string()
    .min(
      FORM_LIMITS.fullName.min,
      `Name must be at least ${FORM_LIMITS.fullName.min} characters`
    )
    .max(
      FORM_LIMITS.fullName.max,
      `Name must be no more than ${FORM_LIMITS.fullName.max} characters`
    )
    .optional(),
  bio: z
    .string()
    .max(
      FORM_LIMITS.bio.max,
      `Bio must be no more than ${FORM_LIMITS.bio.max} characters`
    )
    .optional(),
  location: z
    .string()
    .max(
      FORM_LIMITS.location.max,
      `Location must be no more than ${FORM_LIMITS.location.max} characters`
    )
    .optional(),
  website: z
    .string()
    .url('Invalid website URL')
    .max(
      FORM_LIMITS.website.max,
      `Website must be no more than ${FORM_LIMITS.website.max} characters`
    )
    .optional()
    .or(z.literal('')),
  phone: z.string().optional(),
  gender: z.nativeEnum(Gender).optional(),
});

// Enhanced portfolio schema with all fields
export const portfolioSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(255, 'Title must be no more than 255 characters'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(255, 'Slug must be no more than 255 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .optional(),
  template: z.nativeEnum(TemplateType),
  status: z.nativeEnum(PortfolioStatus),
  bio: z
    .string()
    .max(2000, 'Bio must be no more than 2000 characters')
    .optional(),
  skills: z.array(z.string().max(100)).max(20, 'Maximum 20 skills allowed').optional(),
  experience_years: z.number().int().min(0).max(50).default(0),
  height: z.string().max(20).optional(),
  weight: z.string().max(20).optional(),
  measurements: z.record(z.string()).optional(),
  hair_color: z.string().max(50).optional(),
  eye_color: z.string().max(50).optional(),
  clothing_size: z.string().max(20).optional(),
  shoe_size: z.string().max(20).optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().max(20).optional(),
  availability_status: z.enum(['available', 'busy', 'unavailable']).default('available'),
  location_preferences: z.array(z.string().max(100)).max(10).optional(),
  rate_per_hour: z.number().positive().optional(),
  rate_per_day: z.number().positive().optional(),
  currency: z.string().length(3).default('USD'),
  seo_title: z.string().max(255).optional(),
  seo_description: z.string().max(500).optional(),
  seo_keywords: z.array(z.string().max(50)).max(10).optional(),
});

// Update portfolio schema (partial)
export const updatePortfolioSchema = portfolioSchema.partial();

// Portfolio skill schema
export const portfolioSkillSchema = z.object({
  skill_name: z.string().min(1).max(100),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  years_experience: z.number().int().min(0).max(50).default(0),
});

// Portfolio tag schema
export const portfolioTagSchema = z.object({
  tag_name: z.string().min(1).max(50),
});

// Enhanced image upload schema
export const imageUploadSchema = z.object({
  file: z.instanceof(File),
  type: z.nativeEnum(ImageType),
  alt_text: z.string().max(200).optional(),
  is_primary: z.boolean().default(false),
  sort_order: z.number().int().min(0).default(0),
});

// Image update schema
export const imageUpdateSchema = z.object({
  alt_text: z.string().max(200).optional(),
  is_primary: z.boolean().optional(),
  sort_order: z.number().int().min(0).optional(),
});

// User profile schema with all fields
export const userProfileSchema = z.object({
  full_name: z.string().min(1).max(255).optional(),
  profession: z.nativeEnum(Profession),
  gender: z.nativeEnum(Gender).optional(),
  date_of_birth: z.string().date().optional(),
  location: z.string().max(255).optional(),
  phone: z.string().max(20).optional(),
  bio: z.string().max(1000).optional(),
  website_url: z.string().url().max(255).optional(),
  social_instagram: z.string().max(100).optional(),
  social_twitter: z.string().max(100).optional(),
  social_tiktok: z.string().max(100).optional(),
  social_linkedin: z.string().max(100).optional(),
});

// Search and filter schemas
export const portfolioSearchSchema = z.object({
  query: z.string().max(100).optional(),
  template: z.nativeEnum(TemplateType).optional(),
  location: z.string().max(100).optional(),
  skill: z.string().max(100).optional(),
  min_experience: z.number().int().min(0).max(50).optional(),
  sort_by: z.enum(['relevance', 'views', 'recent', 'experience']).default('relevance'),
  limit: z.number().int().min(1).max(50).default(20),
  offset: z.number().int().min(0).default(0),
});

// Portfolio analytics schema
export const portfolioAnalyticsSchema = z.object({
  portfolio_id: z.string().uuid(),
  date_from: z.string().date().optional(),
  date_to: z.string().date().optional(),
});

// Contact form schema
export const contactFormSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(1000),
  portfolio_id: z.string().uuid().optional(),
});

// Report content schema
export const reportContentSchema = z.object({
  content_type: z.enum(['portfolio', 'image', 'user']),
  content_id: z.string().uuid(),
  reason: z.enum([
    'inappropriate_content',
    'spam',
    'harassment',
    'copyright_violation',
    'fake_profile',
    'other'
  ]),
  description: z.string().max(500).optional(),
});

// Password reset schema
export const passwordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const passwordUpdateSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(8, 'Password confirmation is required'),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

// API response schemas for type safety
export const apiResponseSchema = z.object({
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const paginatedResponseSchema = z.object({
  data: z.array(z.any()),
  count: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  totalPages: z.number().int(),
});

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 50 * 1024 * 1024, 'File size must be less than 50MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type),
      'File must be a valid image (JPEG, PNG, WebP, or GIF)'
    ),
});

// Type exports
export type SignUpForm = z.infer<typeof signUpSchema>;
export type SignInForm = z.infer<typeof signInSchema>;
export type PortfolioStep1Form = z.infer<typeof portfolioStep1Schema>;
export type PortfolioStep2Form = z.infer<typeof portfolioStep2Schema>;
export type PortfolioStep3Form = z.infer<typeof portfolioStep3Schema>;
export type CreatePortfolioForm = z.infer<typeof createPortfolioSchema>;
export type UpdateProfileForm = z.infer<typeof updateProfileSchema>;
export type PortfolioForm = z.infer<typeof portfolioSchema>;
export type PortfolioSkillForm = z.infer<typeof portfolioSkillSchema>;
export type PortfolioTagForm = z.infer<typeof portfolioTagSchema>;
export type ImageUploadForm = z.infer<typeof imageUploadSchema>;
export type ImageUpdateForm = z.infer<typeof imageUpdateSchema>;
export type UserProfileForm = z.infer<typeof userProfileSchema>;
export type PortfolioSearchForm = z.infer<typeof portfolioSearchSchema>;
export type PortfolioAnalyticsForm = z.infer<typeof portfolioAnalyticsSchema>;
export type ContactForm = z.infer<typeof contactFormSchema>;
export type ReportContentForm = z.infer<typeof reportContentSchema>;
export type PasswordResetForm = z.infer<typeof passwordResetSchema>;
export type PasswordUpdateForm = z.infer<typeof passwordUpdateSchema>;
export type FileUploadForm = z.infer<typeof fileUploadSchema>;
