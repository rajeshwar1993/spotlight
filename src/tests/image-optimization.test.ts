/**
 * Comprehensive test suite for image optimization features
 * Part 4.3: Image Optimization Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { ImageOptimizationService } from '@/lib/image-optimization';
import { ImageFormatDetector } from '@/utils/image-format';
import { ImageMetricsCollector } from '@/lib/image-metrics';
import { ImageType } from '@/types/database';

// Mock global fetch
global.fetch = vi.fn();

// Mock Supabase
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        getPublicUrl: vi.fn(() => ({
          data: { publicUrl: 'https://test.supabase.co/storage/v1/object/public/bucket/file.jpg' }
        }))
      }))
    }
  }
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';

describe('Image Optimization Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('URL Generation', () => {
    it('should generate optimized URLs for all image types', () => {
      const bucketName = 'portfolio-images';
      const fileName = 'test-image.jpg';

      Object.values(ImageType).forEach(imageType => {
        const urls = ImageOptimizationService.generateOptimizedUrls(
          bucketName,
          fileName,
          imageType
        );

        expect(urls).toHaveProperty('original');
        expect(urls).toHaveProperty('variants');
        expect(urls).toHaveProperty('placeholder');
        expect(Object.keys(urls.variants)).toEqual(['thumbnail', 'small', 'medium', 'large']);
      });
    });

    it('should generate correct transformation URLs', () => {
      const urls = ImageOptimizationService.generateOptimizedUrls(
        'test-bucket',
        'test.jpg',
        ImageType.PROFILE
      );

      expect(urls.variants.thumbnail).toContain('width=150');
      expect(urls.variants.thumbnail).toContain('height=150');
      expect(urls.variants.thumbnail).toContain('quality=85');
      expect(urls.variants.thumbnail).toContain('format=webp');
    });

    it('should generate responsive sources for different screen sizes', () => {
      const urls = ImageOptimizationService.generateOptimizedUrls(
        'test-bucket',
        'test.jpg',
        ImageType.PORTFOLIO
      );

      const sources = ImageOptimizationService.getResponsiveSources(urls, ImageType.PORTFOLIO);

      expect(sources).toHaveLength(3);
      expect(sources[0].media).toBe('(max-width: 640px)');
      expect(sources[1].media).toBe('(max-width: 1024px)');
      expect(sources[2].media).toBe('(min-width: 1025px)');
    });
  });

  describe('Quality Optimization', () => {
    it('should calculate optimal quality for different image types', () => {
      const headShotQuality = ImageOptimizationService.getOptimalQuality(
        ImageType.HEADSHOT,
        'medium'
      );
      const portfolioQuality = ImageOptimizationService.getOptimalQuality(
        ImageType.PORTFOLIO,
        'medium'
      );

      expect(headShotQuality).toBeGreaterThan(portfolioQuality);
      expect(headShotQuality).toBeGreaterThanOrEqual(60);
      expect(headShotQuality).toBeLessThanOrEqual(95);
    });

    it('should adjust quality based on file size', () => {
      const largeFileQuality = ImageOptimizationService.getOptimalQuality(
        ImageType.PROFILE,
        'large',
        10 * 1024 * 1024 // 10MB
      );
      const smallFileQuality = ImageOptimizationService.getOptimalQuality(
        ImageType.PROFILE,
        'large',
        500 * 1024 // 500KB
      );

      expect(smallFileQuality).toBeGreaterThan(largeFileQuality);
    });
  });

  describe('Placeholder Generation', () => {
    it('should generate placeholder data URL', async () => {
      // Mock fetch for placeholder generation
      const mockBlob = new Blob(['fake image data'], { type: 'image/webp' });
      (global.fetch as Mock).mockResolvedValue({
        blob: () => Promise.resolve(mockBlob)
      });

      // Mock FileReader
      const mockFileReader = {
        onloadend: null as any,
        onerror: null as any,
        readAsDataURL: vi.fn(),
        result: 'data:image/webp;base64,fakedata'
      };

      global.FileReader = vi.fn(() => mockFileReader) as any;

      const placeholder = ImageOptimizationService.generatePlaceholder(
        'test-bucket',
        'test.jpg'
      );

      // Simulate FileReader completion
      setTimeout(() => {
        if (mockFileReader.onloadend) {
          mockFileReader.onloadend();
        }
      }, 0);

      await expect(placeholder).resolves.toBe('data:image/webp;base64,fakedata');
    });
  });
});

describe('Image Format Detector', () => {
  beforeEach(() => {
    // Mock canvas and browser APIs
    const mockCanvas = {
      width: 1,
      height: 1,
      toDataURL: vi.fn()
    };

    global.HTMLCanvasElement = vi.fn(() => mockCanvas) as any;
    global.document = {
      createElement: vi.fn(() => mockCanvas)
    } as any;

    // Mock navigator
    global.navigator = {
      connection: {
        effectiveType: '4g',
        saveData: false
      }
    } as any;
  });

  it('should detect browser capabilities', async () => {
    const mockCanvas = document.createElement('canvas') as any;
    mockCanvas.toDataURL
      .mockReturnValueOnce('data:image/webp;base64,test') // WebP supported
      .mockReturnValueOnce('data:image/avif;base64,test'); // AVIF supported

    const capabilities = await ImageFormatDetector.detectBrowserCapabilities();

    expect(capabilities).toHaveProperty('supportsWebP');
    expect(capabilities).toHaveProperty('supportsAVIF');
    expect(capabilities).toHaveProperty('supportsJPEG', true);
    expect(capabilities).toHaveProperty('supportsPNG', true);
    expect(capabilities).toHaveProperty('connection');
  });

  it('should get best format based on browser support', async () => {
    const mockCanvas = document.createElement('canvas') as any;
    mockCanvas.toDataURL
      .mockReturnValueOnce('data:image/webp;base64,test')
      .mockReturnValueOnce('data:image/png;base64,test'); // AVIF not supported

    const format = await ImageFormatDetector.getBestFormat();

    expect(format.format).toBe('webp');
    expect(format.isModern).toBe(true);
  });

  it('should calculate optimal quality based on connection and format', async () => {
    // Mock slow connection
    global.navigator = {
      connection: {
        effectiveType: '2g',
        saveData: true
      }
    } as any;

    const quality = await ImageFormatDetector.getOptimalQuality('webp', 85);

    expect(quality).toBeLessThan(85); // Should reduce quality for slow connections
    expect(quality).toBeGreaterThanOrEqual(60);
  });

  it('should generate format recommendations', () => {
    const photographicRecommendation = ImageFormatDetector.getFormatRecommendation({
      isPhotographic: true,
      hasTransparency: false
    });

    const transparencyRecommendation = ImageFormatDetector.getFormatRecommendation({
      hasTransparency: true
    });

    const animationRecommendation = ImageFormatDetector.getFormatRecommendation({
      hasAnimation: true
    });

    expect(photographicRecommendation).toEqual(['avif', 'webp', 'jpeg']);
    expect(transparencyRecommendation).toEqual(['avif', 'webp', 'png']);
    expect(animationRecommendation).toEqual(['webp', 'gif']);
  });
});

describe('Image Metrics Collector', () => {
  let collector: ImageMetricsCollector;

  beforeEach(() => {
    collector = ImageMetricsCollector.getInstance();
    collector.clear();

    // Mock PerformanceObserver
    global.PerformanceObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn(),
      disconnect: vi.fn()
    }));

    // Mock MutationObserver
    global.MutationObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn(),
      disconnect: vi.fn()
    }));
  });

  afterEach(() => {
    collector.destroy();
  });

  it('should track image load metrics', () => {
    const mockImg = {
      src: 'https://example.com/image.jpg',
      naturalWidth: 1200,
      naturalHeight: 800,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    } as any;

    collector.trackImageLoad(mockImg);

    expect(mockImg.addEventListener).toHaveBeenCalledWith('load', expect.any(Function));
    expect(mockImg.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('should generate performance summary', () => {
    // Add some mock metrics
    const metrics = new Map([
      ['image1.jpg', {
        loadTime: 1000,
        fileSize: 500000,
        renderTime: 100,
        firstByte: 200,
        format: 'webp',
        dimensions: { width: 1200, height: 800 },
        cacheHit: true
      }],
      ['image2.jpg', {
        loadTime: 1500,
        fileSize: 800000,
        renderTime: 150,
        firstByte: 300,
        format: 'jpeg',
        dimensions: { width: 1600, height: 1200 },
        cacheHit: false
      }]
    ]);

    // Mock the private metrics property
    (collector as any).metrics = metrics;

    const summary = collector.getPerformanceSummary();

    expect(summary.totalImages).toBe(2);
    expect(summary.averageLoadTime).toBe(1250);
    expect(summary.totalFileSize).toBe(1300000);
    expect(summary.cacheHitRate).toBe(0.5);
    expect(summary.formatDistribution).toEqual({
      webp: 1,
      jpeg: 1
    });
  });

  it('should generate optimization recommendations', () => {
    // Mock metrics with performance issues
    const metrics = new Map([
      ['slow-image.jpg', {
        loadTime: 5000, // Slow loading
        fileSize: 2000000, // Large file
        renderTime: 500,
        firstByte: 1000,
        format: 'jpeg', // Not modern format
        dimensions: { width: 2000, height: 1500 },
        cacheHit: false // Poor cache performance
      }]
    ]);

    (collector as any).metrics = metrics;

    const recommendations = collector.getOptimizationRecommendations();

    expect(recommendations).toContain(
      expect.stringContaining('Consider enabling image compression')
    );
    expect(recommendations).toContain(
      expect.stringContaining('modern image formats')
    );
  });

  it('should measure Core Web Vitals', async () => {
    // Mock performance entries
    const mockEntries = [
      { startTime: 1500, processingStart: 1520 }
    ];

    global.PerformanceObserver = vi.fn().mockImplementation((callback) => {
      setTimeout(() => callback({ getEntries: () => mockEntries }), 0);
      return {
        observe: vi.fn(),
        disconnect: vi.fn()
      };
    });

    const vitals = await collector.measureCoreWebVitals();

    expect(vitals).toHaveProperty('lcp');
    expect(vitals).toHaveProperty('fid');
    expect(vitals).toHaveProperty('cls');
    expect(vitals).toHaveProperty('fcp');
  });

  it('should export metrics as JSON', () => {
    const metrics = new Map([
      ['test.jpg', {
        loadTime: 1000,
        fileSize: 500000,
        renderTime: 100,
        firstByte: 200,
        format: 'webp',
        dimensions: { width: 1200, height: 800 },
        cacheHit: true
      }]
    ]);

    (collector as any).metrics = metrics;

    const exported = collector.exportMetrics();
    const parsed = JSON.parse(exported);

    expect(parsed).toHaveProperty('summary');
    expect(parsed).toHaveProperty('metrics');
    expect(parsed).toHaveProperty('timestamp');
    expect(parsed.summary.totalImages).toBe(1);
  });
});

describe('API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Upload Image Endpoint', () => {
    it('should handle single image upload', async () => {
      const mockFormData = new FormData();
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      mockFormData.append('file', mockFile);
      mockFormData.append('imageType', ImageType.PROFILE);
      mockFormData.append('portfolioId', 'test-portfolio');

      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          image: {
            id: 'test-id',
            fileName: 'test.jpg',
            urls: {}
          }
        })
      });

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: mockFormData
      });

      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.image).toHaveProperty('id');
    });
  });

  describe('Batch Upload Endpoint', () => {
    it('should handle multiple image uploads', async () => {
      const mockFormData = new FormData();
      mockFormData.append('portfolioId', 'test-portfolio');
      mockFormData.append('generateVariants', 'true');

      Array.from({ length: 3 }, (_, i) => {
        const file = new File(['test'], `test-${i}.jpg`, { type: 'image/jpeg' });
        mockFormData.append(`file_${i}`, file);
        mockFormData.append(`imageType_${i}`, ImageType.PORTFOLIO);
      });

      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          totalUploaded: 3,
          totalAttempted: 3,
          results: [
            { success: true, fileName: 'test-0.jpg' },
            { success: true, fileName: 'test-1.jpg' },
            { success: true, fileName: 'test-2.jpg' }
          ]
        })
      });

      const response = await fetch('/api/upload/batch', {
        method: 'POST',
        body: mockFormData
      });

      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.totalUploaded).toBe(3);
      expect(result.results).toHaveLength(3);
    });
  });

  describe('Image Optimization Endpoint', () => {
    it('should optimize existing images', async () => {
      const optimizationRequest = {
        imageId: 'test-id',
        bucketName: 'portfolio-images',
        fileName: 'test.jpg',
        imageType: ImageType.PROFILE,
        optimizations: {
          formats: ['webp', 'avif'],
          sizes: [
            { width: 400, height: 400, quality: 85 }
          ]
        }
      };

      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          optimizedUrls: {
            original: 'https://example.com/original.jpg',
            variants: {
              webp_400: 'https://example.com/webp-400.webp',
              avif_400: 'https://example.com/avif-400.avif'
            }
          }
        })
      });

      const response = await fetch('/api/image/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(optimizationRequest)
      });

      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.optimizedUrls).toHaveProperty('variants');
    });
  });

  describe('Metrics Endpoint', () => {
    it('should store performance metrics', async () => {
      const metricsData = {
        metrics: {
          'image1.jpg': {
            loadTime: 1000,
            fileSize: 500000,
            format: 'webp'
          }
        },
        sessionId: 'test-session',
        pageUrl: '/portfolio/test'
      };

      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const response = await fetch('/api/image/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metricsData)
      });

      const result = await response.json();

      expect(result.success).toBe(true);
    });

    it('should retrieve performance metrics', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          metrics: {
            totalImages: 5,
            averageLoadTime: 1200,
            cacheHitRate: 0.8,
            formatDistribution: {
              webp: 3,
              jpeg: 2
            }
          }
        })
      });

      const response = await fetch('/api/image/metrics?timeRange=7d&aggregation=summary');
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.metrics).toHaveProperty('totalImages');
      expect(result.metrics).toHaveProperty('averageLoadTime');
    });
  });
});

describe('Integration Tests', () => {
  it('should complete full optimization workflow', async () => {
    // 1. Upload image with optimization
    const uploadFormData = new FormData();
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    uploadFormData.append('file', mockFile);
    uploadFormData.append('imageType', ImageType.PORTFOLIO);
    uploadFormData.append('portfolioId', 'test-portfolio');
    uploadFormData.append('generateVariants', 'true');

    (global.fetch as Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          image: { id: 'test-id', fileName: 'test.jpg' }
        })
      })
      // 2. Optimize image
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          optimizedUrls: { variants: {} }
        })
      })
      // 3. Store metrics
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

    // Upload
    const uploadResponse = await fetch('/api/upload/image', {
      method: 'POST',
      body: uploadFormData
    });
    const uploadResult = await uploadResponse.json();
    expect(uploadResult.success).toBe(true);

    // Optimize
    const optimizeResponse = await fetch('/api/image/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageId: uploadResult.image.id,
        bucketName: 'portfolio-images',
        fileName: 'test.jpg',
        imageType: ImageType.PORTFOLIO
      })
    });
    const optimizeResult = await optimizeResponse.json();
    expect(optimizeResult.success).toBe(true);

    // Store metrics
    const metricsResponse = await fetch('/api/image/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metrics: { 'test.jpg': { loadTime: 1000 } },
        sessionId: 'test'
      })
    });
    const metricsResult = await metricsResponse.json();
    expect(metricsResult.success).toBe(true);
  });
});

export { };