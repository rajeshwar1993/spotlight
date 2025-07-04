import { useAuth } from './use-auth';
import type { User } from '@/types';

export function useUser(): {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  isProfileComplete: boolean;
} {
  const { user, loading } = useAuth();

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isEmailVerified: user?.is_email_verified ?? false,
    isProfileComplete: user?.is_profile_complete ?? false,
  };
}