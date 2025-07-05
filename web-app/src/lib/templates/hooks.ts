import { useState, useEffect, useMemo, useCallback } from 'react';
import type { TemplateType, PortfolioData } from './types';
import { getTemplateConfig, getTemplatePreviewData, validateTemplateData } from './registry';
import { calculatePortfolioCompletion, validatePortfolioData, getTemplateRecommendations } from './utils';

/**
 * React hooks for template system
 */

/**
 * Hook for template configuration and metadata
 */
export function useTemplateConfig(templateType: TemplateType) {
  const config = useMemo(() => getTemplateConfig(templateType), [templateType]);
  const previewData = useMemo(() => getTemplatePreviewData(templateType), [templateType]);

  return {
    config,
    previewData,
    isLoading: false,
    error: !config ? new Error(`Template ${templateType} not found`) : null
  };
}

/**
 * Hook for template validation
 */
export function useTemplateValidation(data: PortfolioData, templateType: TemplateType) {
  const validation = useMemo(() => {
    return validatePortfolioData(data, templateType);
  }, [data, templateType]);

  const templateValidation = useMemo(() => {
    return validateTemplateData(data, templateType);
  }, [data, templateType]);

  return {
    isValid: validation.isValid && templateValidation.isValid,
    errors: [...validation.errors, ...templateValidation.errors],
    warnings: validation.warnings,
    validation,
    templateValidation
  };
}

/**
 * Hook for portfolio completion tracking
 */
export function usePortfolioCompletion(data: PortfolioData) {
  const completion = useMemo(() => {
    return calculatePortfolioCompletion(data);
  }, [data]);

  return {
    percentage: completion.percentage,
    completed: completion.completed,
    missing: completion.missing,
    isComplete: completion.percentage >= 80
  };
}

/**
 * Hook for template recommendations
 */
export function useTemplateRecommendations(templateType: TemplateType, data: PortfolioData) {
  const recommendations = useMemo(() => {
    return getTemplateRecommendations(templateType, data);
  }, [templateType, data]);

  return recommendations;
}

/**
 * Hook for template selection and comparison
 */
export function useTemplateSelection(initialTemplate?: TemplateType) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(initialTemplate || null);
  const [comparisonTemplates, setComparisonTemplates] = useState<TemplateType[]>([]);

  const addToComparison = useCallback((templateType: TemplateType) => {
    setComparisonTemplates(prev => {
      if (prev.includes(templateType)) return prev;
      return [...prev, templateType].slice(0, 3); // Max 3 templates for comparison
    });
  }, []);

  const removeFromComparison = useCallback((templateType: TemplateType) => {
    setComparisonTemplates(prev => prev.filter(t => t !== templateType));
  }, []);

  const clearComparison = useCallback(() => {
    setComparisonTemplates([]);
  }, []);

  return {
    selectedTemplate,
    setSelectedTemplate,
    comparisonTemplates,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison: (templateType: TemplateType) => comparisonTemplates.includes(templateType)
  };
}

/**
 * Hook for template preview modes
 */
export function useTemplatePreview() {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMetadata, setShowMetadata] = useState(true);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const toggleMetadata = useCallback(() => {
    setShowMetadata(prev => !prev);
  }, []);

  return {
    previewMode,
    setPreviewMode,
    isFullscreen,
    setIsFullscreen,
    toggleFullscreen,
    showMetadata,
    setShowMetadata,
    toggleMetadata
  };
}

/**
 * Hook for template data management
 */
export function useTemplateData(initialData?: PortfolioData) {
  const [data, setData] = useState<PortfolioData | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateData = useCallback((updates: Partial<PortfolioData>) => {
    setData(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const updateUser = useCallback((userUpdates: Partial<PortfolioData['user']>) => {
    setData(prev => prev ? {
      ...prev,
      user: { ...prev.user, ...userUpdates }
    } : null);
  }, []);

  const updatePortfolio = useCallback((portfolioUpdates: Partial<PortfolioData['portfolio']>) => {
    setData(prev => prev ? {
      ...prev,
      portfolio: { ...prev.portfolio, ...portfolioUpdates }
    } : null);
  }, []);

  const updateImages = useCallback((imageUpdates: Partial<PortfolioData['images']>) => {
    setData(prev => prev ? {
      ...prev,
      images: { ...prev.images, ...imageUpdates }
    } : null);
  }, []);

  const updateContactInfo = useCallback((contactUpdates: Partial<PortfolioData['contact_info']>) => {
    setData(prev => prev ? {
      ...prev,
      contact_info: { ...prev.contact_info, ...contactUpdates }
    } : null);
  }, []);

  const updateSocialLinks = useCallback((socialUpdates: Partial<PortfolioData['social_links']>) => {
    setData(prev => prev ? {
      ...prev,
      social_links: { ...prev.social_links, ...socialUpdates }
    } : null);
  }, []);

  const resetData = useCallback(() => {
    setData(initialData || null);
    setError(null);
  }, [initialData]);

  return {
    data,
    setData,
    updateData,
    updateUser,
    updatePortfolio,
    updateImages,
    updateContactInfo,
    updateSocialLinks,
    resetData,
    isLoading,
    setIsLoading,
    error,
    setError
  };
}

/**
 * Hook for template loading and caching
 */
export function useTemplateLoader() {
  const [loadedTemplates, setLoadedTemplates] = useState<Set<TemplateType>>(new Set());
  const [loadingTemplates, setLoadingTemplates] = useState<Set<TemplateType>>(new Set());

  const loadTemplate = useCallback(async (templateType: TemplateType) => {
    if (loadedTemplates.has(templateType) || loadingTemplates.has(templateType)) {
      return;
    }

    setLoadingTemplates(prev => new Set([...prev, templateType]));

    try {
      // Dynamically import template component
      switch (templateType) {
        case 'T1':
          await import('../components/templates/t1');
          break;
        case 'T2':
          await import('../components/templates/t2');
          break;
        case 'T3':
          await import('../components/templates/t3');
          break;
        case 'T4':
          await import('../components/templates/t4');
          break;
      }

      setLoadedTemplates(prev => new Set([...prev, templateType]));
    } catch (error) {
      console.error(`Failed to load template ${templateType}:`, error);
    } finally {
      setLoadingTemplates(prev => {
        const next = new Set(prev);
        next.delete(templateType);
        return next;
      });
    }
  }, [loadedTemplates, loadingTemplates]);

  const preloadAllTemplates = useCallback(async () => {
    const allTemplates: TemplateType[] = ['T1', 'T2', 'T3', 'T4'];
    await Promise.all(allTemplates.map(loadTemplate));
  }, [loadTemplate]);

  return {
    loadedTemplates,
    loadingTemplates,
    loadTemplate,
    preloadAllTemplates,
    isLoaded: (templateType: TemplateType) => loadedTemplates.has(templateType),
    isLoading: (templateType: TemplateType) => loadingTemplates.has(templateType)
  };
}

/**
 * Hook for template analytics and performance
 */
export function useTemplateAnalytics(templateType: TemplateType) {
  const [analytics, setAnalytics] = useState({
    views: 0,
    renderTime: 0,
    errors: 0,
    lastViewed: null as Date | null
  });

  const trackView = useCallback(() => {
    setAnalytics(prev => ({
      ...prev,
      views: prev.views + 1,
      lastViewed: new Date()
    }));
  }, []);

  const trackRenderTime = useCallback((time: number) => {
    setAnalytics(prev => ({
      ...prev,
      renderTime: time
    }));
  }, []);

  const trackError = useCallback(() => {
    setAnalytics(prev => ({
      ...prev,
      errors: prev.errors + 1
    }));
  }, []);

  return {
    analytics,
    trackView,
    trackRenderTime,
    trackError
  };
}