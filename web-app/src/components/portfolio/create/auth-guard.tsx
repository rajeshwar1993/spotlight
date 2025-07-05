'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { usePortfolioCreation } from './portfolio-creation-context';
import { User, Mail, ArrowRight, CheckCircle } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = false }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { state } = usePortfolioCreation();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      setShowAuthPrompt(true);
    } else {
      setShowAuthPrompt(false);
    }
  }, [user, loading, requireAuth]);

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking authentication...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show auth prompt for protected steps
  if (showAuthPrompt) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Almost there! 🎯
          </h2>
          <p className="text-lg text-gray-600">
            Create an account to save your portfolio and continue
          </p>
        </div>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <User className="h-6 w-6 text-blue-600" />
              Create Your Account
            </CardTitle>
            <CardDescription>
              Your portfolio progress has been saved. Sign up to create your professional portfolio.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Progress Summary */}
            <div className="bg-white rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-gray-900">Your Progress So Far:</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">
                    Basic information: {state.formData.step1.full_name || 'Completed'}
                  </span>
                </div>
                {state.formData.step2.template_type && (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">
                      Template selected: {state.formData.step2.template_type}
                    </span>
                  </div>
                )}
                {state.formData.step3.title && (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">
                      Portfolio details: {state.formData.step3.title}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">With your account, you&apos;ll get:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Professional portfolio hosting</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Custom portfolio URL</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Image upload & management</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Portfolio analytics</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Button 
                className="w-full flex items-center gap-2"
                onClick={() => {
                  // Save current step to return after auth
                  sessionStorage.setItem('portfolio-creation-return-step', '3');
                  router.push('/auth/signup');
                }}
              >
                <Mail className="h-4 w-4" />
                Create Account & Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  sessionStorage.setItem('portfolio-creation-return-step', '3');
                  router.push('/auth/signin');
                }}
              >
                Already have an account? Sign In
              </Button>
            </div>

            {/* Security Note */}
            <p className="text-xs text-gray-500 text-center">
              Your information is secure and your portfolio progress is automatically saved.
            </p>
          </CardContent>
        </Card>

        {/* Alternative Actions */}
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/create/step/1')}
            className="text-gray-500"
          >
            ← Go back and edit information
          </Button>
        </div>
      </div>
    );
  }

  // Render children if authenticated or auth not required
  return <>{children}</>;
}