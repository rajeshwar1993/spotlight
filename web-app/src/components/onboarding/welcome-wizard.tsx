'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Clock, 
  Users, 
  Zap, 
  Star, 
  TrendingUp,
  ArrowRight,
  Play
} from 'lucide-react';

interface WelcomeWizardProps {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  onComplete: () => void;
  onSkip: () => void;
}

interface WelcomeStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  benefit: string;
}

const WELCOME_STEPS: WelcomeStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Spotlight',
    description: 'The professional portfolio platform built for actors and models',
    icon: <Sparkles className="h-8 w-8 text-spotlight-600" />,
    benefit: 'Join thousands of successful professionals'
  },
  {
    id: 'speed',
    title: 'Create in Minutes',
    description: 'Build a stunning portfolio in under 5 minutes with our guided process',
    icon: <Clock className="h-8 w-8 text-blue-600" />,
    benefit: 'Save hours of design work'
  },
  {
    id: 'templates',
    title: 'Professional Templates',
    description: 'Choose from industry-specific templates designed by professionals',
    icon: <Star className="h-8 w-8 text-purple-600" />,
    benefit: 'Look professional from day one'
  },
  {
    id: 'performance',
    title: 'Lightning Fast',
    description: 'Your portfolio loads instantly with 90+ performance scores',
    icon: <Zap className="h-8 w-8 text-yellow-600" />,
    benefit: 'Better search rankings and user experience'
  }
];

const PLATFORM_STATS = [
  { label: 'Active Portfolios', value: '12,000+', trend: '+23%' },
  { label: 'Bookings Generated', value: '8,500+', trend: '+45%' },
  { label: 'Average Load Time', value: '1.2s', trend: 'Best in class' },
  { label: 'Success Rate', value: '94%', trend: '+12%' }
];

export function WelcomeWizard({ user, onComplete, onSkip }: WelcomeWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const handleNext = () => {
    if (currentStep < WELCOME_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentWelcomeStep = WELCOME_STEPS[currentStep];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="p-3 bg-spotlight-100 rounded-full">
            <Sparkles className="h-12 w-12 text-spotlight-600" />
          </div>
        </div>
        
        <h1 className="text-5xl font-bold mb-4">
          Welcome to <span className="text-spotlight-600">Spotlight</span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-2">
          Hi {user.name || user.email.split('@')[0]}! 👋
        </p>
        
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
          You're about to create a professional portfolio that will help you stand out 
          and land more opportunities. Let's get you set up in just a few minutes.
        </p>

        {/* Quick Demo Video */}
        <div className="mb-8">
          {!showVideo ? (
            <Button
              onClick={() => setShowVideo(true)}
              variant="outline"
              className="mx-auto"
            >
              <Play className="h-4 w-4 mr-2" />
              Watch 60-second demo
            </Button>
          ) : (
            <div className="bg-black rounded-lg p-2 max-w-md mx-auto">
              <div className="aspect-video bg-gray-800 rounded flex items-center justify-center">
                <p className="text-white">Demo video would play here</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Platform Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
      >
        {PLATFORM_STATS.map((stat, index) => (
          <Card key={stat.label} className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-spotlight-600 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                {stat.label}
              </div>
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                {stat.trend}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-12"
      >
        <Card className="border-2 border-spotlight-200">
          <CardContent className="p-8">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <div className="p-4 bg-gray-50 rounded-xl">
                  {currentWelcomeStep.icon}
                </div>
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">
                  {currentWelcomeStep.title}
                </h2>
                
                <p className="text-lg text-muted-foreground mb-4">
                  {currentWelcomeStep.description}
                </p>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                    ✓ {currentWelcomeStep.benefit}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress Indicators */}
      <div className="flex justify-center space-x-2 mb-8">
        {WELCOME_STEPS.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentStep 
                ? 'bg-spotlight-600' 
                : index < currentStep 
                  ? 'bg-spotlight-300' 
                  : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {currentStep > 0 && (
            <Button
              onClick={handlePrevious}
              variant="outline"
            >
              Previous
            </Button>
          )}
          
          <Button
            onClick={onSkip}
            variant="ghost"
            className="text-muted-foreground"
          >
            Skip introduction
          </Button>
        </div>

        <Button
          onClick={handleNext}
          className="bg-spotlight-600 hover:bg-spotlight-700"
          size="lg"
        >
          {currentStep < WELCOME_STEPS.length - 1 ? (
            <>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          ) : (
            'Get Started'
          )}
        </Button>
      </div>

      {/* Success Stories Teaser */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-12 text-center"
      >
        <Card className="bg-gradient-to-r from-spotlight-50 to-blue-50 border-spotlight-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <Users className="h-8 w-8 text-spotlight-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Join successful professionals</p>
              </div>
              
              <div className="text-center">
                <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm font-medium">4.9/5 user satisfaction</p>
              </div>
              
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium">3x more bookings on average</p>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground italic">
                "I booked my first major role within a week of launching my Spotlight portfolio!" 
                - Sarah M., Actor
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}