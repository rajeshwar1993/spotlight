/**
 * Image format detection and optimization utilities
 */

export interface BrowserCapabilities {
  supportsWebP: boolean;
  supportsAVIF: boolean;
  supportsJPEG: boolean;
  supportsPNG: boolean;
  connection: 'slow' | 'fast' | 'unknown';
}

export interface ImageFormatInfo {
  format: string;
  mimeType: string;
  extension: string;
  quality: number;
  isModern: boolean;
  compressionRatio: number;
}

export class ImageFormatDetector {
  private static browserCapabilities: BrowserCapabilities | null = null;
  private static detectionPromise: Promise<BrowserCapabilities> | null = null;

  /**
   * Detect browser capabilities for image formats
   */
  static async detectBrowserCapabilities(): Promise<BrowserCapabilities> {
    if (this.browserCapabilities) {
      return this.browserCapabilities;
    }

    if (this.detectionPromise) {
      return this.detectionPromise;
    }

    this.detectionPromise = this.performDetection();
    this.browserCapabilities = await this.detectionPromise;
    return this.browserCapabilities;
  }

  /**
   * Perform actual format detection
   */
  private static async performDetection(): Promise<BrowserCapabilities> {
    // For SSR, return safe defaults
    if (typeof window === 'undefined') {
      return {
        supportsWebP: true,
        supportsAVIF: false,
        supportsJPEG: true,
        supportsPNG: true,
        connection: 'unknown',
      };
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;

    const [supportsWebP, supportsAVIF] = await Promise.all([
      this.testFormat(canvas, 'image/webp'),
      this.testFormat(canvas, 'image/avif'),
    ]);

    const connection = this.detectConnection();

    return {
      supportsWebP,
      supportsAVIF,
      supportsJPEG: true, // Always supported
      supportsPNG: true, // Always supported
      connection,
    };
  }

  /**
   * Test if a format is supported
   */
  private static testFormat(canvas: HTMLCanvasElement, mimeType: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const dataURL = canvas.toDataURL(mimeType);
        resolve(dataURL.startsWith(`data:${mimeType}`));
      } catch (error) {
        resolve(false);
      }
    });
  }

  /**
   * Detect connection speed
   */
  private static detectConnection(): 'slow' | 'fast' | 'unknown' {
    if (typeof navigator === 'undefined') return 'unknown';

    // Check for Network Information API
    const connection = (navigator as any).connection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        return 'slow';
      }
      if (effectiveType === '3g' || effectiveType === '4g') {
        return 'fast';
      }
    }

    // Fallback: Check for save-data header
    if (connection && connection.saveData) {
      return 'slow';
    }

    return 'unknown';
  }

  /**
   * Get the best format for the current browser
   */
  static async getBestFormat(
    preferredFormats: string[] = ['avif', 'webp', 'jpeg']
  ): Promise<ImageFormatInfo> {
    const capabilities = await this.detectBrowserCapabilities();
    
    for (const format of preferredFormats) {
      const formatInfo = this.getFormatInfo(format);
      if (this.isFormatSupported(format, capabilities)) {
        return formatInfo;
      }
    }

    // Fallback to JPEG
    return this.getFormatInfo('jpeg');
  }

  /**
   * Check if a format is supported
   */
  private static isFormatSupported(format: string, capabilities: BrowserCapabilities): boolean {
    switch (format.toLowerCase()) {
      case 'avif':
        return capabilities.supportsAVIF;
      case 'webp':
        return capabilities.supportsWebP;
      case 'jpeg':
      case 'jpg':
        return capabilities.supportsJPEG;
      case 'png':
        return capabilities.supportsPNG;
      default:
        return false;
    }
  }

  /**
   * Get format information
   */
  private static getFormatInfo(format: string): ImageFormatInfo {
    const formatMap: Record<string, ImageFormatInfo> = {
      avif: {
        format: 'avif',
        mimeType: 'image/avif',
        extension: 'avif',
        quality: 80,
        isModern: true,
        compressionRatio: 0.3, // 30% of original size
      },
      webp: {
        format: 'webp',
        mimeType: 'image/webp',
        extension: 'webp',
        quality: 85,
        isModern: true,
        compressionRatio: 0.4, // 40% of original size
      },
      jpeg: {
        format: 'jpeg',
        mimeType: 'image/jpeg',
        extension: 'jpg',
        quality: 85,
        isModern: false,
        compressionRatio: 0.7, // 70% of original size
      },
      png: {
        format: 'png',
        mimeType: 'image/png',
        extension: 'png',
        quality: 95,
        isModern: false,
        compressionRatio: 0.9, // 90% of original size (less compression)
      },
    };

    return formatMap[format.toLowerCase()] || formatMap.jpeg;
  }

  /**
   * Get optimal quality based on format and connection
   */
  static async getOptimalQuality(
    format: string,
    baseQuality: number = 85,
    imageSize?: number
  ): Promise<number> {
    const capabilities = await this.detectBrowserCapabilities();
    const formatInfo = this.getFormatInfo(format);
    
    let quality = baseQuality;

    // Adjust quality based on connection speed
    if (capabilities.connection === 'slow') {
      quality = Math.max(quality - 15, 60);
    } else if (capabilities.connection === 'fast') {
      quality = Math.min(quality + 5, 95);
    }

    // Adjust quality based on format capabilities
    if (formatInfo.isModern) {
      quality = Math.min(quality + 5, 95);
    }

    // Adjust quality based on image size
    if (imageSize) {
      const sizeInMB = imageSize / (1024 * 1024);
      if (sizeInMB > 5) {
        quality = Math.max(quality - 10, 60);
      } else if (sizeInMB < 0.5) {
        quality = Math.min(quality + 5, 95);
      }
    }

    return Math.max(60, Math.min(95, quality));
  }

  /**
   * Get responsive image sources with optimal formats
   */
  static async getResponsiveImageSources(
    baseUrl: string,
    sizes: Array<{ width: number; height?: number; quality?: number }>
  ): Promise<Array<{ src: string; width: number; height?: number; type: string }>> {
    const format = await this.getBestFormat();
    
    return Promise.all(
      sizes.map(async (size) => {
        const quality = await this.getOptimalQuality(
          format.format,
          size.quality || 85
        );
        
        const params = new URLSearchParams({
          width: size.width.toString(),
          quality: quality.toString(),
          format: format.format,
        });
        
        if (size.height) {
          params.append('height', size.height.toString());
        }
        
        return {
          src: `${baseUrl}?${params.toString()}`,
          width: size.width,
          height: size.height,
          type: format.mimeType,
        };
      })
    );
  }

  /**
   * Get picture element sources for different breakpoints
   */
  static async getPictureElementSources(
    baseUrl: string,
    breakpoints: Array<{
      media: string;
      width: number;
      height?: number;
      quality?: number;
    }>
  ): Promise<Array<{ media: string; srcSet: string; type: string }>> {
    const format = await this.getBestFormat();
    
    return Promise.all(
      breakpoints.map(async (breakpoint) => {
        const quality = await this.getOptimalQuality(
          format.format,
          breakpoint.quality || 85
        );
        
        const params = new URLSearchParams({
          width: breakpoint.width.toString(),
          quality: quality.toString(),
          format: format.format,
        });
        
        if (breakpoint.height) {
          params.append('height', breakpoint.height.toString());
        }
        
        return {
          media: breakpoint.media,
          srcSet: `${baseUrl}?${params.toString()}`,
          type: format.mimeType,
        };
      })
    );
  }

  /**
   * Preload image format detection
   */
  static preloadDetection(): void {
    if (typeof window !== 'undefined' && !this.detectionPromise) {
      this.detectBrowserCapabilities();
    }
  }

  /**
   * Get format recommendation based on image characteristics
   */
  static getFormatRecommendation(
    imageCharacteristics: {
      hasTransparency?: boolean;
      isPhotographic?: boolean;
      hasAnimation?: boolean;
      colorDepth?: number;
    }
  ): string[] {
    const { hasTransparency, isPhotographic, hasAnimation, colorDepth } = imageCharacteristics;

    // Animated images
    if (hasAnimation) {
      return ['webp', 'gif']; // AVIF animation support is limited
    }

    // Images with transparency
    if (hasTransparency) {
      return ['avif', 'webp', 'png'];
    }

    // Photographic images
    if (isPhotographic) {
      return ['avif', 'webp', 'jpeg'];
    }

    // Graphics/illustrations
    if (colorDepth && colorDepth <= 256) {
      return ['avif', 'webp', 'png'];
    }

    // Default recommendation
    return ['avif', 'webp', 'jpeg'];
  }

  /**
   * Calculate estimated file size reduction
   */
  static estimateFileSizeReduction(
    originalSize: number,
    fromFormat: string,
    toFormat: string
  ): number {
    const fromInfo = this.getFormatInfo(fromFormat);
    const toInfo = this.getFormatInfo(toFormat);
    
    const reduction = (fromInfo.compressionRatio - toInfo.compressionRatio) / fromInfo.compressionRatio;
    return Math.max(0, Math.min(1, reduction));
  }
}

export default ImageFormatDetector;