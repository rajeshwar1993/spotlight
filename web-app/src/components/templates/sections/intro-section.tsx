'use client';

import { ResponsiveImage } from '@/components/ui/responsive-image';
import { Badge } from '@/components/ui/badge';
import { Quote } from 'lucide-react';
import type { Portfolio, User } from '@/types';

interface IntroSectionProps {
  portfolio: Portfolio;
  user: User;
  isEditing?: boolean;
  className?: string;
}

export function IntroSection({ portfolio, user, isEditing = false, className = '' }: IntroSectionProps) {
  const profileImage = portfolio.images?.find(img => img.imageType === 'PROFILE');

  return (
    <section className={`py-16 lg:py-24 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-light text-gray-900 mb-4">
              Introduction
            </h2>
            <div className="w-24 h-px bg-gray-300 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            {/* Profile Image */}
            <div className="lg:col-span-1 flex justify-center lg:justify-start">
              {profileImage ? (
                <div className="relative">
                  <div className="w-64 h-64 rounded-full overflow-hidden shadow-lg">
                    <ResponsiveImage
                      src={profileImage.fileName}
                      alt={`${user.firstName} ${user.lastName} - Introduction`}
                      bucketName="portfolio-images"
                      imageType="PROFILE"
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                      enableProgressive={true}
                      showLoadingState={true}
                    />
                  </div>
                  {/* Decorative ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-gray-200 scale-105"></div>
                </div>
              ) : (
                <div className="w-64 h-64 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-lg">
                  <div className="text-center text-gray-500">
                    <div className="w-16 h-16 mx-auto mb-2 bg-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-white">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </span>
                    </div>
                    {isEditing && <p className="text-xs">Add Photo</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quote Icon and Bio */}
              <div className="relative">
                <Quote className="w-8 h-8 text-gray-300 mb-4" />
                {portfolio.bio && (
                  <blockquote className="text-lg sm:text-xl text-gray-700 leading-relaxed italic font-light">
                    {portfolio.bio}
                  </blockquote>
                )}
                <div className="mt-4">
                  <cite className="text-base text-gray-600 not-italic">
                    — {user.firstName} {user.lastName}
                    {portfolio.title && (
                      <span className="block text-sm text-gray-500 mt-1">{portfolio.title}</span>
                    )}
                  </cite>
                </div>
              </div>

              {/* Key Details */}
              <div className="space-y-4">
                {user.location && (
                  <div className="flex items-start gap-4">
                    <span className="text-sm font-medium text-gray-900 w-20 flex-shrink-0">Location:</span>
                    <span className="text-sm text-gray-700">{user.location}</span>
                  </div>
                )}
                
                {portfolio.experience && (
                  <div className="flex items-start gap-4">
                    <span className="text-sm font-medium text-gray-900 w-20 flex-shrink-0">Experience:</span>
                    <span className="text-sm text-gray-700">{portfolio.experience}</span>
                  </div>
                )}

                {user.gender && (
                  <div className="flex items-start gap-4">
                    <span className="text-sm font-medium text-gray-900 w-20 flex-shrink-0">Gender:</span>
                    <span className="text-sm text-gray-700 capitalize">{user.gender.toLowerCase()}</span>
                  </div>
                )}

                {user.dateOfBirth && (
                  <div className="flex items-start gap-4">
                    <span className="text-sm font-medium text-gray-900 w-20 flex-shrink-0">Age:</span>
                    <span className="text-sm text-gray-700">
                      {new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear()}
                    </span>
                  </div>
                )}
              </div>

              {/* Specialties */}
              {portfolio.specialties && portfolio.specialties.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Specializing in:</h3>
                  <div className="flex flex-wrap gap-2">
                    {portfolio.specialties.map((specialty, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}