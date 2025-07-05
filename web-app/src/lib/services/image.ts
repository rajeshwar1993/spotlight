import { supabase } from '@/lib/supabase/client';
import type { PortfolioImage, ImageType } from '@/types';
import { IMAGE_LIMITS, APP_CONFIG } from '@/lib/constants';

export interface ImageUploadResult {
  data?: PortfolioImage;
  error?: Error | null;
}

export interface ImageListResult {
  data?: PortfolioImage[];
  error?: Error | null;
}

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface OptimizedImageUrls {
  original: string;
  thumbnail: string;
  medium: string;
  large: string;
}

/**
 * Validate image file before upload
 */
export function validateImageFile(file: File): ImageValidationResult {
  // Check file type
  if (!APP_CONFIG.supportedImageTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Unsupported file type. Please use: ${APP_CONFIG.supportedImageTypes.join(', ')}`
    };
  }

  // Check file size
  if (file.size > IMAGE_LIMITS.maxSize) {
    return {
      isValid: false,
      error: `File size must be less than ${Math.round(IMAGE_LIMITS.maxSize / 1024 / 1024)}MB`
    };
  }

  return { isValid: true };
}

/**
 * Get image dimensions from file
 */
export function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * Generate storage file path for image
 */
export function generateImagePath(
  userId: string, 
  portfolioId: string | null, 
  type: ImageType, 
  fileExtension: string
): string {
  const timestamp = Date.now();
  const prefix = portfolioId ? `${userId}/${portfolioId}` : `${userId}/profile`;
  return `${prefix}/${type.toLowerCase()}_${timestamp}.${fileExtension}`;
}

/**
 * Upload image to Supabase storage
 */
export async function uploadImageToStorage(
  file: File,
  filePath: string
): Promise<{ error?: Error | null; url?: string }> {
  try {
    const { error: uploadError } = await supabase.storage
      .from('portfolio-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      return { error: new Error(uploadError.message) };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('portfolio-images')
      .getPublicUrl(filePath);

    return { url: urlData.publicUrl };
  } catch (error) {
    return { error: error as Error };
  }
}

/**
 * Save image record to database
 */
export async function saveImageRecord(
  userId: string,
  portfolioId: string | null,
  type: ImageType,
  file: File,
  filePath: string,
  publicUrl: string,
  dimensions: ImageDimensions,
  altText?: string
): Promise<ImageUploadResult> {
  try {
    // Get next sort order for this type
    let sortOrder = 0;
    if (type === 'GALLERY') {
      const { data: existingImages } = await supabase
        .from('images')
        .select('sort_order')
        .eq('user_id', userId)
        .eq('portfolio_id', portfolioId)
        .eq('type', 'GALLERY')
        .order('sort_order', { ascending: false })
        .limit(1);

      if (existingImages && existingImages.length > 0 && existingImages[0]) {
        sortOrder = (existingImages[0].sort_order || 0) + 1;
      }
    }

    const { data: image, error } = await supabase
      .from('images')
      .insert({
        user_id: userId,
        portfolio_id: portfolioId,
        type: type,
        file_name: file.name,
        file_path: publicUrl,
        file_size: file.size,
        width: dimensions.width,
        height: dimensions.height,
        alt_text: altText || '',
        is_primary: type === 'PROFILE' || type === 'HERO',
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (error) {
      return { error: new Error(error.message) };
    }

    return { data: image };
  } catch (error) {
    return { error: error as Error };
  }
}

/**
 * Upload portfolio image (main function)
 */
export async function uploadPortfolioImage(
  userId: string,
  portfolioId: string | null,
  file: File,
  type: ImageType,
  altText?: string
): Promise<ImageUploadResult> {
  try {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      return { error: new Error(validation.error) };
    }

    // Get image dimensions
    const dimensions = await getImageDimensions(file);
    
    // Validate dimensions
    if (dimensions.width < IMAGE_LIMITS.dimensions.minWidth || 
        dimensions.height < IMAGE_LIMITS.dimensions.minHeight) {
      return { 
        error: new Error(
          `Image must be at least ${IMAGE_LIMITS.dimensions.minWidth}x${IMAGE_LIMITS.dimensions.minHeight} pixels`
        )
      };
    }

    if (dimensions.width > IMAGE_LIMITS.dimensions.maxWidth || 
        dimensions.height > IMAGE_LIMITS.dimensions.maxHeight) {
      return { 
        error: new Error(
          `Image must be no larger than ${IMAGE_LIMITS.dimensions.maxWidth}x${IMAGE_LIMITS.dimensions.maxHeight} pixels`
        )
      };
    }

    // Generate file path
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = generateImagePath(userId, portfolioId, type, fileExtension);

    // Upload to storage
    const { error: uploadError, url } = await uploadImageToStorage(file, filePath);
    if (uploadError || !url) {
      return { error: uploadError || new Error('Failed to get image URL') };
    }

    // Save record to database
    const result = await saveImageRecord(
      userId, 
      portfolioId, 
      type, 
      file, 
      filePath, 
      url, 
      dimensions, 
      altText
    );

    return result;
  } catch (error) {
    return { error: error as Error };
  }
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(
  userId: string,
  portfolioId: string | null,
  files: File[],
  type: ImageType,
  altTexts?: string[]
): Promise<{ results: ImageUploadResult[]; errors: Error[] }> {
  const results: ImageUploadResult[] = [];
  const errors: Error[] = [];

  // Check total count
  if (files.length > IMAGE_LIMITS.maxFiles) {
    errors.push(new Error(`Maximum ${IMAGE_LIMITS.maxFiles} images allowed`));
    return { results, errors };
  }

  // Upload files sequentially to avoid overwhelming the server
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const altText = altTexts?.[i];
    
    const result = await uploadPortfolioImage(userId, portfolioId, file, type, altText);
    
    if (result.error) {
      errors.push(result.error);
    } else {
      results.push(result);
    }
  }

  return { results, errors };
}

/**
 * Get portfolio images by type
 */
export async function getPortfolioImages(
  portfolioId: string, 
  type?: ImageType
): Promise<ImageListResult> {
  try {
    let query = supabase
      .from('images')
      .select('*')
      .eq('portfolio_id', portfolioId);

    if (type) {
      query = query.eq('type', type);
    }

    const { data: images, error } = await query
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      return { error: new Error(error.message) };
    }

    return { data: images || [] };
  } catch (error) {
    return { error: error as Error };
  }
}

/**
 * Get user images by type
 */
export async function getUserImages(
  userId: string, 
  type?: ImageType
): Promise<ImageListResult> {
  try {
    let query = supabase
      .from('images')
      .select('*')
      .eq('user_id', userId);

    if (type) {
      query = query.eq('type', type);
    }

    const { data: images, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      return { error: new Error(error.message) };
    }

    return { data: images || [] };
  } catch (error) {
    return { error: error as Error };
  }
}

/**
 * Update image metadata
 */
export async function updateImageMetadata(
  imageId: string,
  updates: {
    alt_text?: string;
    sort_order?: number;
    is_primary?: boolean;
  }
): Promise<ImageUploadResult> {
  try {
    const { data: image, error } = await supabase
      .from('images')
      .update(updates)
      .eq('id', imageId)
      .select()
      .single();

    if (error) {
      return { error: new Error(error.message) };
    }

    return { data: image };
  } catch (error) {
    return { error: error as Error };
  }
}

/**
 * Reorder images
 */
export async function reorderImages(
  portfolioId: string,
  imageIds: string[]
): Promise<{ error?: Error | null }> {
  try {
    // Update sort order for each image
    const updates = imageIds.map((id, index) => 
      supabase
        .from('images')
        .update({ sort_order: index })
        .eq('id', id)
        .eq('portfolio_id', portfolioId)
    );

    // Execute all updates
    await Promise.all(updates);

    return {};
  } catch (error) {
    return { error: error as Error };
  }
}

/**
 * Delete image
 */
export async function deleteImage(imageId: string): Promise<{ error?: Error | null }> {
  try {
    // Get image record to find file path
    const { data: image } = await supabase
      .from('images')
      .select('file_path')
      .eq('id', imageId)
      .single();

    // Delete from storage if file path exists
    if (image?.file_path) {
      // Extract file path from full URL
      const url = new URL(image.file_path);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts.slice(-3).join('/'); // user/portfolio/filename
      
      const { error: deleteError } = await supabase.storage
        .from('portfolio-images')
        .remove([fileName]);

      if (deleteError) {
        console.error('Error deleting image file:', deleteError);
        // Continue to delete record even if file deletion fails
      }
    }

    // Delete image record
    const { error } = await supabase
      .from('images')
      .delete()
      .eq('id', imageId);

    if (error) {
      return { error: new Error(error.message) };
    }

    return {};
  } catch (error) {
    return { error: error as Error };
  }
}

/**
 * Delete multiple images
 */
export async function deleteMultipleImages(imageIds: string[]): Promise<{ error?: Error | null }> {
  try {
    const errors: Error[] = [];
    
    // Delete images one by one to handle storage cleanup
    for (const imageId of imageIds) {
      const { error } = await deleteImage(imageId);
      if (error) {
        errors.push(error);
      }
    }

    if (errors.length > 0) {
      return { error: new Error(`Failed to delete ${errors.length} images`) };
    }

    return {};
  } catch (error) {
    return { error: error as Error };
  }
}

/**
 * Set primary image for portfolio
 */
export async function setPrimaryImage(
  portfolioId: string,
  imageId: string,
  type: ImageType
): Promise<{ error?: Error | null }> {
  try {
    // First, unset any existing primary image of this type
    await supabase
      .from('images')
      .update({ is_primary: false })
      .eq('portfolio_id', portfolioId)
      .eq('type', type);

    // Set the new primary image
    const { error } = await supabase
      .from('images')
      .update({ is_primary: true })
      .eq('id', imageId)
      .eq('portfolio_id', portfolioId);

    if (error) {
      return { error: new Error(error.message) };
    }

    return {};
  } catch (error) {
    return { error: error as Error };
  }
}

/**
 * Get optimized image URLs (for future use with image transformations)
 */
export function getOptimizedImageUrls(originalUrl: string): OptimizedImageUrls {
  // For now, return the same URL for all sizes
  // This can be enhanced with Supabase image transformations or a CDN
  return {
    original: originalUrl,
    thumbnail: originalUrl, // TODO: Add ?width=150&height=150
    medium: originalUrl,    // TODO: Add ?width=500&height=500
    large: originalUrl,     // TODO: Add ?width=1200&height=1200
  };
}