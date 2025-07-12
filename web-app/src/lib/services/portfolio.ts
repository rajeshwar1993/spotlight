import { supabase } from '@/lib/supabase/client';
import type { Portfolio, PortfolioImage, TemplateType } from '@/types';
import type { PortfolioData } from '@/lib/templates/types';

export interface PortfolioResponse {
  data?: Portfolio;
  error?: Error | null;
}

export interface PortfolioListResponse {
  data?: Portfolio[];
  error?: Error | null;
}

export interface PortfolioImageResponse {
  data?: PortfolioImage;
  error?: Error | null;
}

export interface PortfolioImageListResponse {
  data?: PortfolioImage[];
  error?: Error | null;
}

export interface PortfolioDataResponse {
  data?: PortfolioData;
  error?: Error | null;
}

/**
 * Get portfolio by ID
 */
export async function getPortfolio(portfolioId: string): Promise<PortfolioResponse> {
  try {
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', portfolioId)
      .single();

    if (error) {
      console.error('Error fetching portfolio:', error);
      return { error: new Error(error.message) };
    }

    if (!portfolio) {
      return { error: new Error('Portfolio not found') };
    }

    return { data: portfolio };
  } catch (error) {
    console.error('Error in getPortfolio:', error);
    return { error: error as Error };
  }
}

/**
 * Get user's portfolios
 */
export async function getUserPortfolios(userId: string): Promise<PortfolioListResponse> {
  try {
    const { data: portfolios, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user portfolios:', error);
      return { error: new Error(error.message) };
    }

    return { data: portfolios || [] };
  } catch (error) {
    console.error('Error in getUserPortfolios:', error);
    return { error: error as Error };
  }
}

/**
 * Get portfolio by slug
 */
export async function getPortfolioBySlug(slug: string): Promise<PortfolioResponse> {
  try {
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching portfolio by slug:', error);
      return { error: new Error(error.message) };
    }

    if (!portfolio) {
      return { error: new Error('Portfolio not found') };
    }

    return { data: portfolio };
  } catch (error) {
    console.error('Error in getPortfolioBySlug:', error);
    return { error: error as Error };
  }
}

/**
 * Create new portfolio
 */
interface CreatePortfolioData {
  title?: string;
  slug?: string;
  bio?: string;
  template_type?: TemplateType;
  is_published?: boolean;
  height?: string;
  weight?: string;
  eye_color?: string;
  hair_color?: string;
  skills?: string[];
}

export async function createPortfolio(
  userId: string, 
  portfolioData: CreatePortfolioData
): Promise<PortfolioResponse> {
  try {
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .insert({
        user_id: userId,
        title: portfolioData.title,
        slug: portfolioData.slug,
        bio: portfolioData.bio,
        template: portfolioData.template_type,
        is_published: portfolioData.is_published || false,
        height: portfolioData.height,
        weight: portfolioData.weight,
        eye_color: portfolioData.eye_color,
        hair_color: portfolioData.hair_color,
        skills: portfolioData.skills,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating portfolio:', error);
      return { error: new Error(error.message) };
    }

    return { data: portfolio };
  } catch (error) {
    console.error('Error in createPortfolio:', error);
    return { error: error as Error };
  }
}

/**
 * Update portfolio
 */
export async function updatePortfolio(
  portfolioId: string, 
  portfolioData: CreatePortfolioData
): Promise<PortfolioResponse> {
  try {
    const updateData = {
      title: portfolioData.title,
      slug: portfolioData.slug,
      bio: portfolioData.bio,
      template: portfolioData.template_type,
      is_published: portfolioData.is_published,
      height: portfolioData.height,
      weight: portfolioData.weight,
      eye_color: portfolioData.eye_color,
      hair_color: portfolioData.hair_color,
      skills: portfolioData.skills,
      updated_at: new Date().toISOString()
    };

    // Remove undefined values
    const cleanedData = Object.fromEntries(
      Object.entries(updateData).filter(([, value]) => value !== undefined)
    );

    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .update(cleanedData)
      .eq('id', portfolioId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating portfolio:', error);
      return { error: new Error(error.message) };
    }

    return { data: portfolio };
  } catch (error) {
    console.error('Error in updatePortfolio:', error);
    return { error: error as Error };
  }
}

/**
 * Delete portfolio
 */
export async function deletePortfolio(portfolioId: string): Promise<{ error?: Error | null }> {
  try {
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', portfolioId);

    if (error) {
      console.error('Error deleting portfolio:', error);
      return { error: new Error(error.message) };
    }

    return {};
  } catch (error) {
    console.error('Error in deletePortfolio:', error);
    return { error: error as Error };
  }
}

/**
 * Get portfolio images
 */
export async function getPortfolioImages(portfolioId: string): Promise<PortfolioImageListResponse> {
  try {
    const { data: images, error } = await supabase
      .from('images')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching portfolio images:', error);
      return { error: new Error(error.message) };
    }

    return { data: images || [] };
  } catch (error) {
    console.error('Error in getPortfolioImages:', error);
    return { error: error as Error };
  }
}

/**
 * Upload portfolio image
 */
export async function uploadPortfolioImage(
  portfolioId: string, 
  file: File, 
  imageType: 'profile' | 'hero' | 'gallery',
  altText?: string,
  userId?: string
): Promise<PortfolioImageResponse> {
  try {
    // This function is deprecated - use the new image service instead
    // Import and use uploadPortfolioImage from '@/lib/services/image'
    const { uploadPortfolioImage: newUploadFunction } = await import('@/lib/services/image');
    
    if (!userId) {
      return { error: new Error('User ID is required') };
    }

    // Map old image types to new enum format
    const typeMap = {
      'profile': 'PROFILE' as const,
      'hero': 'HERO' as const,
      'gallery': 'GALLERY' as const,
    };

    const result = await newUploadFunction(
      userId,
      portfolioId,
      file,
      typeMap[imageType],
      altText
    );

    return result;
  } catch (error) {
    console.error('Error in uploadPortfolioImage:', error);
    return { error: error as Error };
  }
}

/**
 * Delete portfolio image
 */
export async function deletePortfolioImage(imageId: string): Promise<{ error?: Error | null }> {
  try {
    // This function is deprecated - use the new image service instead
    const { deleteImage } = await import('@/lib/services/image');
    
    const result = await deleteImage(imageId);
    return result;
  } catch (error) {
    console.error('Error in deletePortfolioImage:', error);
    return { error: error as Error };
  }
}

/**
 * Get complete portfolio data for template rendering
 */
export async function getPortfolioData(portfolioId: string): Promise<PortfolioDataResponse> {
  try {
    // Get portfolio
    const { data: portfolio, error: portfolioError } = await getPortfolio(portfolioId);
    if (portfolioError || !portfolio) {
      return { error: portfolioError || new Error('Portfolio not found') };
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', portfolio.user_id)
      .single();

    if (userError || !user) {
      return { error: userError ? new Error(userError.message) : new Error('User not found') };
    }

    // Get portfolio images
    const { data: images, error: imagesError } = await getPortfolioImages(portfolioId);
    if (imagesError) {
      return { error: imagesError };
    }

    // Transform images by type
    const imagesByType = {
      profile: images?.find(img => img.type === 'PROFILE') || undefined,
      hero: images?.find(img => img.type === 'HERO') || undefined,
      gallery: images?.filter(img => img.type === 'GALLERY') || []
    };

    // Build portfolio data
    const portfolioData: PortfolioData = {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        profession: user.profession,
        location: user.location,
        bio: user.bio,
        avatar_url: user.avatar_url,
        is_email_verified: user.is_email_verified,
        is_profile_complete: user.is_profile_complete,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      portfolio: {
        id: portfolio.id,
        user_id: portfolio.user_id,
        title: portfolio.title,
        slug: portfolio.slug,
        bio: portfolio.bio,
        template: portfolio.template,
        status: portfolio.is_published ? 'published' : 'draft',
        is_published: portfolio.is_published,
        height: portfolio.height,
        weight: portfolio.weight,
        eye_color: portfolio.eye_color,
        hair_color: portfolio.hair_color,
        skills: portfolio.skills,
        experience_years: portfolio.experience_years || 0,
        view_count: portfolio.view_count || 0,
        created_at: portfolio.created_at,
        updated_at: portfolio.updated_at
      },
      images: imagesByType,
      social_links: {
        instagram: user.social_instagram,
        twitter: user.social_twitter,
        linkedin: user.social_linkedin,
        tiktok: user.social_tiktok,
        website: user.website_url
      },
      contact_info: {
        email: user.email,
        phone: user.phone,
        // Agent information could be added in the future
        // Currently not supported in the database schema
        agent: undefined
      },
      stats: {
        experience_years: calculateExperienceYears(user.date_of_birth),
        projects_completed: imagesByType.gallery.length,
        view_count: portfolio.view_count || 0
      }
    };

    return { data: portfolioData };
  } catch (error) {
    console.error('Error in getPortfolioData:', error);
    return { error: error as Error };
  }
}

/**
 * Calculate experience years from date of birth
 */
function calculateExperienceYears(dateOfBirth: string | null): number {
  if (!dateOfBirth) return 5; // Default experience
  
  const birth = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  
  // Assume professional career starts at 18
  return Math.max(age - 18, 1);
}

/**
 * Check if slug is available
 */
export async function isSlugAvailable(slug: string, excludePortfolioId?: string): Promise<boolean> {
  try {
    let query = supabase
      .from('portfolios')
      .select('id')
      .eq('slug', slug);

    if (excludePortfolioId) {
      query = query.neq('id', excludePortfolioId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error checking slug availability:', error);
      return false;
    }

    return !data || data.length === 0;
  } catch (error) {
    console.error('Error in isSlugAvailable:', error);
    return false;
  }
}

/**
 * Generate unique slug from title
 */
export async function generateSlug(title: string, excludePortfolioId?: string): Promise<string> {
  // Convert to slug format
  let baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

  // Ensure minimum length
  if (baseSlug.length < 3) {
    baseSlug = 'portfolio-' + baseSlug;
  }

  let slug = baseSlug;
  let counter = 1;

  // Check availability and increment if needed
  while (!(await isSlugAvailable(slug, excludePortfolioId))) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Get published portfolio by slug (public access)
 */
export async function getPublishedPortfolioBySlug(slug: string): Promise<PortfolioResponse> {
  try {
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'PUBLISHED')
      .eq('is_published', true)
      .single();

    if (error) {
      console.error('Error fetching published portfolio by slug:', error);
      return { error: new Error(error.message) };
    }

    if (!portfolio) {
      return { error: new Error('Portfolio not found') };
    }

    return { data: portfolio };
  } catch (error) {
    console.error('Error in getPublishedPortfolioBySlug:', error);
    return { error: error as Error };
  }
}

/**
 * Get complete published portfolio data for public viewing
 */
export async function getPublishedPortfolioData(slug: string): Promise<PortfolioDataResponse> {
  try {
    // Get published portfolio
    const { data: portfolio, error: portfolioError } = await getPublishedPortfolioBySlug(slug);
    if (portfolioError || !portfolio) {
      return { error: portfolioError || new Error('Portfolio not found') };
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', portfolio.user_id)
      .single();

    if (userError || !user) {
      return { error: userError ? new Error(userError.message) : new Error('User not found') };
    }

    // Get portfolio images
    const { data: images, error: imagesError } = await getPortfolioImages(portfolio.id);
    if (imagesError) {
      return { error: imagesError };
    }

    // Transform images by type
    const imagesByType = {
      profile: images?.find(img => img.type === 'PROFILE') || undefined,
      hero: images?.find(img => img.type === 'HERO') || undefined,
      gallery: images?.filter(img => img.type === 'GALLERY') || []
    };

    // Build portfolio data
    const portfolioData: PortfolioData = {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        profession: user.profession,
        location: user.location,
        bio: user.bio,
        avatar_url: user.avatar_url,
        is_email_verified: user.is_email_verified,
        is_profile_complete: user.is_profile_complete,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      portfolio: {
        id: portfolio.id,
        user_id: portfolio.user_id,
        title: portfolio.title,
        slug: portfolio.slug,
        bio: portfolio.bio,
        template: portfolio.template,
        status: 'published',
        is_published: portfolio.is_published,
        height: portfolio.height,
        weight: portfolio.weight,
        eye_color: portfolio.eye_color,
        hair_color: portfolio.hair_color,
        skills: portfolio.skills,
        experience_years: portfolio.experience_years || 0,
        view_count: portfolio.view_count || 0,
        created_at: portfolio.created_at,
        updated_at: portfolio.updated_at
      },
      images: imagesByType,
      social_links: {
        instagram: user.social_instagram,
        twitter: user.social_twitter,
        linkedin: user.social_linkedin,
        tiktok: user.social_tiktok,
        website: user.website_url
      },
      contact_info: {
        email: user.email,
        phone: user.phone,
        // Agent information could be added in the future
        // Currently not supported in the database schema
        agent: undefined
      },
      stats: {
        experience_years: calculateExperienceYears(user.date_of_birth),
        projects_completed: imagesByType.gallery.length,
        view_count: portfolio.view_count || 0
      }
    };

    return { data: portfolioData };
  } catch (error) {
    console.error('Error in getPublishedPortfolioData:', error);
    return { error: error as Error };
  }
}

/**
 * Get all published portfolios for sitemap generation
 */
export async function getPublishedPortfolios(): Promise<PortfolioListResponse> {
  try {
    const { data: portfolios, error } = await supabase
      .from('portfolios')
      .select('slug, updated_at, title')
      .eq('status', 'PUBLISHED')
      .eq('is_published', true)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching published portfolios:', error);
      return { error: new Error(error.message) };
    }

    return { data: portfolios || [] };
  } catch (error) {
    console.error('Error in getPublishedPortfolios:', error);
    return { error: error as Error };
  }
}

/**
 * Increment portfolio view count
 */
export async function incrementPortfolioViewCount(portfolioId: string): Promise<{ error?: Error | null }> {
  try {
    const { error } = await supabase
      .from('portfolios')
      .update({ 
        view_count: supabase.sql`COALESCE(view_count, 0) + 1`,
        updated_at: new Date().toISOString()
      })
      .eq('id', portfolioId);

    if (error) {
      console.error('Error incrementing view count:', error);
      return { error: new Error(error.message) };
    }

    return {};
  } catch (error) {
    console.error('Error in incrementPortfolioViewCount:', error);
    return { error: error as Error };
  }
}

// Portfolio service object for easier importing
export const portfolioService = {
  getPortfolio,
  getUserPortfolios,
  getPortfolioBySlug,
  getPublishedPortfolioBySlug,
  getPublishedPortfolioData,
  getPublishedPortfolios,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  getPortfolioImages,
  createPortfolioImage,
  updatePortfolioImage,
  deletePortfolioImage,
  getPortfolioData,
  incrementPortfolioViewCount,
  generateSlug,
  isSlugAvailable
};