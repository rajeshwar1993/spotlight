'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export function ResponsiveImage({
  src,
  alt,
  className,
  width,
  height,
  fill = false,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  objectFit = 'cover',
  placeholder = 'empty',
  blurDataURL,
  ...props
}: ResponsiveImageProps) {
  const imageProps = {
    src,
    alt,
    className: cn('transition-opacity duration-300', className),
    priority,
    sizes,
    placeholder,
    ...(blurDataURL && { blurDataURL }),
    style: {
      objectFit,
    },
    ...props,
  };

  if (fill) {
    return (
      <Image
        {...imageProps}
        fill
      />
    );
  }

  return (
    <Image
      {...imageProps}
      width={width || 600}
      height={height || 400}
    />
  );
}