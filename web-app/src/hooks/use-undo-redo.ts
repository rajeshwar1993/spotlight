import { useCallback, useEffect, useRef, useState } from 'react';

interface UndoRedoAction<T> {
  id: string;
  timestamp: Date;
  description: string;
  data: T;
  fieldPath?: string;
}

interface UndoRedoState<T> {
  canUndo: boolean;
  canRedo: boolean;
  history: UndoRedoAction<T>[];
  currentIndex: number;
  lastAction?: UndoRedoAction<T>;
}

interface UndoRedoOptions {
  maxHistorySize?: number;
  debounceMs?: number;
  enableKeyboardShortcuts?: boolean;
}

export function useUndoRedo<T>(
  initialData: T,
  options: UndoRedoOptions = {}
) {
  const {
    maxHistorySize = 50,
    debounceMs = 500,
    enableKeyboardShortcuts = true
  } = options;

  const [state, setState] = useState<UndoRedoState<T>>({
    canUndo: false,
    canRedo: false,
    history: [],
    currentIndex: -1
  });

  const [currentData, setCurrentData] = useState<T>(initialData);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const isUndoRedoOperationRef = useRef(false);

  const generateActionId = useCallback(() => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const pushToHistory = useCallback((
    data: T,
    description: string,
    fieldPath?: string
  ) => {
    const action: UndoRedoAction<T> = {
      id: generateActionId(),
      timestamp: new Date(),
      description,
      data: JSON.parse(JSON.stringify(data)), // Deep clone
      fieldPath
    };

    setState(prevState => {
      // Remove any redo history when adding new action
      const newHistory = prevState.history.slice(0, prevState.currentIndex + 1);
      
      // Add new action
      newHistory.push(action);
      
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
      }
      
      const newIndex = newHistory.length - 1;
      
      return {
        ...prevState,
        history: newHistory,
        currentIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: false,
        lastAction: action
      };
    });
  }, [maxHistorySize, generateActionId]);

  const saveState = useCallback((
    data: T,
    description: string,
    fieldPath?: string
  ) => {
    if (isUndoRedoOperationRef.current) return;

    // Clear existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce the save operation
    debounceTimeoutRef.current = setTimeout(() => {
      pushToHistory(data, description, fieldPath);
    }, debounceMs);
  }, [pushToHistory, debounceMs]);

  const undo = useCallback(() => {
    if (!state.canUndo) return currentData;

    const newIndex = state.currentIndex - 1;
    const targetAction = state.history[newIndex];
    
    if (targetAction) {
      isUndoRedoOperationRef.current = true;
      const newData = JSON.parse(JSON.stringify(targetAction.data));
      setCurrentData(newData);
      
      setState(prevState => ({
        ...prevState,
        currentIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: true,
        lastAction: targetAction
      }));
      
      // Reset flag after state update
      setTimeout(() => {
        isUndoRedoOperationRef.current = false;
      }, 0);
      
      return newData;
    }
    
    return currentData;
  }, [state.canUndo, state.currentIndex, state.history, currentData]);

  const redo = useCallback(() => {
    if (!state.canRedo) return currentData;

    const newIndex = state.currentIndex + 1;
    const targetAction = state.history[newIndex];
    
    if (targetAction) {
      isUndoRedoOperationRef.current = true;
      const newData = JSON.parse(JSON.stringify(targetAction.data));
      setCurrentData(newData);
      
      setState(prevState => ({
        ...prevState,
        currentIndex: newIndex,
        canUndo: true,
        canRedo: newIndex < prevState.history.length - 1,
        lastAction: targetAction
      }));
      
      // Reset flag after state update
      setTimeout(() => {
        isUndoRedoOperationRef.current = false;
      }, 0);
      
      return newData;
    }
    
    return currentData;
  }, [state.canRedo, state.currentIndex, state.history, currentData]);

  const clear = useCallback(() => {
    setState({
      canUndo: false,
      canRedo: false,
      history: [],
      currentIndex: -1
    });
  }, []);

  const getHistory = useCallback(() => {
    return state.history.map(action => ({
      id: action.id,
      timestamp: action.timestamp,
      description: action.description,
      fieldPath: action.fieldPath
    }));
  }, [state.history]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't trigger shortcuts when typing in inputs
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        (e.metaKey || e.ctrlKey) && 
        (e.key === 'y' || (e.key === 'z' && e.shiftKey))
      ) {
        e.preventDefault();
        redo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, undo, redo]);

  // Initialize with initial data
  useEffect(() => {
    if (state.history.length === 0) {
      pushToHistory(initialData, 'Initial state');
    }
  }, [initialData, pushToHistory, state.history.length]);

  // Cleanup debounce timeout
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Current state
    currentData,
    setCurrentData,
    
    // Actions
    saveState,
    undo,
    redo,
    clear,
    
    // State information
    canUndo: state.canUndo,
    canRedo: state.canRedo,
    lastAction: state.lastAction,
    
    // History
    getHistory,
    historyLength: state.history.length,
    currentIndex: state.currentIndex
  };
}