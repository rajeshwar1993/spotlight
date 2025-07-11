import { useState, useEffect } from 'react';

export interface OnboardingState {
  completed: boolean;
  currentStep: number;
  completedSteps: number[];
  startTime: number;
  profile: {
    title?: string;
    location?: string;
    bio?: string;
  };
  template?: string;
  preferences: {
    skipTutorial: boolean;
    emailNotifications: boolean;
  };
}

const INITIAL_STATE: OnboardingState = {
  completed: false,
  currentStep: 0,
  completedSteps: [],
  startTime: Date.now(),
  profile: {},
  preferences: {
    skipTutorial: false,
    emailNotifications: true,
  },
};

const STORAGE_KEY = 'spotlight_onboarding_state';

export function useOnboardingState() {
  const [state, setState] = useState<OnboardingState>(() => {
    if (typeof window === 'undefined') return INITIAL_STATE;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...INITIAL_STATE, ...parsed };
      }
    } catch (error) {
      console.error('Failed to parse onboarding state:', error);
    }
    
    return INITIAL_STATE;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
    }
  }, [state]);

  const actions = {
    // Step management
    setStep: (step: number) => {
      setState(prev => ({
        ...prev,
        currentStep: step,
      }));
    },

    completeStep: (step: number) => {
      setState(prev => ({
        ...prev,
        completedSteps: [...prev.completedSteps.filter(s => s !== step), step],
      }));
    },

    // Profile management
    updateProfile: (updates: Partial<OnboardingState['profile']>) => {
      setState(prev => ({
        ...prev,
        profile: { ...prev.profile, ...updates },
      }));
    },

    // Template selection
    selectTemplate: (template: string) => {
      setState(prev => ({
        ...prev,
        template,
      }));
    },

    // Preferences
    updatePreferences: (updates: Partial<OnboardingState['preferences']>) => {
      setState(prev => ({
        ...prev,
        preferences: { ...prev.preferences, ...updates },
      }));
    },

    // Completion
    complete: () => {
      setState(prev => ({
        ...prev,
        completed: true,
        currentStep: -1, // Indicate completion
      }));
    },

    // Reset
    reset: () => {
      setState(INITIAL_STATE);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error('Failed to clear onboarding state:', error);
      }
    },

    // Skip onboarding
    skip: () => {
      setState(prev => ({
        ...prev,
        completed: true,
        currentStep: -1,
        preferences: {
          ...prev.preferences,
          skipTutorial: true,
        },
      }));
    },
  };

  return { state, actions };
}

// Check if user has completed onboarding
export function hasCompletedOnboarding(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.completed === true;
    }
  } catch (error) {
    console.error('Failed to check onboarding completion:', error);
  }
  
  return false;
}

// Get onboarding progress percentage
export function getOnboardingProgress(): number {
  if (typeof window === 'undefined') return 0;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.completed) return 100;
      
      const totalSteps = 6; // Total number of onboarding steps
      const completedSteps = parsed.completedSteps?.length || 0;
      return Math.round((completedSteps / totalSteps) * 100);
    }
  } catch (error) {
    console.error('Failed to get onboarding progress:', error);
  }
  
  return 0;
}

// Clear onboarding data (for testing or reset)
export function clearOnboardingData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear onboarding data:', error);
  }
}