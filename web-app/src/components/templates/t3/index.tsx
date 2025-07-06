'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { TemplateProps } from '@/lib/templates/types';
import {
  BaseTemplateLayout,
  TemplateSectionWrapper,
  TemplateProfileImage,
} from '../base-template';

// T3 - Minimal Elegant Template
export default function T3Template({
  data,
  isPreview,
  isEditing = false,
  className,
  onSectionClick
}: TemplateProps) {
  const { user, portfolio, images, social_links, contact_info, stats } = data;

  return (
    <div className={cn('template-t3 bg-gray-50 text-gray-900', className)}>
      {/* Hero Section */}
      <TemplateSectionWrapper
        sectionId="hero"
        isEditing={isEditing}
        onSectionClick={onSectionClick}
        className="min-h-screen flex items-center bg-white"
      >
        <BaseTemplateLayout maxWidth="md" padding="xl">
          <div className="text-center">
            {/* Name */}
            <h1 className="text-6xl lg:text-8xl font-serif font-light text-gray-900 mb-8 tracking-tight leading-none">
              {user.full_name}
            </h1>

            {/* Profession */}
            <p className="text-xl lg:text-2xl text-gray-600 font-light mb-16 tracking-wide uppercase letter-spacing-wider">
              {user.profession === 'ACTOR' ? 'Actor' :
               user.profession === 'MODEL' ? 'Model' :
               user.profession === 'BOTH' ? 'Actor · Model' : 'Professional'}
            </p>

            {/* Profile Image */}
            <div className="mb-16">
              {images.profile ? (
                <TemplateProfileImage
                  src={images.profile.file_path}
                  alt={images.profile.alt_text || `${user.full_name} profile photo`}
                  size="lg"
                  className="mx-auto shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 mx-auto rounded-full bg-gray-200 flex items-center justify-center shadow-lg">
                  <span className="text-gray-400">Photo</span>
                </div>
              )}
            </div>

            {/* Location */}
            {user.location && (
              <p className="text-gray-500 text-lg font-light tracking-wide">
                {user.location}
              </p>
            )}
          </div>
        </BaseTemplateLayout>
      </TemplateSectionWrapper>

      {/* Introduction */}
      <TemplateSectionWrapper
        sectionId="intro"
        isEditing={isEditing}
        onSectionClick={onSectionClick}
        className="py-32 bg-white"
      >
        <BaseTemplateLayout maxWidth="md">
          <div className="text-center">
            {portfolio.bio && (
              <div className="prose prose-xl prose-gray mx-auto text-center">
                <p className="text-xl lg:text-2xl leading-relaxed font-light text-gray-700 tracking-wide">
                  {portfolio.bio}
                </p>
              </div>
            )}

            {user.bio && user.bio !== portfolio.bio && (
              <div className="mt-12 prose prose-lg prose-gray mx-auto text-center">
                <p className="leading-relaxed text-gray-600">
                  {user.bio}
                </p>
              </div>
            )}
          </div>
        </BaseTemplateLayout>
      </TemplateSectionWrapper>

      {/* Work Section */}
      {images.gallery && images.gallery.length > 0 && (
        <TemplateSectionWrapper
          sectionId="work"
          isEditing={isEditing}
          onSectionClick={onSectionClick}
          className="py-32 bg-gray-50"
        >
          <BaseTemplateLayout maxWidth="lg">
            {/* Section Title */}
            <div className="text-center mb-20">
              <h2 className="text-4xl lg:text-5xl font-serif font-light text-gray-900 tracking-tight">
                Selected Work
              </h2>
            </div>

            {/* Work Grid */}
            <div className="space-y-32">
              {images.gallery.slice(0, 6).map((image, index) => (
                <div
                  key={image.id}
                  className={cn(
                    'grid grid-cols-1 lg:grid-cols-2 gap-16 items-center',
                    index % 2 === 1 && 'lg:grid-flow-col-dense'
                  )}
                >
                  {/* Image */}
                  <div className={cn(
                    'relative overflow-hidden bg-white shadow-xl',
                    index % 2 === 1 && 'lg:col-start-2'
                  )}>
                    <div className="aspect-[4/5] lg:aspect-[3/4]">
                      <img
                        src={image.file_path}
                        alt={image.alt_text || `Work ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className={cn(
                    'space-y-6',
                    index % 2 === 1 && 'lg:col-start-1 lg:row-start-1'
                  )}>
                    <div className="text-sm uppercase tracking-wider text-gray-500 font-medium">
                      Project {String(index + 1).padStart(2, '0')}
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-serif font-light text-gray-900">
                      {image.alt_text || `Portfolio Work ${index + 1}`}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      A carefully curated piece showcasing professional work and artistic vision.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </BaseTemplateLayout>
        </TemplateSectionWrapper>
      )}

      {/* About Section */}
      <TemplateSectionWrapper
        sectionId="about"
        isEditing={isEditing}
        onSectionClick={onSectionClick}
        className="py-32 bg-white"
      >
        <BaseTemplateLayout maxWidth="md">
          <div className="text-center">
            <h2 className="text-4xl lg:text-5xl font-serif font-light text-gray-900 mb-16 tracking-tight">
              About
            </h2>

            <div className="space-y-12">
              {/* Experience & Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                <div className="text-center">
                  <div className="text-5xl font-light text-gray-900 mb-4">
                    {stats.experience_years}
                  </div>
                  <p className="text-sm uppercase tracking-wider text-gray-500">
                    Years Experience
                  </p>
                </div>
                
                {stats.projects_completed && (
                  <div className="text-center">
                    <div className="text-5xl font-light text-gray-900 mb-4">
                      {stats.projects_completed}
                    </div>
                    <p className="text-sm uppercase tracking-wider text-gray-500">
                      Projects Completed
                    </p>
                  </div>
                )}
              </div>

              {/* Skills */}
              {portfolio.skills && portfolio.skills.length > 0 && (
                <div className="pt-12 border-t border-gray-200">
                  <h3 className="text-lg font-light text-gray-900 mb-8 tracking-wide">
                    Expertise
                  </h3>
                  <div className="flex flex-wrap justify-center gap-4">
                    {portfolio.skills.slice(0, 8).map((skill, index) => (
                      <span
                        key={index}
                        className="text-gray-600 text-sm tracking-wide"
                      >
                        {skill}
                        {index < Math.min(portfolio.skills!.length - 1, 7) && ' · '}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="pt-12 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm">
                  {portfolio.height && (
                    <div className="text-center">
                      <p className="text-gray-500 uppercase tracking-wider mb-2">Height</p>
                      <p className="text-gray-900">{portfolio.height}</p>
                    </div>
                  )}
                  
                  {user.location && (
                    <div className="text-center">
                      <p className="text-gray-500 uppercase tracking-wider mb-2">Based</p>
                      <p className="text-gray-900">{user.location}</p>
                    </div>
                  )}
                  
                  {portfolio.eye_color && (
                    <div className="text-center">
                      <p className="text-gray-500 uppercase tracking-wider mb-2">Eyes</p>
                      <p className="text-gray-900">{portfolio.eye_color}</p>
                    </div>
                  )}
                  
                  {portfolio.hair_color && (
                    <div className="text-center">
                      <p className="text-gray-500 uppercase tracking-wider mb-2">Hair</p>
                      <p className="text-gray-900">{portfolio.hair_color}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </BaseTemplateLayout>
      </TemplateSectionWrapper>

      {/* Contact Section */}
      <TemplateSectionWrapper
        sectionId="contact"
        isEditing={isEditing}
        onSectionClick={onSectionClick}
        className="py-32 bg-gray-50 border-t border-gray-200"
      >
        <BaseTemplateLayout maxWidth="md">
          <div className="text-center">
            <h2 className="text-4xl lg:text-5xl font-serif font-light text-gray-900 mb-16 tracking-tight">
              Contact
            </h2>

            <div className="space-y-12">
              {/* Contact Info */}
              <div className="space-y-6">
                {contact_info.email && (
                  <div>
                    <p className="text-sm uppercase tracking-wider text-gray-500 mb-2">Email</p>
                    <a
                      href={`mailto:${contact_info.email}`}
                      className="text-xl font-light text-gray-900 hover:text-gray-600 transition-colors"
                    >
                      {contact_info.email}
                    </a>
                  </div>
                )}

                {contact_info.phone && (
                  <div>
                    <p className="text-sm uppercase tracking-wider text-gray-500 mb-2">Phone</p>
                    <a
                      href={`tel:${contact_info.phone}`}
                      className="text-xl font-light text-gray-900 hover:text-gray-600 transition-colors"
                    >
                      {contact_info.phone}
                    </a>
                  </div>
                )}

                {contact_info.agent && (
                  <div className="pt-8 border-t border-gray-200">
                    <p className="text-sm uppercase tracking-wider text-gray-500 mb-4">Representation</p>
                    <div className="space-y-2">
                      <p className="text-lg font-light text-gray-900">{contact_info.agent.name}</p>
                      <a
                        href={`mailto:${contact_info.agent.email}`}
                        className="block text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        {contact_info.agent.email}
                      </a>
                      {contact_info.agent.phone && (
                        <a
                          href={`tel:${contact_info.agent.phone}`}
                          className="block text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          {contact_info.agent.phone}
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Social Links */}
              {Object.keys(social_links).length > 0 && (
                <div className="pt-8 border-t border-gray-200">
                  <p className="text-sm uppercase tracking-wider text-gray-500 mb-6">Follow</p>
                  <div className="flex justify-center space-x-8">
                    {Object.entries(social_links).map(([platform, url]) => {
                      if (!url) return null;
                      const platformNames: Record<string, string> = {
                        instagram: 'Instagram',
                        twitter: 'Twitter',
                        linkedin: 'LinkedIn',
                        tiktok: 'TikTok',
                        website: 'Website'
                      };
                      
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-900 transition-colors text-sm tracking-wide"
                        >
                          {platformNames[platform] || platform}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Availability */}
              <div className="pt-8 border-t border-gray-200">
                <p className="text-lg font-light text-gray-900 leading-relaxed">
                  Currently available for new projects and collaborations.
                </p>
              </div>
            </div>
          </div>
        </BaseTemplateLayout>
      </TemplateSectionWrapper>
    </div>
  );
}