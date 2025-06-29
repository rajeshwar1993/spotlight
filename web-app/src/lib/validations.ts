import { z } from 'zod';
import { UserRole, Gender, TemplateType, ImageType } from '@/types';
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
  role: z.nativeEnum(UserRole, { required_error: 'Please select a role' }),
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

// Image upload schema
export const imageUploadSchema = z.object({
  file: z.instanceof(File),
  image_type: z.nativeEnum(ImageType),
  title: z.string().max(100).optional(),
  description: z.string().max(200).optional(),
});

// Type exports
export type SignUpForm = z.infer<typeof signUpSchema>;
export type SignInForm = z.infer<typeof signInSchema>;
export type PortfolioStep1Form = z.infer<typeof portfolioStep1Schema>;
export type PortfolioStep2Form = z.infer<typeof portfolioStep2Schema>;
export type PortfolioStep3Form = z.infer<typeof portfolioStep3Schema>;
export type CreatePortfolioForm = z.infer<typeof createPortfolioSchema>;
export type UpdateProfileForm = z.infer<typeof updateProfileSchema>;
export type ImageUploadForm = z.infer<typeof imageUploadSchema>;
