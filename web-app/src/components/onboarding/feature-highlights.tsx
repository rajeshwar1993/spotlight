'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Zap, 
  Shield, 
  BarChart3, 
  Palette, 
  Globe,
  ArrowRight,
  ArrowLeft,
  Check,
  Star,
  Eye,
  Users,
  TrendingUp
} from 'lucide-react';

interface FeatureHighlightsProps {
  onComplete: () => void;
  onBack: () => void;
}

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  benefit: string;
  stats?: string;
  highlights: string[];
  preview?: React.ReactNode;
}

const FEATURES: Feature[] = [
  {
    id: 'mobile-first',
    title: 'Mobile-First Design',
    description: 'Your portfolio looks perfect on every device, ensuring casting directors can view it anywhere.',
    icon: <Smartphone className="h-8 w-8" />,
    benefit: 'Reach casting directors on any device',
    stats: '70% of portfolio views are on mobile',
    highlights: [
      'Responsive design that adapts to any screen',
      'Touch-friendly navigation',
      'Fast loading on mobile networks',
      'Optimized images for all devices'
    ],
    preview: (
      <div className="flex space-x-2">
        <div className="w-6 h-10 bg-gray-300 rounded-sm" />
        <div className="w-8 h-10 bg-gray-200 rounded-sm" />
        <div className="w-12 h-8 bg-gray-100 rounded-sm" />
      </div>
    )
  },
  {
    id: 'lightning-fast',
    title: 'Lightning Fast Performance',
    description: 'Sub-2 second load times with 90+ Lighthouse scores mean better search rankings and user experience.',
    icon: <Zap className="h-8 w-8" />,
    benefit: 'Better search rankings and user experience',
    stats: 'Average load time: 1.2 seconds',
    highlights: [
      '90+ Lighthouse performance scores',
      'Advanced image optimization',
      'CDN delivery worldwide',
      'Optimized for Core Web Vitals'
    ],
    preview: (
      <div className="flex items-center space-x-2">
        <div className="w-16 h-2 bg-green-500 rounded-full" />
        <span className="text-xs text-green-600 font-medium">Fast</span>
      </div>
    )
  },
  {
    id: 'analytics',
    title: 'Professional Analytics',
    description: 'Track who views your portfolio, which photos perform best, and optimize for more bookings.',
    icon: <BarChart3 className="h-8 w-8" />,
    benefit: 'Data-driven optimization for more bookings',
    stats: '3x more bookings with analytics insights',
    highlights: [
      'View count and visitor tracking',
      'Photo performance metrics',
      'Traffic source analysis',
      'Booking conversion tracking'
    ],
    preview: (
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-blue-500 rounded" />
          <span className="text-xs">1,234 views</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-1 bg-green-500 rounded" />
          <span className="text-xs">89% engagement</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-1 bg-purple-500 rounded" />
          <span className="text-xs">23 bookings</span>
        </div>
      </div>
    )
  },
  {
    id: 'customization',
    title: 'Full Customization',
    description: 'Personalize every aspect of your portfolio with our advanced customization tools.',
    icon: <Palette className="h-8 w-8" />,
    benefit: 'Stand out with your unique brand',
    stats: 'Unlimited design possibilities',
    highlights: [
      'Custom color schemes',
      'Font selection and typography',
      'Layout customization options',
      'Advanced CSS for pro users'
    ],
    preview: (
      <div className="grid grid-cols-3 gap-1">
        <div className="w-4 h-4 bg-red-500 rounded-full" />
        <div className="w-4 h-4 bg-blue-500 rounded-full" />
        <div className="w-4 h-4 bg-green-500 rounded-full" />
        <div className="w-4 h-4 bg-purple-500 rounded-full" />
        <div className="w-4 h-4 bg-yellow-500 rounded-full" />
        <div className="w-4 h-4 bg-pink-500 rounded-full" />
      </div>
    )
  },
  {
    id: 'seo-optimized',
    title: 'SEO Optimized',
    description: 'Built-in SEO features help casting directors find you through search engines.',
    icon: <Globe className="h-8 w-8" />,
    benefit: 'Get discovered organically',
    stats: '40% more organic discovery',
    highlights: [
      'Search engine optimization',
      'Social media integration',
      'Rich snippets and schema markup',
      'XML sitemap generation'
    ],
    preview: (
      <div className="space-y-1">
        <div className="text-xs text-blue-600">google.com</div>
        <div className="text-xs font-medium">John Doe - Professional Actor</div>
        <div className="text-xs text-gray-500">Experienced actor with 10+ years...</div>
      </div>
    )
  },
  {
    id: 'security',
    title: 'Enterprise Security',
    description: 'Your data is protected with bank-level security and privacy controls.',
    icon: <Shield className="h-8 w-8" />,
    benefit: 'Peace of mind with your professional data',
    stats: '99.9% uptime guarantee',
    highlights: [
      'SSL encryption for all data',
      'Privacy controls and settings',
      'GDPR compliance',
      'Regular security audits'
    ],
    preview: (
      <div className="flex items-center space-x-1">
        <Shield className="h-4 w-4 text-green-600" />
        <span className="text-xs text-green-600">Secured</span>
      </div>
    )
  }
];

export function FeatureHighlights({ onComplete, onBack }: FeatureHighlightsProps) {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [viewedFeatures, setViewedFeatures] = useState<Set<number>>(new Set([0]));

  const handleNext = () => {
    if (currentFeature < FEATURES.length - 1) {
      const nextFeature = currentFeature + 1;
      setCurrentFeature(nextFeature);
      setViewedFeatures(prev => new Set([...prev, nextFeature]));
    }
  };

  const handlePrevious = () => {
    if (currentFeature > 0) {
      setCurrentFeature(currentFeature - 1);
    }
  };

  const handleFeatureSelect = (index: number) => {
    setCurrentFeature(index);
    setViewedFeatures(prev => new Set([...prev, index]));
  };

  const feature = FEATURES[currentFeature];
  const progress = ((currentFeature + 1) / FEATURES.length) * 100;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold mb-4">
          Powerful Features for Success
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Discover the tools and features that will help you create an outstanding portfolio 
          and land more bookings.
        </p>
      </motion.div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Feature {currentFeature + 1} of {FEATURES.length}</span>
          <span>{Math.round(progress)}% explored</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-spotlight-500 to-spotlight-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Feature Navigation */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4">All Features</h3>
          <div className="space-y-2">
            {FEATURES.map((feat, index) => (
              <motion.button
                key={feat.id}
                onClick={() => handleFeatureSelect(index)}
                className={`
                  w-full text-left p-3 rounded-lg transition-all
                  ${index === currentFeature 
                    ? 'bg-spotlight-100 border-2 border-spotlight-300' 
                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`
                    p-2 rounded-lg
                    ${index === currentFeature ? 'bg-spotlight-600 text-white' : 'bg-gray-200 text-gray-600'}
                  `}>
                    {feat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{feat.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {feat.benefit}
                    </p>
                  </div>
                  {viewedFeatures.has(index) && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-6 p-4 bg-gradient-to-r from-spotlight-50 to-blue-50 rounded-lg">
            <h4 className="font-semibold text-sm mb-3">Platform Success</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active Users</span>
                <span className="font-medium">12,000+</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Avg. Load Time</span>
                <span className="font-medium">1.2s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Success Rate</span>
                <span className="font-medium">94%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Detail */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFeature}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-2 border-spotlight-200">
                <CardContent className="p-8">
                  {/* Feature Header */}
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="p-3 bg-spotlight-100 rounded-xl">
                      <div className="text-spotlight-600">
                        {feature.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h2 className="text-2xl font-bold">{feature.title}</h2>
                        {feature.stats && (
                          <Badge variant="secondary" className="text-xs">
                            {feature.stats}
                          </Badge>
                        )}
                      </div>
                      <p className="text-lg text-muted-foreground mb-3">
                        {feature.description}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <Star className="h-3 w-3 mr-1" />
                          {feature.benefit}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Feature Preview */}
                  {feature.preview && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium mb-3 text-muted-foreground">
                        Preview
                      </h4>
                      <div className="flex items-center justify-center">
                        {feature.preview}
                      </div>
                    </div>
                  )}

                  {/* Feature Highlights */}
                  <div>
                    <h4 className="font-semibold mb-3">Key Benefits</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {feature.highlights.map((highlight, index) => (
                        <motion.div
                          key={highlight}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center space-x-2"
                        >
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm">{highlight}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              onClick={handlePrevious}
              disabled={currentFeature === 0}
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex space-x-1">
              {FEATURES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleFeatureSelect(index)}
                  className={`
                    w-2 h-2 rounded-full transition-colors
                    ${index === currentFeature 
                      ? 'bg-spotlight-600' 
                      : viewedFeatures.has(index)
                        ? 'bg-spotlight-300'
                        : 'bg-gray-200'
                    }
                  `}
                />
              ))}
            </div>

            {currentFeature < FEATURES.length - 1 ? (
              <Button onClick={handleNext}>
                Next Feature
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={onComplete} className="bg-spotlight-600 hover:bg-spotlight-700">
                Continue Setup
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between mt-12 pt-6 border-t">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {viewedFeatures.size} of {FEATURES.length} features explored
          </p>
          {viewedFeatures.size === FEATURES.length && (
            <Badge variant="secondary" className="mt-1">
              <Check className="h-3 w-3 mr-1" />
              All features reviewed
            </Badge>
          )}
        </div>

        <Button 
          onClick={onComplete} 
          className="bg-spotlight-600 hover:bg-spotlight-700"
        >
          Ready to Create
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}