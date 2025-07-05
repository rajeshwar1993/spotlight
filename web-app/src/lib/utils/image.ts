import type { ImageType } from '@/types';

/**
 * Image processing and utility functions
 */

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface CropOptions {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Compress image file
 */
export function compressImage(
  file: File, 
  options: ImageCompressionOptions = {}
): Promise<File> {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'jpeg'
    } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: `image/${format}`,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        `image/${format}`,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Crop image file
 */
export function cropImage(file: File, cropOptions: CropOptions): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      const { x, y, width, height } = cropOptions;
      
      // Set canvas to crop dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw cropped image
      ctx.drawImage(
        img,
        x, y, width, height,  // Source crop area
        0, 0, width, height   // Destination area
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const croppedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(croppedFile);
          } else {
            reject(new Error('Failed to crop image'));
          }
        },
        file.type,
        0.9
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Generate image thumbnail
 */
export function generateThumbnail(
  file: File, 
  size: number = 150
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      // Calculate square crop from center
      const { width, height } = img;
      const cropSize = Math.min(width, height);
      const offsetX = (width - cropSize) / 2;
      const offsetY = (height - cropSize) / 2;

      // Set canvas to thumbnail size
      canvas.width = size;
      canvas.height = size;

      // Draw thumbnail
      ctx.drawImage(
        img,
        offsetX, offsetY, cropSize, cropSize,  // Source crop area
        0, 0, size, size                       // Destination area
      );

      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Convert image to WebP format
 */
export function convertToWebP(file: File, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(webpFile);
          } else {
            reject(new Error('Failed to convert to WebP'));
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Get image aspect ratio
 */
export function getImageAspectRatio(width: number, height: number): number {
  return width / height;
}

/**
 * Calculate dimensions to fit within bounds while maintaining aspect ratio
 */
export function calculateFitDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;
  
  let width = originalWidth;
  let height = originalHeight;
  
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }
  
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }
  
  return { width: Math.round(width), height: Math.round(height) };
}

/**
 * Calculate dimensions to fill bounds while maintaining aspect ratio
 */
export function calculateFillDimensions(
  originalWidth: number,
  originalHeight: number,
  targetWidth: number,
  targetHeight: number
): { width: number; height: number; offsetX: number; offsetY: number } {
  const aspectRatio = originalWidth / originalHeight;
  const targetAspectRatio = targetWidth / targetHeight;
  
  let width: number;
  let height: number;
  let offsetX = 0;
  let offsetY = 0;
  
  if (aspectRatio > targetAspectRatio) {
    // Image is wider than target
    height = targetHeight;
    width = height * aspectRatio;
    offsetX = (width - targetWidth) / 2;
  } else {
    // Image is taller than target
    width = targetWidth;
    height = width / aspectRatio;
    offsetY = (height - targetHeight) / 2;
  }
  
  return {
    width: Math.round(width),
    height: Math.round(height),
    offsetX: Math.round(offsetX),
    offsetY: Math.round(offsetY)
  };
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Get MIME type from file extension
 */
export function getMimeTypeFromExtension(extension: string): string {
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
    tif: 'image/tiff',
  };
  
  return mimeTypes[extension.toLowerCase()] || 'image/jpeg';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate alt text suggestions based on image type and context
 */
export function generateAltTextSuggestion(
  type: ImageType,
  userName?: string,
  portfolioTitle?: string
): string {
  const name = userName || 'Professional';
  const title = portfolioTitle || 'Portfolio';
  
  switch (type) {
    case 'PROFILE':
      return `Professional headshot of ${name}`;
    case 'HERO':
      return `Hero image for ${name}'s ${title}`;
    case 'GALLERY':
      return `Portfolio image from ${name}'s professional gallery`;
    case 'INTERNAL':
      return `Internal image for ${title}`;
    default:
      return `Professional image of ${name}`;
  }
}

/**
 * Validate image dimensions for specific use cases
 */
export function validateImageDimensions(
  width: number,
  height: number,
  type: ImageType
): { isValid: boolean; error?: string } {
  const minDimensions = {
    PROFILE: { width: 400, height: 400 },
    HERO: { width: 800, height: 400 },
    GALLERY: { width: 400, height: 400 },
    INTERNAL: { width: 200, height: 200 },
  };
  
  const min = minDimensions[type];
  
  if (width < min.width || height < min.height) {
    return {
      isValid: false,
      error: `${type} images must be at least ${min.width}x${min.height} pixels`
    };
  }
  
  // Additional validation for specific types
  if (type === 'PROFILE') {
    const aspectRatio = width / height;
    if (aspectRatio < 0.8 || aspectRatio > 1.2) {
      return {
        isValid: false,
        error: 'Profile images should be approximately square (aspect ratio between 0.8 and 1.2)'
      };
    }
  }
  
  return { isValid: true };
}

/**
 * Create image preview URL from File
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Cleanup image preview URL
 */
export function cleanupImagePreview(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Check if browser supports WebP
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webpData = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    const img = new Image();
    img.onload = img.onerror = () => resolve(img.height === 2);
    img.src = webpData;
  });
}

/**
 * Batch process images with progress callback
 */
export async function batchProcessImages(
  files: File[],
  processor: (file: File) => Promise<File>,
  onProgress?: (completed: number, total: number) => void
): Promise<File[]> {
  const results: File[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file) continue;
    
    try {
      const processed = await processor(file);
      results.push(processed);
    } catch (error) {
      console.error(`Failed to process image ${file.name}:`, error);
      // Add original file as fallback
      results.push(file);
    }
    
    if (onProgress) {
      onProgress(i + 1, files.length);
    }
  }
  
  return results;
}

/**
 * Create image from file for crop processing
 */
export function createImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for cropping'));
    };
    
    img.src = url;
  });
}

/**
 * Apply crop to image canvas
 */
export function applyCropToCanvas(
  image: HTMLImageElement,
  cropData: {
    x: number;
    y: number;
    width: number;
    height: number;
  },
  targetWidth?: number,
  targetHeight?: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  // Use target dimensions or crop dimensions
  canvas.width = targetWidth || cropData.width;
  canvas.height = targetHeight || cropData.height;

  // Calculate scale factors
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // Draw cropped image
  ctx.drawImage(
    image,
    cropData.x * scaleX,
    cropData.y * scaleY,
    cropData.width * scaleX,
    cropData.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return canvas;
}

/**
 * Convert canvas to file
 */
export function canvasToFile(
  canvas: HTMLCanvasElement,
  filename: string,
  mimeType: string = 'image/jpeg',
  quality: number = 0.9
): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], filename, {
            type: mimeType,
            lastModified: Date.now(),
          });
          resolve(file);
        } else {
          reject(new Error('Failed to convert canvas to file'));
        }
      },
      mimeType,
      quality
    );
  });
}

/**
 * Get optimal crop for different aspect ratios
 */
export function getOptimalCrop(
  imageWidth: number,
  imageHeight: number,
  targetAspectRatio: number
): { x: number; y: number; width: number; height: number } {
  const imageAspectRatio = imageWidth / imageHeight;
  
  let cropWidth: number;
  let cropHeight: number;
  let cropX: number;
  let cropY: number;

  if (imageAspectRatio > targetAspectRatio) {
    // Image is wider than target, crop width
    cropHeight = imageHeight;
    cropWidth = imageHeight * targetAspectRatio;
    cropX = (imageWidth - cropWidth) / 2;
    cropY = 0;
  } else {
    // Image is taller than target, crop height
    cropWidth = imageWidth;
    cropHeight = imageWidth / targetAspectRatio;
    cropX = 0;
    cropY = (imageHeight - cropHeight) / 2;
  }

  return {
    x: cropX,
    y: cropY,
    width: cropWidth,
    height: cropHeight,
  };
}

/**
 * Auto-crop image to aspect ratio
 */
export async function autoCropToAspectRatio(
  file: File,
  aspectRatio: number,
  quality: number = 0.9
): Promise<File> {
  const image = await createImageFromFile(file);
  const cropData = getOptimalCrop(
    image.naturalWidth,
    image.naturalHeight,
    aspectRatio
  );
  
  const canvas = applyCropToCanvas(image, cropData);
  return canvasToFile(canvas, file.name, file.type, quality);
}

/**
 * Smart crop for profile images (focuses on center/face area)
 */
export async function smartCropProfile(
  file: File,
  size: number = 400
): Promise<File> {
  const image = await createImageFromFile(file);
  const { naturalWidth: width, naturalHeight: height } = image;
  
  // Use smaller dimension as basis for square crop
  const cropSize = Math.min(width, height);
  const cropData = {
    x: (width - cropSize) / 2,
    y: Math.max(0, (height - cropSize) / 3), // Slightly higher to focus on face area
    width: cropSize,
    height: cropSize,
  };
  
  const canvas = applyCropToCanvas(image, cropData, size, size);
  return canvasToFile(canvas, file.name, file.type, 0.9);
}