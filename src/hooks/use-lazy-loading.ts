import { useEffect, useRef, useState, useCallback } from 'react';

export interface LazyLoadingOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  fallbackDelay?: number;
}

export interface LazyLoadingReturn {
  ref: React.RefObject<HTMLElement>;
  isLoading: boolean;
  isVisible: boolean;
  isLoaded: boolean;
  error: Error | null;
  retry: () => void;
}

/**
 * Custom hook for lazy loading images with Intersection Observer
 * Provides loading states and error handling
 */
export function useLazyLoading(
  options: LazyLoadingOptions = {}
): LazyLoadingReturn {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true,
    fallbackDelay = 300,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const ref = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset all states for retry
  const retry = useCallback(() => {
    setError(null);
    setIsLoading(false);
    setIsLoaded(false);
    setRetryCount(prev => prev + 1);
    
    if (isVisible) {
      setIsLoading(true);
    }
  }, [isVisible]);

  // Handle intersection changes
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      
      if (entry.isIntersecting) {
        setIsVisible(true);
        setIsLoading(true);
        
        // Disconnect observer if triggerOnce is true
        if (triggerOnce && observerRef.current) {
          observerRef.current.disconnect();
        }
      } else if (!triggerOnce) {
        setIsVisible(false);
      }
    },
    [triggerOnce]
  );

  // Set up Intersection Observer
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver support
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
        setIsLoading(true);
      }, fallbackDelay);
      return;
    }

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleIntersection, threshold, rootMargin, fallbackDelay, retryCount]);

  // Mark as loaded when image loads successfully
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setIsLoaded(true);
    setError(null);
  }, []);

  // Handle loading errors
  const handleError = useCallback((err: Error) => {
    setIsLoading(false);
    setIsLoaded(false);
    setError(err);
  }, []);

  // Provide methods to components
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleImageLoad = () => handleLoad();
    const handleImageError = () => handleError(new Error('Failed to load image'));

    if (element.tagName === 'IMG') {
      element.addEventListener('load', handleImageLoad);
      element.addEventListener('error', handleImageError);
      
      return () => {
        element.removeEventListener('load', handleImageLoad);
        element.removeEventListener('error', handleImageError);
      };
    }
  }, [handleLoad, handleError, isVisible]);

  return {
    ref,
    isLoading,
    isVisible,
    isLoaded,
    error,
    retry,
  };
}

/**
 * Hook specifically for lazy loading images with src management
 */
export function useLazyImage(
  src: string,
  placeholder?: string,
  options?: LazyLoadingOptions
) {
  const lazyLoading = useLazyLoading(options);
  const [currentSrc, setCurrentSrc] = useState(placeholder || '');
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // Update src when visibility changes
  useEffect(() => {
    if (lazyLoading.isVisible && src && !imageSrc) {
      setImageSrc(src);
    }
  }, [lazyLoading.isVisible, src, imageSrc]);

  // Handle image loading
  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(imageSrc);
      lazyLoading.retry(); // This will trigger the loaded state
    };
    
    img.onerror = () => {
      console.error('Failed to load image:', imageSrc);
      if (placeholder) {
        setCurrentSrc(placeholder);
      }
    };
    
    img.src = imageSrc;
  }, [imageSrc, placeholder, lazyLoading]);

  return {
    ...lazyLoading,
    src: currentSrc,
    isLoading: lazyLoading.isLoading && !lazyLoading.isLoaded,
  };
}

/**
 * Hook for progressive image loading with multiple sources
 */
export function useProgressiveImage(
  sources: string[],
  options?: LazyLoadingOptions
) {
  const lazyLoading = useLazyLoading(options);
  const [currentSrc, setCurrentSrc] = useState('');
  const [loadedSources, setLoadedSources] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);

  // Start loading images when visible
  useEffect(() => {
    if (!lazyLoading.isVisible || sources.length === 0) return;

    const loadImage = (src: string, index: number) => {
      const img = new Image();
      
      img.onload = () => {
        setLoadedSources(prev => new Set([...prev, src]));
        setCurrentSrc(src);
        setCurrentIndex(index);
        
        // If this is the highest quality image, mark as complete
        if (index === sources.length - 1) {
          lazyLoading.retry();
        }
      };
      
      img.onerror = () => {
        console.error('Failed to load image:', src);
        // Try next image if available
        if (index < sources.length - 1) {
          loadImage(sources[index + 1], index + 1);
        }
      };
      
      img.src = src;
    };

    // Start with the first (lowest quality) image
    loadImage(sources[0], 0);

    // Load higher quality images progressively
    sources.forEach((src, index) => {
      if (index > 0) {
        setTimeout(() => loadImage(src, index), index * 100);
      }
    });
  }, [lazyLoading.isVisible, sources, lazyLoading]);

  const isProgressive = currentIndex < sources.length - 1;
  const isComplete = currentIndex === sources.length - 1 && lazyLoading.isLoaded;

  return {
    ...lazyLoading,
    src: currentSrc,
    isProgressive,
    isComplete,
    currentIndex,
    totalImages: sources.length,
  };
}

export default useLazyLoading;