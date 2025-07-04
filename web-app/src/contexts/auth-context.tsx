'use client';

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import type { User, UserProfileForm } from '@/types';
import { 
  updateUserProfile, 
  uploadAvatar, 
  deleteAvatar, 
  getUserProfile,
  type UserUpdateResponse,
  type AvatarUploadResponse
} from '@/lib/services/user';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
  resendConfirmation: (email: string) => Promise<{ error: AuthError | null }>;
  // Profile management methods
  updateProfile: (data: Partial<UserProfileForm>) => Promise<UserUpdateResponse>;
  uploadUserAvatar: (file: File) => Promise<AvatarUploadResponse>;
  deleteUserAvatar: () => Promise<{ error?: Error | null }>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
      }
      
      setSession(session);
      await setUserFromSession(session);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        await setUserFromSession(session);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const setUserFromSession = async (session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      return;
    }

    try {
      // Fetch user profile from our database
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        setUser(null);
        return;
      }

      if (userProfile) {
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
        
        setUser(transformedUser);
      }
    } catch (error) {
      console.error('Error setting user from session:', error);
      setUser(null);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setLoading(false);
        return { error };
      }

      // User profile will be created automatically via database trigger
      setLoading(false);
      return { error: null };
    } catch (error) {
      setLoading(false);
      return { error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setLoading(false);
      return { error };
    } catch (error) {
      setLoading(false);
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (!error) {
        setUser(null);
        setSession(null);
      }
      
      setLoading(false);
      return { error };
    } catch (error) {
      setLoading(false);
      return { error: error as AuthError };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify`,
        },
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  // Profile management methods
  const updateProfile = async (profileData: Partial<UserProfileForm>): Promise<UserUpdateResponse> => {
    if (!user?.id) {
      return { error: new Error('User not authenticated') };
    }

    try {
      const result = await updateUserProfile(user.id, profileData);
      
      if (result.data) {
        // Update the user state with the new profile data
        setUser(result.data);
      }
      
      return result;
    } catch (error) {
      return { error: error as Error };
    }
  };

  const uploadUserAvatar = async (file: File): Promise<AvatarUploadResponse> => {
    if (!user?.id) {
      return { error: new Error('User not authenticated') };
    }

    try {
      const result = await uploadAvatar(user.id, file);
      
      if (result.url) {
        // Update the user state with the new avatar URL
        setUser(prev => prev ? { ...prev, avatar_url: result.url } : null);
      }
      
      return result;
    } catch (error) {
      return { error: error as Error };
    }
  };

  const deleteUserAvatar = async (): Promise<{ error?: Error | null }> => {
    if (!user?.id) {
      return { error: new Error('User not authenticated') };
    }

    try {
      const result = await deleteAvatar(user.id);
      
      if (!result.error) {
        // Update the user state to remove avatar URL
        setUser(prev => prev ? { ...prev, avatar_url: null } : null);
      }
      
      return result;
    } catch (error) {
      return { error: error as Error };
    }
  };

  const refreshUserProfile = async (): Promise<void> => {
    if (!user?.id) {
      return;
    }

    try {
      const { data: refreshedUser } = await getUserProfile(user.id);
      if (refreshedUser) {
        setUser(refreshedUser);
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    resendConfirmation,
    updateProfile,
    uploadUserAvatar,
    deleteUserAvatar,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}