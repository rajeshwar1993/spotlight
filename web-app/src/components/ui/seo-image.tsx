'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { optimizeImageForSEO, generateAltText } from '@/lib/seo';
import type { PortfolioData } from '@/lib/templates/types';

interface SEOImageProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  fill?: boolean;
  
  // SEO enhancement props
  portfolioData?: PortfolioData;
  imageType?: 'headshot' | 'portfolio' | 'gallery' | 'hero';
  context?: string;
  
  // Schema.org structured data
  structuredData?: boolean;
  caption?: string;
  description?: string;
  keywords?: string[];
  
  // Performance optimization
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  
  // Event handlers
  onLoad?: () => void;
  onError?: () => void;
}

export function SEOImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 85,
  sizes,
  fill = false,
  portfolioData,
  imageType,
  context,
  structuredData = false,
  caption,
  description,
  keywords = [],
  loading = 'lazy',
  decoding = 'async',
  onLoad,
  onError,
}: SEOImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Generate optimized alt text
  const optimizedAlt = alt || 
    (portfolioData && imageType ? 
      generateAltText(imageType, portfolioData, context) : 
      'Professional image');
  
  // Generate structured data for the image
  const imageStructuredData = structuredData && portfolioData ? {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    name: optimizedAlt,
    description: description || caption || optimizedAlt,
    url: src,
    width: width?.toString(),
    height: height?.toString(),
    creator: {
      '@type': 'Person',
      name: portfolioData.user.full_name || portfolioData.portfolio.title
    },
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    contentUrl: src,
    thumbnailUrl: src,
    encodingFormat: getImageFormat(src),
    dateCreated: new Date().toISOString(),
    copyrightHolder: {
      '@type': 'Person',
      name: portfolioData.user.full_name || portfolioData.portfolio.title
    }
  } : null;
  
  // Optimize image properties
  const imageProps = optimizeImageForSEO(src, {
    alt: optimizedAlt,
    title: caption || optimizedAlt,
    description: description,
    keywords,
    width,
    height,
    quality,
  });
  
  const handleLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };
  
  const handleError = () => {
    setImageError(true);
    onError?.();
  };
  
  // Generate responsive sizes if not provided
  const responsiveSizes = sizes || generateResponsiveSizes(width, height);
  
  return (
    <figure 
      className={`relative ${className || ''}`}
      itemScope 
      itemType="https://schema.org/ImageObject"
    >
      {/* Structured data for SEO */}
      {imageStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(imageStructuredData),
          }}
        />
      )}
      
      {/* Image with SEO optimization */}
      <Image
        src={src}
        alt={imageProps.alt}
        title={imageProps.title}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        quality={quality}
        priority={priority}
        sizes={responsiveSizes}
        loading={loading}
        decoding={decoding}
        className={`${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        
        // SEO attributes
        itemProp="image"
        data-image-type={imageType}
        data-context={context}
        
        // Performance attributes
        crossOrigin="anonymous"
        referrerPolicy="no-referrer-when-downgrade"
      />
      
      {/* Loading placeholder */}
      {!imageLoaded && !imageError && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          aria-label="Loading image"
        >
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
      
      {/* Error placeholder */}
      {imageError && (
        <div 
          className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-500"
          aria-label="Failed to load image"
        >
          <div className="text-center">
            <svg 
              className="w-12 h-12 mx-auto mb-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <p className="text-sm">Image not available</p>
          </div>
        </div>
      )}
      
      {/* Caption with schema.org markup */}
      {caption && (
        <figcaption 
          className="mt-2 text-sm text-gray-600 text-center"
          itemProp="caption"
        >
          {caption}
        </figcaption>
      )}
      
      {/* Hidden metadata for search engines */}
      {keywords.length > 0 && (
        <meta itemProp="keywords" content={keywords.join(', ')} />
      )}
      {description && (
        <meta itemProp="description" content={description} />
      )}
      <meta itemProp="contentUrl" content={src} />
      <meta itemProp="url" content={src} />
      {width && <meta itemProp="width" content={width.toString()} />}
      {height && <meta itemProp="height" content={height.toString()} />}
      <meta itemProp="encodingFormat" content={getImageFormat(src)} />
    </figure>
  );
}

// Utility functions
function getImageFormat(src: string): string {
  const extension = src.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'avif':
      return 'image/avif';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    default:
      return 'image/jpeg';
  }
}

function generateResponsiveSizes(width?: number, height?: number): string {
  if (!width) {
    return '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw';
  }
  
  // Generate sizes based on image dimensions
  if (width >= 1200) {
    return '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px';
  } else if (width >= 800) {
    return '(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 800px';
  } else if (width >= 400) {
    return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px';
  } else {
    return '(max-width: 640px) 100vw, (max-width: 1024px) 30vw, 200px';
  }
}

// Gallery component with SEO optimization
interface SEOImageGalleryProps {
  images: Array<{
    src: string;
    alt?: string;
    caption?: string;
    description?: string;
    keywords?: string[];
  }>;
  portfolioData?: PortfolioData;
  columns?: number;
  gap?: number;
  className?: string;
}

export function SEOImageGallery({
  images,
  portfolioData,
  columns = 3,
  gap = 4,
  className
}: SEOImageGalleryProps) {
  const galleryStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: `${portfolioData?.user.full_name || 'Portfolio'} - Image Gallery`,
    description: `Professional image gallery for ${portfolioData?.user.full_name || 'portfolio'}`,
    image: images.map(img => img.src),
    creator: portfolioData ? {
      '@type': 'Person',
      name: portfolioData.user.full_name || portfolioData.portfolio.title
    } : undefined,
    associatedMedia: images.map((img, index) => ({
      '@type': 'ImageObject',
      name: img.alt || `Gallery image ${index + 1}`,
      description: img.description || img.caption,
      url: img.src,
      keywords: img.keywords?.join(', ')
    }))
  };
  
  return (
    <div 
      className={`${className || ''}`}
      itemScope 
      itemType="https://schema.org/ImageGallery"
    >
      {/* Gallery structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(galleryStructuredData),
        }}
      />
      
      {/* Gallery grid */}
      <div 
        className={`grid grid-cols-${columns} gap-${gap}`}
        itemProp="associatedMedia"
      >
        {images.map((image, index) => (
          <SEOImage
            key={index}
            src={image.src}
            alt={image.alt}
            portfolioData={portfolioData}
            imageType="gallery"
            context={`Gallery image ${index + 1}`}
            structuredData={true}
            caption={image.caption}
            description={image.description}
            keywords={image.keywords}
            className="w-full h-auto"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ))}
      </div>
    </div>
  );
}