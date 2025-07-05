'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { TemplateProps, TemplateSectionProps } from '@/lib/templates/types';

// Base template interface that all templates should implement
export interface BaseTemplateInterface {
  render(): React.ReactElement;
  getSections(): string[];
  validateData(): boolean;
}

// Common template section wrapper
interface TemplateSectionWrapperProps {
  sectionId: string;
  className?: string;
  isVisible?: boolean;
  isEditing?: boolean;
  onSectionClick?: (sectionId: string) => void;
  children: React.ReactNode;
}

export function TemplateSectionWrapper({
  sectionId,
  className,
  isVisible = true,
  isEditing = false,
  onSectionClick,
  children
}: TemplateSectionWrapperProps) {
  const handleClick = () => {
    if (isEditing && onSectionClick) {
      onSectionClick(sectionId);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <section
      id={sectionId}
      className={cn(
        'template-section',
        `template-section-${sectionId}`,
        'relative',
        {
          'cursor-pointer group': isEditing && onSectionClick,
          'border-2 border-dashed border-transparent hover:border-blue-300': isEditing && onSectionClick
        },
        className
      )}
      onClick={handleClick}
      data-section={sectionId}
      data-editing={isEditing}
    >
      {/* Edit indicator for editing mode */}
      {isEditing && onSectionClick && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg">
            Edit {sectionId}
          </div>
        </div>
      )}
      
      {children}
    </section>
  );
}

// Base template layout component
interface BaseTemplateLayoutProps {
  className?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export function BaseTemplateLayout({
  className,
  children,
  maxWidth = 'xl',
  padding = 'lg'
}: BaseTemplateLayoutProps) {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4 py-8',
    md: 'px-6 py-12',
    lg: 'px-8 py-16',
    xl: 'px-12 py-20'
  };

  return (
    <div className={cn(
      'template-layout',
      'w-full',
      'mx-auto',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}

// Common template components that can be reused across templates
export function TemplateHeroImage({ 
  src, 
  alt, 
  className,
  overlay = false,
  overlayOpacity = 0.3
}: {
  src: string;
  alt: string;
  className?: string;
  overlay?: boolean;
  overlayOpacity?: number;
}) {
  return (
    <div className={cn('template-hero-image relative overflow-hidden', className)}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      {overlay && (
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}
    </div>
  );
}

export function TemplateProfileImage({ 
  src, 
  alt, 
  size = 'md',
  className 
}: {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48'
  };

  return (
    <div className={cn(
      'template-profile-image',
      'rounded-full overflow-hidden bg-gray-200',
      sizeClasses[size],
      className
    )}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
}

export function TemplateGalleryGrid({ 
  images, 
  columns = 3,
  gap = 'md',
  className
}: {
  images: Array<{ src: string; alt: string; id: string }>;
  columns?: 2 | 3 | 4 | 5;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const columnClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  return (
    <div className={cn(
      'template-gallery-grid',
      'grid',
      columnClasses[columns],
      gapClasses[gap],
      className
    )}>
      {images.map((image) => (
        <div
          key={image.id}
          className="template-gallery-item aspect-square overflow-hidden rounded-lg bg-gray-200"
        >
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}

export function TemplateSkillsList({ 
  skills, 
  variant = 'tags',
  className 
}: {
  skills: string[];
  variant?: 'tags' | 'list' | 'grid';
  className?: string;
}) {
  if (variant === 'tags') {
    return (
      <div className={cn('template-skills-tags flex flex-wrap gap-2', className)}>
        {skills.map((skill, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
          >
            {skill}
          </span>
        ))}
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className={cn('template-skills-grid grid grid-cols-2 md:grid-cols-3 gap-2', className)}>
        {skills.map((skill, index) => (
          <div
            key={index}
            className="text-center p-2 bg-gray-50 rounded text-sm font-medium"
          >
            {skill}
          </div>
        ))}
      </div>
    );
  }

  return (
    <ul className={cn('template-skills-list space-y-1', className)}>
      {skills.map((skill, index) => (
        <li key={index} className="text-sm">
          • {skill}
        </li>
      ))}
    </ul>
  );
}

export function TemplateSocialLinks({ 
  links, 
  variant = 'icons',
  className 
}: {
  links: Record<string, string>;
  variant?: 'icons' | 'text' | 'buttons';
  className?: string;
}) {
  const socialPlatforms = {
    instagram: { name: 'Instagram', icon: '📷' },
    twitter: { name: 'Twitter', icon: '🐦' },
    linkedin: { name: 'LinkedIn', icon: '💼' },
    tiktok: { name: 'TikTok', icon: '🎵' },
    website: { name: 'Website', icon: '🌐' }
  };

  return (
    <div className={cn(
      'template-social-links',
      variant === 'icons' ? 'flex space-x-4' : 'space-y-2',
      className
    )}>
      {Object.entries(links).map(([platform, url]) => {
        const platformInfo = socialPlatforms[platform as keyof typeof socialPlatforms];
        if (!platformInfo || !url) return null;

        if (variant === 'icons') {
          return (
            <a
              key={platform}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl hover:scale-110 transition-transform"
              title={platformInfo.name}
            >
              {platformInfo.icon}
            </a>
          );
        }

        if (variant === 'buttons') {
          return (
            <a
              key={platform}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <span className="mr-2">{platformInfo.icon}</span>
              {platformInfo.name}
            </a>
          );
        }

        return (
          <a
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-blue-600 hover:text-blue-800 transition-colors"
          >
            {platformInfo.name}
          </a>
        );
      })}
    </div>
  );
}

// Abstract base template class that other templates can extend
export abstract class BaseTemplate {
  protected props: TemplateProps;

  constructor(props: TemplateProps) {
    this.props = props;
  }

  abstract render(): React.ReactElement;

  protected getSectionProps(sectionId: string): TemplateSectionProps {
    return {
      data: this.props.data,
      isPreview: this.props.isPreview,
      isEditing: this.props.isEditing,
      customizations: this.props.customizations
    };
  }

  protected renderSection(sectionId: string, component: React.ComponentType<TemplateSectionProps>) {
    const Component = component;
    return (
      <TemplateSectionWrapper
        key={sectionId}
        sectionId={sectionId}
        isEditing={this.props.isEditing}
        onSectionClick={this.props.onSectionClick}
      >
        <Component {...this.getSectionProps(sectionId)} />
      </TemplateSectionWrapper>
    );
  }
}