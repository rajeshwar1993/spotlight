'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-context';
import { WelcomeWizard } from '@/components/onboarding/welcome-wizard';
import { ProgressTracker } from '@/components/onboarding/progress-tracker';
import { FeatureHighlights } from '@/components/onboarding/feature-highlights';
import { LaunchAnalytics, UserJourneyTracker } from '@/lib/onboarding/analytics';
import { useOnboardingState } from '@/lib/onboarding/state';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { state, actions } = useOnboardingState();
  const [currentStep, setCurrentStep] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin?redirect=/onboarding');
      return;
    }

    // Initialize onboarding tracking
    LaunchAnalytics.trackOnboardingStep('welcome');
    UserJourneyTracker.startJourney();
    UserJourneyTracker.trackStep('onboarding_started');

    return () => {
      // Track abandonment if user leaves without completing
      if (!state.completed) {
        const timeSpent = Date.now() - startTime;
        LaunchAnalytics.trackOnboardingAbandoned(
          `step_${currentStep}`,
          Math.floor(timeSpent / 1000)
        );
      }
    };
  }, [user, router, startTime, state.completed, currentStep]);

  const handleStepComplete = (step: number) => {
    const stepName = getStepName(step);
    LaunchAnalytics.trackOnboardingStep(stepName, { step_number: step });
    UserJourneyTracker.trackStep(`onboarding_${stepName}`);
    
    actions.completeStep(step);
    setCurrentStep(step + 1);
  };

  const handleOnboardingComplete = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    LaunchAnalytics.trackOnboardingComplete(timeSpent, state.completedSteps.length);
    UserJourneyTracker.completeJourney('onboarding_completed');
    
    actions.complete();
    router.push('/dashboard?onboarding=completed');
  };

  const handleSkip = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    LaunchAnalytics.trackOnboardingAbandoned('skipped', timeSpent);
    UserJourneyTracker.abandonJourney('user_skipped');
    
    router.push('/dashboard');
  };

  const getStepName = (step: number): string => {
    const stepNames = [
      'welcome',
      'profile_setup',
      'template_intro',
      'feature_overview',
      'first_portfolio',
      'completion'
    ];
    return stepNames[step] || `step_${step}`;
  };

  // Redirect if already completed
  if (state.completed) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spotlight-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Tracker */}
        <div className="mb-8">
          <ProgressTracker
            currentStep={currentStep}
            totalSteps={6}
            completedSteps={state.completedSteps}
          />
        </div>

        {/* Skip Button */}
        <div className="absolute top-8 right-8">
          <button
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 0 && (
            <WelcomeWizard
              user={user!}
              onComplete={() => handleStepComplete(0)}
              onSkip={handleSkip}
            />
          )}

          {currentStep === 1 && (
            <ProfileSetupStep
              onComplete={() => handleStepComplete(1)}
              onBack={() => setCurrentStep(0)}
            />
          )}

          {currentStep === 2 && (
            <TemplateIntroStep
              onComplete={() => handleStepComplete(2)}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <FeatureHighlights
              onComplete={() => handleStepComplete(3)}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && (
            <FirstPortfolioStep
              onComplete={() => handleStepComplete(4)}
              onBack={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 5 && (
            <CompletionStep
              onComplete={handleOnboardingComplete}
              onBack={() => setCurrentStep(4)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Individual step components
function ProfileSetupStep({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  return (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Let's set up your profile</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Add some basic information to help casting directors find you
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
        <div className="space-y-6">
          <div className="text-left">
            <label className="block text-sm font-medium mb-2">Professional Title</label>
            <input
              type="text"
              placeholder="e.g., Actor, Model, Voice Actor"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="text-left">
            <label className="block text-sm font-medium mb-2">Location</label>
            <input
              type="text"
              placeholder="e.g., New York, NY"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="text-left">
            <label className="block text-sm font-medium mb-2">Brief Bio</label>
            <textarea
              placeholder="Tell us about your experience and what makes you unique..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="px-6 py-2 text-gray-600 hover:text-gray-800"
          >
            Back
          </button>
          <button
            onClick={onComplete}
            className="px-6 py-2 bg-spotlight-600 text-white rounded-md hover:bg-spotlight-700"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function TemplateIntroStep({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const [selectedTemplate, setSelectedTemplate] = useState('classic');

  return (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Choose your style</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Select a template that represents your professional brand
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 ${
              selectedTemplate === template.id ? 'ring-2 ring-spotlight-600' : ''
            }`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-6xl">{template.icon}</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
              <p className="text-muted-foreground">{template.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="px-6 py-2 text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
        <button
          onClick={onComplete}
          className="px-6 py-2 bg-spotlight-600 text-white rounded-md hover:bg-spotlight-700"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function FirstPortfolioStep({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  return (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Ready to create your portfolio?</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          You're all set! Let's create your first professional portfolio.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xl">✓</span>
            </div>
            <div className="text-left">
              <h3 className="font-semibold">Profile Information</h3>
              <p className="text-muted-foreground">Your basic info is ready</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xl">✓</span>
            </div>
            <div className="text-left">
              <h3 className="font-semibold">Template Selected</h3>
              <p className="text-muted-foreground">Your design style is chosen</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xl">📸</span>
            </div>
            <div className="text-left">
              <h3 className="font-semibold">Add Your Photos</h3>
              <p className="text-muted-foreground">Upload your professional images</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="px-6 py-2 text-gray-600 hover:text-gray-800"
          >
            Back
          </button>
          <button
            onClick={onComplete}
            className="px-6 py-2 bg-spotlight-600 text-white rounded-md hover:bg-spotlight-700"
          >
            Create Portfolio
          </button>
        </div>
      </div>
    </div>
  );
}

function CompletionStep({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  return (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-4xl font-bold">Welcome to Spotlight!</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          You're all set to create amazing portfolios and showcase your talent.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
        <h3 className="text-xl font-semibold mb-6">What's next?</h3>
        
        <div className="space-y-4 text-left">
          <div className="flex items-start space-x-3">
            <span className="text-spotlight-600">1.</span>
            <div>
              <h4 className="font-medium">Upload your best photos</h4>
              <p className="text-muted-foreground text-sm">Add 10-15 professional images to your portfolio</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="text-spotlight-600">2.</span>
            <div>
              <h4 className="font-medium">Customize your design</h4>
              <p className="text-muted-foreground text-sm">Personalize colors and fonts to match your brand</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="text-spotlight-600">3.</span>
            <div>
              <h4 className="font-medium">Publish and share</h4>
              <p className="text-muted-foreground text-sm">Make your portfolio live and share it with the world</p>
            </div>
          </div>
        </div>

        <button
          onClick={onComplete}
          className="w-full mt-8 px-6 py-3 bg-spotlight-600 text-white rounded-md hover:bg-spotlight-700 font-medium"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

const templates = [
  {
    id: 'classic',
    name: 'Classic Professional',
    description: 'Traditional and elegant design perfect for industry standards',
    icon: '🎭'
  },
  {
    id: 'modern',
    name: 'Modern Bold',
    description: 'Contemporary and eye-catching for fashion and commercial work',
    icon: '✨'
  },
  {
    id: 'minimal',
    name: 'Minimal Elegant',
    description: 'Clean and sophisticated for artistic professionals',
    icon: '🎨'
  },
  {
    id: 'creative',
    name: 'Creative Artistic',
    description: 'Unique and expressive for character actors and creatives',
    icon: '🎪'
  }
];