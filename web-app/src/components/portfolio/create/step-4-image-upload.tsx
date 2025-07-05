'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from '@/components/portfolio/image-upload';
import { ImageGallery } from '@/components/portfolio/image-gallery';
import { useAuth } from '@/hooks/use-auth';
import { usePortfolioCreation } from './portfolio-creation-context';
import { 
  uploadPortfolioImage, 
  getUserImages,
  updateImageMetadata,
  deleteImage,
  reorderImages,
  setPrimaryImage
} from '@/lib/services/image';
import type { PortfolioImage, ImageType } from '@/types';
// import { StepNavigation } from './step-navigation'; // Will be used when step navigation is updated
import { AuthGuard } from './auth-guard';

export function Step4ImageUpload() {
  const router = useRouter();
  const { user } = useAuth();
  const { state, setErrors, clearErrors } = usePortfolioCreation();
  const [isUploading, setIsUploading] = useState(false);
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [selectedImageType, setSelectedImageType] = useState<ImageType>('GALLERY');

  // Load existing images on component mount
  React.useEffect(() => {
    if (user && state.portfolioId) {
      loadImages();
    }
  }, [user, state.portfolioId]);

  const loadImages = async () => {
    if (!user || !state.portfolioId) return;

    try {
      const { data: portfolioImages, error } = await getUserImages(user.id);
      if (error) {
        setErrors({ submit: error.message });
      } else {
        // Filter images for this portfolio
        const currentPortfolioImages = portfolioImages?.filter(
          img => img.portfolio_id === (state.portfolioId || null)
        ) || [];
        setImages(currentPortfolioImages);
      }
    } catch (error) {
      console.error('Error loading images:', error);
      setErrors({ submit: 'Failed to load images' });
    }
  };

  const handleFilesSelected = useCallback((files: File[]) => {
    // Files are selected, ready for upload
    console.log('Files selected:', files.length);
  }, []);

  const handleUpload = useCallback(async (files: File[]) => {
    if (!user || !state.portfolioId) {
      setErrors({ submit: 'User not authenticated or portfolio not found' });
      return;
    }

    setIsUploading(true);
    clearErrors();

    try {
      const uploadPromises = files.map(file => 
        uploadPortfolioImage(user.id, state.portfolioId, file, selectedImageType)
      );

      const results = await Promise.all(uploadPromises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        setErrors({ submit: `Failed to upload ${errors.length} image(s)` });
      } else {
        // Reload images to show the new uploads
        await loadImages();
      }
    } catch (error) {
      console.error('Upload error:', error);
      setErrors({ submit: 'Failed to upload images' });
    } finally {
      setIsUploading(false);
    }
  }, [user, state.portfolioId, selectedImageType, setErrors, clearErrors]);

  const handleImageUpdate = useCallback(async (
    imageId: string, 
    updates: { alt_text?: string; sort_order?: number; is_primary?: boolean }
  ) => {
    try {
      const { error } = await updateImageMetadata(imageId, updates);
      if (error) {
        setErrors({ submit: error.message });
      } else {
        await loadImages();
      }
    } catch (error) {
      console.error('Error updating image:', error);
      setErrors({ submit: 'Failed to update image' });
    }
  }, [setErrors]);

  const handleImageDelete = useCallback(async (imageId: string) => {
    try {
      const { error } = await deleteImage(imageId);
      if (error) {
        setErrors({ submit: error.message });
      } else {
        await loadImages();
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      setErrors({ submit: 'Failed to delete image' });
    }
  }, [setErrors]);

  const handleImageReorder = useCallback(async (imageIds: string[]) => {
    if (!state.portfolioId) return;

    try {
      const { error } = await reorderImages(state.portfolioId, imageIds);
      if (error) {
        setErrors({ submit: error.message });
      } else {
        await loadImages();
      }
    } catch (error) {
      console.error('Error reordering images:', error);
      setErrors({ submit: 'Failed to reorder images' });
    }
  }, [state.portfolioId, setErrors]);

  const handleSetPrimary = useCallback(async (imageId: string, type: ImageType) => {
    if (!state.portfolioId) return;

    try {
      const { error } = await setPrimaryImage(state.portfolioId, imageId, type);
      if (error) {
        setErrors({ submit: error.message });
      } else {
        await loadImages();
      }
    } catch (error) {
      console.error('Error setting primary image:', error);
      setErrors({ submit: 'Failed to set primary image' });
    }
  }, [state.portfolioId, setErrors]);

  const handleNext = () => {
    // Navigate to portfolio preview or completion page
    router.push(`/create/preview?portfolio=${state.portfolioId}`);
  };

  const handleSkip = () => {
    // Allow users to skip image upload and come back later
    router.push(`/create/preview?portfolio=${state.portfolioId}`);
  };

  const imageStats = {
    profile: images.filter(img => img.type === 'PROFILE').length,
    hero: images.filter(img => img.type === 'HERO').length,
    gallery: images.filter(img => img.type === 'GALLERY').length,
  };

  const hasRequiredImages = imageStats.profile >= 1 || imageStats.hero >= 1;

  return (
    <AuthGuard requireAuth={true}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Step Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Add Your Professional Images
          </h2>
          <p className="text-lg text-gray-600">
            Upload your best photos to showcase your talent and experience
          </p>
        </div>

        {/* Image Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Image Overview</span>
              <div className="flex space-x-2">
                <Badge variant="secondary">
                  {images.length} Total Images
                </Badge>
              </div>
            </CardTitle>
            <CardDescription>
              Upload different types of images to create a comprehensive portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {imageStats.profile}
                </div>
                <div className="text-sm text-gray-600">Profile Photos</div>
                <div className="text-xs text-gray-400 mt-1">
                  Professional headshots
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {imageStats.hero}
                </div>
                <div className="text-sm text-gray-600">Hero Images</div>
                <div className="text-xs text-gray-400 mt-1">
                  Banner images for your portfolio
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {imageStats.gallery}
                </div>
                <div className="text-sm text-gray-600">Gallery Images</div>
                <div className="text-xs text-gray-400 mt-1">
                  Portfolio showcase photos
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Image Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Images</CardTitle>
            <CardDescription>
              Select the type of images you want to upload
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Image Type Selector */}
              <div className="flex flex-wrap gap-2">
                {(['PROFILE', 'HERO', 'GALLERY'] as ImageType[]).map((type) => (
                  <Button
                    key={type}
                    variant={selectedImageType === type ? 'default' : 'outline'}
                    onClick={() => setSelectedImageType(type)}
                    className="capitalize"
                  >
                    {type.toLowerCase().replace('_', ' ')}
                  </Button>
                ))}
              </div>

              {/* Upload Component */}
              <ImageUpload
                imageType={selectedImageType}
                maxFiles={selectedImageType === 'GALLERY' ? 10 : 3}
                onFilesSelected={handleFilesSelected}
                onUpload={handleUpload}
                isUploading={isUploading}
                disabled={!user || !state.portfolioId}
              />
            </div>
          </CardContent>
        </Card>

        {/* Existing Images Gallery */}
        {images.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Manage Your Images</CardTitle>
              <CardDescription>
                Edit, reorder, and organize your uploaded images
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageGallery
                images={images}
                onUpdate={handleImageUpdate}
                onDelete={handleImageDelete}
                onReorder={handleImageReorder}
                onSetPrimary={handleSetPrimary}
                canEdit={true}
              />
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {state.errors.submit && (
          <div className="p-4 border border-red-200 bg-red-50 rounded-md">
            <p className="text-sm text-red-600">{state.errors.submit}</p>
          </div>
        )}

        {/* Recommendations */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              📸 Image Upload Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-2">Profile Photos</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Professional headshots work best</li>
                  <li>• Square format recommended</li>
                  <li>• High resolution (min 400x400px)</li>
                  <li>• Good lighting and clear background</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Gallery Images</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Showcase your range and versatility</li>
                  <li>• Include different looks and styles</li>
                  <li>• High quality and well-composed</li>
                  <li>• Upload 5-10 of your best shots</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => router.push('/create/step/3')}
          >
            Back to Bio Details
          </Button>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleSkip}
            >
              Skip for Now
            </Button>
            <Button
              onClick={handleNext}
              disabled={isUploading}
              className="bg-green-600 hover:bg-green-700"
            >
              {hasRequiredImages ? 'Complete Portfolio' : 'Continue Without Images'}
            </Button>
          </div>
        </div>

        {/* Progress Info */}
        <div className="text-center text-sm text-gray-500">
          <p>Step 4 of 4 • You can always add more images later</p>
        </div>
      </div>
    </AuthGuard>
  );
}