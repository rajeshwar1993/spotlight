'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResetPasswordForm } from '@/components/forms/reset-password-form';
import { useAuth } from '@/hooks/use-auth';
import { passwordUpdateSchema, type PasswordUpdateForm } from '@/lib/validations';
import { ROUTES } from '@/lib/constants';

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updatePassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordUpdateForm>({
    resolver: zodResolver(passwordUpdateSchema),
  });

  useEffect(() => {
    // Check if this is a password update callback (user clicked reset link)
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (accessToken && refreshToken) {
      setIsUpdateMode(true);
    }
  }, [searchParams]);

  const onSubmit = async (data: PasswordUpdateForm) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await updatePassword(data.password);

      if (error) {
        setMessage({
          type: 'error',
          text: error.message || 'Failed to update password',
        });
      } else {
        setMessage({
          type: 'success',
          text: 'Password updated successfully! Redirecting to dashboard...',
        });
        
        // Redirect to dashboard after successful password update
        setTimeout(() => {
          router.push(ROUTES.dashboard);
        }, 2000);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isUpdateMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Update your password</CardTitle>
              <CardDescription>
                Enter your new password below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    New Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your new password"
                    {...register('password')}
                    disabled={isLoading}
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirm_password" className="text-sm font-medium">
                    Confirm Password
                  </label>
                  <Input
                    id="confirm_password"
                    type="password"
                    placeholder="Confirm your new password"
                    {...register('confirm_password')}
                    disabled={isLoading}
                    className={errors.confirm_password ? 'border-red-500' : ''}
                  />
                  {errors.confirm_password && (
                    <p className="text-sm text-red-500">{errors.confirm_password.message}</p>
                  )}
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

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <ResetPasswordForm />
      </div>
    </div>
  );
}