'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useUser } from '@/hooks/use-user';
import { ROUTES } from '@/lib/constants';

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isEmailVerified } = useUser();
  const { resendConfirmation } = useAuth();

  useEffect(() => {
    // Check if this is a confirmation callback
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    
    if (token && type === 'signup') {
      setMessage({
        type: 'success',
        text: 'Your email has been verified successfully! You can now access all features.',
      });
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        router.push(ROUTES.dashboard);
      }, 3000);
    }
  }, [searchParams, router]);

  useEffect(() => {
    // If user is already verified, redirect to dashboard
    if (isEmailVerified && !searchParams.get('token')) {
      router.push(ROUTES.dashboard);
    }
  }, [isEmailVerified, router, searchParams]);

  const handleResendEmail = async () => {
    if (!user?.email) return;

    setIsResending(true);
    setMessage(null);

    try {
      const { error } = await resendConfirmation(user.email);

      if (error) {
        setMessage({
          type: 'error',
          text: error.message || 'Failed to resend verification email',
        });
      } else {
        setMessage({
          type: 'success',
          text: 'Verification email sent! Please check your inbox.',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
            <CardDescription>
              We've sent a verification link to <strong>{user?.email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-sm text-gray-600 space-y-2">
              <p>Please check your email and click the verification link to activate your account.</p>
              <p>If you don't see the email, check your spam folder.</p>
            </div>

            {message && (
              <div
                className={`p-3 rounded-md text-sm ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full"
                variant="outline"
              >
                {isResending ? 'Sending...' : 'Resend verification email'}
              </Button>

              <div className="text-center">
                <Link
                  href={ROUTES.dashboard}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Continue to dashboard
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}