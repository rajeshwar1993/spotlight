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
export async function createPortfolio(
  userId: string, 
  portfolioData: Partial<Portfolio>
): Promise<PortfolioResponse> {
  try {
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .insert({
        user_id: userId,
        title: portfolioData.title,
        slug: portfolioData.slug,
        bio: portfolioData.bio,
        template_type: portfolioData.template_type,
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
  portfolioData: Partial<Portfolio>
): Promise<PortfolioResponse> {
  try {
    const updateData = {
      title: portfolioData.title,
      slug: portfolioData.slug,
      bio: portfolioData.bio,
      template_type: portfolioData.template_type,
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
      .from('portfolio_images')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('order_index', { ascending: true });

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
  altText?: string
): Promise<PortfolioImageResponse> {
  try {
    // Validate file
    if (!file.type.startsWith('image/')) {
      return { error: new Error('File must be an image') };
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return { error: new Error('File size must be less than 10MB') };
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${portfolioId}/${imageType}_${Date.now()}.${fileExtension}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('portfolio-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading portfolio image:', uploadError);
      return { error: new Error(uploadError.message) };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('portfolio-images')
      .getPublicUrl(fileName);

    const imageUrl = urlData.publicUrl;

    // Get next order index for gallery images
    let orderIndex = 0;
    if (imageType === 'gallery') {
      const { data: existingImages } = await supabase
        .from('portfolio_images')
        .select('order_index')
        .eq('portfolio_id', portfolioId)
        .eq('image_type', 'gallery')
        .order('order_index', { ascending: false })
        .limit(1);

      if (existingImages && existingImages.length > 0) {
        orderIndex = (existingImages[0].order_index || 0) + 1;
      }
    }

    // Save image record
    const { data: image, error: saveError } = await supabase
      .from('portfolio_images')
      .insert({
        portfolio_id: portfolioId,
        image_type: imageType,
        file_path: imageUrl,
        file_name: fileName,
        alt_text: altText,
        order_index: orderIndex,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (saveError) {
      console.error('Error saving portfolio image record:', saveError);
      return { error: new Error(saveError.message) };
    }

    return { data: image };
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
    // Get image record to find file path
    const { data: image } = await supabase
      .from('portfolio_images')
      .select('file_name')
      .eq('id', imageId)
      .single();

    if (image?.file_name) {
      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('portfolio-images')
        .remove([image.file_name]);

      if (deleteError) {
        console.error('Error deleting image file:', deleteError);
        // Continue to delete record even if file deletion fails
      }
    }

    // Delete image record
    const { error } = await supabase
      .from('portfolio_images')
      .delete()
      .eq('id', imageId);

    if (error) {
      console.error('Error deleting portfolio image record:', error);
      return { error: new Error(error.message) };
    }

    return {};
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
      profile: images?.find(img => img.image_type === 'profile') || null,
      hero: images?.find(img => img.image_type === 'hero') || null,
      gallery: images?.filter(img => img.image_type === 'gallery') || []
    };

    // Build portfolio data
    const portfolioData: PortfolioData = {
      user: {
        id: user.id,
        full_name: user.full_name,
        profession: user.profession,
        location: user.location,
        bio: user.bio,
        avatar_url: user.avatar_url
      },
      portfolio: {
        id: portfolio.id,
        title: portfolio.title,
        slug: portfolio.slug,
        bio: portfolio.bio,
        template_type: portfolio.template_type,
        is_published: portfolio.is_published,
        height: portfolio.height,
        weight: portfolio.weight,
        eye_color: portfolio.eye_color,
        hair_color: portfolio.hair_color,
        skills: portfolio.skills
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
        agent: null // TODO: Add agent support
      },
      stats: {
        experience_years: calculateExperienceYears(user.date_of_birth),
        projects_completed: imagesByType.gallery.length,
        portfolio_views: 0 // TODO: Add analytics
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