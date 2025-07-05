export const locales = ['en'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

// Locale configuration
export const localeConfig = {
  en: {
    label: 'English',
    flag: '🇺🇸',
    direction: 'ltr' as const,
  },
  // Future locales can be added here
  // es: {
  //   label: 'Español',
  //   flag: '🇪🇸',
  //   direction: 'ltr' as const,
  // },
  // fr: {
  //   label: 'Français',
  //   flag: '🇫🇷',
  //   direction: 'ltr' as const,
  // },
} as const;

// Navigation and route configuration
export const pathnames = {
  '/': '/',
  '/dashboard': '/dashboard',
  '/profile': '/profile',
  '/profile/settings': '/profile/settings',
  '/auth/signin': '/auth/signin',
  '/auth/signup': '/auth/signup',
  '/auth/reset-password': '/auth/reset-password',
  '/auth/verify': '/auth/verify',
  // Future dynamic routes
  '/create': '/create',
  '/examples': '/examples',
  '/templates': '/templates',
  '/pricing': '/pricing',
} as const;

export type Pathnames = typeof pathnames;

// Breadcrumb label configuration
export const breadcrumbLabels = {
  home: 'Home',
  dashboard: 'Dashboard',
  profile: 'Profile',
  settings: 'Settings',
  auth: 'Authentication',
  signin: 'Sign In',
  signup: 'Sign Up',
  'reset-password': 'Reset Password',
  verify: 'Verify Email',
  create: 'Create Portfolio',
  examples: 'Examples',
  templates: 'Templates',
  pricing: 'Pricing',
} as const;