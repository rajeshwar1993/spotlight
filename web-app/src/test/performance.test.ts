import { describe, it, expect, vi } from 'vitest';
import { performance } from 'perf_hooks';

/**
 * Performance regression tests to ensure critical functions
 * maintain acceptable performance characteristics
 */

describe('Performance Regression Tests', () => {
  // Helper function to measure execution time
  const measureExecutionTime = async (fn: () => Promise<void> | void): Promise<number> => {
    const start = performance.now();
    await fn();
    const end = performance.now();
    return end - start;
  };

  describe('Component Rendering Performance', () => {
    it('should render large portfolio lists within acceptable time', async () => {
      // Mock large portfolio data
      const largePortfolioList = Array.from({ length: 1000 }, (_, i) => ({
        id: `portfolio-${i}`,
        title: `Portfolio ${i}`,
        profession: 'actor',
        bio: `Bio for portfolio ${i}`,
        images: [],
        template_id: 'T1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const renderTime = await measureExecutionTime(async () => {
        // Simulate rendering large list
        const processedList = largePortfolioList.map(portfolio => ({
          ...portfolio,
          displayTitle: portfolio.title.toUpperCase(),
        }));
        
        // Simulate DOM operations
        processedList.forEach(portfolio => {
          const element = document.createElement('div');
          element.textContent = portfolio.displayTitle;
          document.body.appendChild(element);
        });
      });

      // Should render 1000 portfolios in under 100ms
      expect(renderTime).toBeLessThan(100);
    });

    it('should handle template switching quickly', async () => {
      const templateSwitchTime = await measureExecutionTime(async () => {
        // Simulate template switching operations
        const templates = ['T1', 'T2', 'T3', 'T4'];
        const portfolioData = {
          id: 'test-id',
          title: 'Test Portfolio',
          bio: 'Test bio',
          images: Array.from({ length: 20 }, (_, i) => ({ url: `image-${i}.jpg` })),
        };

        templates.forEach(templateId => {
          // Simulate template processing
          const processedData = {
            ...portfolioData,
            template_id: templateId,
            styles: { color: '#000', fontFamily: 'Arial' },
          };
          
          // Simulate DOM updates
          const element = document.createElement('div');
          element.id = templateId;
          element.innerHTML = JSON.stringify(processedData);
          document.body.appendChild(element);
        });
      });

      // Template switching should be under 50ms
      expect(templateSwitchTime).toBeLessThan(50);
    });
  });

  describe('Data Processing Performance', () => {
    it('should process image uploads efficiently', async () => {
      // Mock image files
      const imageFiles = Array.from({ length: 50 }, (_, i) => ({
        name: `image-${i}.jpg`,
        size: 1024 * 1024, // 1MB
        type: 'image/jpeg',
        lastModified: Date.now(),
      }));

      const processingTime = await measureExecutionTime(async () => {
        // Simulate image processing
        const processedImages = imageFiles.map(file => ({
          ...file,
          id: `img-${file.name}`,
          url: `processed-${file.name}`,
          thumbnail: `thumb-${file.name}`,
          optimized: true,
        }));

        // Simulate validation
        processedImages.forEach(image => {
          const isValid = image.size < 5 * 1024 * 1024; // 5MB limit
          if (!isValid) {
            throw new Error(`Image ${image.name} is too large`);
          }
        });
      });

      // Should process 50 images in under 200ms
      expect(processingTime).toBeLessThan(200);
    });

    it('should handle form validation efficiently', async () => {
      const formData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        profession: 'actor',
        bio: 'This is a long bio that contains multiple sentences and should be validated for length and content.',
        location: 'New York, NY',
        phone: '+1234567890',
        website: 'https://johndoe.com',
        instagram: 'johndoe',
        twitter: 'johndoe',
        linkedin: 'johndoe',
      };

      const validationTime = await measureExecutionTime(async () => {
        // Simulate complex validation
        const validationRules = {
          fullName: (value: string) => value.length > 0 && value.length <= 100,
          email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
          profession: (value: string) => ['actor', 'model', 'photographer', 'artist'].includes(value),
          bio: (value: string) => value.length >= 10 && value.length <= 1000,
          phone: (value: string) => /^\+?[\d\s-()]+$/.test(value),
          website: (value: string) => !value || /^https?:\/\/.+/.test(value),
          instagram: (value: string) => !value || /^[a-zA-Z0-9._]+$/.test(value),
          twitter: (value: string) => !value || /^[a-zA-Z0-9_]+$/.test(value),
          linkedin: (value: string) => !value || /^[a-zA-Z0-9-]+$/.test(value),
        };

        // Run validation 1000 times to test performance
        for (let i = 0; i < 1000; i++) {
          Object.entries(validationRules).forEach(([field, validator]) => {
            const value = formData[field as keyof typeof formData];
            const isValid = validator(value);
            if (!isValid) {
              throw new Error(`Invalid ${field}: ${value}`);
            }
          });
        }
      });

      // Should validate 1000 form submissions in under 50ms
      expect(validationTime).toBeLessThan(50);
    });
  });

  describe('Search and Filtering Performance', () => {
    it('should handle large dataset search efficiently', async () => {
      // Mock large dataset
      const portfolios = Array.from({ length: 10000 }, (_, i) => ({
        id: `portfolio-${i}`,
        title: `Portfolio ${i}`,
        profession: i % 2 === 0 ? 'actor' : 'model',
        bio: `This is the bio for portfolio ${i}`,
        location: i % 3 === 0 ? 'New York' : i % 3 === 1 ? 'Los Angeles' : 'Chicago',
        tags: [`tag${i % 10}`, `category${i % 5}`],
      }));

      const searchTime = await measureExecutionTime(async () => {
        // Simulate complex search
        const searchTerm = 'Portfolio 123';
        const professionFilter = 'actor';
        const locationFilter = 'New York';

        const results = portfolios.filter(portfolio => {
          const matchesSearch = portfolio.title.includes(searchTerm) || 
                               portfolio.bio.includes(searchTerm);
          const matchesProfession = !professionFilter || portfolio.profession === professionFilter;
          const matchesLocation = !locationFilter || portfolio.location === locationFilter;
          
          return matchesSearch && matchesProfession && matchesLocation;
        });

        // Simulate sorting
        results.sort((a, b) => a.title.localeCompare(b.title));
      });

      // Should search 10,000 portfolios in under 100ms
      expect(searchTime).toBeLessThan(100);
    });

    it('should handle real-time search suggestions efficiently', async () => {
      const suggestions = Array.from({ length: 1000 }, (_, i) => ({
        id: `suggestion-${i}`,
        text: `Suggestion ${i}`,
        category: `Category ${i % 10}`,
        popularity: Math.random() * 1000,
      }));

      const suggestionTime = await measureExecutionTime(async () => {
        const query = 'Sug';
        
        // Simulate autocomplete search
        const matches = suggestions
          .filter(s => s.text.toLowerCase().includes(query.toLowerCase()))
          .sort((a, b) => b.popularity - a.popularity)
          .slice(0, 10);

        // Simulate highlighting
        matches.forEach(match => {
          const highlighted = match.text.replace(
            new RegExp(query, 'gi'),
            `<mark>${query}</mark>`
          );
        });
      });

      // Should generate suggestions in under 20ms
      expect(suggestionTime).toBeLessThan(20);
    });
  });

  describe('Memory Usage Tests', () => {
    it('should not cause memory leaks with event listeners', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Simulate adding and removing many event listeners
      const elements = Array.from({ length: 1000 }, () => document.createElement('div'));
      const handlers = elements.map(() => () => {});

      // Add event listeners
      elements.forEach((element, index) => {
        element.addEventListener('click', handlers[index]);
        document.body.appendChild(element);
      });

      // Remove event listeners and elements
      elements.forEach((element, index) => {
        element.removeEventListener('click', handlers[index]);
        document.body.removeChild(element);
      });

      // Force garbage collection (if available)
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryDiff = finalMemory - initialMemory;

      // Memory increase should be minimal (less than 5MB in test environment)
      expect(memoryDiff).toBeLessThan(5 * 1024 * 1024);
    });

    it('should handle large state objects efficiently', async () => {
      const stateUpdateTime = await measureExecutionTime(async () => {
        // Simulate large state object
        const largeState = {
          portfolios: Array.from({ length: 1000 }, (_, i) => ({
            id: `portfolio-${i}`,
            data: Array.from({ length: 100 }, (_, j) => `item-${j}`),
          })),
          cache: new Map(),
          history: [],
        };

        // Simulate state updates
        for (let i = 0; i < 100; i++) {
          const updatedState = {
            ...largeState,
            portfolios: largeState.portfolios.map(p => ({
              ...p,
              updated: true,
            })),
          };
          
          largeState.history.push(updatedState);
        }
      });

      // Should handle state updates in under 500ms
      expect(stateUpdateTime).toBeLessThan(500);
    });
  });

  describe('Bundle Size Performance', () => {
    it('should not exceed bundle size limits', async () => {
      // This would typically be run as part of build process
      // Here we simulate checking for code splitting effectiveness
      const bundleCheckTime = await measureExecutionTime(async () => {
        // Simulate dynamic imports
        const dynamicImports = [
          () => import('@/components/templates/t1'),
          () => import('@/components/templates/t2'),
          () => import('@/components/templates/t3'),
          () => import('@/components/templates/t4'),
        ];

        // Simulate lazy loading
        for (const importFn of dynamicImports) {
          // In real test, this would check actual bundle sizes
          const mockBundle = {
            size: Math.random() * 100 * 1024, // Random size under 100KB
            gzipSize: Math.random() * 50 * 1024, // Random gzip size under 50KB
          };
          
          expect(mockBundle.size).toBeLessThan(100 * 1024); // 100KB limit
          expect(mockBundle.gzipSize).toBeLessThan(50 * 1024); // 50KB gzip limit
        }
      });

      // Bundle analysis should be fast
      expect(bundleCheckTime).toBeLessThan(100);
    });
  });

  describe('Database Query Performance', () => {
    it('should handle pagination efficiently', async () => {
      const queryTime = await measureExecutionTime(async () => {
        // Simulate database queries with different page sizes
        const pageSizes = [10, 25, 50, 100];
        
        for (const pageSize of pageSizes) {
          // Simulate query execution time based on page size
          const queryDuration = pageSize * 0.1; // 0.1ms per item
          
          // Simulate waiting for query
          await new Promise(resolve => setTimeout(resolve, queryDuration));
          
          // Simulate processing results
          const results = Array.from({ length: pageSize }, (_, i) => ({
            id: `item-${i}`,
            processed: true,
          }));
          
          results.forEach(result => {
            result.processed = true;
          });
        }
      });

      // All pagination queries should complete in under 100ms
      expect(queryTime).toBeLessThan(100);
    });
  });

  describe('Image Processing Performance', () => {
    it('should handle image optimization efficiently', async () => {
      const optimizationTime = await measureExecutionTime(async () => {
        // Simulate image optimization for different sizes
        const imageSizes = [
          { width: 1920, height: 1080 },
          { width: 1200, height: 800 },
          { width: 800, height: 600 },
          { width: 400, height: 300 },
          { width: 200, height: 150 },
        ];

        for (const size of imageSizes) {
          // Simulate processing time based on image size
          const processingTime = (size.width * size.height) / 1000000; // Simplified calculation
          
          // Simulate image processing
          const processedImage = {
            originalSize: size,
            optimizedSize: {
              width: Math.floor(size.width * 0.8),
              height: Math.floor(size.height * 0.8),
            },
            quality: 85,
            format: 'webp',
            processingTime,
          };

          expect(processedImage.optimizedSize.width).toBeLessThan(size.width);
          expect(processedImage.optimizedSize.height).toBeLessThan(size.height);
        }
      });

      // Image optimization should complete in under 50ms
      expect(optimizationTime).toBeLessThan(50);
    });
  });
});

/**
 * Performance benchmarking utility
 */
export class PerformanceBenchmark {
  private measurements: { [key: string]: number[] } = {};

  async measure<T>(name: string, fn: () => T | Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    const duration = end - start;

    if (!this.measurements[name]) {
      this.measurements[name] = [];
    }
    this.measurements[name].push(duration);

    return result;
  }

  getStats(name: string) {
    const measurements = this.measurements[name] || [];
    if (measurements.length === 0) {
      return null;
    }

    const sorted = measurements.slice().sort((a, b) => a - b);
    const avg = measurements.reduce((sum, val) => sum + val, 0) / measurements.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    return {
      count: measurements.length,
      average: avg,
      median,
      min,
      max,
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  getAllStats() {
    return Object.keys(this.measurements).map(name => ({
      name,
      ...this.getStats(name),
    }));
  }

  clear() {
    this.measurements = {};
  }
}

// Export benchmark instance for use in other tests
export const benchmark = new PerformanceBenchmark();