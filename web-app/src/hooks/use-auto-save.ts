import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AutoSaveOptions<T> {
  delay?: number;
  onSave: (data: T) => Promise<void>;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

interface AutoSaveState {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
  error: string | null;
}

export function useAutoSave<T>(
  data: T,
  options: AutoSaveOptions<T>
) {
  const { delay = 2000, onSave, onError, enabled = true } = options;
  const { toast } = useToast();
  
  const [state, setState] = useState<AutoSaveState>({
    status: 'idle',
    lastSaved: null,
    error: null
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef<T>(data);
  const isSavingRef = useRef(false);

  const saveData = useCallback(async (dataToSave: T) => {
    if (isSavingRef.current) return;
    
    try {
      isSavingRef.current = true;
      setState(prev => ({ ...prev, status: 'saving', error: null }));
      
      await onSave(dataToSave);
      
      setState(prev => ({
        ...prev,
        status: 'saved',
        lastSaved: new Date(),
        error: null
      }));

      // Show success toast briefly
      toast({
        title: "Saved",
        description: "Changes have been saved automatically",
        duration: 2000,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Save failed';
      
      setState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage
      }));

      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMessage));
      }

      toast({
        title: "Save failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave, onError, toast]);

  const scheduleAutoSave = useCallback((dataToSave: T) => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Schedule new save
    timeoutRef.current = setTimeout(() => {
      saveData(dataToSave);
    }, delay);
  }, [enabled, delay, saveData]);

  const forceSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    saveData(data);
  }, [data, saveData]);

  const resetState = useCallback(() => {
    setState({
      status: 'idle',
      lastSaved: null,
      error: null
    });
  }, []);

  // Auto-save when data changes
  useEffect(() => {
    const hasDataChanged = JSON.stringify(data) !== JSON.stringify(previousDataRef.current);
    
    if (hasDataChanged && enabled) {
      scheduleAutoSave(data);
      previousDataRef.current = data;
    }
  }, [data, enabled, scheduleAutoSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.status === 'saving' || timeoutRef.current) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.status]);

  return {
    ...state,
    forceSave,
    resetState,
    isAutoSaveEnabled: enabled,
    isPending: state.status === 'saving' || !!timeoutRef.current
  };
}