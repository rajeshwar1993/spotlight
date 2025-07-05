'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ImageSkeleton } from '@/components/ui/image-skeleton';
import type { PortfolioImage, ImageType } from '@/types';

interface PortfolioImageProps {
  image: PortfolioImage;
  alt?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
  sizes?: string;
  priority?: boolean;
  quality?: number;
  onClick?: () => void;
  loading?: 'lazy' | 'eager';
  objectFit?: 'cover' | 'contain' | 'fill';
  showOverlay?: boolean;
  overlayContent?: React.ReactNode;
}

export function PortfolioImage({
  image,
  alt,
  className,
  aspectRatio = 'auto',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  quality = 80,
  onClick,
  loading = 'lazy',
  objectFit = 'cover',
  showOverlay = false,
  overlayContent,
}: PortfolioImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video', 
    portrait: 'aspect-[3/4]',
    auto: ''
  };

  const objectFitClasses = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill'
  };

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  const imageAlt = alt || image.alt_text || image.file_name || 'Portfolio image';

  if (hasError) {
    return (
      <div 
        className={cn(
          'bg-gray-100 flex items-center justify-center rounded-lg',
          aspectClasses[aspectRatio],
          className
        )}
      >
        <div className="text-center p-4">
          <svg
            className="w-8 h-8 text-gray-400 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.966-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <p className="text-xs text-gray-500">Failed to load image</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'relative overflow-hidden rounded-lg',
        aspectClasses[aspectRatio],
        onClick && 'cursor-pointer transition-transform hover:scale-105',
        className
      )}
      onClick={onClick}
    >
      {/* Loading skeleton */}
      {isLoading && (
        <ImageSkeleton 
          className="absolute inset-0 w-full h-full rounded-lg"
          aspectRatio={aspectRatio}
        />
      )}

      {/* Main image */}
      <Image
        src={image.file_path}
        alt={imageAlt}
        fill={aspectRatio !== 'auto'}
        width={aspectRatio === 'auto' ? image.width || undefined : undefined}
        height={aspectRatio === 'auto' ? image.height || undefined : undefined}
        sizes={sizes}
        priority={priority}
        quality={quality}
        loading={loading}
        className={cn(
          objectFitClasses[objectFit],
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={handleLoad}
        onError={handleError}
      />

      {/* Overlay */}
      {showOverlay && overlayContent && (
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
            {overlayContent}
          </div>
        </div>
      )}

      {/* Primary badge */}
      {image.is_primary && (
        <div className="absolute top-2 right-2">
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Primary
          </span>
        </div>
      )}
    </div>
  );
}

// Utility component for different portfolio image types
interface TypedPortfolioImageProps extends Omit<PortfolioImageProps, 'aspectRatio'> {
  type?: ImageType;
}

export function TypedPortfolioImage({ 
  type, 
  ...props 
}: TypedPortfolioImageProps) {
  const getAspectRatio = (imageType?: ImageType) => {
    switch (imageType) {
      case 'PROFILE':
        return 'square' as const;
      case 'HERO':
        return 'video' as const;
      case 'GALLERY':
        return 'portrait' as const;
      default:
        return 'auto' as const;
    }
  };

  return (
    <PortfolioImage 
      {...props} 
      aspectRatio={getAspectRatio(type)}
    />
  );
}

// Responsive grid of portfolio images
interface PortfolioImageGridProps {
  images: PortfolioImage[];
  onImageClick?: (image: PortfolioImage) => void;
  className?: string;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function PortfolioImageGrid({
  images,
  onImageClick,
  className,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 }
}: PortfolioImageGridProps) {
  const gridClasses = cn(
    'grid gap-4',
    `grid-cols-${columns.sm}`,
    `md:grid-cols-${columns.md}`,
    `lg:grid-cols-${columns.lg}`,
    `xl:grid-cols-${columns.xl}`,
    className
  );

  return (
    <div className={gridClasses}>
      {images.map((image) => (
        <TypedPortfolioImage
          key={image.id}
          image={image}
          type={image.type}
          onClick={() => onImageClick?.(image)}
          className="w-full"
          showOverlay={!!onImageClick}
        />
      ))}
    </div>
  );
}