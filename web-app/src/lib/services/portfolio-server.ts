import { createClient } from '@/lib/supabase/server';
import type { Portfolio } from '@/types';
import { portfolioService } from './portfolio';

export interface PortfolioServerResponse {
  data?: Portfolio;
  error?: Error | null;
}

export interface PortfolioServerListResponse {
  data?: Portfolio[];
  error?: Error | null;
}

/**
 * Server-side portfolio service with email verification checks
 */

/**
 * Get portfolio by ID (server-side)
 */
export async function getPortfolio(portfolioId: string): Promise<PortfolioServerResponse> {
  try {
    const supabase = await createClient();
    
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', portfolioId)
      .single();

    if (error) {
      console.error('Error fetching portfolio:', error);
      return { error: new Error(error.message) };
    }

    if (!portfolio) {
      return { error: new Error('Portfolio not found') };
    }

    return { data: portfolio };
  } catch (error) {
    console.error('Error in getPortfolio:', error);
    return { error: error as Error };
  }
}

/**
 * Update portfolio with email verification checks
 */
export async function updatePortfolio(
  portfolioId: string,
  portfolioData: unknown,
  options: { requireEmailVerification?: boolean } = { requireEmailVerification: true }
): Promise<PortfolioServerResponse> {
  try {
    const supabase = await createClient();
    
    // Check if user is trying to publish and if email verification is required
    if (options.requireEmailVerification && portfolioData.is_published === true) {
      // Get the user to check email verification status
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { error: new Error('Unauthorized') };
      }

      // Get user data to check verification status
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('is_email_verified')
        .eq('id', user.id)
        .single();

      if (userError) {
        return { error: new Error('Failed to check user verification status') };
      }

      // Check if email is verified
      if (!userData.is_email_verified) {
        return { error: new Error('Email verification required. Please verify your email before publishing your portfolio.') };
      }
    }

    // If verification passes or not required, proceed with update
    const result = await portfolioService.updatePortfolio(portfolioId, portfolioData);
    
    return result;
  } catch (error) {
    console.error('Error in updatePortfolio:', error);
    return { error: error as Error };
  }
}

/**
 * Create portfolio with email verification checks
 */
export async function createPortfolio(
  userId: string,
  portfolioData: unknown,
  options: { requireEmailVerification?: boolean } = { requireEmailVerification: true }
): Promise<PortfolioServerResponse> {
  try {
    const supabase = await createClient();
    
    // Check if user is trying to publish and if email verification is required
    if (options.requireEmailVerification && portfolioData.is_published === true) {
      // Get user data to check verification status
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('is_email_verified')
        .eq('id', userId)
        .single();

      if (userError) {
        return { error: new Error('Failed to check user verification status') };
      }

      // Check if email is verified
      if (!userData.is_email_verified) {
        return { error: new Error('Email verification required. Please verify your email before publishing your portfolio.') };
      }
    }

    // If verification passes or not required, proceed with creation
    const result = await portfolioService.createPortfolio(userId, portfolioData);
    
    return result;
  } catch (error) {
    console.error('Error in createPortfolio:', error);
    return { error: error as Error };
  }
}

/**
 * Check if user can publish portfolios
 */
export async function canUserPublishPortfolios(userId: string): Promise<{ canPublish: boolean; reason?: string }> {
  try {
    const supabase = await createClient();
    
    const { data: userData, error } = await supabase
      .from('users')
      .select('is_email_verified')
      .eq('id', userId)
      .single();

    if (error) {
      return { canPublish: false, reason: 'Failed to check user verification status' };
    }

    if (!userData.is_email_verified) {
      return { canPublish: false, reason: 'Email verification required' };
    }

    return { canPublish: true };
  } catch (error) {
    console.error('Error in canUserPublishPortfolios:', error);
    return { canPublish: false, reason: 'Internal server error' };
  }
}

/**
 * Get user verification status
 */
export async function getUserVerificationStatus(userId: string): Promise<{ isVerified: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    
    const { data: userData, error } = await supabase
      .from('users')
      .select('is_email_verified')
      .eq('id', userId)
      .single();

    if (error) {
      return { isVerified: false, error: 'Failed to check verification status' };
    }

    return { isVerified: userData.is_email_verified };
  } catch (error) {
    console.error('Error in getUserVerificationStatus:', error);
    return { isVerified: false, error: 'Internal server error' };
  }
}

// Server-side portfolio service object
export const portfolioServerService = {
  getPortfolio,
  updatePortfolio,
  createPortfolio,
  canUserPublishPortfolios,
  getUserVerificationStatus
};