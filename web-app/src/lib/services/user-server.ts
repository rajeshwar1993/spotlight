import { createClient } from '@/lib/supabase/server';
import type { User } from '@/types';

export interface UserProfileResponse {
  data?: User;
  error?: Error | null;
}

/**
 * Server-side user profile operations
 */
export async function getUserProfileServer(userId: string): Promise<UserProfileResponse> {
  try {
    const supabaseServer = await createClient();
    
    const { data: userProfile, error } = await supabaseServer
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile (server):', error);
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
    console.error('Error in getUserProfileServer:', error);
    return { error: error as Error };
  }
}