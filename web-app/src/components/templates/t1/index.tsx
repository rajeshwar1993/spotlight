'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { TemplateProps } from '@/lib/templates/types';
import {
  BaseTemplateLayout,
  TemplateSectionWrapper,
  TemplateProfileImage,
  TemplateGalleryGrid,
  TemplateSkillsList,
  TemplateSocialLinks
} from '../base-template';

// T1 - Classic Professional Template
export default function T1Template({
  data,
  isPreview = false,
  isEditing = false,
  className,
  onSectionClick
}: TemplateProps) {
  const { user, portfolio, images, social_links, contact_info, stats } = data;

  return (
    <div className={cn('template-t1 bg-white text-gray-900', className)}>
      {/* Hero Section */}
      <TemplateSectionWrapper
        sectionId="hero"
        isEditing={isEditing}
        onSectionClick={onSectionClick}
        className="bg-gradient-to-b from-gray-50 to-white"
      >
        <BaseTemplateLayout maxWidth="lg" padding="xl">
          <div className="text-center">
            {/* Profile Image */}
            <div className="mb-8">
              {images.profile ? (
                <TemplateProfileImage
                  src={images.profile.file_path}
                  alt={images.profile.alt_text || `${user.full_name} profile photo`}
                  size="xl"
                  className="mx-auto border-4 border-white shadow-xl"
                />
              ) : (
                <div className="w-48 h-48 mx-auto rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-lg">No Photo</span>
                </div>
              )}
            </div>

            {/* Name and Title */}
            <div className="mb-8">
              <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-4 tracking-tight">
                {user.full_name}
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 font-light mb-2">
                {user.profession === 'ACTOR' ? 'Actor' :
                 user.profession === 'MODEL' ? 'Model' :
                 user.profession === 'BOTH' ? 'Actor & Model' : 'Professional'}
              </p>
              {user.location && (
                <p className="text-lg text-gray-500">{user.location}</p>
              )}
            </div>

            {/* Brief Introduction */}
            {portfolio.bio && (
              <div className="max-w-2xl mx-auto mb-8">
                <p className="text-lg leading-relaxed text-gray-700">
                  {portfolio.bio}
                </p>
              </div>
            )}

            {/* Contact CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {contact_info.email && (
                <a
                  href={`mailto:${contact_info.email}`}
                  className="inline-flex items-center justify-center px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Contact for Work
                </a>
              )}
              {social_links.website && (
                <a
                  href={social_links.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-3 border-2 border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-900 hover:text-white transition-colors"
                >
                  View Portfolio
                </a>
              )}
            </div>
          </div>
        </BaseTemplateLayout>
      </TemplateSectionWrapper>

      {/* About Section */}
      <TemplateSectionWrapper
        sectionId="about"
        isEditing={isEditing}
        onSectionClick={onSectionClick}
        className="py-20 bg-white"
      >
        <BaseTemplateLayout maxWidth="lg">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Bio */}
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6">About</h2>
              {user.bio && (
                <div className="prose prose-lg text-gray-700 leading-relaxed">
                  <p>{user.bio}</p>
                </div>
              )}
              
              {/* Experience */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Experience</h3>
                <div className="flex items-center space-x-6 text-gray-600">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">{stats.experience_years}</span>
                    <span className="text-sm ml-1">Years Experience</span>
                  </div>
                  {stats.projects_completed && (
                    <div>
                      <span className="text-2xl font-bold text-gray-900">{stats.projects_completed}</span>
                      <span className="text-sm ml-1">Projects</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Details Sidebar */}
            <div className="space-y-8">
              {/* Physical Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
                <div className="space-y-3 text-sm">
                  {portfolio.height && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Height:</span>
                      <span className="font-medium">{portfolio.height}</span>
                    </div>
                  )}
                  {portfolio.eye_color && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Eyes:</span>
                      <span className="font-medium">{portfolio.eye_color}</span>
                    </div>
                  )}
                  {portfolio.hair_color && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hair:</span>
                      <span className="font-medium">{portfolio.hair_color}</span>
                    </div>
                  )}
                  {user.date_of_birth && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-medium">
                        {new Date().getFullYear() - new Date(user.date_of_birth).getFullYear()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
                <div className="space-y-2 text-sm">
                  {contact_info.email && (
                    <a
                      href={`mailto:${contact_info.email}`}
                      className="block text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {contact_info.email}
                    </a>
                  )}
                  {contact_info.phone && (
                    <a
                      href={`tel:${contact_info.phone}`}
                      className="block text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {contact_info.phone}
                    </a>
                  )}
                  {contact_info.agent && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="font-medium text-gray-900 mb-1">Agent</p>
                      <p className="text-gray-600">{contact_info.agent.name}</p>
                      <a
                        href={`mailto:${contact_info.agent.email}`}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        {contact_info.agent.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </BaseTemplateLayout>
      </TemplateSectionWrapper>

      {/* Skills Section */}
      {portfolio.skills && portfolio.skills.length > 0 && (
        <TemplateSectionWrapper
          sectionId="experience"
          isEditing={isEditing}
          onSectionClick={onSectionClick}
          className="py-20 bg-gray-50"
        >
          <BaseTemplateLayout maxWidth="lg">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Skills & Expertise</h2>
              <p className="text-lg text-gray-600">Professional capabilities and specializations</p>
            </div>
            
            <TemplateSkillsList
              skills={portfolio.skills}
              variant="tags"
              className="justify-center"
            />
          </BaseTemplateLayout>
        </TemplateSectionWrapper>
      )}

      {/* Gallery Section */}
      {images.gallery && images.gallery.length > 0 && (
        <TemplateSectionWrapper
          sectionId="gallery"
          isEditing={isEditing}
          onSectionClick={onSectionClick}
          className="py-20 bg-white"
        >
          <BaseTemplateLayout maxWidth="lg">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Portfolio</h2>
              <p className="text-lg text-gray-600">Recent work and professional photography</p>
            </div>
            
            <TemplateGalleryGrid
              images={images.gallery.map(img => ({
                id: img.id,
                src: img.file_path,
                alt: img.alt_text || 'Portfolio image'
              }))}
              columns={3}
              gap="md"
            />
          </BaseTemplateLayout>
        </TemplateSectionWrapper>
      )}

      {/* Contact Section */}
      <TemplateSectionWrapper
        sectionId="contact"
        isEditing={isEditing}
        onSectionClick={onSectionClick}
        className="py-20 bg-gray-900 text-white"
      >
        <BaseTemplateLayout maxWidth="lg">
          <div className="text-center">
            <h2 className="text-3xl font-serif font-bold mb-8">Let's Work Together</h2>
            
            <div className="max-w-2xl mx-auto mb-8">
              <p className="text-lg text-gray-300 leading-relaxed">
                Ready to bring your vision to life? I'm available for new projects and collaborations.
                {contact_info.agent ? ' Please contact my representation for bookings and inquiries.' : ' Let\'s discuss your next project.'}
              </p>
            </div>

            {/* Contact Methods */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              {contact_info.email && (
                <a
                  href={`mailto:${contact_info.email}`}
                  className="flex items-center space-x-3 text-white hover:text-gray-300 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span>{contact_info.email}</span>
                </a>
              )}
              
              {contact_info.phone && (
                <a
                  href={`tel:${contact_info.phone}`}
                  className="flex items-center space-x-3 text-white hover:text-gray-300 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span>{contact_info.phone}</span>
                </a>
              )}
            </div>

            {/* Social Links */}
            {Object.keys(social_links).length > 0 && (
              <div>
                <p className="text-gray-400 mb-4">Follow my work</p>
                <TemplateSocialLinks
                  links={social_links}
                  variant="icons"
                  className="justify-center text-gray-300 hover:text-white"
                />
              </div>
            )}
          </div>
        </BaseTemplateLayout>
      </TemplateSectionWrapper>
    </div>
  );
}