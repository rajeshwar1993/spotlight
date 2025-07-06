'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle, Settings, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ImageType } from '@/types/database';
import { ResponsiveImage } from '@/components/ui/responsive-image';
import { ImageOptimizationService } from '@/lib/image-optimization';
import { ImageFormatDetector } from '@/utils/image-format';
import { useImageMetrics } from '@/lib/image-metrics';
import { IMAGE_LIMITS } from '@/lib/constants';

interface FileWithPreview extends File {
  preview?: string;
  thumbnail?: string;
  error?: string;
  status?: 'pending' | 'uploading' | 'completed' | 'error' | 'optimizing';
  optimizedUrls?: any;
  compressionSavings?: number;
}

interface OptimizationSettings {
  enableOptimization: boolean;
  generateVariants: boolean;
  formatOptimization: boolean;
  quality: number;
  enableLazyLoading: boolean;
  enableProgressive: boolean;
}

interface EnhancedImageUploadProps {
  imageType: ImageType;
  portfolioId: string;
  maxFiles?: number;
  onFilesUploaded: (files: FileWithPreview[]) => void;
  isUploading?: boolean;
  className?: string;
  disabled?: boolean;
  acceptedFileTypes?: string[];
  enableCropping?: boolean;
  autoCrop?: boolean;
  cropAspectRatio?: number | null;
  showOptimizationSettings?: boolean;
}

export function EnhancedImageUpload({
  imageType,
  portfolioId,
  maxFiles = IMAGE_LIMITS.maxFiles,
  onFilesUploaded,
  isUploading = false,
  className,
  disabled = false,
  acceptedFileTypes = ['image/*'],
  enableCropping = true,
  autoCrop = false,
  cropAspectRatio,
  showOptimizationSettings = true,
}: EnhancedImageUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationSettings, setOptimizationSettings] = useState<OptimizationSettings>({
    enableOptimization: true,
    generateVariants: true,
    formatOptimization: true,
    quality: 85,
    enableLazyLoading: true,
    enableProgressive: true,
  });
  const [formatSupport, setFormatSupport] = useState<any>(null);
  const [totalSavings, setTotalSavings] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { trackImage, getSummary } = useImageMetrics();

  // Detect browser format support on mount
  useEffect(() => {
    ImageFormatDetector.detectBrowserCapabilities().then(setFormatSupport);
  }, []);

  const getImageTypeLabel = (type: ImageType): string => {
    switch (type) {
      case 'PROFILE':
        return 'Profile Photo';
      case 'HEADSHOT':
        return 'Headshot';
      case 'BODY':
        return 'Body Shot';
      case 'PORTFOLIO':
        return 'Portfolio Images';
      default:
        return 'Images';
    }
  };

  const getImageTypeDescription = (type: ImageType): string => {
    switch (type) {
      case 'PROFILE':
        return 'Upload a professional profile photo (square format recommended)';
      case 'HEADSHOT':
        return 'Upload professional headshots for your portfolio';
      case 'BODY':
        return 'Upload full-body or partial body shots';
      case 'PORTFOLIO':
        return 'Upload your best professional photos for your portfolio';
      default:
        return 'Upload your images';
    }
  };

  const processFiles = useCallback(async (fileList: FileList | File[]) => {
    const fileArray = Array.from(fileList);

    if (files.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setIsOptimizing(true);

    for (const file of fileArray) {
      const validation = await validateFile(file);
      
      if (!validation.valid) {
        const fileWithPreview: FileWithPreview = {
          ...file,
          status: 'error',
          error: validation.error,
        };
        setFiles(prev => [...prev, fileWithPreview]);
        continue;
      }

      let processedFile = file;
      let compressionSavings = 0;

      // Apply optimization if enabled
      if (optimizationSettings.enableOptimization) {
        try {
          const optimizedResult = await optimizeImage(file);
          processedFile = optimizedResult.file;
          compressionSavings = optimizedResult.savings;
        } catch (error) {
          console.error('Optimization failed, using original:', error);
        }
      }

      const fileWithPreview: FileWithPreview = {
        ...processedFile,
        name: file.name,
        status: 'pending',
        compressionSavings,
      };

      // Generate preview and thumbnail
      try {
        fileWithPreview.preview = URL.createObjectURL(processedFile);
        fileWithPreview.thumbnail = await generateThumbnail(processedFile, 150);
        
        // Generate optimized URLs
        if (optimizationSettings.generateVariants) {
          const fileName = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          fileWithPreview.optimizedUrls = ImageOptimizationService.generateOptimizedUrls(
            'temp',
            fileName,
            imageType
          );
        }
      } catch (error) {
        console.error('Error processing file:', error);
        fileWithPreview.error = 'Failed to process image';
        fileWithPreview.status = 'error';
      }

      setFiles(prev => [...prev, fileWithPreview]);
    }

    setIsOptimizing(false);
    
    // Calculate total savings
    const savings = files.reduce((total, file) => total + (file.compressionSavings || 0), 0);
    setTotalSavings(savings);
  }, [files, maxFiles, imageType, optimizationSettings]);

  const optimizeImage = async (file: File): Promise<{ file: File; savings: number }> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          
          // Apply quality settings
          const quality = optimizationSettings.quality / 100;
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const optimizedFile = new File([blob], file.name, {
                  type: optimizationSettings.formatOptimization ? 'image/webp' : file.type,
                  lastModified: file.lastModified,
                });
                
                const savings = ((file.size - blob.size) / file.size) * 100;
                resolve({ file: optimizedFile, savings });
              } else {
                reject(new Error('Failed to create blob'));
              }
            },
            optimizationSettings.formatOptimization ? 'image/webp' : file.type,
            quality
          );
        } else {
          reject(new Error('Failed to get canvas context'));
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const generateThumbnail = async (file: File, size: number): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        canvas.width = size;
        canvas.height = size / aspectRatio;
        
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/webp', 0.8));
        } else {
          reject(new Error('Failed to generate thumbnail'));
        }
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const validateFile = async (file: File) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Only JPEG, PNG, WebP, and AVIF are allowed.',
      };
    }

    // Check file size
    if (file.size > IMAGE_LIMITS.maxSize) {
      return {
        valid: false,
        error: `File too large. Maximum size is ${Math.round(IMAGE_LIMITS.maxSize / 1024 / 1024)}MB.`,
      };
    }

    return { valid: true };
  };

  const handleUpload = async () => {
    if (files.length === 0 || isUploading) return;

    const validFiles = files.filter(f => f.status === 'pending');
    if (validFiles.length === 0) return;

    try {
      setUploadProgress(0);
      
      // Update file status to uploading
      setFiles(prevFiles => 
        prevFiles.map(f => 
          f.status === 'pending' ? { ...f, status: 'uploading' } : f
        )
      );

      // Use batch upload endpoint
      const formData = new FormData();
      formData.append('portfolioId', portfolioId);
      formData.append('generateVariants', optimizationSettings.generateVariants.toString());
      formData.append('optimizeFormat', optimizationSettings.formatOptimization.toString());

      validFiles.forEach((file, index) => {
        formData.append(`file_${index}`, file);
        formData.append(`imageType_${index}`, imageType);
        formData.append(`altText_${index}`, '');
        formData.append(`sortOrder_${index}`, index.toString());
      });

      const response = await fetch('/api/upload/batch', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      // Update file status based on results
      setFiles(prevFiles => 
        prevFiles.map((f, index) => {
          const uploadResult = result.results[index];
          if (uploadResult?.success) {
            return { 
              ...f, 
              status: 'completed',
              optimizedUrls: uploadResult.urls 
            };
          } else {
            return { 
              ...f, 
              status: 'error', 
              error: uploadResult?.error || 'Upload failed' 
            };
          }
        })
      );

      setUploadProgress(100);
      onFilesUploaded(validFiles);

    } catch (error) {
      console.error('Upload error:', error);
      
      setFiles(prevFiles => 
        prevFiles.map(f => 
          f.status === 'uploading' ? { ...f, status: 'error', error: 'Upload failed' } : f
        )
      );
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, [disabled, processFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    e.target.value = '';
  }, [processFiles]);

  const removeFile = useCallback((index: number) => {
    const fileToRemove = files[index];
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
  }, [files]);

  const clearAll = useCallback(() => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    setUploadProgress(0);
    setTotalSavings(0);
  }, [files]);

  const hasValidFiles = files.some(f => f.status === 'pending');

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h3 className="text-lg font-semibold">{getImageTypeLabel(imageType)}</h3>
        <p className="text-sm text-gray-600">{getImageTypeDescription(imageType)}</p>
      </div>

      {/* Optimization Settings */}
      {showOptimizationSettings && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4" />
              <h4 className="font-medium">Optimization Settings</h4>
              {formatSupport && (
                <Badge variant="secondary" className="text-xs">
                  Supports: {formatSupport.supportsAVIF ? 'AVIF' : formatSupport.supportsWebP ? 'WebP' : 'JPEG'}
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enable-optimization">Enable Optimization</Label>
                <Switch
                  id="enable-optimization"
                  checked={optimizationSettings.enableOptimization}
                  onCheckedChange={(checked) =>
                    setOptimizationSettings(prev => ({ ...prev, enableOptimization: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="generate-variants">Generate Variants</Label>
                <Switch
                  id="generate-variants"
                  checked={optimizationSettings.generateVariants}
                  onCheckedChange={(checked) =>
                    setOptimizationSettings(prev => ({ ...prev, generateVariants: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="format-optimization">Format Optimization</Label>
                <Switch
                  id="format-optimization"
                  checked={optimizationSettings.formatOptimization}
                  onCheckedChange={(checked) =>
                    setOptimizationSettings(prev => ({ ...prev, formatOptimization: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="progressive-loading">Progressive Loading</Label>
                <Switch
                  id="progressive-loading"
                  checked={optimizationSettings.enableProgressive}
                  onCheckedChange={(checked) =>
                    setOptimizationSettings(prev => ({ ...prev, enableProgressive: checked }))
                  }
                />
              </div>
            </div>

            {totalSavings > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Total compression savings: {totalSavings.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Area */}
      <Card
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragOver && !disabled && 'border-blue-500 bg-blue-50',
          disabled && 'opacity-50 cursor-not-allowed',
          'hover:border-gray-400'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              Drag and drop your images here, or <span className="text-blue-600">browse</span>
            </p>
            <p className="text-sm text-gray-500">
              Supports JPEG, PNG, WebP, AVIF up to {Math.round(IMAGE_LIMITS.maxSize / 1024 / 1024)}MB each
            </p>
            <p className="text-xs text-gray-400">
              Maximum {maxFiles} images • Auto-optimization enabled
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={maxFiles > 1}
        accept={acceptedFileTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Optimization Progress */}
      {isOptimizing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Optimizing images...</span>
            <Zap className="w-4 h-4 text-blue-500 animate-pulse" />
          </div>
          <Progress value={50} className="w-full" />
        </div>
      )}

      {/* File Preview List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Selected Files ({files.length})</h4>
            <Button variant="outline" size="sm" onClick={clearAll}>
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file, index) => (
              <Card key={index} className="relative">
                <CardContent className="p-4">
                  <div className="aspect-square relative mb-3 bg-gray-100 rounded-lg overflow-hidden">
                    {file.thumbnail ? (
                      <img
                        src={file.thumbnail}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Status Indicator */}
                    <div className="absolute top-2 right-2">
                      {file.status === 'pending' && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Upload className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {file.status === 'uploading' && (
                        <div className="w-6 h-6 bg-yellow-500 rounded-full animate-spin">
                          <div className="w-2 h-2 bg-white rounded-full mx-auto mt-2"></div>
                        </div>
                      )}
                      {file.status === 'completed' && (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {file.status === 'error' && (
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 left-2 w-6 h-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>

                    {/* Compression Savings Badge */}
                    {file.compressionSavings && file.compressionSavings > 0 && (
                      <Badge
                        variant="secondary"
                        className="absolute bottom-2 left-2 text-xs"
                      >
                        -{file.compressionSavings.toFixed(0)}%
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {file.error && (
                      <p className="text-xs text-red-600">{file.error}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading images...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {/* Upload Button */}
      {hasValidFiles && (
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={clearAll}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isUploading || !hasValidFiles}
            className="min-w-[120px]"
          >
            {isUploading ? 'Uploading...' : `Upload ${files.filter(f => f.status === 'pending').length} Image${files.filter(f => f.status === 'pending').length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      )}
    </div>
  );
}