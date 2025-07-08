import { supabase } from '@/lib/supabase/client';
import type { User } from '@/types';
import type { UserProfileForm } from '@/lib/validations';

export interface UserProfileResponse {
  data?: User;
  error?: Error | null;
}

export interface UserUpdateResponse {
  data?: User;
  error?: Error | null;
}

export interface AvatarUploadResponse {
  url?: string;
  error?: Error | null;
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<UserProfileResponse> {
  try {
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return { error: new Error(error.message) };
    }

    if (!userProfile) {
      return { error: new Error('User not found') };
    }

    // Transform database user to application user type
    const transformedUser: User = {
      id: userProfile.id,
      email: userProfile.email,
      full_name: userProfile.full_name,
      avatar_url: userProfile.avatar_url,
      profession: userProfile.profession,
      gender: userProfile.gender,
      date_of_birth: userProfile.date_of_birth,
      location: userProfile.location,
      bio: userProfile.bio,
      phone: userProfile.phone,
      website_url: userProfile.website_url,
      social_links: {
        instagram: userProfile.social_instagram,
        twitter: userProfile.social_twitter,
        tiktok: userProfile.social_tiktok,
        linkedin: userProfile.social_linkedin,
      },
      is_email_verified: userProfile.is_email_verified,
      is_profile_complete: userProfile.is_profile_complete,
      created_at: userProfile.created_at,
      updated_at: userProfile.updated_at,
    };

    return { data: transformedUser };
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return { error: error as Error };
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string, 
  profileData: Partial<UserProfileForm>
): Promise<UserUpdateResponse> {
  try {
    // Transform application data to database format
    const updateData = {
      full_name: profileData.full_name,
      profession: profileData.profession,
      gender: profileData.gender,
      date_of_birth: profileData.date_of_birth,
      location: profileData.location,
      phone: profileData.phone,
      bio: profileData.bio,
      website_url: profileData.website_url,
      social_instagram: profileData.social_instagram,
      social_twitter: profileData.social_twitter,
      social_tiktok: profileData.social_tiktok,
      social_linkedin: profileData.social_linkedin,
      updated_at: new Date().toISOString(),
    };

    // Remove undefined values
    const cleanedData = Object.fromEntries(
      Object.entries(updateData).filter(([, value]) => value !== undefined)
    );

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(cleanedData)
      .eq('id', userId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return { error: new Error(error.message) };
    }

    // Calculate and update profile completion
    const profileCompletion = calculateProfileCompletion(updatedUser);
    
    // Update is_profile_complete flag
    await supabase
      .from('users')
      .update({ 
        is_profile_complete: profileCompletion >= 80,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    // Transform back to application user type
    const transformedUser: User = {
      id: updatedUser.id,
      email: updatedUser.email,
      full_name: updatedUser.full_name,
      avatar_url: updatedUser.avatar_url,
      profession: updatedUser.profession,
      gender: updatedUser.gender,
      date_of_birth: updatedUser.date_of_birth,
      location: updatedUser.location,
      bio: updatedUser.bio,
      phone: updatedUser.phone,
      website_url: updatedUser.website_url,
      social_links: {
        instagram: updatedUser.social_instagram,
        twitter: updatedUser.social_twitter,
        tiktok: updatedUser.social_tiktok,
        linkedin: updatedUser.social_linkedin,
      },
      is_email_verified: updatedUser.is_email_verified,
      is_profile_complete: profileCompletion >= 80,
      created_at: updatedUser.created_at,
      updated_at: updatedUser.updated_at,
    };

    return { data: transformedUser };
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return { error: error as Error };
  }
}

/**
 * Calculate profile completion percentage
 */
export function calculateProfileCompletion(user: Record<string, unknown>): number {
  const fields = [
    'full_name',
    'profession',
    'bio',
    'location',
    'avatar_url',
    'phone',
    'website_url',
    'social_instagram',
    'social_twitter',
    'social_linkedin',
  ];

  const filledFields = fields.filter(field => {
    const value = user[field];
    return value !== null && value !== undefined && value !== '';
  });

  return Math.round((filledFields.length / fields.length) * 100);
}

/**
 * Upload user avatar to Supabase Storage
 */
export async function uploadAvatar(userId: string, file: File): Promise<AvatarUploadResponse> {
  try {
    // Validate file
    if (!file.type.startsWith('image/')) {
      return { error: new Error('File must be an image') };
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return { error: new Error('File size must be less than 5MB') };
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExtension}`;

    // Delete existing avatar if it exists
    await deleteAvatar(userId);

    // Upload new avatar
    const { error: uploadError } = await supabase.storage
      .from('user-uploads')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      return { error: new Error(uploadError.message) };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('user-uploads')
      .getPublicUrl(fileName);

    const avatarUrl = urlData.publicUrl;

    // Update user profile with new avatar URL
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user avatar URL:', updateError);
      return { error: new Error(updateError.message) };
    }

    return { url: avatarUrl };
  } catch (error) {
    console.error('Error in uploadAvatar:', error);
    return { error: error as Error };
  }
}

/**
 * Delete user avatar from storage and profile
 */
export async function deleteAvatar(userId: string): Promise<{ error?: Error | null }> {
  try {
    // Get current avatar URL to determine file path
    const { data: user } = await supabase
      .from('users')
      .select('avatar_url')
      .eq('id', userId)
      .single();

    if (user?.avatar_url) {
      // Extract file path from URL
      const urlParts = user.avatar_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${userId}/${fileName}`;

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('user-uploads')
        .remove([filePath]);

      if (deleteError) {
        console.error('Error deleting avatar file:', deleteError);
        // Continue to update profile even if file deletion fails
      }
    }

    // Update user profile to remove avatar URL
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        avatar_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error removing avatar URL from profile:', updateError);
      return { error: new Error(updateError.message) };
    }

    return {};
  } catch (error) {
    console.error('Error in deleteAvatar:', error);
    return { error: error as Error };
  }
}

/**
 * Check if profile is complete
 */
export function isProfileComplete(user: User): boolean {
  return calculateProfileCompletion(user as unknown as Record<string, unknown>) >= 80;
}

/**
 * Get profile completion details
 */
export function getProfileCompletionDetails(user: User) {
  const checks = [
    { field: 'full_name', label: 'Full Name', completed: !!user.full_name },
    { field: 'profession', label: 'Profession', completed: !!user.profession },
    { field: 'bio', label: 'Bio', completed: !!user.bio },
    { field: 'location', label: 'Location', completed: !!user.location },
    { field: 'avatar_url', label: 'Profile Photo', completed: !!user.avatar_url },
    { field: 'phone', label: 'Phone Number', completed: !!user.phone },
    { field: 'website_url', label: 'Website', completed: !!user.website_url },
    { field: 'social_instagram', label: 'Instagram', completed: !!user.social_links?.instagram },
    { field: 'social_twitter', label: 'Twitter', completed: !!user.social_links?.twitter },
    { field: 'social_linkedin', label: 'LinkedIn', completed: !!user.social_links?.linkedin },
  ];

  const completedCount = checks.filter(check => check.completed).length;
  const percentage = Math.round((completedCount / checks.length) * 100);

  return {
    checks,
    completedCount,
    totalCount: checks.length,
    percentage,
    isComplete: percentage >= 80,
  };
}

/**
 * Update user with dynamic fields
 */
export async function updateUser(
  updates: Record<string, unknown>
): Promise<UserUpdateResponse> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: new Error('User not authenticated') };
    }

    // Transform social media fields
    const transformedUpdates: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (key === 'instagram_url') {
        transformedUpdates.social_instagram = value;
      } else if (key === 'linkedin_url') {
        transformedUpdates.social_linkedin = value;
      } else if (key === 'twitter_url') {
        transformedUpdates.social_twitter = value;
      } else if (key === 'website_url') {
        transformedUpdates.website_url = value;
      } else if (key === 'years_experience') {
        transformedUpdates.years_experience = parseInt(value) || null;
      } else {
        transformedUpdates[key] = value;
      }
    }

    transformedUpdates.updated_at = new Date().toISOString();

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(transformedUpdates)
      .eq('id', user.id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return { error: new Error(error.message) };
    }

    return { data: updatedUser as User };
  } catch (error) {
    console.error('Error in updateUser:', error);
    return { error: error as Error };
  }
}

// Service object for easier importing
export const userService = {
  getUserProfile,
  updateUserProfile,
  updateUser,
  uploadAvatar,
  deleteAvatar,
  calculateProfileCompletion,
  isProfileComplete,
  getProfileCompletionDetails,
};

