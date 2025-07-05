'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { 
  Crop, 
  PixelCrop, 
  centerCrop, 
  makeAspectCrop 
} from 'react-image-crop';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  RotateCw, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Square, 
  Monitor, 
  Smartphone,
  Maximize
} from 'lucide-react';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  file: File;
  onCropComplete: (croppedFile: File) => void;
  aspectRatio?: number | null;
  initialAspectRatio?: 'square' | 'video' | 'portrait' | 'free';
  minDimensions?: { width: number; height: number };
}

interface AspectRatioOption {
  label: string;
  value: number | null;
  icon: React.ReactNode;
}

const aspectRatioOptions: AspectRatioOption[] = [
  { label: 'Free', value: null, icon: <Maximize className="w-4 h-4" /> },
  { label: 'Square', value: 1, icon: <Square className="w-4 h-4" /> },
  { label: 'Video', value: 16/9, icon: <Monitor className="w-4 h-4" /> },
  { label: 'Portrait', value: 3/4, icon: <Smartphone className="w-4 h-4" /> },
];

export function ImageCropper({
  isOpen,
  onClose,
  file,
  onCropComplete,
  aspectRatio: propAspectRatio,
  initialAspectRatio = 'free',
  minDimensions = { width: 100, height: 100 }
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspectRatio, setAspectRatio] = useState<number | null>(
    propAspectRatio ?? (aspectRatioOptions.find(opt => opt.label.toLowerCase() === initialAspectRatio)?.value || null)
  );
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);

  // Load image when file changes
  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [file]);

  // Initialize crop when image loads
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
    
    let initialCrop: Crop;
    
    if (aspectRatio) {
      initialCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 80,
          },
          aspectRatio,
          width,
          height
        ),
        width,
        height
      );
    } else {
      initialCrop = {
        unit: '%',
        x: 10,
        y: 10,
        width: 80,
        height: 80,
      };
    }
    
    setCrop(initialCrop);
  }, [aspectRatio]);

  const handleAspectRatioChange = useCallback((newAspectRatio: number | null) => {
    setAspectRatio(newAspectRatio);
    
    if (imgRef.current && newAspectRatio) {
      const { naturalWidth: width, naturalHeight: height } = imgRef.current;
      const newCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 80,
          },
          newAspectRatio,
          width,
          height
        ),
        width,
        height
      );
      setCrop(newCrop);
    }
  }, []);

  const handleRotation = useCallback((direction: 'left' | 'right') => {
    const rotationAmount = direction === 'right' ? 90 : -90;
    setRotation(prev => (prev + rotationAmount) % 360);
  }, []);

  const handleScaleChange = useCallback((value: number[]) => {
    setScale(value[0] || 1);
  }, []);

  const getCroppedCanvas = useCallback((
    image: HTMLImageElement,
    crop: PixelCrop,
    scale: number,
    rotation: number
  ): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = Math.floor(crop.width * scaleX);
    canvas.height = Math.floor(crop.height * scaleY);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.save();
    
    // Translate to center, rotate, scale, then translate back
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.restore();
    return canvas;
  }, []);

  const handleCropComplete = useCallback(async () => {
    if (!imgRef.current || !completedCrop) {
      return;
    }

    setIsProcessing(true);

    try {
      const canvas = getCroppedCanvas(imgRef.current, completedCrop, scale, rotation);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const croppedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            onCropComplete(croppedFile);
            onClose();
          }
        },
        file.type,
        0.9
      );
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [completedCrop, scale, rotation, file, onCropComplete, onClose, getCroppedCanvas]);

  const handleReset = useCallback(() => {
    setRotation(0);
    setScale(1);
    if (imgRef.current) {
      onImageLoad({ currentTarget: imgRef.current } as React.SyntheticEvent<HTMLImageElement>);
    }
  }, [onImageLoad]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
          <DialogDescription>
            Adjust the crop area, rotation, and scale to get the perfect image
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Aspect Ratio Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Aspect Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {aspectRatioOptions.map((option) => (
                  <Button
                    key={option.label}
                    variant={aspectRatio === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleAspectRatioChange(option.value)}
                    className="flex items-center space-x-2"
                  >
                    {option.icon}
                    <span>{option.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Image Crop Area */}
          <div className="flex justify-center">
            <div className="max-w-full max-h-96 overflow-auto border rounded-lg">
              {imageSrc && (
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspectRatio || undefined}
                  minWidth={minDimensions.width}
                  minHeight={minDimensions.height}
                >
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Crop preview"
                    onLoad={onImageLoad}
                    style={{
                      transform: `scale(${scale}) rotate(${rotation}deg)`,
                      maxWidth: '100%',
                      maxHeight: '400px',
                    }}
                  />
                </ReactCrop>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Rotation Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Rotation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRotation('left')}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRotation('right')}
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-center text-sm text-gray-500">
                  {rotation}°
                </div>
              </CardContent>
            </Card>

            {/* Scale Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Scale</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <ZoomOut className="w-4 h-4 text-gray-500" />
                  <Slider
                    value={[scale]}
                    onValueChange={handleScaleChange}
                    max={3}
                    min={0.5}
                    step={0.1}
                    className="flex-1"
                  />
                  <ZoomIn className="w-4 h-4 text-gray-500" />
                </div>
                <div className="text-center text-sm text-gray-500">
                  {Math.round(scale * 100)}%
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="w-full"
                >
                  Reset
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleCropComplete} 
            disabled={!completedCrop || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Apply Crop'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}