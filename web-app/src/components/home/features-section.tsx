'use client';

import { useState, useEffect, useRef } from 'react';
// import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Zap, 
  Palette, 
  Smartphone, 
  BarChart3, 
  Shield, 
  // Rocket,
  CheckCircle,
  Globe,
  // Users,
  Star
} from 'lucide-react';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  benefits: string[];
  color: string;
  image?: string;
}

const features: Feature[] = [
  {
    id: 'lightning-fast',
    title: 'Lightning Fast Creation',
    description: 'Build your professional portfolio in under 5 minutes with our intuitive interface and smart automation.',
    icon: <Zap className="w-6 h-6" />,
    benefits: [
      'Pre-built professional templates',
      'Smart content suggestions',
      'One-click publishing',
      'Instant preview updates'
    ],
    color: 'from-yellow-500 to-orange-500',
    image: '/images/features/fast-creation.jpg'
  },
  {
    id: 'beautiful-templates',
    title: 'Beautiful Templates',
    description: 'Choose from professionally designed templates created specifically for actors, models, and creative professionals.',
    icon: <Palette className="w-6 h-6" />,
    benefits: [
      '4 unique professional designs',
      'Industry-specific layouts',
      'Customizable colors and fonts',
      'Mobile-responsive design'
    ],
    color: 'from-purple-500 to-pink-500',
    image: '/images/features/templates.jpg'
  },
  {
    id: 'mobile-optimized',
    title: 'Mobile Optimized',
    description: 'Your portfolio looks perfect on every device. Casting directors can view your work anywhere, anytime.',
    icon: <Smartphone className="w-6 h-6" />,
    benefits: [
      'Responsive design',
      'Touch-friendly interface',
      'Fast mobile loading',
      'Offline viewing capability'
    ],
    color: 'from-blue-500 to-cyan-500',
    image: '/images/features/mobile.jpg'
  },
  {
    id: 'powerful-analytics',
    title: 'Powerful Analytics',
    description: 'Track who visits your portfolio, which sections they spend time on, and optimize for better results.',
    icon: <BarChart3 className="w-6 h-6" />,
    benefits: [
      'Real-time view tracking',
      'Visitor demographics',
      'Content performance insights',
      'Export analytics reports'
    ],
    color: 'from-green-500 to-emerald-500',
    image: '/images/features/analytics.jpg'
  },
  {
    id: 'secure-reliable',
    title: 'Secure & Reliable',
    description: 'Your portfolio is hosted on enterprise-grade infrastructure with 99.9% uptime guarantee.',
    icon: <Shield className="w-6 h-6" />,
    benefits: [
      '99.9% uptime guarantee',
      'SSL encryption',
      'Regular backups',
      'DDoS protection'
    ],
    color: 'from-red-500 to-rose-500',
    image: '/images/features/security.jpg'
  },
  {
    id: 'seo-optimized',
    title: 'SEO Optimized',
    description: 'Get discovered by casting directors and agents with built-in SEO optimization and social sharing.',
    icon: <Globe className="w-6 h-6" />,
    benefits: [
      'Search engine optimization',
      'Social media integration',
      'Custom URL creation',
      'Meta tags optimization'
    ],
    color: 'from-indigo-500 to-purple-500',
    image: '/images/features/seo.jpg'
  }
];

interface FeaturesSectionProps {
  className?: string;
}

export function FeaturesSection({ className = '' }: FeaturesSectionProps) {
  const [visibleFeatures, setVisibleFeatures] = useState<Set<string>>(new Set());
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const featureId = entry.target.getAttribute('data-feature-id');
            if (featureId) {
              setVisibleFeatures(prev => new Set([...prev, featureId]));
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    const featureElements = document.querySelectorAll('[data-feature-id]');
    featureElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={`py-20 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-purple-100 text-purple-800">
            Why Choose Spotlight
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to Succeed
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional portfolio creation made simple. Focus on your craft while we handle the technology.
          </p>
        </div>

        {/* Features Grid */}
        <div className="space-y-24">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              data-feature-id={feature.id}
              className={`grid lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
              }`}
            >
              {/* Content */}
              <div 
                className={`${
                  index % 2 === 1 ? 'lg:col-start-2' : ''
                } transition-all duration-700 ${
                  visibleFeatures.has(feature.id) 
                    ? 'opacity-100 translate-x-0' 
                    : `opacity-0 ${index % 2 === 0 ? '-translate-x-8' : 'translate-x-8'}`
                }`}
              >
                <div className="mb-6">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-4`}>
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  
                  <p className="text-lg text-gray-600 mb-6">
                    {feature.description}
                  </p>
                </div>

                <div className="space-y-3">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <div 
                      key={benefitIndex}
                      className={`flex items-center gap-3 transition-all duration-300 delay-${benefitIndex * 100} ${
                        visibleFeatures.has(feature.id) 
                          ? 'opacity-100 translate-x-0' 
                          : 'opacity-0 translate-x-4'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center flex-shrink-0`}>
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-gray-700 font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual */}
              <div 
                className={`${
                  index % 2 === 1 ? 'lg:col-start-1' : ''
                } transition-all duration-700 delay-200 ${
                  visibleFeatures.has(feature.id) 
                    ? 'opacity-100 translate-x-0' 
                    : `opacity-0 ${index % 2 === 0 ? 'translate-x-8' : '-translate-x-8'}`
                }`}
              >
                <Card className="overflow-hidden border-0 shadow-2xl">
                  <CardContent className="p-0">
                    <div className="relative">
                      {/* Placeholder for feature image */}
                      <div className={`aspect-[4/3] bg-gradient-to-br ${feature.color} flex items-center justify-center relative overflow-hidden`}>
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute inset-0 bg-[url('/images/pattern.svg')] bg-repeat" />
                        </div>
                        
                        {/* Feature Icon */}
                        <div className="relative z-10 w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <div className="w-12 h-12 text-white">
                            {feature.icon}
                          </div>
                        </div>
                        
                        {/* Corner Badge */}
                        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                          <div className="flex items-center gap-1 text-white text-sm font-medium">
                            <Star className="w-3 h-3" />
                            Featured
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-24 bg-white rounded-2xl p-8 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">99.9%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">&lt;5min</div>
              <div className="text-sm text-gray-600">Setup Time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">10K+</div>
              <div className="text-sm text-gray-600">Happy Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">4.9★</div>
              <div className="text-sm text-gray-600">User Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}