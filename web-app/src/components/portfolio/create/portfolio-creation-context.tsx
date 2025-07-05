'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { TemplateType, Profession } from '@/types';

// Form data interfaces
export interface Step1Data {
  full_name: string;
  email: string;
  profession?: Profession;
  location?: string;
}

export interface Step2Data {
  template_type?: TemplateType;
}

export interface Step3Data {
  title: string;
  bio: string;
}

export interface PortfolioFormData {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
}

// Context state
interface PortfolioCreationState {
  currentStep: number;
  formData: PortfolioFormData;
  portfolioId?: string | null;
  isComplete: boolean;
  errors: Record<string, string>;
  isSubmitting: boolean;
  hasUnsavedChanges: boolean;
}

// Actions
type PortfolioCreationAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'UPDATE_STEP1'; payload: Partial<Step1Data> }
  | { type: 'UPDATE_STEP2'; payload: Partial<Step2Data> }
  | { type: 'UPDATE_STEP3'; payload: Partial<Step3Data> }
  | { type: 'SET_PORTFOLIO_ID'; payload: string | null }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_UNSAVED_CHANGES'; payload: boolean }
  | { type: 'RESET_FORM' }
  | { type: 'LOAD_FROM_STORAGE'; payload: PortfolioFormData };

// Initial state
const initialFormData: PortfolioFormData = {
  step1: {
    full_name: '',
    email: '',
    profession: undefined,
    location: '',
  },
  step2: {
    template_type: undefined,
  },
  step3: {
    title: '',
    bio: '',
  },
};

const initialState: PortfolioCreationState = {
  currentStep: 1,
  formData: initialFormData,
  portfolioId: null,
  isComplete: false,
  errors: {},
  isSubmitting: false,
  hasUnsavedChanges: false,
};

// Reducer
function portfolioCreationReducer(
  state: PortfolioCreationState,
  action: PortfolioCreationAction
): PortfolioCreationState {
  switch (action.type) {
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
        errors: {}, // Clear errors when changing steps
      };

    case 'UPDATE_STEP1':
      return {
        ...state,
        formData: {
          ...state.formData,
          step1: { ...state.formData.step1, ...action.payload },
        },
        hasUnsavedChanges: true,
      };

    case 'UPDATE_STEP2':
      return {
        ...state,
        formData: {
          ...state.formData,
          step2: { ...state.formData.step2, ...action.payload },
        },
        hasUnsavedChanges: true,
      };

    case 'UPDATE_STEP3':
      return {
        ...state,
        formData: {
          ...state.formData,
          step3: { ...state.formData.step3, ...action.payload },
        },
        hasUnsavedChanges: true,
      };

    case 'SET_PORTFOLIO_ID':
      return {
        ...state,
        portfolioId: action.payload,
      };

    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.payload,
      };

    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: {},
      };

    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.payload,
      };

    case 'SET_UNSAVED_CHANGES':
      return {
        ...state,
        hasUnsavedChanges: action.payload,
      };

    case 'RESET_FORM':
      return {
        ...initialState,
        formData: initialFormData,
        hasUnsavedChanges: false,
      };

    case 'LOAD_FROM_STORAGE':
      return {
        ...state,
        formData: action.payload,
      };

    default:
      return state;
  }
}

// Context
interface PortfolioCreationContextType {
  state: PortfolioCreationState;
  dispatch: React.Dispatch<PortfolioCreationAction>;
  setStep: (step: number) => void;
  updateStep1: (data: Partial<Step1Data>) => void;
  updateStep2: (data: Partial<Step2Data>) => void;
  updateStep3: (data: Partial<Step3Data>) => void;
  setPortfolioId: (portfolioId: string | null) => void;
  setErrors: (errors: Record<string, string>) => void;
  clearErrors: () => void;
  setSubmitting: (submitting: boolean) => void;
  setUnsavedChanges: (hasChanges: boolean) => void;
  resetForm: () => void;
  saveToStorage: () => void;
  loadFromStorage: () => void;
  clearStorage: () => void;
  isStepValid: (step: number) => boolean;
  canProceedToStep: (step: number) => boolean;
}

const PortfolioCreationContext = createContext<PortfolioCreationContextType | undefined>(
  undefined
);

// Storage key
const STORAGE_KEY = 'spotlight-portfolio-creation';

// Provider component
export function PortfolioCreationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(portfolioCreationReducer, initialState);

  // Helper functions
  const setStep = (step: number) => {
    dispatch({ type: 'SET_STEP', payload: step });
  };

  const updateStep1 = (data: Partial<Step1Data>) => {
    dispatch({ type: 'UPDATE_STEP1', payload: data });
  };

  const updateStep2 = (data: Partial<Step2Data>) => {
    dispatch({ type: 'UPDATE_STEP2', payload: data });
  };

  const updateStep3 = (data: Partial<Step3Data>) => {
    dispatch({ type: 'UPDATE_STEP3', payload: data });
  };

  const setPortfolioId = (portfolioId: string | null) => {
    dispatch({ type: 'SET_PORTFOLIO_ID', payload: portfolioId });
  };

  const setErrors = (errors: Record<string, string>) => {
    dispatch({ type: 'SET_ERRORS', payload: errors });
  };

  const clearErrors = () => {
    dispatch({ type: 'CLEAR_ERRORS' });
  };

  const setSubmitting = (submitting: boolean) => {
    dispatch({ type: 'SET_SUBMITTING', payload: submitting });
  };

  const setUnsavedChanges = (hasChanges: boolean) => {
    dispatch({ type: 'SET_UNSAVED_CHANGES', payload: hasChanges });
  };

  const resetForm = () => {
    dispatch({ type: 'RESET_FORM' });
    clearStorage();
  };

  // Storage functions
  const saveToStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state.formData));
      } catch (error) {
        console.error('Failed to save form data to storage:', error);
      }
    }
  }, [state.formData]);

  const loadFromStorage = () => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          dispatch({ type: 'LOAD_FROM_STORAGE', payload: data });
        }
      } catch (error) {
        console.error('Failed to load form data from storage:', error);
      }
    }
  };

  const clearStorage = () => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error('Failed to clear form data from storage:', error);
      }
    }
  };

  // Validation functions
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return (
          state.formData.step1.full_name.trim().length >= 2 &&
          state.formData.step1.email.includes('@') &&
          !!state.formData.step1.profession
        );
      case 2:
        return !!state.formData.step2.template_type;
      case 3:
        return (
          state.formData.step3.title.trim().length >= 3 &&
          state.formData.step3.bio.trim().length >= 10
        );
      default:
        return false;
    }
  };

  const canProceedToStep = (step: number): boolean => {
    if (step <= 1) return true;
    
    // Check if all previous steps are valid
    for (let i = 1; i < step; i++) {
      if (!isStepValid(i)) return false;
    }
    return true;
  };

  // Load from storage on mount
  useEffect(() => {
    loadFromStorage();
  }, []);

  // Auto-save to storage when form data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToStorage();
    }, 500); // Debounce saves

    return () => clearTimeout(timeoutId);
  }, [state.formData, saveToStorage]);

  const contextValue: PortfolioCreationContextType = {
    state,
    dispatch,
    setStep,
    updateStep1,
    updateStep2,
    updateStep3,
    setPortfolioId,
    setErrors,
    clearErrors,
    setSubmitting,
    setUnsavedChanges,
    resetForm,
    saveToStorage,
    loadFromStorage,
    clearStorage,
    isStepValid,
    canProceedToStep,
  };

  return (
    <PortfolioCreationContext.Provider value={contextValue}>
      {children}
    </PortfolioCreationContext.Provider>
  );
}

// Hook to use the context
export function usePortfolioCreation() {
  const context = useContext(PortfolioCreationContext);
  if (context === undefined) {
    throw new Error('usePortfolioCreation must be used within a PortfolioCreationProvider');
  }
  return context;
}