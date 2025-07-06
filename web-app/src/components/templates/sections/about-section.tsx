'use client';

import { ResponsiveImage } from '@/components/ui/responsive-image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Award } from 'lucide-react';
import type { Portfolio, User } from '@/types';

interface AboutSectionProps {
  portfolio: Portfolio;
  user: User;
  isEditing?: boolean;
  className?: string;
}

export function AboutSection({ portfolio, user, isEditing = false, className = '' }: AboutSectionProps) {
  const profileImages = portfolio.images?.filter(img => img.imageType === 'PROFILE') || [];
  const galleryImages = portfolio.images?.filter(img => img.imageType === 'GALLERY').slice(0, 3) || [];

  return (
    <section className={`py-16 lg:py-24 bg-white ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                About {user.firstName}
              </h2>
              
              {portfolio.bio && (
                <div className="prose prose-lg text-gray-700 max-w-none">
                  {portfolio.bio.split('\n').map((paragraph, index) => (
                    paragraph.trim() && (
                      <p key={index} className="mb-4 leading-relaxed">
                        {paragraph}
                      </p>
                    )
                  ))}
                </div>
              )}
            </div>

            {/* Key Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {user.location && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium text-gray-900">{user.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {user.dateOfBirth && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Age</p>
                        <p className="font-medium text-gray-900">
                          {new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {portfolio.experience && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Experience</p>
                        <p className="font-medium text-gray-900">{portfolio.experience}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {user.gender && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-pink-600 rounded-full"></div>
                      <div>
                        <p className="text-sm text-gray-600">Gender</p>
                        <p className="font-medium text-gray-900 capitalize">{user.gender.toLowerCase()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Specialties */}
            {portfolio.specialties && portfolio.specialties.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {portfolio.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {portfolio.skills && portfolio.skills.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Skills</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {portfolio.skills.map((skill, index) => (
                    <div key={index} className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Images */}
          <div className="space-y-6">
            {/* Main Profile Image */}
            {profileImages.length > 0 && (
              <div className="relative">
                <div className="aspect-[4/5] rounded-lg overflow-hidden shadow-lg">
                  <ResponsiveImage
                    src={profileImages[0].fileName}
                    alt={`${user.firstName} ${user.lastName} - About`}
                    bucketName="portfolio-images"
                    imageType="PROFILE"
                    width={500}
                    height={625}
                    className="w-full h-full object-cover"
                    enableProgressive={true}
                    showLoadingState={true}
                  />
                </div>
              </div>
            )}

            {/* Gallery Preview */}
            {galleryImages.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Work</h3>
                <div className="grid grid-cols-3 gap-2">
                  {galleryImages.map((image, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden">
                      <ResponsiveImage
                        src={image.fileName}
                        alt={`Gallery ${index + 1}`}
                        bucketName="portfolio-images"
                        imageType="GALLERY"
                        width={200}
                        height={200}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        enableProgressive={true}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Placeholder for editing */}
            {isEditing && profileImages.length === 0 && (
              <div className="aspect-[4/5] rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p className="text-sm">Add profile photos</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}