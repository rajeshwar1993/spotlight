'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  Palette, 
  Upload, 
  Rocket, 
  // ChevronRight, 
  Clock, 
  CheckCircle,
  ArrowRight 
} from 'lucide-react';
import Link from 'next/link';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: string;
  features: string[];
  color: string;
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Sign Up & Choose Template',
    description: 'Create your account and select from our professionally designed templates.',
    icon: <UserPlus className="w-6 h-6" />,
    duration: '30 seconds',
    features: ['Free account creation', '4 professional templates', 'Mobile-responsive designs'],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 2,
    title: 'Add Your Information',
    description: 'Fill in your professional details, bio, and contact information.',
    icon: <Palette className="w-6 h-6" />,
    duration: '2 minutes',
    features: ['Personal information', 'Professional bio', 'Contact details', 'Social links'],
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 3,
    title: 'Upload Your Best Work',
    description: 'Add your photos, headshots, and portfolio pieces with our easy drag-and-drop interface.',
    icon: <Upload className="w-6 h-6" />,
    duration: '2 minutes',
    features: ['Drag & drop upload', 'Auto image optimization', 'Unlimited photo storage'],
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 4,
    title: 'Publish & Share',
    description: 'Your portfolio is ready! Share it with casting directors, agents, and potential clients.',
    icon: <Rocket className="w-6 h-6" />,
    duration: '10 seconds',
    features: ['Instant publishing', 'Custom URL', 'Social sharing', 'Analytics tracking'],
    color: 'from-orange-500 to-red-500'
  }
];

interface HowItWorksProps {
  className?: string;
}

export function HowItWorks({ className = '' }: HowItWorksProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={sectionRef} className={`py-20 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-800">
            Simple Process
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How It Works
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create your professional portfolio in 4 simple steps. No technical skills required.
          </p>
        </div>

        {/* Process Timeline */}
        <div className="relative mb-16">
          {/* Desktop Timeline */}
          <div className="hidden lg:block">
            <div className="flex justify-between items-center mb-8">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div 
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all duration-500 ${
                      index <= activeStep 
                        ? `bg-gradient-to-r ${step.color} scale-110 shadow-lg` 
                        : 'bg-gray-300'
                    }`}
                  >
                    {index < activeStep ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="text-center mt-4">
                    <div className="text-sm font-medium text-gray-900">{step.title}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {step.duration}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Connection Line */}
            <div className="absolute top-8 left-8 right-8 h-0.5 bg-gray-200 -z-10">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-out"
                style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>

          {/* Mobile Timeline */}
          <div className="lg:hidden space-y-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-4">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0 ${
                    index <= activeStep 
                      ? `bg-gradient-to-r ${step.color}` 
                      : 'bg-gray-300'
                  }`}
                >
                  {index < activeStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                    <Clock className="w-3 h-3" />
                    {step.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Step Details */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Step Details */}
          <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${steps[activeStep].color} flex items-center justify-center text-white`}>
                  {steps[activeStep].icon}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">
                    Step {steps[activeStep].id} of {steps.length}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {steps[activeStep].title}
                  </h3>
                </div>
              </div>
              
              <p className="text-lg text-gray-600 mb-6">
                {steps[activeStep].description}
              </p>
            </div>

            <div className="space-y-3">
              {steps[activeStep].features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Representation */}
          <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <Card className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 border-0 shadow-xl">
              <CardContent className="p-0">
                <div className="text-center">
                  <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r ${steps[activeStep].color} flex items-center justify-center text-white shadow-lg`}>
                    {steps[activeStep].icon}
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      Time Required
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {steps[activeStep].duration}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-sm text-gray-600">
                      {steps[activeStep].features.length} key features included
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Total Time & CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Total Time</span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              Under 5 Minutes
            </div>
            <p className="text-gray-600">
              From signup to published portfolio
            </p>
          </div>
          
          <div className="space-y-4">
            <Link href="/auth/register">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Creating Your Portfolio
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            
            <p className="text-sm text-gray-500">
              No credit card required • Free forever plan available
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}