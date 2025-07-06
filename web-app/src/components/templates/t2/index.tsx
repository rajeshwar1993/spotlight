'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { TemplateProps } from '@/lib/templates/types';
import {
  BaseTemplateLayout,
  TemplateSectionWrapper,
  TemplateProfileImage,
  TemplateHeroImage,
  TemplateGalleryGrid,
  TemplateSkillsList,
} from '../base-template';

// T2 - Modern Bold Template
export default function T2Template({
  data,
  isPreview,
  isEditing = false,
  className,
  onSectionClick
}: TemplateProps) {
  const { user, portfolio, images, social_links, contact_info, stats } = data;

  return (
    <div className={cn('template-t2 bg-gray-900 text-white', className)}>
      {/* Hero Section - Split Layout */}
      <TemplateSectionWrapper
        sectionId="hero"
        isEditing={isEditing}
        onSectionClick={onSectionClick}
        className="min-h-screen"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
          {/* Content Side */}
          <div className="flex flex-col justify-center p-8 lg:p-16 bg-gradient-to-br from-purple-900 via-gray-900 to-gray-900">
            <div className="max-w-lg">
              <div className="mb-8">
                <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                    {user.full_name?.split(' ')[0]}
                  </span>
                  <br />
                  <span className="text-white">
                    {user.full_name?.split(' ').slice(1).join(' ')}
                  </span>
                </h1>
                
                <div className="text-xl lg:text-2xl text-gray-300 mb-6 font-light">
                  {user.profession === 'ACTOR' ? 'Professional Actor' :
                   user.profession === 'MODEL' ? 'Professional Model' :
                   user.profession === 'BOTH' ? 'Actor & Model' : 'Creative Professional'}
                </div>

                {user.location && (
                  <div className="flex items-center text-gray-400 mb-8">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {user.location}
                  </div>
                )}
              </div>

              {portfolio.bio && (
                <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                  {portfolio.bio}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                    {stats.experience_years}+
                  </div>
                  <div className="text-sm text-gray-400 uppercase tracking-wide">Years Experience</div>
                </div>
                {stats.projects_completed && (
                  <div>
                    <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">
                      {stats.projects_completed}+
                    </div>
                    <div className="text-sm text-gray-400 uppercase tracking-wide">Projects</div>
                  </div>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {contact_info.email && (
                  <a
                    href={`mailto:${contact_info.email}`}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 text-center"
                  >
                    Get In Touch
                  </a>
                )}
                <button className="px-8 py-4 border-2 border-purple-400 text-purple-400 font-bold rounded-lg hover:bg-purple-400 hover:text-white transition-all text-center">
                  View Work
                </button>
              </div>
            </div>
          </div>

          {/* Image Side */}
          <div className="relative overflow-hidden">
            {images.hero ? (
              <TemplateHeroImage
                src={images.hero.file_path}
                alt={images.hero.alt_text || `${user.full_name} hero image`}
                className="h-full"
                overlay={true}
                overlayOpacity={0.2}
              />
            ) : images.profile ? (
              <TemplateHeroImage
                src={images.profile.file_path}
                alt={images.profile.alt_text || `${user.full_name} profile photo`}
                className="h-full"
                overlay={true}
                overlayOpacity={0.2}
              />
            ) : (
              <div className="h-full bg-gradient-to-br from-purple-800 to-pink-800 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl mb-4">🎭</div>
                  <p className="text-xl text-purple-200">Portfolio Image</p>
                </div>
              </div>
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-purple-900/30 to-purple-900/70" />
            
            {/* Floating Elements */}
            <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 opacity-20 animate-pulse" />
            <div className="absolute bottom-20 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-20 animate-pulse delay-1000" />
          </div>
        </div>
      </TemplateSectionWrapper>

      {/* Showcase Section */}
      <TemplateSectionWrapper
        sectionId="showcase"
        isEditing={isEditing}
        onSectionClick={onSectionClick}
        className="py-20 bg-gray-800"
      >
        <BaseTemplateLayout maxWidth="xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Featured Work
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Showcasing recent projects and collaborations that define my creative journey
            </p>
          </div>

          {images.gallery && images.gallery.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {images.gallery.slice(0, 6).map((image, index) => (
                <div
                  key={image.id}
                  className="group relative overflow-hidden rounded-2xl bg-gray-700 aspect-[4/5] hover:transform hover:scale-105 transition-all duration-300"
                >
                  <img
                    src={image.file_path}
                    alt={image.alt_text || 'Portfolio work'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Portfolio Image {index + 1}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </BaseTemplateLayout>
      </TemplateSectionWrapper>

      {/* Skills Section */}
      {portfolio.skills && portfolio.skills.length > 0 && (
        <TemplateSectionWrapper
          sectionId="skills"
          isEditing={isEditing}
          onSectionClick={onSectionClick}
          className="py-20 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900"
        >
          <BaseTemplateLayout maxWidth="xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Skills & Expertise
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {portfolio.skills.map((skill, index) => (
                <div
                  key={index}
                  className="group p-6 bg-gray-800 rounded-xl hover:bg-gradient-to-br hover:from-purple-900 hover:to-pink-900 transition-all duration-300 text-center"
                >
                  <div className="text-2xl mb-3">⭐</div>
                  <p className="font-semibold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-pink-300 group-hover:bg-clip-text transition-all duration-300">
                    {skill}
                  </p>
                </div>
              ))}
            </div>
          </BaseTemplateLayout>
        </TemplateSectionWrapper>
      )}

      {/* Portfolio Grid */}
      {images.gallery && images.gallery.length > 6 && (
        <TemplateSectionWrapper
          sectionId="portfolio"
          isEditing={isEditing}
          onSectionClick={onSectionClick}
          className="py-20 bg-black"
        >
          <BaseTemplateLayout maxWidth="xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
                Complete Portfolio
              </h2>
            </div>

            <TemplateGalleryGrid
              images={images.gallery.map(img => ({
                id: img.id,
                src: img.file_path,
                alt: img.alt_text || 'Portfolio image'
              }))}
              columns={4}
              gap="lg"
              className="[&_.template-gallery-item]:rounded-xl [&_.template-gallery-item]:bg-gray-800"
            />
          </BaseTemplateLayout>
        </TemplateSectionWrapper>
      )}

      {/* Contact Section */}
      <TemplateSectionWrapper
        sectionId="contact"
        isEditing={isEditing}
        onSectionClick={onSectionClick}
        className="py-20 bg-gradient-to-br from-purple-900 via-gray-900 to-black"
      >
        <BaseTemplateLayout maxWidth="lg">
          <div className="text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-8">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Let's Create Together
              </span>
            </h2>

            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Ready to bring bold visions to life? I&apos;m available for exciting new projects, 
              collaborations, and creative challenges that push boundaries.
            </p>

            {/* Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {contact_info.email && (
                <a
                  href={`mailto:${contact_info.email}`}
                  className="group p-8 bg-gray-800 rounded-2xl hover:bg-gradient-to-br hover:from-purple-900 hover:to-pink-900 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="text-4xl mb-4">📧</div>
                  <h3 className="text-xl font-bold mb-2 text-white">Email Me</h3>
                  <p className="text-gray-300 group-hover:text-purple-200">{contact_info.email}</p>
                </a>
              )}

              {contact_info.agent && (
                <div className="p-8 bg-gray-800 rounded-2xl">
                  <div className="text-4xl mb-4">🤝</div>
                  <h3 className="text-xl font-bold mb-2 text-white">Representation</h3>
                  <p className="text-gray-300 mb-1">{contact_info.agent.name}</p>
                  <a
                    href={`mailto:${contact_info.agent.email}`}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    {contact_info.agent.email}
                  </a>
                </div>
              )}
            </div>

            {/* Social Links */}
            {Object.keys(social_links).length > 0 && (
              <div>
                <p className="text-gray-400 mb-6 text-lg">Connect & Follow</p>
                <TemplateSocialLinks
                  links={social_links}
                  variant="buttons"
                  className="flex flex-wrap gap-4 justify-center"
                />
              </div>
            )}
          </div>
        </BaseTemplateLayout>
      </TemplateSectionWrapper>
    </div>
  );
}