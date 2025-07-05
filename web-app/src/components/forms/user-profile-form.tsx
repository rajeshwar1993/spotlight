'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useUser } from '@/hooks/use-user';
import { userProfileSchema, type UserProfileForm } from '@/lib/validations';
import { Profession, Gender } from '@/types';

interface UserProfileFormProps {
  onSuccess?: (updatedUser: unknown) => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
}

export function UserProfileFormComponent({ 
  onSuccess, 
  onCancel, 
  showCancelButton = false 
}: UserProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const { user } = useUser();
  const { updateProfile } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    reset,
  } = useForm<UserProfileForm>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      profession: user?.profession || Profession.ACTOR,
      gender: user?.gender || undefined,
      date_of_birth: user?.date_of_birth || '',
      location: user?.location || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      website_url: user?.website_url || '',
      social_instagram: user?.social_links?.instagram || '',
      social_twitter: user?.social_links?.twitter || '',
      social_tiktok: user?.social_links?.tiktok || '',
      social_linkedin: user?.social_links?.linkedin || '',
    },
  });

  // Watch for form changes
  const watchedValues = watch();
  
  useEffect(() => {
    setHasChanges(isDirty);
  }, [isDirty]);

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name || '',
        profession: user.profession || Profession.ACTOR,
        gender: user.gender || undefined,
        date_of_birth: user.date_of_birth || '',
        location: user.location || '',
        phone: user.phone || '',
        bio: user.bio || '',
        website_url: user.website_url || '',
        social_instagram: user.social_links?.instagram || '',
        social_twitter: user.social_links?.twitter || '',
        social_tiktok: user.social_links?.tiktok || '',
        social_linkedin: user.social_links?.linkedin || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UserProfileForm) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await updateProfile(data);

      if (result.error) {
        setMessage({
          type: 'error',
          text: result.error.message || 'Failed to update profile',
        });
      } else {
        setMessage({
          type: 'success',
          text: 'Profile updated successfully!',
        });
        setHasChanges(false);
        
        if (onSuccess && result.data) {
          onSuccess(result.data);
        }
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setHasChanges(false);
    setMessage(null);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>
          Update your personal information and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="full_name" className="text-sm font-medium">
                  Full Name *
                </label>
                <Input
                  id="full_name"
                  placeholder="Enter your full name"
                  {...register('full_name')}
                  className={errors.full_name ? 'border-red-500' : ''}
                />
                {errors.full_name && (
                  <p className="text-sm text-red-500">{errors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="profession" className="text-sm font-medium">
                  Profession *
                </label>
                <select
                  id="profession"
                  {...register('profession')}
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    errors.profession ? 'border-red-500' : ''
                  }`}
                >
                  <option value={Profession.ACTOR}>Actor</option>
                  <option value={Profession.MODEL}>Model</option>
                  <option value={Profession.BOTH}>Both</option>
                </select>
                {errors.profession && (
                  <p className="text-sm text-red-500">{errors.profession.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="gender" className="text-sm font-medium">
                  Gender
                </label>
                <select
                  id="gender"
                  {...register('gender')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select gender</option>
                  <option value={Gender.MALE}>Male</option>
                  <option value={Gender.FEMALE}>Female</option>
                  <option value={Gender.NON_BINARY}>Non-binary</option>
                  <option value={Gender.PREFER_NOT_TO_SAY}>Prefer not to say</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="date_of_birth" className="text-sm font-medium">
                  Date of Birth
                </label>
                <Input
                  id="date_of_birth"
                  type="date"
                  {...register('date_of_birth')}
                  className={errors.date_of_birth ? 'border-red-500' : ''}
                />
                {errors.date_of_birth && (
                  <p className="text-sm text-red-500">{errors.date_of_birth.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium">
                  Location
                </label>
                <Input
                  id="location"
                  placeholder="City, State, Country"
                  {...register('location')}
                  className={errors.location ? 'border-red-500' : ''}
                />
                {errors.location && (
                  <p className="text-sm text-red-500">{errors.location.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  {...register('phone')}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium">
                Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                placeholder="Tell us about yourself..."
                {...register('bio')}
                className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.bio ? 'border-red-500' : ''
                }`}
              />
              {errors.bio && (
                <p className="text-sm text-red-500">{errors.bio.message}</p>
              )}
              <p className="text-xs text-gray-500">
                {watchedValues.bio?.length || 0}/1000 characters
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="website_url" className="text-sm font-medium">
                Website
              </label>
              <Input
                id="website_url"
                type="url"
                placeholder="https://yourwebsite.com"
                {...register('website_url')}
                className={errors.website_url ? 'border-red-500' : ''}
              />
              {errors.website_url && (
                <p className="text-sm text-red-500">{errors.website_url.message}</p>
              )}
            </div>
          </div>

          {/* Social Media Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Social Media</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="social_instagram" className="text-sm font-medium">
                  Instagram Username
                </label>
                <Input
                  id="social_instagram"
                  placeholder="@username"
                  {...register('social_instagram')}
                  className={errors.social_instagram ? 'border-red-500' : ''}
                />
                {errors.social_instagram && (
                  <p className="text-sm text-red-500">{errors.social_instagram.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="social_twitter" className="text-sm font-medium">
                  Twitter/X Username
                </label>
                <Input
                  id="social_twitter"
                  placeholder="@username"
                  {...register('social_twitter')}
                  className={errors.social_twitter ? 'border-red-500' : ''}
                />
                {errors.social_twitter && (
                  <p className="text-sm text-red-500">{errors.social_twitter.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="social_tiktok" className="text-sm font-medium">
                  TikTok Username
                </label>
                <Input
                  id="social_tiktok"
                  placeholder="@username"
                  {...register('social_tiktok')}
                  className={errors.social_tiktok ? 'border-red-500' : ''}
                />
                {errors.social_tiktok && (
                  <p className="text-sm text-red-500">{errors.social_tiktok.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="social_linkedin" className="text-sm font-medium">
                  LinkedIn Username
                </label>
                <Input
                  id="social_linkedin"
                  placeholder="username"
                  {...register('social_linkedin')}
                  className={errors.social_linkedin ? 'border-red-500' : ''}
                />
                {errors.social_linkedin && (
                  <p className="text-sm text-red-500">{errors.social_linkedin.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Status Message */}
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

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            {showCancelButton && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || !hasChanges}
              className="min-w-[120px]"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          {/* Unsaved Changes Warning */}
          {hasChanges && (
            <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-2">
              You have unsaved changes. Don&apos;t forget to save your profile!
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}