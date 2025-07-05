'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { ImageType } from '@/types';
import { validateImageFile } from '@/lib/services/image';
import { generateThumbnail } from '@/lib/utils/image';
import { formatFileSize } from '@/lib/utils/image';
import { IMAGE_LIMITS } from '@/lib/constants';

interface FileWithPreview extends File {
  preview?: string;
  thumbnail?: string;
  error?: string;
  status?: 'pending' | 'uploading' | 'completed' | 'error';
}

interface ImageUploadProps {
  imageType: ImageType;
  maxFiles?: number;
  onFilesSelected: (files: File[]) => void;
  onUpload: (files: File[]) => Promise<void>;
  isUploading?: boolean;
  className?: string;
  disabled?: boolean;
  acceptedFileTypes?: string[];
}

export function ImageUpload({
  imageType,
  maxFiles = IMAGE_LIMITS.maxFiles,
  onFilesSelected,
  onUpload,
  isUploading = false,
  className,
  disabled = false,
  acceptedFileTypes = ['image/*'],
}: ImageUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getImageTypeLabel = (type: ImageType): string => {
    switch (type) {
      case 'PROFILE':
        return 'Profile Photo';
      case 'HERO':
        return 'Hero Image';
      case 'GALLERY':
        return 'Gallery Images';
      case 'INTERNAL':
        return 'Internal Images';
      default:
        return 'Images';
    }
  };

  const getImageTypeDescription = (type: ImageType): string => {
    switch (type) {
      case 'PROFILE':
        return 'Upload a professional headshot (square format recommended)';
      case 'HERO':
        return 'Upload a wide banner image for your portfolio header';
      case 'GALLERY':
        return 'Upload your best professional photos for your portfolio gallery';
      case 'INTERNAL':
        return 'Upload images for internal use';
      default:
        return 'Upload your images';
    }
  };

  const processFiles = useCallback(async (fileList: FileList | File[]) => {
    const newFiles: FileWithPreview[] = [];
    const fileArray = Array.from(fileList);

    // Check if adding these files would exceed the limit
    if (files.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    for (const file of fileArray) {
      const validation = validateImageFile(file);
      
      const fileWithPreview: FileWithPreview = {
        ...file,
        status: validation.isValid ? 'pending' : 'error',
        error: validation.error,
      };

      // Generate preview and thumbnail for valid images
      if (validation.isValid) {
        try {
          fileWithPreview.preview = URL.createObjectURL(file);
          fileWithPreview.thumbnail = await generateThumbnail(file, 150);
        } catch (error) {
          console.error('Error generating preview:', error);
          fileWithPreview.error = 'Failed to generate preview';
          fileWithPreview.status = 'error';
        }
      }

      newFiles.push(fileWithPreview);
    }

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    
    // Call the callback with valid files only
    const validFiles = newFiles.filter(f => f.status !== 'error');
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  }, [files, maxFiles, onFilesSelected]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
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
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [processFiles]);

  const handleBrowseFiles = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const removeFile = useCallback((index: number) => {
    const fileToRemove = files[index];
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesSelected(updatedFiles.filter(f => f.status !== 'error'));
  }, [files, onFilesSelected]);

  const handleUpload = async () => {
    if (files.length === 0 || isUploading) return;

    const validFiles = files.filter(f => f.status !== 'error');
    if (validFiles.length === 0) return;

    try {
      setUploadProgress(0);
      
      // Update file status to uploading
      setFiles(prevFiles => 
        prevFiles.map(f => 
          f.status === 'pending' ? { ...f, status: 'uploading' } : f
        )
      );

      // Call upload function
      await onUpload(validFiles);

      // Update status to completed
      setFiles(prevFiles => 
        prevFiles.map(f => 
          f.status === 'uploading' ? { ...f, status: 'completed' } : f
        )
      );

      setUploadProgress(100);
    } catch (error) {
      console.error('Upload error:', error);
      
      // Update status to error
      setFiles(prevFiles => 
        prevFiles.map(f => 
          f.status === 'uploading' ? { ...f, status: 'error', error: 'Upload failed' } : f
        )
      );
    }
  };

  const clearAll = useCallback(() => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    setUploadProgress(0);
    onFilesSelected([]);
  }, [files, onFilesSelected]);

  const hasValidFiles = files.some(f => f.status === 'pending');
  const hasErrors = files.some(f => f.status === 'error');

  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h3 className="text-lg font-semibold">{getImageTypeLabel(imageType)}</h3>
        <p className="text-sm text-gray-600">{getImageTypeDescription(imageType)}</p>
      </div>

      {/* Upload Area */}
      <Card
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragOver && !disabled && 'border-blue-500 bg-blue-50',
          disabled && 'opacity-50 cursor-not-allowed',
          hasErrors && 'border-red-300',
          'hover:border-gray-400'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseFiles}
      >
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              Drag and drop your images here, or <span className="text-blue-600">browse</span>
            </p>
            <p className="text-sm text-gray-500">
              Supports JPEG, PNG, WebP up to {Math.round(IMAGE_LIMITS.maxSize / 1024 / 1024)}MB each
            </p>
            <p className="text-xs text-gray-400">
              Maximum {maxFiles} images • Minimum {IMAGE_LIMITS.dimensions.minWidth}x{IMAGE_LIMITS.dimensions.minHeight}px
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
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
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