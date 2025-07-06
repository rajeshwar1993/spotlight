import { supabase } from '@/lib/supabase/client';
import { ImageType } from '@/types/database';

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  resize?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  blur?: number;
  sharpen?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
}

export interface ImageVariant {
  name: string;
  width: number;
  height?: number;
  quality: number;
  format: 'webp' | 'avif' | 'jpeg';
  resize: 'cover' | 'contain' | 'fill';
}

export interface OptimizedImageUrls {
  original: string;
  variants: Record<string, string>;
  placeholder?: string;
}

export class ImageOptimizationService {
  private static readonly SUPABASE_STORAGE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/render/image/public';
  
  // Predefined image variants for different use cases
  private static readonly IMAGE_VARIANTS: Record<ImageType, ImageVariant[]> = {
    [ImageType.PROFILE]: [
      { name: 'thumbnail', width: 150, height: 150, quality: 85, format: 'webp', resize: 'cover' },
      { name: 'small', width: 300, height: 300, quality: 85, format: 'webp', resize: 'cover' },
      { name: 'medium', width: 600, height: 600, quality: 90, format: 'webp', resize: 'cover' },
      { name: 'large', width: 1200, height: 1200, quality: 92, format: 'webp', resize: 'cover' },
    ],
    [ImageType.HEADSHOT]: [
      { name: 'thumbnail', width: 200, height: 250, quality: 85, format: 'webp', resize: 'cover' },
      { name: 'small', width: 400, height: 500, quality: 85, format: 'webp', resize: 'cover' },
      { name: 'medium', width: 800, height: 1000, quality: 90, format: 'webp', resize: 'cover' },
      { name: 'large', width: 1600, height: 2000, quality: 92, format: 'webp', resize: 'cover' },
    ],
    [ImageType.BODY]: [
      { name: 'thumbnail', width: 150, height: 200, quality: 85, format: 'webp', resize: 'cover' },
      { name: 'small', width: 300, height: 400, quality: 85, format: 'webp', resize: 'cover' },
      { name: 'medium', width: 600, height: 800, quality: 90, format: 'webp', resize: 'cover' },
      { name: 'large', width: 1200, height: 1600, quality: 92, format: 'webp', resize: 'cover' },
    ],
    [ImageType.PORTFOLIO]: [
      { name: 'thumbnail', width: 300, height: 200, quality: 85, format: 'webp', resize: 'cover' },
      { name: 'small', width: 600, height: 400, quality: 85, format: 'webp', resize: 'cover' },
      { name: 'medium', width: 1200, height: 800, quality: 90, format: 'webp', resize: 'cover' },
      { name: 'large', width: 2400, height: 1600, quality: 92, format: 'webp', resize: 'cover' },
    ],
  };

  /**
   * Generate optimized URLs for all variants of an image
   */
  static generateOptimizedUrls(
    bucketName: string,
    fileName: string,
    imageType: ImageType
  ): OptimizedImageUrls {
    const variants = this.IMAGE_VARIANTS[imageType];
    const optimizedUrls: OptimizedImageUrls = {
      original: this.getOriginalUrl(bucketName, fileName),
      variants: {},
    };

    // Generate variant URLs
    variants.forEach((variant) => {
      optimizedUrls.variants[variant.name] = this.getTransformedUrl(
        bucketName,
        fileName,
        variant
      );
    });

    // Generate placeholder (blurred thumbnail)
    optimizedUrls.placeholder = this.getTransformedUrl(bucketName, fileName, {
      name: 'placeholder',
      width: 20,
      height: 20,
      quality: 30,
      format: 'webp',
      resize: 'cover',
    });

    return optimizedUrls;
  }

  /**
   * Get the original image URL from Supabase storage
   */
  private static getOriginalUrl(bucketName: string, fileName: string): string {
    const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);
    return data.publicUrl;
  }

  /**
   * Generate transformed image URL using Supabase's image transformation API
   */
  private static getTransformedUrl(
    bucketName: string,
    fileName: string,
    options: ImageTransformOptions & { name?: string }
  ): string {
    const baseUrl = `${this.SUPABASE_STORAGE_URL}/${bucketName}/${fileName}`;
    const params = new URLSearchParams();

    // Add transformation parameters
    if (options.width) params.append('width', options.width.toString());
    if (options.height) params.append('height', options.height.toString());
    if (options.quality) params.append('quality', options.quality.toString());
    if (options.format) params.append('format', options.format);
    if (options.resize) params.append('resize', options.resize);
    if (options.blur) params.append('blur', options.blur.toString());
    if (options.sharpen) params.append('sharpen', options.sharpen.toString());
    if (options.brightness) params.append('brightness', options.brightness.toString());
    if (options.contrast) params.append('contrast', options.contrast.toString());
    if (options.saturation) params.append('saturation', options.saturation.toString());

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Get the best variant URL based on viewport dimensions
   */
  static getOptimalVariant(
    optimizedUrls: OptimizedImageUrls,
    targetWidth: number,
    targetHeight?: number
  ): string {
    const variants = Object.keys(optimizedUrls.variants);
    
    // Find the smallest variant that's still larger than the target
    let bestVariant = variants[0];
    let bestScore = Infinity;

    variants.forEach((variantName) => {
      // For simplicity, we'll use a scoring system based on width
      // In a real implementation, you might want to be more sophisticated
      const variantWidth = this.getVariantWidth(variantName);
      if (variantWidth >= targetWidth) {
        const score = variantWidth - targetWidth;
        if (score < bestScore) {
          bestScore = score;
          bestVariant = variantName;
        }
      }
    });

    return optimizedUrls.variants[bestVariant] || optimizedUrls.original;
  }

  /**
   * Get the width of a variant based on its name
   */
  private static getVariantWidth(variantName: string): number {
    const widthMap: Record<string, number> = {
      thumbnail: 150,
      small: 300,
      medium: 600,
      large: 1200,
    };
    return widthMap[variantName] || 1200;
  }

  /**
   * Generate a base64 placeholder from a low-quality image
   */
  static async generatePlaceholder(
    bucketName: string,
    fileName: string
  ): Promise<string> {
    try {
      const placeholderUrl = this.getTransformedUrl(bucketName, fileName, {
        width: 20,
        height: 20,
        quality: 30,
        format: 'webp',
        resize: 'cover',
        blur: 10,
      });

      const response = await fetch(placeholderUrl);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error generating placeholder:', error);
      return '';
    }
  }

  /**
   * Validate if browser supports modern image formats
   */
  static getBrowserSupportedFormat(): 'avif' | 'webp' | 'jpeg' {
    if (typeof window === 'undefined') return 'webp'; // SSR fallback

    // Check for AVIF support
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    try {
      const avifSupported = canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
      if (avifSupported) return 'avif';
    } catch (e) {
      // AVIF not supported
    }

    // Check for WebP support
    try {
      const webpSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      if (webpSupported) return 'webp';
    } catch (e) {
      // WebP not supported
    }

    return 'jpeg';
  }

  /**
   * Get responsive image sources for different screen sizes
   */
  static getResponsiveSources(
    optimizedUrls: OptimizedImageUrls,
    imageType: ImageType
  ): Array<{ media: string; srcSet: string; type: string }> {
    const format = this.getBrowserSupportedFormat();
    const variants = this.IMAGE_VARIANTS[imageType];
    
    return [
      {
        media: '(max-width: 640px)',
        srcSet: optimizedUrls.variants.small || optimizedUrls.original,
        type: `image/${format}`,
      },
      {
        media: '(max-width: 1024px)',
        srcSet: optimizedUrls.variants.medium || optimizedUrls.original,
        type: `image/${format}`,
      },
      {
        media: '(min-width: 1025px)',
        srcSet: optimizedUrls.variants.large || optimizedUrls.original,
        type: `image/${format}`,
      },
    ];
  }

  /**
   * Calculate image quality based on content type and use case
   */
  static getOptimalQuality(
    imageType: ImageType,
    variantName: string,
    fileSize?: number
  ): number {
    const baseQuality = {
      thumbnail: 75,
      small: 80,
      medium: 85,
      large: 90,
    };

    let quality = baseQuality[variantName as keyof typeof baseQuality] || 85;

    // Adjust quality based on image type
    if (imageType === ImageType.HEADSHOT || imageType === ImageType.PROFILE) {
      quality += 5; // Higher quality for portraits
    }

    // Adjust quality based on file size (if available)
    if (fileSize) {
      const sizeInMB = fileSize / (1024 * 1024);
      if (sizeInMB > 5) {
        quality -= 5; // Reduce quality for large files
      }
    }

    return Math.max(60, Math.min(95, quality));
  }
}

export default ImageOptimizationService;