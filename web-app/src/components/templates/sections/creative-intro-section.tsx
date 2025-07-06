'use client';

import { ResponsiveImage } from '@/components/ui/responsive-image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, Sparkles } from 'lucide-react';
import type { Portfolio, User } from '@/types';

interface CreativeIntroSectionProps {
  portfolio: Portfolio;
  user: User;
  isEditing?: boolean;
  className?: string;
}

export function CreativeIntroSection({ portfolio, user, isEditing = false, className = '' }: CreativeIntroSectionProps) {
  const profileImage = portfolio.images?.find(img => img.imageType === 'PROFILE');
  const heroImage = portfolio.images?.find(img => img.imageType === 'HERO');

  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className}`}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {heroImage && (
          <ResponsiveImage
            src={heroImage.fileName}
            alt="Background"
            bucketName="portfolio-images"
            imageType="HERO"
            width={1920}
            height={1080}
            className="w-full h-full object-cover opacity-20 mix-blend-overlay"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Profile Image */}
          {profileImage && (
            <div className="mb-8 flex justify-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl transform group-hover:scale-105 transition-transform duration-300">
                  <ResponsiveImage
                    src={profileImage.fileName}
                    alt={`${user.firstName} ${user.lastName} - Profile`}
                    bucketName="portfolio-images"
                    imageType="PROFILE"
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                    enableProgressive={true}
                  />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              </div>
            </div>
          )}

          {/* Title with Animation */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
              <span className="text-yellow-400 font-medium tracking-wider uppercase text-sm">Creative Artist</span>
              <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4">
              <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                {user.firstName}
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                {user.lastName}
              </span>
            </h1>

            {portfolio.title && (
              <p className="text-2xl sm:text-3xl text-purple-200 font-light">
                {portfolio.title}
              </p>
            )}
          </div>

          {/* Bio */}
          {portfolio.bio && (
            <p className="text-lg sm:text-xl text-gray-200 leading-relaxed max-w-3xl mx-auto mb-8">
              {portfolio.bio}
            </p>
          )}

          {/* Specialties */}
          {portfolio.specialties && portfolio.specialties.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {portfolio.specialties.slice(0, 6).map((specialty, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="bg-white bg-opacity-20 text-white border-white border-opacity-30 px-4 py-2 text-sm backdrop-blur-sm hover:bg-opacity-30 transition-all duration-300"
                >
                  {specialty}
                </Badge>
              ))}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Explore My Work
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white hover:text-purple-900 transition-all duration-300"
            >
              Get In Touch
            </Button>
          </div>

          {/* Scroll Indicator */}
          <div className="flex justify-center">
            <div className="animate-bounce">
              <ArrowDown className="w-6 h-6 text-white opacity-70" />
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