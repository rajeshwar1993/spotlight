'use client';

import { ResponsiveImage } from '@/components/ui/responsive-image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Mail, Phone } from 'lucide-react';
import type { Portfolio, User } from '@/types';

interface HeroSectionProps {
  portfolio: Portfolio;
  user: User;
  isEditing?: boolean;
  className?: string;
}

export function HeroSection({ portfolio, user, isEditing = false, className = '' }: HeroSectionProps) {
  const profileImage = portfolio.images?.find(img => img.imageType === 'PROFILE');
  const heroImage = portfolio.images?.find(img => img.imageType === 'HERO');

  return (
    <section className={`relative bg-gradient-to-br from-gray-50 to-white py-16 lg:py-24 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1">
            <div className="space-y-6">
              {/* Name and Title */}
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  {user.firstName} {user.lastName}
                </h1>
                {portfolio.title && (
                  <p className="text-xl sm:text-2xl text-gray-600 mt-2">
                    {portfolio.title}
                  </p>
                )}
              </div>

              {/* Bio */}
              {portfolio.bio && (
                <p className="text-lg text-gray-700 leading-relaxed max-w-2xl">
                  {portfolio.bio}
                </p>
              )}

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {user.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                {user.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                )}
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>

              {/* Specialties */}
              {portfolio.specialties && portfolio.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {portfolio.specialties.slice(0, 5).map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="bg-black text-white hover:bg-gray-800">
                  View Portfolio
                </Button>
                <Button variant="outline" size="lg">
                  Contact Me
                </Button>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              {profileImage ? (
                <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                  <ResponsiveImage
                    src={profileImage.fileName}
                    alt={`${user.firstName} ${user.lastName} - Profile`}
                    bucketName="portfolio-images"
                    imageType="PROFILE"
                    width={600}
                    height={600}
                    className="w-full h-full object-cover"
                    enableProgressive={true}
                    showLoadingState={true}
                  />
                </div>
              ) : (
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-2xl">
                  <div className="text-center text-gray-500">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </span>
                    </div>
                    {isEditing && <p className="text-sm">Add Profile Photo</p>}
                  </div>
                </div>
              )}
              
              {/* Decorative elements */}
              <div className="absolute -z-10 top-4 right-4 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-70"></div>
              <div className="absolute -z-10 bottom-4 left-4 w-48 h-48 bg-purple-100 rounded-full blur-3xl opacity-70"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Hero Image */}
      {heroImage && (
        <div className="absolute inset-0 -z-20 opacity-5">
          <ResponsiveImage
            src={heroImage.fileName}
            alt="Background"
            bucketName="portfolio-images"
            imageType="HERO"
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </section>
  );
}