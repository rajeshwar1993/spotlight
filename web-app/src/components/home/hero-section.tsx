'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { ChevronRight, Play, Star, Users, Eye, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className = '' }: HeroSectionProps) {
  const { user } = useAuth();
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const phrases = [
    'Professional Portfolios',
    'Creative Showcases',
    'Career Breakthroughs',
    'Dream Opportunities'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentPhrase((prev) => (prev + 1) % phrases.length);
        setIsVisible(true);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <section className={`relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black ${className}`}>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-5" />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center">
          {/* Badge */}
          <Badge 
            variant="secondary" 
            className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            #1 Portfolio Platform for Creatives
          </Badge>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
            Create Stunning
            <br />
            <span className="relative">
              <span 
                className={`inline-block transition-all duration-300 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
              >
                {phrases[currentPhrase]}
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Build professional portfolios in minutes, not days. Perfect for actors, models, and creative professionals who want to stand out.
          </p>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10">
            <div className="flex items-center gap-2 text-gray-300">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-sm">10,000+ Professionals</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Eye className="w-5 h-5 text-purple-400" />
              <span className="text-sm">5M+ Portfolio Views</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-sm">4.9/5 Rating</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <Link href="/dashboard">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 px-8 py-6 text-lg font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  Go to Dashboard
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/auth/register">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 px-8 py-6 text-lg font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  Create Your Portfolio
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            )}
            
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white/20 text-white hover:bg-white/10 hover:text-white px-8 py-6 text-lg font-semibold backdrop-blur-sm transition-all duration-300"
            >
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </div>

          {/* Quick Start Indicator */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              ⚡ Ready in under 5 minutes • No design skills required
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}