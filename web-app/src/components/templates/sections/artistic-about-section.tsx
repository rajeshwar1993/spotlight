'use client';

import { ResponsiveImage } from '@/components/ui/responsive-image';
import { Badge } from '@/components/ui/badge';
import { Palette, Sparkles, Heart } from 'lucide-react';
import type { Portfolio, User } from '@/types';

interface ArtisticAboutSectionProps {
  portfolio: Portfolio;
  user: User;
  isEditing?: boolean;
  className?: string;
}

export function ArtisticAboutSection({ portfolio, user, isEditing = false, className = '' }: ArtisticAboutSectionProps) {
  const profileImages = portfolio.images?.filter(img => img.imageType === 'PROFILE') || [];
  const galleryImages = portfolio.images?.filter(img => img.imageType === 'GALLERY').slice(0, 4) || [];

  return (
    <section className={`py-16 lg:py-24 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 relative overflow-hidden ${className}`}>
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Palette className="w-8 h-8 text-purple-600" />
              <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                About the Artist
              </h2>
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <div className="w-32 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Content */}
            <div className="space-y-8 order-2 lg:order-1">
              {/* Main Bio */}
              {portfolio.bio && (
                <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white border-opacity-50">
                  <div className="flex items-center gap-3 mb-6">
                    <Heart className="w-6 h-6 text-red-500" />
                    <h3 className="text-2xl font-bold text-gray-900">My Story</h3>
                  </div>
                  <div className="prose prose-lg text-gray-700 max-w-none">
                    {portfolio.bio.split('\n').map((paragraph, index) => (
                      paragraph.trim() && (
                        <p key={index} className="mb-4 leading-relaxed">
                          {paragraph}
                        </p>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Artist Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {user.location && (
                  <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white border-opacity-50">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold text-lg">📍</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Based in</p>
                      <p className="font-semibold text-gray-900">{user.location}</p>
                    </div>
                  </div>
                )}

                {portfolio.experience && (
                  <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white border-opacity-50">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold text-lg">⭐</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Experience</p>
                      <p className="font-semibold text-gray-900">{portfolio.experience}</p>
                    </div>
                  </div>
                )}

                {user.dateOfBirth && (
                  <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white border-opacity-50">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold text-lg">🎂</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Age</p>
                      <p className="font-semibold text-gray-900">
                        {new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear()}
                      </p>
                    </div>
                  </div>
                )}

                {user.gender && (
                  <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white border-opacity-50">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold text-lg">✨</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Gender</p>
                      <p className="font-semibold text-gray-900 capitalize">{user.gender.toLowerCase()}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Specialties */}
              {portfolio.specialties && portfolio.specialties.length > 0 && (
                <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white border-opacity-50">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Creative Specialties
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {portfolio.specialties.map((specialty, index) => (
                      <Badge 
                        key={index} 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 text-sm font-medium border-0 hover:scale-105 transition-transform duration-200"
                      >
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Images */}
            <div className="order-1 lg:order-2 space-y-6">
              {/* Main Profile Image */}
              {profileImages.length > 0 && (
                <div className="relative group">
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
                    <ResponsiveImage
                      src={profileImages[0].fileName}
                      alt={`${user.firstName} ${user.lastName} - Artist Portrait`}
                      bucketName="portfolio-images"
                      imageType="PROFILE"
                      width={500}
                      height={625}
                      className="w-full h-full object-cover"
                      enableProgressive={true}
                      showLoadingState={true}
                    />
                  </div>
                  {/* Decorative border */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
                </div>
              )}

              {/* Gallery Mosaic */}
              {galleryImages.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Featured Work</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {galleryImages.map((image, index) => (
                      <div 
                        key={index} 
                        className={`relative group overflow-hidden rounded-xl shadow-lg ${
                          index === 0 ? 'col-span-2 aspect-video' : 'aspect-square'
                        }`}
                      >
                        <ResponsiveImage
                          src={image.fileName}
                          alt={`Artwork ${index + 1}`}
                          bucketName="portfolio-images"
                          imageType="GALLERY"
                          width={index === 0 ? 400 : 200}
                          height={index === 0 ? 225 : 200}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          enableProgressive={true}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Placeholder for editing */}
              {isEditing && profileImages.length === 0 && (
                <div className="aspect-[4/5] rounded-2xl border-2 border-dashed border-purple-300 bg-white bg-opacity-50 flex items-center justify-center">
                  <div className="text-center text-purple-600">
                    <Palette className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">Add artistic portraits</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles for Animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}