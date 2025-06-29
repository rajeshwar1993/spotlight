# Spotlight - Product Requirements Document (Refined)

## Executive Summary

**Project Name:** Spotlight  
**Version:** 1.0  
**Document Version:** 1.0  
**Last Updated:** 2025-06-29  

Spotlight is a modern web application that enables actors and models to create professional online portfolios with minimal effort. The platform focuses on simplicity, performance, and SEO optimization to help users showcase their work effectively.

## 1. Project Overview

### 1.1 Vision Statement
To democratize professional portfolio creation for actors and models by providing an intuitive, fast, and SEO-optimized platform that can be set up in under 5 minutes.

### 1.2 Target Audience
- **Primary:** Actors and models seeking professional online presence
- **Secondary:** Creative professionals, performers, and artists

### 1.3 Key Value Propositions
- **Speed:** Portfolio creation in under 5 minutes
- **Simplicity:** Minimal learning curve with intuitive interface
- **Performance:** Lighthouse score 90+ with fast load times
- **SEO Optimization:** Server-side rendered pages with Schema.org markup
- **Mobile-First:** Responsive design for all devices

## 2. Technical Stack

### 2.1 Core Technologies
- **Frontend:** Next.js 15+ (App Router)
- **Backend:** Supabase (Authentication, Database, Storage, Edge Functions)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Language:** TypeScript
- **Deployment:** Vercel (recommended) or similar platform

### 2.2 Additional Libraries
- **Internationalization:** next-intl
- **Validation:** Zod
- **Image Optimization:** Next.js Image component
- **SEO:** Schema.org markup, Open Graph meta tags

## 3. Non-Functional Requirements

### 3.1 Technical Performance Requirements
- **Lighthouse Score:** 90+ (Performance, SEO, Accessibility, Best Practices)
- **Page Load Time:** < 2 seconds (LCP - Largest Contentful Paint)
- **Mobile Usability:** 100% score
- **SEO Score:** 95+
- **Bundle Size:** Optimized with code splitting and lazy loading

### 3.2 User Experience Requirements
- **Portfolio Creation Completion Rate:** 70%+
- **Time to Create Portfolio:** < 5 minutes
- **User Satisfaction:** 4.5/5 stars
- **Mobile Usage Target:** 50%+ of traffic
- **Accessibility:** WCAG 2.1 AA compliance

### 3.3 Scalability & Performance
- **Mobile-First Design:** Responsive breakpoints (320px+, 768px+, 1024px+)
- **Image Optimization:** 
  - Next.js Image component with lazy loading
  - WebP format support with fallbacks
  - Automatic sizing and quality optimization
- **Bundle Optimization:** 
  - Tree shaking enabled
  - Dynamic imports for large components
  - Critical CSS inlining
- **Critical Asset Preloading:** Fonts, hero images, and above-fold assets

### 3.4 Security & Data Protection
- **Row Level Security (RLS):** Comprehensive policies for all database tables
- **Authentication:** Supabase Auth with proper session management
- **Data Privacy:** Users can only access their own data
- **Cascade Protection:** Foreign key constraints with proper deletion handling
- **Input Validation:** Zod schemas for all user inputs
- **CSRF Protection:** Built-in Next.js protection
- **XSS Prevention:** Sanitized outputs and CSP headers

### 3.5 Internationalization
- **Multi-language Support:** English (default) and Spanish
- **Locale Management:** Custom cookie management (1-year expiration)
- **Type Safety:** TypeScript integration for translation keys
- **URL Structure:** All pages under `[locale]` slug except portfolio pages
- **Fallback Strategy:** Browser locale detection with English fallback
- **Future Expansion Ready:** Architecture supports additional languages

### 3.6 Error Handling & Reliability
- **AI API Fallbacks:** Robust fallback mechanisms for API failures
- **Rate Limit Handling:** Proper handling of API rate limits with retry logic
- **Image Processing Recovery:** Fallback to original content on processing failures
- **User Feedback:** Clear error messages and retry mechanisms
- **Global Error Boundary:** Comprehensive error catching and reporting
- **Validation:** Zod schemas for all data inputs and API responses

## 4. Database Schema Design

### 4.1 Database Tables

#### 4.1.1 Users Table
```sql
CREATE TYPE "USER_ROLE" AS ENUM ('GENERAL', 'ADMIN', 'SUB_ADMIN');
CREATE TYPE "GENDER" AS ENUM ('MALE', 'FEMALE', 'NB', 'PNTS');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    user_role "USER_ROLE" NOT NULL DEFAULT 'GENERAL',
    first_name text,
    last_name text,
    gender "GENDER",
    profession text[],
    date_of_birth DATE,
    phone_number text,
    location text,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
```

**RLS Policy:** CRUD operations can only be performed by logged-in user with same auth_user_id

**Triggers:**
- Auto-create user entry on auth.users signup
- Auto-update updated_at timestamp on row modification

#### 4.1.2 My Pages Table
```sql
CREATE TABLE my_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    slug text UNIQUE NOT NULL,
    template_id UUID REFERENCES templates(id) NOT NULL,
    page_data_id UUID REFERENCES page_data(id) NOT NULL,
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
```

**RLS Policy:** CRUD operations can be performed by superuser only (server-side operations)

#### 4.1.3 Templates Table
```sql
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name text UNIQUE NOT NULL,
    template_key text UNIQUE NOT NULL, -- T1, T2, T3, T4
    sample_link text,
    display_image_id UUID REFERENCES images(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now()
);
```

**RLS Policy:** CRUD operations can be performed by superuser only

#### 4.1.4 Page Data Table
```sql
CREATE TABLE page_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    hero_image_id UUID REFERENCES images(id),
    display_name text NOT NULL,
    age INTEGER,
    gender "GENDER",
    phone_number text,
    bio text,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
```

**RLS Policy:** CRUD operations can be performed by superuser only

#### 4.1.5 Images Table
```sql
CREATE TYPE "IMAGE_TYPE" AS ENUM ('PROFILE', 'HERO', 'GALLERY');

CREATE TABLE images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    page_data_id UUID REFERENCES page_data(id) ON DELETE CASCADE,
    usage_type "IMAGE_TYPE" NOT NULL,
    storage_path text NOT NULL,
    public_url text NOT NULL,
    original_url text,
    file_type text NOT NULL,
    file_size INTEGER,
    alt_text text,
    caption text,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT now()
);
```

**RLS Policy:** CRUD operations can be performed by superuser only

### 4.2 Database Enums
```sql
-- Gender options
CREATE TYPE "GENDER" AS ENUM ('MALE', 'FEMALE', 'NB', 'PNTS');

-- Image usage types
CREATE TYPE "IMAGE_TYPE" AS ENUM ('PROFILE', 'HERO', 'GALLERY');

-- User roles
CREATE TYPE "USER_ROLE" AS ENUM ('GENERAL', 'ADMIN', 'SUB_ADMIN');
```

## 5. API Endpoints Specification

### 5.1 Authentication Endpoints
```typescript
// Handled by Supabase Auth
POST /auth/signup
POST /auth/signin
POST /auth/signout
POST /auth/reset-password
POST /auth/verify-email
GET  /auth/session

// Custom email verification endpoint
POST /api/auth/resend-verification    // Resend verification email
```

### 5.2 User Management Endpoints
```typescript
GET    /api/users/profile          // Get current user profile
PUT    /api/users/profile          // Update user profile
DELETE /api/users/profile          // Delete user account
```

### 5.3 Portfolio Management Endpoints
```typescript
GET    /api/portfolios             // Get user's portfolios
POST   /api/portfolios             // Create new portfolio
GET    /api/portfolios/[id]        // Get specific portfolio
PUT    /api/portfolios/[id]        // Update portfolio
DELETE /api/portfolios/[id]        // Delete portfolio
PATCH  /api/portfolios/[id]/publish // Toggle publish status
```

### 5.4 Template Endpoints
```typescript
GET    /api/templates              // Get available templates
GET    /api/templates/[id]         // Get specific template details
```

### 5.5 Image Management Endpoints
```typescript
POST   /api/images/upload          // Upload image to storage
DELETE /api/images/[id]            // Delete image
GET    /api/images/[id]            // Get image metadata
```

### 5.6 Public Endpoints
```typescript
GET    /api/public/featured        // Get featured portfolios
GET    /api/public/portfolio/[slug] // Get public portfolio data
POST   /api/public/view/[slug]     // Increment view count
```

## 6. Page Specifications

### 6.1 Home Page (`/[locale]`)

**Type:** Server-Side Rendered (SSR)  
**Authentication:** Public  
**Layout:** Standard (Navbar + Main + Footer)

#### 6.1.1 Navbar Component
**Desktop Layout:**
- **Left:** App logo/name (clickable, links to home)
- **Center:** "Create Portfolio" CTA button
- **Right:** 
  - Unauthenticated: "Sign Up" and "Sign In" buttons
  - Authenticated: User avatar with dropdown menu

**Mobile Layout:**
- **Left:** App logo/name
- **Center:** "Create Portfolio" CTA button  
- **Right:**
  - Unauthenticated: "Sign Up" button only
  - Authenticated: Hamburger menu opening left drawer

**Authenticated Menu Items:**
```
Section 1:
Create New Portfolio
View My Portfolios

Section 2:
Profile & Settings

Section 3:
Sign Out (bottom of drawer on mobile)
```

#### 6.1.2 Main Content Sections

**Hero Section:**
- Compelling headline and value proposition
- Visual showcase with sample portfolio screenshots
- Primary CTA: "Create Your Portfolio" button
- Secondary CTA: "View Examples" link
- Background: Gradient or subtle pattern
- Mobile-optimized with stacked layout

**Featured Portfolios Section:**
- Title: "Featured Portfolios"
- **Desktop:** 4 portfolios in horizontal grid
- **Mobile:** 4 portfolios stacked vertically
- Each card includes:
  - Profile avatar image
  - Display name
  - Primary profession
  - Click action: Navigate to portfolio page

**Process Section:**
- Title: "How It Works"
- 3-step process visualization:
  1. **"Add Your Info"** - Icon + description
  2. **"Choose Template"** - Icon + description  
  3. **"Publish & Share"** - Icon + description
- Visual flowchart or timeline design
- Mobile-friendly stacked layout

**Testimonials Section:**
- Title: "What Our Users Say"
- **Desktop:** 2 testimonials side-by-side + carousel navigation
- **Mobile:** 1 testimonial + carousel navigation
- Each testimonial includes:
  - User avatar
  - Name and profession
  - Quote/testimonial text
  - Star rating (optional)
  - Click action: Navigate to user's portfolio

#### 6.1.3 Footer Component
**Layout:** 3-column grid (mobile: stacked)
- **Column 1:** App branding and tagline
- **Column 2:** Quick links (About, Contact, Help)
- **Column 3:** Social media links (Instagram, LinkedIn, Twitter)
- **Bottom:** Copyright notice and privacy/terms links

### 6.2 Create Portfolio Page (`/[locale]/create`)

**Type:** Client-Side Rendered (CSR)  
**Authentication:** Public (with auth flow)  
**Layout:** Full-page (no navbar/footer)

#### 6.2.1 Page Structure
- Progress bar showing current step (1/3, 2/3, 3/3)
- Step content area with fade animations
- Navigation buttons (Back/Next)
- Exit confirmation dialog

#### 6.2.2 Step 1: Basic Information
**Fields:**
- Display name (required, max 50 characters)
- Brief tagline (optional, max 100 characters)

**Validation:**
- Real-time character count
- Required field indicators
- Error messages below fields

**Actions:**
- "Next" button (enabled when valid)
- "Exit" link with confirmation

#### 6.2.3 Step 2: Template Selection
**Template Grid:**
- 4 template options (T1, T2, T3, T4)
- Large preview images
- Template names and descriptions
- Radio button selection
- "Preview" link for each template

**Template Descriptions:**
- **T1 - Classic:** Clean, professional layout with hero image and bio
- **T2 - Modern:** Bold typography with image gallery focus
- **T3 - Minimal:** Simple, elegant design with essential information
- **T4 - Creative:** Artistic layout with custom color schemes

**Actions:**
- "Back" button
- "Next" button (enabled when template selected)

#### 6.2.4 Step 3: Bio & Details
**Fields:**
- Bio/About section (required, max 300 words)
- Character counter with live updates
- Auto-save to sessionStorage every 30 seconds

**Actions:**
- "Back" button
- "Create Portfolio" button

**Authentication Flow:**
- **Authenticated Users:** Direct creation and redirect to preview
- **Unauthenticated Users:** 
  1. Show authentication modal
  2. Store form data in sessionStorage
  3. Redirect to auth flow
  4. Return to create page with pre-filled data
  5. Complete portfolio creation

### 6.3 Preview Page (`/[locale]/preview/[slug]`)

**Type:** Client-Side Rendered (CSR)  
**Authentication:** Protected (owner only)  
**Layout:** Full-page template preview

#### 6.3.1 Page Features
- Exact replica of published portfolio
- Floating action button: "Edit Portfolio"
- Share preview link functionality
- Mobile-responsive preview
- Template-specific rendering

**Actions:**
- Edit button � Navigate to edit page
- Publish toggle button
- Share button with copy-to-clipboard
- View public version link

### 6.4 Edit Page (`/[locale]/edit/[slug]`)

**Type:** Client-Side Rendered (CSR)  
**Authentication:** Protected (owner only)  
**Layout:** Full-page editor

#### 6.4.1 Editor Features
- Live preview alongside edit form
- Auto-save functionality
- Undo/redo capability
- Image upload and management
- Template switching option

**Editable Fields:**
- Display name
- Bio/about text
- Hero image upload
- Contact information
- Additional portfolio images
- Template selection

**Actions:**
- Save changes
- Preview changes
- Publish/unpublish toggle
- Delete portfolio (with confirmation)

### 6.5 Portfolio Page (`/portfolio/[slug]`)

**Type:** Static Site Generation (SSG)  
**Authentication:** Public  
**Layout:** Template-specific

#### 6.5.1 SEO Optimization
```html
<!-- Schema.org markup -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "{{display_name}}",
  "jobTitle": "{{profession}}",
  "description": "{{bio}}",
  "image": "{{hero_image_url}}",
  "url": "{{portfolio_url}}"
}
</script>

<!-- Open Graph meta tags -->
<meta property="og:title" content="{{display_name}} - Portfolio">
<meta property="og:description" content="{{bio_excerpt}}">
<meta property="og:image" content="{{hero_image_url}}">
<meta property="og:url" content="{{portfolio_url}}">
<meta property="og:type" content="profile">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{display_name}} - Portfolio">
<meta name="twitter:description" content="{{bio_excerpt}}">
<meta name="twitter:image" content="{{hero_image_url}}">
```

#### 6.5.2 Performance Features
- Critical CSS inlining
- Image optimization with WebP
- Lazy loading for below-fold content
- Prefetching for related portfolios
- Service worker caching

### 6.6 Profile Page (`/[locale]/profile`)

**Type:** Client-Side Rendered (CSR)  
**Authentication:** Protected  
**Layout:** Standard (Navbar + Main + Footer)

#### 6.6.1 My Portfolios Section
- Grid view of user's portfolios
- Each card shows:
  - Portfolio thumbnail
  - Title and status (Published/Draft)
  - View count
  - Last modified date
  - Action buttons (Edit, Preview, Delete)

**Actions:**
- Create new portfolio
- Edit existing portfolio
- Toggle publish status
- Delete portfolio (with confirmation)
- View analytics (future feature)

#### 6.6.2 Personal Information Section
**Editable Fields:**
- First name and last name
- Gender
- Date of birth
- Phone number
- Location
- Profession tags
- Profile avatar

**Features:**
- Inline editing
- Auto-save functionality
- Validation and error handling
- Avatar upload with cropping

## 7. Template System Design

### 7.1 Template Architecture
```typescript
// Template enum
export enum TemplateType {
  T1 = 'T1',
  T2 = 'T2', 
  T3 = 'T3',
  T4 = 'T4'
}

// Template component interface
interface TemplateProps {
  data: PortfolioData;
  isPreview?: boolean;
}

// Dynamic template rendering
const TemplateRenderer = ({ templateType, data }: TemplateRendererProps) => {
  switch (templateType) {
    case TemplateType.T1:
      return <Template1 data={data} />;
    case TemplateType.T2:
      return <Template2 data={data} />;
    case TemplateType.T3:
      return <Template3 data={data} />;
    case TemplateType.T4:
      return <Template4 data={data} />;
    default:
      return <DefaultTemplate data={data} />;
  }
};
```

### 7.2 Template Specifications

#### 7.2.1 Template 1 (T1) - Classic Professional
**Design Style:** Clean, traditional layout
**Color Scheme:** Navy blue and white with gold accents
**Layout:**
- Full-width hero section with overlay text
- Two-column bio section
- Contact information sidebar
- Minimalist footer

**Key Features:**
- Large hero image with name overlay
- Professional typography (serif headings)
- Contact cards with icons
- Social media integration

#### 7.2.2 Template 2 (T2) - Modern Bold
**Design Style:** Contemporary with bold typography
**Color Scheme:** Black, white, and bright accent color
**Layout:**
- Split-screen hero (image left, text right)
- Full-width bio section
- Grid-based contact layout
- Modern card-based design

**Key Features:**
- Sans-serif typography
- Geometric shapes and lines
- Hover animations
- Mobile-first responsive design

#### 7.2.3 Template 3 (T3) - Minimal Elegant
**Design Style:** Clean, minimal, lots of whitespace
**Color Scheme:** Monochromatic with single accent color
**Layout:**
- Centered content with max-width container
- Vertical photo with text below
- Simple contact list
- Minimal footer

**Key Features:**
- Plenty of whitespace
- Subtle animations
- Focus on typography
- Ultra-clean aesthetics

#### 7.2.4 Template 4 (T4) - Creative Artistic
**Design Style:** Creative, artistic, unique layouts
**Color Scheme:** Vibrant, customizable color palette
**Layout:**
- Asymmetrical design elements
- Creative typography mixing
- Artistic photo treatments
- Unique navigation elements

**Key Features:**
- Custom CSS animations
- Artistic image filters
- Creative text layouts
- Interactive elements

## 8. Image Upload & Processing Requirements

### 8.1 Upload Specifications
**Supported Formats:** JPEG, PNG, WebP  
**Maximum File Size:** 10MB per image  
**Maximum Dimensions:** 4000x4000 pixels  
**Minimum Dimensions:** 400x400 pixels (for hero images)

### 8.2 Processing Pipeline
```typescript
// Image processing workflow
const processImage = async (file: File) => {
  // 1. Validation
  validateImageFile(file);
  
  // 2. Generate multiple sizes
  const sizes = await generateImageSizes(file, [
    { name: 'thumbnail', width: 300, height: 300 },
    { name: 'medium', width: 800, height: 600 },
    { name: 'large', width: 1200, height: 900 },
    { name: 'original', width: null, height: null }
  ]);
  
  // 3. Convert to WebP with fallback
  const webpVersions = await convertToWebP(sizes);
  
  // 4. Upload to Supabase Storage
  const uploadResults = await uploadToStorage(webpVersions);
  
  // 5. Save metadata to database
  await saveImageMetadata(uploadResults);
  
  return uploadResults;
};
```

### 8.3 Storage Structure
```
/portfolios/
  /{user_id}/
    /hero/
      /{image_id}-thumbnail.webp
      /{image_id}-medium.webp
      /{image_id}-large.webp
      /{image_id}-original.{ext}
    /gallery/
      /{image_id}-thumbnail.webp
      /{image_id}-medium.webp
      /{image_id}-large.webp
      /{image_id}-original.{ext}
```

### 8.4 Optimization Features
- Automatic WebP conversion with fallbacks
- Responsive image sizing
- Lazy loading implementation
- CDN delivery via Supabase
- Image compression with quality optimization

## 9. Error Handling & Error Pages

### 9.1 Error Page Specifications

#### 9.1.1 404 - Page Not Found (`/404`)
**Design:** Branded error page with navigation options
**Content:**
- "Page Not Found" heading
- Friendly explanation message
- Search functionality
- Links to popular pages (Home, Create Portfolio)
- Report broken link option

#### 9.1.2 500 - Server Error (`/500`)
**Design:** Professional error page with support options
**Content:**
- "Something went wrong" heading
- Apologetic but reassuring message
- Refresh page button
- Contact support link
- Error ID for tracking

#### 9.1.3 Authentication Errors
**401 - Unauthorized:**
- Redirect to sign-in page
- Preserve intended destination
- Clear error message about required authentication

**403 - Forbidden:**
- "Access Denied" message
- Explanation of permission requirements
- Link to contact support

### 9.2 Error Handling Patterns
```typescript
// Global error boundary
export class GlobalErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    logError(error, errorInfo);
    
    // Show user-friendly error message
    this.setState({ hasError: true });
  }
}

// API error handling
export const handleApiError = (error: ApiError) => {
  switch (error.status) {
    case 400:
      showToast('Invalid request. Please check your input.', 'error');
      break;
    case 401:
      redirectToAuth();
      break;
    case 403:
      showToast('You don\'t have permission to perform this action.', 'error');
      break;
    case 429:
      showToast('Too many requests. Please try again later.', 'warning');
      break;
    case 500:
      showToast('Server error. Our team has been notified.', 'error');
      break;
    default:
      showToast('An unexpected error occurred.', 'error');
  }
};
```

## 10. Authentication Flows

### 10.1 SessionStorage Management
```typescript
// Portfolio creation data storage
interface CreatePortfolioSession {
  step: number;
  displayName: string;
  tagline?: string;
  templateId: string;
  bio: string;
  timestamp: number;
}

const SESSION_KEY = 'spotlight_create_session';
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export const saveCreateSession = (data: Partial<CreatePortfolioSession>) => {
  const existing = getCreateSession();
  const updated = {
    ...existing,
    ...data,
    timestamp: Date.now()
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
};

export const getCreateSession = (): CreatePortfolioSession | null => {
  const stored = sessionStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  
  const data = JSON.parse(stored);
  
  // Check if session has expired
  if (Date.now() - data.timestamp > SESSION_EXPIRY) {
    clearCreateSession();
    return null;
  }
  
  return data;
};

export const clearCreateSession = () => {
  sessionStorage.removeItem(SESSION_KEY);
};
```

### 10.2 Authentication State Management
```typescript
// Auth context and hooks
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  return { user, loading };
};
```

### 10.3 Protected Route Implementation
```typescript
// Route protection wrapper
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);
  
  if (loading) return <LoadingSpinner />;
  if (!user) return null;
  
  return <>{children}</>;
};
```

### 10.4 Email Verification Requirements

#### 10.4.1 Email Verification Flow
**Non-blocking Approach:** Users can access all features except publishing portfolios without email verification.

**Verification States:**
- **Verified:** `auth.users.email_confirmed_at` is not null
- **Unverified:** `auth.users.email_confirmed_at` is null

#### 10.4.2 Announcement Banner System
```typescript
// Configurable announcement component
interface AnnouncementBannerProps {
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
  };
  dismissible?: boolean;
  persistent?: boolean;
}

export const AnnouncementBanner = ({ 
  type, 
  title, 
  message, 
  action, 
  dismissible = false,
  persistent = true 
}: AnnouncementBannerProps) => {
  // Component implementation
};
```

#### 10.4.3 Email Verification Banner
**Trigger Conditions:**
- User is authenticated
- `email_confirmed_at` is null
- Banner appears below navbar on all authenticated pages

**Banner Content:**
- **Title:** "Email Verification Required"
- **Message:** "Please verify your email address to publish portfolios. You can still create and edit portfolios."
- **Action Button:** "Resend Verification Email"
- **Loading States:** Show spinner when resending email

#### 10.4.4 Publishing Restrictions
**Blocked Actions:**
- Portfolio publishing (`PATCH /api/portfolios/[id]/publish`)
- Only when `email_confirmed_at` is null

**Allowed Actions:**
- Portfolio creation, editing, preview
- Profile management
- Template selection
- Image uploads

**User Feedback:**
- Disabled publish button with tooltip explaining verification requirement
- Clear error messages when attempting to publish
- Link to resend verification email

## 11. Day 2 Features & Future Enhancements

### 11.1 AI Integration (Day 2)
**Bio Enhancement API:**
- Integration with OpenAI or similar service
- Transform basic bio into comprehensive portfolio content
- Generate profession-specific sections
- Auto-suggest improvements and keywords

**Implementation:**
```typescript
// AI bio enhancement
export const enhanceBio = async (basicBio: string, profession: string) => {
  const response = await fetch('/api/ai/enhance-bio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bio: basicBio, profession })
  });
  
  return response.json();
};
```

### 11.2 Advanced Features (Future)
- **Analytics Dashboard:** Portfolio view analytics and insights
- **Custom Domains:** Allow users to use custom domains
- **Advanced Templates:** More template options with customization
- **Portfolio Collections:** Group multiple portfolios
- **Collaboration Tools:** Share draft portfolios for feedback
- **Integration APIs:** Connect with casting platforms
- **Premium Features:** Advanced customization options
- **Mobile App:** Native mobile app for portfolio management

### 11.3 Enhanced Footer (Day 2)
**Expanded Footer Sections:**
- **Company Info:** About, Careers, Press
- **Support:** Help Center, Contact, Community
- **Legal:** Privacy Policy, Terms of Service, Cookie Policy
- **Resources:** Blog, Templates, Success Stories
- **Social Proof:** User count, testimonials, awards

## 12. Development Phases

### 12.1 Phase 1 (Day 1) - Core Features
- [ ] Project setup and configuration
- [ ] Database schema implementation
- [ ] Authentication system
- [ ] Basic portfolio creation flow
- [ ] Template system (4 templates)
- [ ] Home page with featured portfolios
- [ ] Basic profile management
- [ ] Image upload and processing
- [ ] SEO optimization

### 12.2 Phase 2 (Day 2) - Enhanced Features
- [ ] AI bio enhancement integration
- [ ] Advanced analytics
- [ ] Enhanced footer and additional pages
- [ ] Performance optimizations
- [ ] Advanced error handling
- [ ] User feedback system
- [ ] Enhanced mobile experience
- [ ] Additional template customization

### 12.3 Phase 3 (Future) - Advanced Features
- [ ] Custom domains
- [ ] Mobile application
- [ ] Advanced analytics dashboard
- [ ] Integration with external platforms
- [ ] Premium features and monetization
- [ ] Multi-language expansion
- [ ] Advanced collaboration tools

## 13. Success Metrics & KPIs

### 13.1 Technical Metrics
- Lighthouse scores (Performance, SEO, Accessibility, Best Practices)
- Page load times and Core Web Vitals
- Error rates and uptime
- Mobile usability scores

### 13.2 User Experience Metrics
- Portfolio creation completion rate
- Time to create first portfolio
- User satisfaction ratings
- Mobile vs desktop usage ratios

### 13.3 Business Metrics
- User registration and retention rates
- Portfolio publish rates
- Portfolio view counts
- User engagement metrics

---

**Document Status:** Complete  
**Next Review Date:** As needed during development  
**Approved By:** Product Manager  
**Distribution:** Engineering Team, Design Team, QA Team