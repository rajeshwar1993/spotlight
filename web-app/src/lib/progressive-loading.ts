/**
 * Progressive loading system for templates and heavy components
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface ProgressiveLoadingState {
  isLoading: boolean;
  isLoaded: boolean;
  error: Error | null;
  progress: number;
}

export interface ProgressiveLoadingOptions {
  // Delay before starting to load (in ms)
  loadDelay?: number;
  // Timeout for loading (in ms)
  loadTimeout?: number;
  // Whether to load immediately or wait for user interaction
  immediate?: boolean;
  // Whether to use intersection observer
  useIntersectionObserver?: boolean;
  // Intersection observer options
  intersectionOptions?: IntersectionObserverInit;
  // Fallback component while loading
  fallback?: React.ComponentType;
  // Error component on failure
  errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
}

/**
 * Hook for progressive loading of components
 */
export const useProgressiveLoading = <T>(
  importFn: () => Promise<{ default: T }>,
  options: ProgressiveLoadingOptions = {}
) => {
  const [state, setState] = useState<ProgressiveLoadingState>({
    isLoading: false,
    isLoaded: false,
    error: null,
    progress: 0,
  });

  const [component, setComponent] = useState<T | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  const load = useCallback(async () => {
    if (state.isLoaded || state.isLoading) return;

    setState(prev => ({ ...prev, isLoading: true, error: null, progress: 0 }));

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + Math.random() * 30, 90)
        }));
      }, 100);

      // Set timeout if specified
      if (options.loadTimeout) {
        timeoutRef.current = setTimeout(() => {
          abortControllerRef.current?.abort();
          throw new Error('Loading timeout');
        }, options.loadTimeout);
      }

      // Load the component
      const module = await importFn();
      
      // Clear interval and timeout
      clearInterval(progressInterval);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Check if aborted
      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Loading aborted');
      }

      setComponent(module.default);
      setState(prev => ({
        ...prev,
        isLoading: false,
        isLoaded: true,
        progress: 100
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error as Error,
        progress: 0
      }));
    }
  }, [importFn, options.loadTimeout, state.isLoaded, state.isLoading]);

  const retry = useCallback(() => {
    setState({
      isLoading: false,
      isLoaded: false,
      error: null,
      progress: 0,
    });
    setComponent(null);
    load();
  }, [load]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setState({
      isLoading: false,
      isLoaded: false,
      error: null,
      progress: 0,
    });
  }, []);

  useEffect(() => {
    if (options.immediate) {
      if (options.loadDelay) {
        timeoutRef.current = setTimeout(load, options.loadDelay);
      } else {
        load();
      }
    }

    return () => {
      cancel();
    };
  }, [load, cancel, options.immediate, options.loadDelay]);

  return {
    ...state,
    component,
    load,
    retry,
    cancel,
  };
};

/**
 * Hook for intersection observer-based progressive loading
 */
export const useIntersectionProgressiveLoading = <T>(
  importFn: () => Promise<{ default: T }>,
  options: ProgressiveLoadingOptions = {}
) => {
  const [elementRef, setElementRef] = useState<Element | null>(null);
  const loading = useProgressiveLoading(importFn, {
    ...options,
    immediate: false,
  });

  useEffect(() => {
    if (!elementRef || !options.useIntersectionObserver) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loading.load();
          observer.disconnect();
        }
      },
      options.intersectionOptions || { threshold: 0.1 }
    );

    observer.observe(elementRef);

    return () => observer.disconnect();
  }, [elementRef, loading.load, options.useIntersectionObserver, options.intersectionOptions]);

  return {
    ...loading,
    setElementRef,
  };
};

/**
 * Progressive template loader
 */
export class ProgressiveTemplateLoader {
  private loadedTemplates = new Map<string, any>();
  private loadingPromises = new Map<string, Promise<any>>();

  async loadTemplate(templateId: string): Promise<any> {
    // Return cached template if already loaded
    if (this.loadedTemplates.has(templateId)) {
      return this.loadedTemplates.get(templateId);
    }

    // Return existing promise if already loading
    if (this.loadingPromises.has(templateId)) {
      return this.loadingPromises.get(templateId);
    }

    // Create loading promise
    const loadingPromise = this.createLoadingPromise(templateId);
    this.loadingPromises.set(templateId, loadingPromise);

    try {
      const template = await loadingPromise;
      this.loadedTemplates.set(templateId, template);
      this.loadingPromises.delete(templateId);
      return template;
    } catch (error) {
      this.loadingPromises.delete(templateId);
      throw error;
    }
  }

  private async createLoadingPromise(templateId: string) {
    const importMap: Record<string, () => Promise<any>> = {
      't1': () => import('@/components/templates/t1'),
      't2': () => import('@/components/templates/t2'),
      't3': () => import('@/components/templates/t3'),
      't4': () => import('@/components/templates/t4'),
    };

    const importFn = importMap[templateId];
    if (!importFn) {
      throw new Error(`Template ${templateId} not found`);
    }

    return importFn();
  }

  preloadTemplate(templateId: string): void {
    if (!this.loadedTemplates.has(templateId) && !this.loadingPromises.has(templateId)) {
      this.loadTemplate(templateId).catch(() => {
        // Ignore preload errors
      });
    }
  }

  preloadAllTemplates(): void {
    ['t1', 't2', 't3', 't4'].forEach(templateId => {
      this.preloadTemplate(templateId);
    });
  }

  clearCache(): void {
    this.loadedTemplates.clear();
    this.loadingPromises.clear();
  }

  getLoadedTemplates(): string[] {
    return Array.from(this.loadedTemplates.keys());
  }
}

/**
 * Progressive component loader for multi-step forms
 */
export class ProgressiveFormLoader {
  private loadedSteps = new Map<number, any>();
  private preloadQueue: number[] = [];

  async loadStep(stepNumber: number): Promise<any> {
    if (this.loadedSteps.has(stepNumber)) {
      return this.loadedSteps.get(stepNumber);
    }

    const importMap: Record<number, () => Promise<any>> = {
      1: () => import('@/components/portfolio/create/step-1-basic-info'),
      2: () => import('@/components/portfolio/create/step-2-template-selection'),
      3: () => import('@/components/portfolio/create/step-3-bio-details'),
      4: () => import('@/components/portfolio/create/step-4-image-upload'),
    };

    const importFn = importMap[stepNumber];
    if (!importFn) {
      throw new Error(`Step ${stepNumber} not found`);
    }

    const module = await importFn();
    this.loadedSteps.set(stepNumber, module.default);
    return module.default;
  }

  preloadNextStep(currentStep: number): void {
    const nextStep = currentStep + 1;
    if (nextStep <= 4 && !this.loadedSteps.has(nextStep)) {
      this.loadStep(nextStep).catch(() => {
        // Ignore preload errors
      });
    }
  }

  preloadPreviousStep(currentStep: number): void {
    const previousStep = currentStep - 1;
    if (previousStep >= 1 && !this.loadedSteps.has(previousStep)) {
      this.loadStep(previousStep).catch(() => {
        // Ignore preload errors
      });
    }
  }

  preloadAdjacentSteps(currentStep: number): void {
    this.preloadNextStep(currentStep);
    this.preloadPreviousStep(currentStep);
  }

  clearCache(): void {
    this.loadedSteps.clear();
  }
}

/**
 * Resource priority loader
 */
export class ResourcePriorityLoader {
  private loadQueue: Array<{
    priority: 'high' | 'medium' | 'low';
    importFn: () => Promise<any>;
    id: string;
  }> = [];

  private isProcessing = false;
  private loadedResources = new Set<string>();

  addToQueue(
    importFn: () => Promise<any>,
    id: string,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): void {
    if (this.loadedResources.has(id)) return;

    this.loadQueue.push({ priority, importFn, id });
    this.sortQueue();
    this.processQueue();
  }

  private sortQueue(): void {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    this.loadQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.loadQueue.length === 0) return;

    this.isProcessing = true;

    while (this.loadQueue.length > 0) {
      const item = this.loadQueue.shift()!;
      
      try {
        await item.importFn();
        this.loadedResources.add(item.id);
      } catch (error) {
        console.error(`Failed to load resource ${item.id}:`, error);
      }

      // Add small delay to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    this.isProcessing = false;
  }

  clearQueue(): void {
    this.loadQueue = [];
    this.loadedResources.clear();
  }
}

/**
 * Global instances
 */
export const progressiveTemplateLoader = new ProgressiveTemplateLoader();
export const progressiveFormLoader = new ProgressiveFormLoader();
export const resourcePriorityLoader = new ResourcePriorityLoader();

/**
 * Progressive loading utilities
 */
export const progressiveUtils = {
  /**
   * Load component with fallback
   */
  loadWithFallback: async <T>(
    primaryImport: () => Promise<{ default: T }>,
    fallbackImport: () => Promise<{ default: T }>
  ): Promise<T> => {
    try {
      const module = await primaryImport();
      return module.default;
    } catch (error) {
      console.warn('Primary import failed, using fallback:', error);
      const fallbackModule = await fallbackImport();
      return fallbackModule.default;
    }
  },

  /**
   * Load with timeout
   */
  loadWithTimeout: async <T>(
    importFn: () => Promise<{ default: T }>,
    timeout: number = 5000
  ): Promise<T> => {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Import timeout')), timeout);
    });

    const module = await Promise.race([importFn(), timeoutPromise]);
    return module.default;
  },

  /**
   * Load with retry logic
   */
  loadWithRetry: async <T>(
    importFn: () => Promise<{ default: T }>,
    maxRetries: number = 3,
    retryDelay: number = 1000
  ): Promise<T> => {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const module = await importFn();
        return module.default;
      } catch (error) {
        lastError = error as Error;
        
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    throw lastError!;
  },

  /**
   * Batch load multiple components
   */
  batchLoad: async <T>(
    importFns: Array<() => Promise<{ default: T }>>,
    options: {
      concurrency?: number;
      failFast?: boolean;
    } = {}
  ): Promise<T[]> => {
    const { concurrency = 3, failFast = false } = options;
    const results: T[] = [];
    const errors: Error[] = [];

    for (let i = 0; i < importFns.length; i += concurrency) {
      const batch = importFns.slice(i, i + concurrency);
      const batchPromises = batch.map(async (importFn, index) => {
        try {
          const module = await importFn();
          return { success: true, result: module.default, index: i + index };
        } catch (error) {
          return { success: false, error: error as Error, index: i + index };
        }
      });

      const batchResults = await Promise.all(batchPromises);

      for (const result of batchResults) {
        if (result.success) {
          results[result.index] = result.result;
        } else {
          errors.push(result.error);
          if (failFast) {
            throw result.error;
          }
        }
      }
    }

    if (errors.length > 0 && results.length === 0) {
      throw errors[0];
    }

    return results;
  },
};