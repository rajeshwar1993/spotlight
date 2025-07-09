import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Mock providers to avoid complex dependencies
const MockNextIntlProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const MockThemeProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const MockBreadcrumbProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

// Mock messages for testing
const mockMessages = {
  common: {
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
  },
  auth: {
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot Password?',
  },
  portfolio: {
    title: 'Portfolio',
    create: 'Create Portfolio',
    edit: 'Edit Portfolio',
    delete: 'Delete Portfolio',
    publish: 'Publish',
    unpublish: 'Unpublish',
    draft: 'Draft',
    published: 'Published',
  },
  dashboard: {
    title: 'Dashboard',
    portfolios: 'Portfolios',
    profile: 'Profile',
    settings: 'Settings',
    analytics: 'Analytics',
  },
  forms: {
    required: 'This field is required',
    invalid: 'Invalid input',
    tooShort: 'Too short',
    tooLong: 'Too long',
    emailInvalid: 'Invalid email address',
  },
};

// Mock user data for testing
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  email_verified: true,
  user_metadata: {
    full_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
  },
  app_metadata: {
    provider: 'email',
    providers: ['email'],
  },
  aud: 'authenticated',
  role: 'authenticated',
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
  phone: null,
  phone_verified: false,
  identities: [],
  factors: [],
};

// Mock profile data for testing
export const mockProfile = {
  id: 'test-profile-id',
  user_id: 'test-user-id',
  full_name: 'Test User',
  profession: 'actor' as const,
  location: 'New York, NY',
  bio: 'Test bio',
  avatar_url: 'https://example.com/avatar.jpg',
  website: 'https://example.com',
  instagram: 'testuser',
  twitter: 'testuser',
  linkedin: 'testuser',
  phone: '+1234567890',
  email_verified: true,
  visibility_settings: {
    email: true,
    phone: true,
    social_media: true,
  },
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
};

// Mock portfolio data for testing
export const mockPortfolio = {
  id: 'test-portfolio-id',
  user_id: 'test-user-id',
  title: 'Test Portfolio',
  slug: 'test-portfolio',
  profession: 'actor' as const,
  bio: 'Test portfolio bio',
  location: 'New York, NY',
  website: 'https://example.com',
  instagram: 'testuser',
  twitter: 'testuser',
  linkedin: 'testuser',
  phone: '+1234567890',
  email: 'test@example.com',
  template_id: 'T1',
  custom_styles: {},
  images: [],
  is_published: true,
  view_count: 0,
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
};

// Custom render function with all providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialUser?: typeof mockUser | null;
  initialProfile?: typeof mockProfile | null;
  locale?: string;
  theme?: 'light' | 'dark' | 'system';
  messages?: typeof mockMessages;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    initialUser = null,
    initialProfile = null,
    locale = 'en',
    theme = 'light',
    messages = mockMessages,
    ...renderOptions
  } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MockNextIntlProvider>
        <MockThemeProvider>
          <MockBreadcrumbProvider>
            {children}
          </MockBreadcrumbProvider>
        </MockThemeProvider>
      </MockNextIntlProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Utility function to create a test user session
export function createTestUserSession(overrides: Partial<typeof mockUser> = {}) {
  return {
    ...mockUser,
    ...overrides,
  };
}

// Utility function to create a test profile
export function createTestProfile(overrides: Partial<typeof mockProfile> = {}) {
  return {
    ...mockProfile,
    ...overrides,
  };
}

// Utility function to create a test portfolio
export function createTestPortfolio(overrides: Partial<typeof mockPortfolio> = {}) {
  return {
    ...mockPortfolio,
    ...overrides,
  };
}

// Utility to wait for element to be removed (for testing loading states)
export async function waitForElementToBeRemoved(
  element: HTMLElement | (() => HTMLElement | null),
  options?: { timeout?: number }
) {
  const { waitForElementToBeRemoved: waitFor } = await import('@testing-library/react');
  return waitFor(element, options);
}

// Utility to create mock form data
export function createMockFormData(data: Record<string, any>): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  });
  return formData;
}

// Utility to create mock file
export function createMockFile(
  name: string = 'test.jpg',
  type: string = 'image/jpeg',
  size: number = 1024
): File {
  const file = new File(['test'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

// Utility to simulate user interactions
export async function simulateUserInteraction(
  element: HTMLElement,
  action: 'click' | 'type' | 'clear' | 'upload',
  value?: string | File
) {
  const { userEvent } = await import('@testing-library/user-event');
  const user = userEvent.setup();

  switch (action) {
    case 'click':
      await user.click(element);
      break;
    case 'type':
      if (value && typeof value === 'string') {
        await user.type(element, value);
      }
      break;
    case 'clear':
      await user.clear(element);
      break;
    case 'upload':
      if (value instanceof File) {
        await user.upload(element, value);
      }
      break;
  }
}

// Utility to test accessibility
export function testAccessibility(element: HTMLElement) {
  // Basic accessibility checks
  const checks = {
    hasAriaLabel: element.getAttribute('aria-label') !== null,
    hasRole: element.getAttribute('role') !== null,
    hasTabIndex: element.hasAttribute('tabindex'),
    isFocusable: element.tabIndex >= 0,
    hasTextContent: element.textContent !== null && element.textContent.trim().length > 0,
  };

  return checks;
}

// Re-export testing utilities for convenience
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
export { renderWithProviders as render };