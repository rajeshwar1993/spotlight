'use client';

import React, { useState, useEffect, forwardRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ImageOptimizationService, OptimizedImageUrls } from '@/lib/image-optimization';
import { useLazyImage, useProgressiveImage } from '@/hooks/use-lazy-loading';
import { ImageType } from '@/types/database';

export interface ResponsiveImageProps {
  src: string;
  alt: string;
  bucketName: string;
  imageType: ImageType;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  fill?: boolean;
  width?: number;
  height?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: (error: Error) => void;
  enableProgressive?: boolean;
  showLoadingState?: boolean;
  blurDataURL?: string;
}

/**
 * Responsive image component with built-in optimization and lazy loading
 */
export const ResponsiveImage = forwardRef<HTMLDivElement, ResponsiveImageProps>(
  ({
    src,
    alt,
    bucketName,
    imageType,
    className,
    sizes,
    priority = false,
    quality,
    placeholder = 'blur',
    fill = false,
    width,
    height,
    objectFit = 'cover',
    loading = 'lazy',
    onLoad,
    onError,
    enableProgressive = true,
    showLoadingState = true,
    blurDataURL,
    ...props
  }, ref) => {
    const [optimizedUrls, setOptimizedUrls] = useState<OptimizedImageUrls | null>(null);
    const [placeholderData, setPlaceholderData] = useState<string>('');
    const [isClient, setIsClient] = useState(false);

    // Generate optimized URLs
    useEffect(() => {
      const urls = ImageOptimizationService.generateOptimizedUrls(
        bucketName,
        src,
        imageType
      );
      setOptimizedUrls(urls);
    }, [bucketName, src, imageType]);

    // Generate placeholder on client
    useEffect(() => {
      setIsClient(true);
      
      if (placeholder === 'blur' && !blurDataURL && optimizedUrls?.placeholder) {
        ImageOptimizationService.generatePlaceholder(bucketName, src)
          .then(setPlaceholderData)
          .catch(console.error);
      }
    }, [placeholder, blurDataURL, optimizedUrls, bucketName, src]);

    // Progressive loading sources
    const progressiveSources = React.useMemo(() => {
      if (!optimizedUrls || !enableProgressive) return [];
      
      return [
        optimizedUrls.variants.thumbnail,
        optimizedUrls.variants.small,
        optimizedUrls.variants.medium,
        optimizedUrls.variants.large,
      ].filter(Boolean);
    }, [optimizedUrls, enableProgressive]);

    // Use progressive loading if enabled
    const progressiveImage = useProgressiveImage(
      progressiveSources,
      { triggerOnce: true, threshold: 0.1 }
    );

    // Fallback to regular lazy loading
    const lazyImage = useLazyImage(
      optimizedUrls?.variants.large || optimizedUrls?.original || src,
      optimizedUrls?.placeholder,
      { triggerOnce: true, threshold: 0.1 }
    );

    // Choose loading strategy
    const imageLoader = enableProgressive && progressiveSources.length > 0 
      ? progressiveImage 
      : lazyImage;

    // Handle loading states
    const handleLoad = () => {
      onLoad?.();
    };

    const handleError = (error: string) => {
      onError?.(new Error(error));
    };

    // Get responsive sources for picture element
    const responsiveSources = React.useMemo(() => {
      if (!optimizedUrls || !isClient) return [];
      
      return ImageOptimizationService.getResponsiveSources(optimizedUrls, imageType);
    }, [optimizedUrls, imageType, isClient]);

    // Determine the image source to use
    const imageSrc = enableProgressive && progressiveSources.length > 0
      ? progressiveImage.src
      : (optimizedUrls?.variants.large || optimizedUrls?.original || src);

    // Generate srcSet for responsive images
    const srcSet = React.useMemo(() => {
      if (!optimizedUrls) return '';
      
      const variants = optimizedUrls.variants;
      const srcSetArray: string[] = [];
      
      if (variants.small) srcSetArray.push(`${variants.small} 600w`);
      if (variants.medium) srcSetArray.push(`${variants.medium} 1200w`);
      if (variants.large) srcSetArray.push(`${variants.large} 2400w`);
      
      return srcSetArray.join(', ');
    }, [optimizedUrls]);

    // Default sizes if not provided
    const defaultSizes = sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

    if (!isClient) {
      // SSR fallback
      return (
        <div
          ref={ref}
          className={cn(
            'relative overflow-hidden bg-gray-100 animate-pulse',
            className
          )}
          style={{ width, height }}
          {...props}
        />
      );
    }

    return (
      <div
        ref={imageLoader.ref}
        className={cn('relative overflow-hidden', className)}
        style={{ width: !fill ? width : undefined, height: !fill ? height : undefined }}
        {...props}
      >
        {/* Loading state */}
        {showLoadingState && imageLoader.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Error state */}
        {imageLoader.error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
            <div className="text-center">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Failed to load</p>
              <button
                onClick={imageLoader.retry}
                className="mt-1 text-xs text-blue-500 hover:text-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Main image */}
        {imageLoader.isVisible && imageSrc && (
          <picture>
            {responsiveSources.map((source, index) => (
              <source
                key={index}
                media={source.media}
                srcSet={source.srcSet}
                type={source.type}
              />
            ))}
            <Image
              src={imageSrc}
              alt={alt}
              fill={fill}
              width={!fill ? width : undefined}
              height={!fill ? height : undefined}
              className={cn(
                'transition-opacity duration-300',
                imageLoader.isLoaded ? 'opacity-100' : 'opacity-0',
                objectFit === 'cover' && 'object-cover',
                objectFit === 'contain' && 'object-contain',
                objectFit === 'fill' && 'object-fill',
                objectFit === 'none' && 'object-none',
                objectFit === 'scale-down' && 'object-scale-down'
              )}
              priority={priority}
              loading={loading}
              quality={quality}
              sizes={defaultSizes}
              srcSet={srcSet}
              placeholder={placeholder}
              blurDataURL={blurDataURL || placeholderData}
              onLoad={handleLoad}
              onError={() => handleError('Image failed to load')}
            />
          </picture>
        )}

        {/* Progressive loading indicator */}
        {enableProgressive && 'isProgressive' in imageLoader && imageLoader.isProgressive && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            Loading... {imageLoader.currentIndex + 1}/{imageLoader.totalImages}
          </div>
        )}
      </div>
    );
  }
);

ResponsiveImage.displayName = 'ResponsiveImage';

/**
 * Simple optimized image component without lazy loading
 */
export const OptimizedImage = forwardRef<HTMLImageElement, Omit<ResponsiveImageProps, 'enableProgressive' | 'showLoadingState'>>(
  ({
    src,
    alt,
    bucketName,
    imageType,
    className,
    sizes,
    priority = false,
    quality,
    width,
    height,
    objectFit = 'cover',
    ...props
  }, ref) => {
    const [optimizedUrls, setOptimizedUrls] = useState<OptimizedImageUrls | null>(null);

    useEffect(() => {
      const urls = ImageOptimizationService.generateOptimizedUrls(
        bucketName,
        src,
        imageType
      );
      setOptimizedUrls(urls);
    }, [bucketName, src, imageType]);

    const srcSet = React.useMemo(() => {
      if (!optimizedUrls) return '';
      
      const variants = optimizedUrls.variants;
      const srcSetArray: string[] = [];
      
      if (variants.small) srcSetArray.push(`${variants.small} 600w`);
      if (variants.medium) srcSetArray.push(`${variants.medium} 1200w`);
      if (variants.large) srcSetArray.push(`${variants.large} 2400w`);
      
      return srcSetArray.join(', ');
    }, [optimizedUrls]);

    const defaultSizes = sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

    return (
      <Image
        ref={ref}
        src={optimizedUrls?.variants.large || optimizedUrls?.original || src}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          objectFit === 'cover' && 'object-cover',
          objectFit === 'contain' && 'object-contain',
          objectFit === 'fill' && 'object-fill',
          objectFit === 'none' && 'object-none',
          objectFit === 'scale-down' && 'object-scale-down',
          className
        )}
        priority={priority}
        quality={quality}
        sizes={defaultSizes}
        srcSet={srcSet}
        {...props}
      />
    );
  }
);

OptimizedImage.displayName = 'OptimizedImage';

export default ResponsiveImage;