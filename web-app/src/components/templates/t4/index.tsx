'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { TemplateProps } from '@/lib/templates/types';
import {
  BaseTemplateLayout,
  TemplateSectionWrapper,
  TemplateProfileImage
} from '../base-template';

// T4 - Creative Artistic Template
export default function T4Template({
  data,
  isPreview,
  isEditing = false,
  className,
  onSectionClick
}: TemplateProps) {
  const { user, portfolio, images, social_links, contact_info, stats } = data;

  return (
    <div className={cn('template-t4 bg-gray-900 text-white overflow-hidden', className)}>
      {/* Hero Section */}
      <TemplateSectionWrapper
        sectionId="hero"
        isEditing={isEditing}
        onSectionClick={onSectionClick}
        className="min-h-screen relative"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-20 blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 opacity-20 blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 opacity-10 blur-3xl animate-pulse delay-2000" />
        </div>

        <BaseTemplateLayout maxWidth="xl" padding="xl">
          <div className="relative z-10 min-h-screen flex items-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
              {/* Content */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="text-sm uppercase tracking-widest text-purple-400 font-bold">
                    Creative Professional
                  </div>
                  
                  <h1 className="text-6xl lg:text-8xl font-bold leading-none">
                    <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                      {user.full_name?.split(' ')[0]}
                    </span>
                    <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {user.full_name?.split(' ').slice(1).join(' ')}
                    </span>
                  </h1>

                  <div className="flex items-center space-x-4 text-xl">
                    <div className="w-12 h-px bg-gradient-to-r from-purple-400 to-pink-400" />
                    <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent font-medium">
                      {user.profession === 'ACTOR' ? 'Actor & Performer' :
                       user.profession === 'MODEL' ? 'Model & Creative' :
                       user.profession === 'BOTH' ? 'Actor • Model • Artist' : 'Creative Artist'}
                    </span>
                  </div>
                </div>

                {portfolio.bio && (
                  <p className="text-lg lg:text-xl text-gray-300 leading-relaxed max-w-lg">
                    {portfolio.bio}
                  </p>
                )}

                {/* Creative Stats */}
                <div className="grid grid-cols-3 gap-8 py-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {stats.experience_years}+
                    </div>
                    <div className="text-xs uppercase tracking-wider text-gray-500">Years Creating</div>
                  </div>
                  {stats.projects_completed && (
                    <div className="text-center">
                      <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        {stats.projects_completed}+
                      </div>
                      <div className="text-xs uppercase tracking-wider text-gray-500">Projects</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      ∞
                    </div>
                    <div className="text-xs uppercase tracking-wider text-gray-500">Inspiration</div>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {contact_info.email && (
                    <a
                      href={`mailto:${contact_info.email}`}
                      className="px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-bold rounded-2xl hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 transition-all transform hover:scale-105 text-center shadow-xl"
                    >
                      Start a Project
                    </a>
                  )}
                  <button className="px-8 py-4 border-2 border-purple-400 text-purple-400 font-bold rounded-2xl hover:bg-purple-400 hover:text-gray-900 transition-all text-center">
                    Explore Work
                  </button>
                </div>
              </div>

              {/* Creative Profile Display */}
              <div className="relative">
                {images.profile ? (
                  <div className="relative">
                    {/* Main Profile Image */}
                    <div className="relative w-80 h-80 lg:w-96 lg:h-96 mx-auto">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-3xl transform rotate-6" />
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl transform -rotate-3" />
                      <div className="relative w-full h-full rounded-3xl overflow-hidden border-4 border-white shadow-2xl">
                        <img
                          src={images.profile.file_path}
                          alt={images.profile.alt_text || `${user.full_name} creative portrait`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    
                    {/* Floating Elements */}
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-80 animate-bounce delay-300" />
                    <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full opacity-60 animate-pulse" />
                  </div>
                ) : (
                  <div className="w-80 h-80 lg:w-96 lg:h-96 mx-auto bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-3xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎨</div>
                      <p className="text-xl font-bold">Creative Portrait</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </BaseTemplateLayout>
      </TemplateSectionWrapper>

      {/* Creative Introduction */}
      <TemplateSectionWrapper
        sectionId="creative_intro"
        isEditing={isEditing}
        onSectionClick={onSectionClick}
        className="py-32 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900"
      >
        <BaseTemplateLayout maxWidth="xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
                    Creative
                  </span>
                  <br />
                  <span className="text-white">Philosophy</span>
                </h2>
              </div>

              {user.bio && (
                <div className="space-y-6 text-gray-300 leading-relaxed">
                  <p className="text-lg">{user.bio}</p>
                </div>
              )}

              {/* Artistic Statement */}
              <div className="p-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl border border-purple-500/30">
                <h3 className="text-xl font-bold text-white mb-3">Artistic Vision</h3>
                <p className="text-gray-300">
                  &quot;Every project is an opportunity to push creative boundaries and tell stories that resonate on a deeper level. 
                  I believe in the power of authentic expression and collaborative artistry.&quot;
                </p>
              </div>

              {/* Location */}
              {user.location && (
                <div className="flex items-center space-x-3 text-gray-400">
                  <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-lg">{user.location}</span>
                </div>
              )}
            </div>

            {/* Creative Visual Element */}
            <div className="relative">
              {images.hero || images.gallery?.[0] ? (
                <div className="relative">
                  <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 p-2">
                    <img
                      src={(images.hero || images.gallery?.[0])?.file_path}
                      alt="Creative work showcase"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  </div>
                  {/* Overlay Graphics */}
                  <div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl transform rotate-12 animate-pulse" />
                  <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-2xl transform -rotate-12 animate-pulse delay-1000" />
                </div>
              ) : (
                <div className="aspect-square bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-3xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">✨</div>
                    <p className="text-xl font-bold">Creative Vision</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </BaseTemplateLayout>
      </TemplateSectionWrapper>

      {/* Portfolio Grid */}
      {images.gallery && images.gallery.length > 0 && (
        <TemplateSectionWrapper
          sectionId="portfolio_grid"
          isEditing={isEditing}
          onSectionClick={onSectionClick}
          className="py-32 bg-black"
        >
          <BaseTemplateLayout maxWidth="xl">
            <div className="text-center mb-20">
              <h2 className="text-4xl lg:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Creative Portfolio
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                A curated collection of artistic collaborations and creative expressions
              </p>
            </div>

            {/* Creative Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {images.gallery.map((image, index) => (
                <div
                  key={image.id}
                  className={cn(
                    "group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 to-pink-900 p-1",
                    // Varying aspect ratios for creative layout
                    index % 4 === 0 ? "md:col-span-2 aspect-[3/2]" : 
                    index % 4 === 1 ? "aspect-[3/4]" :
                    index % 4 === 2 ? "aspect-square" :
                    "aspect-[4/3]"
                  )}
                >
                  <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-800">
                    <img
                      src={image.file_path}
                      alt={image.alt_text || `Creative work ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-6 left-6 right-6">
                        <p className="text-white font-bold text-lg mb-2">
                          Creative Work {index + 1}
                        </p>
                        <p className="text-gray-300 text-sm">
                          {image.alt_text || 'Artistic collaboration and creative expression'}
                        </p>
                      </div>
                    </div>

                    {/* Creative Corner Element */}
                    <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-80" />
                  </div>
                </div>
              ))}
            </div>
          </BaseTemplateLayout>
        </TemplateSectionWrapper>
      )}

      {/* Artistic About */}
      <TemplateSectionWrapper
        sectionId="artistic_about"
        isEditing={isEditing}
        onSectionClick={onSectionClick}
        className="py-32 bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900"
      >
        <BaseTemplateLayout maxWidth="lg">
          <div className="text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-16">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Artistic Journey
              </span>
            </h2>

            {/* Skills as Creative Elements */}
            {portfolio.skills && portfolio.skills.length > 0 && (
              <div className="mb-16">
                <h3 className="text-2xl font-bold text-white mb-8">Creative Disciplines</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {portfolio.skills.map((skill, index) => (
                    <div
                      key={index}
                      className="group px-6 py-3 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl border border-purple-500/30 hover:from-purple-800/70 hover:to-pink-800/70 transition-all duration-300"
                    >
                      <span className="text-white font-medium group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-pink-300 group-hover:bg-clip-text transition-all duration-300">
                        {skill}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Creative Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
              <div className="p-8 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-3xl border border-purple-500/30">
                <div className="text-4xl mb-4">🎭</div>
                <div className="text-2xl font-bold text-white mb-2">{stats.experience_years}+ Years</div>
                <p className="text-gray-300">Creative Experience</p>
              </div>
              
              {stats.projects_completed && (
                <div className="p-8 bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-3xl border border-blue-500/30">
                  <div className="text-4xl mb-4">✨</div>
                  <div className="text-2xl font-bold text-white mb-2">{stats.projects_completed}+</div>
                  <p className="text-gray-300">Creative Projects</p>
                </div>
              )}
              
              <div className="p-8 bg-gradient-to-br from-yellow-900/50 to-orange-900/50 rounded-3xl border border-yellow-500/30">
                <div className="text-4xl mb-4">🌟</div>
                <div className="text-2xl font-bold text-white mb-2">∞</div>
                <p className="text-gray-300">Endless Creativity</p>
              </div>
            </div>
          </div>
        </BaseTemplateLayout>
      </TemplateSectionWrapper>

      {/* Creative Contact */}
      <TemplateSectionWrapper
        sectionId="creative_contact"
        isEditing={isEditing}
        onSectionClick={onSectionClick}
        className="py-32 bg-gradient-to-br from-black via-purple-900/20 to-black"
      >
        <BaseTemplateLayout maxWidth="lg">
          <div className="text-center">
            <h2 className="text-4xl lg:text-6xl font-bold mb-8">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                Let&apos;s Create Magic
              </span>
            </h2>

            <p className="text-xl text-gray-300 mb-16 max-w-2xl mx-auto leading-relaxed">
              Ready to embark on a creative journey that pushes boundaries and creates something extraordinary? 
              Let&apos;s collaborate and bring your wildest visions to life.
            </p>

            {/* Creative Contact Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {contact_info.email && (
                <a
                  href={`mailto:${contact_info.email}`}
                  className="group p-8 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-3xl border border-purple-500/30 hover:from-purple-800/50 hover:to-pink-800/50 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="text-5xl mb-4 group-hover:animate-bounce">📧</div>
                  <h3 className="text-xl font-bold mb-2 text-white">Direct Contact</h3>
                  <p className="text-purple-300 group-hover:text-pink-300 transition-colors">
                    {contact_info.email}
                  </p>
                </a>
              )}

              {contact_info.agent ? (
                <div className="p-8 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-3xl border border-blue-500/30">
                  <div className="text-5xl mb-4">🤝</div>
                  <h3 className="text-xl font-bold mb-2 text-white">Creative Representation</h3>
                  <p className="text-blue-300 mb-1">{contact_info.agent.name}</p>
                  <a
                    href={`mailto:${contact_info.agent.email}`}
                    className="text-cyan-300 hover:text-cyan-200 transition-colors"
                  >
                    {contact_info.agent.email}
                  </a>
                </div>
              ) : (
                <div className="p-8 bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded-3xl border border-yellow-500/30">
                  <div className="text-5xl mb-4">💡</div>
                  <h3 className="text-xl font-bold mb-2 text-white">Creative Collaboration</h3>
                  <p className="text-yellow-300">Open to innovative projects and artistic partnerships</p>
                </div>
              )}
            </div>

            {/* Social Links with Creative Styling */}
            {Object.keys(social_links).length > 0 && (
              <div>
                <p className="text-gray-400 mb-8 text-lg">Connect & Follow the Journey</p>
                <div className="flex flex-wrap justify-center gap-6">
                  {Object.entries(social_links).map(([platform, url]) => {
                    if (!url) return null;
                    const icons: Record<string, string> = {
                      instagram: '📸',
                      twitter: '🐦',
                      linkedin: '💼',
                      tiktok: '🎵',
                      website: '🌐'
                    };
                    
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl hover:from-purple-800 hover:to-pink-800 transition-all duration-300 transform hover:scale-105"
                      >
                        <span className="text-2xl group-hover:animate-pulse">
                          {icons[platform] || '🔗'}
                        </span>
                        <span className="text-white font-medium capitalize">
                          {platform}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </BaseTemplateLayout>
      </TemplateSectionWrapper>
    </div>
  );
}