'use client';

import { useState, useCallback, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Download,
  Edit3,
  Star,
  StarOff,
  Trash2,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PortfolioImage, ImageType } from '@/types';
import { formatFileSize } from '@/lib/utils/image';

interface ImagePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  images: PortfolioImage[];
  initialIndex?: number;
  onDelete?: (image: PortfolioImage) => void;
  onEdit?: (image: PortfolioImage) => void;
  onSetPrimary?: (image: PortfolioImage) => void;
  onUpdateAltText?: (imageId: string, altText: string) => void;
  canEdit?: boolean;
}

export function ImagePreview({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  onDelete,
  onEdit,
  onSetPrimary,
  onUpdateAltText,
  canEdit = false
}: ImagePreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [showInfo, setShowInfo] = useState(false);
  const [editingAltText, setEditingAltText] = useState(false);
  const [altText, setAltText] = useState('');

  const currentImage = images[currentIndex];

  // Update current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Reset zoom when image changes
  useEffect(() => {
    setZoom(1);
    setEditingAltText(false);
    setAltText(currentImage?.alt_text || '');
  }, [currentIndex, currentImage]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  const handleDownload = useCallback(async () => {
    if (!currentImage) return;

    try {
      const response = await fetch(currentImage.file_path);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = currentImage.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  }, [currentImage]);

  const handleSaveAltText = useCallback(() => {
    if (currentImage && onUpdateAltText) {
      onUpdateAltText(currentImage.id, altText);
      setEditingAltText(false);
    }
  }, [currentImage, altText, onUpdateAltText]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowLeft':
        goToPrevious();
        break;
      case 'ArrowRight':
        goToNext();
        break;
      case 'Escape':
        onClose();
        break;
      case '+':
      case '=':
        handleZoomIn();
        break;
      case '-':
        handleZoomOut();
        break;
    }
  }, [isOpen, goToPrevious, goToNext, onClose, handleZoomIn, handleZoomOut]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!currentImage) {
    return null;
  }

  const getTypeLabel = (type: ImageType): string => {
    switch (type) {
      case 'PROFILE':
        return 'Profile Photo';
      case 'HERO':
        return 'Hero Image';
      case 'GALLERY':
        return 'Gallery Image';
      case 'INTERNAL':
        return 'Internal Image';
      default:
        return 'Image';
    }
  };

  const getTypeColor = (type: ImageType): string => {
    switch (type) {
      case 'PROFILE':
        return 'bg-blue-500';
      case 'HERO':
        return 'bg-green-500';
      case 'GALLERY':
        return 'bg-purple-500';
      case 'INTERNAL':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DialogTitle className="text-lg font-semibold">
                {currentImage.file_name}
              </DialogTitle>
              <Badge className={cn('text-white', getTypeColor(currentImage.type))}>
                {getTypeLabel(currentImage.type)}
              </Badge>
              {currentImage.is_primary && (
                <Badge variant="secondary">Primary</Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {images.length > 1 && (
                <span className="text-sm text-gray-500">
                  {currentIndex + 1} of {images.length}
                </span>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Image Display */}
        <div className="relative flex-1 bg-gray-50 overflow-hidden" style={{ minHeight: '60vh' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={currentImage.file_path}
              alt={currentImage.alt_text || currentImage.file_name}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
            />
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="sm"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full p-2"
                onClick={goToPrevious}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full p-2"
                onClick={goToNext}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="rounded-full p-2"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="rounded-full p-2"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <div className="text-xs text-center bg-white rounded px-2 py-1">
              {Math.round(zoom * 100)}%
            </div>
          </div>

          {/* Info Toggle */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowInfo(!showInfo)}
            className="absolute top-4 left-4 rounded-full p-2"
          >
            <Info className="w-4 h-4" />
          </Button>

          {/* Image Info Overlay */}
          {showInfo && (
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-300">Dimensions:</span>
                  <div>{currentImage.width} × {currentImage.height}px</div>
                </div>
                <div>
                  <span className="text-gray-300">File Size:</span>
                  <div>{formatFileSize(currentImage.file_size)}</div>
                </div>
                <div>
                  <span className="text-gray-300">Type:</span>
                  <div>{getTypeLabel(currentImage.type)}</div>
                </div>
                <div>
                  <span className="text-gray-300">Uploaded:</span>
                  <div>{new Date(currentImage.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              
              {currentImage.alt_text && (
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <span className="text-gray-300">Alt Text:</span>
                  <div className="mt-1">{currentImage.alt_text}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions Bar */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              
              {canEdit && onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(currentImage)}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              
              {canEdit && onSetPrimary && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSetPrimary(currentImage)}
                >
                  {currentImage.is_primary ? (
                    <StarOff className="w-4 h-4 mr-2" />
                  ) : (
                    <Star className="w-4 h-4 mr-2" />
                  )}
                  {currentImage.is_primary ? 'Remove Primary' : 'Set Primary'}
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {canEdit && onUpdateAltText && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingAltText(true)}
                >
                  Edit Alt Text
                </Button>
              )}
              
              {canEdit && onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(currentImage)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
              
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>

          {/* Alt Text Editor */}
          {editingAltText && canEdit && onUpdateAltText && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="space-y-3">
                <Label htmlFor="alt-text">Alt Text</Label>
                <Textarea
                  id="alt-text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe this image for accessibility..."
                  rows={3}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingAltText(false)}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveAltText}>
                    Save Alt Text
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    'relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                    index === currentIndex 
                      ? 'border-blue-500 scale-105' 
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <img
                    src={image.file_path}
                    alt={image.file_name}
                    className="w-full h-full object-cover"
                  />
                  {image.is_primary && (
                    <div className="absolute top-1 right-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}