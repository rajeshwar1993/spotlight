'use client';

import { useState, useCallback } from 'react';
import { 
  Grid3X3, 
  List, 
  Star, 
  StarOff, 
  Edit3, 
  Trash2, 
  MoreVertical,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { PortfolioImage, ImageType } from '@/types';
import { formatFileSize } from '@/lib/utils/image';
import { ImagePreview } from './image-preview';

interface ImageGalleryProps {
  images: PortfolioImage[];
  onUpdate: (imageId: string, updates: { alt_text?: string; sort_order?: number; is_primary?: boolean }) => void;
  onDelete: (imageId: string) => void;
  onReorder: (imageIds: string[]) => void;
  onSetPrimary: (imageId: string, type: ImageType) => void;
  isLoading?: boolean;
  canEdit?: boolean;
  layout?: 'grid' | 'list';
  className?: string;
}

interface EditDialogState {
  isOpen: boolean;
  image: PortfolioImage | null;
}

interface DeleteDialogState {
  isOpen: boolean;
  image: PortfolioImage | null;
}

export function ImageGallery({
  images,
  onUpdate,
  onDelete,
  onReorder,
  onSetPrimary,
  isLoading = false,
  canEdit = true,
  layout: initialLayout = 'grid',
  className,
}: ImageGalleryProps) {
  const [layout, setLayout] = useState<'grid' | 'list'>(initialLayout);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [editDialog, setEditDialog] = useState<EditDialogState>({ isOpen: false, image: null });
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({ isOpen: false, image: null });
  const [draggedImage, setDraggedImage] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ alt_text: '', sort_order: 0 });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Group images by type
  const imagesByType = images.reduce((acc, image) => {
    if (!acc[image.type]) {
      acc[image.type] = [];
    }
    acc[image.type].push(image);
    return acc;
  }, {} as Record<ImageType, PortfolioImage[]>);

  const getTypeLabel = (type: ImageType): string => {
    switch (type) {
      case 'PROFILE':
        return 'Profile Photos';
      case 'HERO':
        return 'Hero Images';
      case 'GALLERY':
        return 'Gallery Images';
      case 'INTERNAL':
        return 'Internal Images';
      default:
        return 'Images';
    }
  };

  const handleEditImage = useCallback((image: PortfolioImage) => {
    setEditForm({
      alt_text: image.alt_text || '',
      sort_order: image.sort_order,
    });
    setEditDialog({ isOpen: true, image });
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editDialog.image) return;

    onUpdate(editDialog.image.id, {
      alt_text: editForm.alt_text,
      sort_order: editForm.sort_order,
    });

    setEditDialog({ isOpen: false, image: null });
  }, [editDialog.image, editForm, onUpdate]);

  const handleDeleteImage = useCallback((image: PortfolioImage) => {
    setDeleteDialog({ isOpen: true, image });
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteDialog.image) return;

    onDelete(deleteDialog.image.id);
    setDeleteDialog({ isOpen: false, image: null });
  }, [deleteDialog.image, onDelete]);

  const handleSetPrimary = useCallback((image: PortfolioImage) => {
    onSetPrimary(image.id, image.type);
  }, [onSetPrimary]);

  const handleDragStart = useCallback((e: React.DragEvent, imageId: string) => {
    setDraggedImage(imageId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetImageId: string) => {
    e.preventDefault();
    
    if (!draggedImage || draggedImage === targetImageId) return;

    const draggedIndex = images.findIndex(img => img.id === draggedImage);
    const targetIndex = images.findIndex(img => img.id === targetImageId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newImages = [...images];
    const [draggedItem] = newImages.splice(draggedIndex, 1);
    if (draggedItem) {
      newImages.splice(targetIndex, 0, draggedItem);
    }

    const newOrder = newImages.map(img => img.id);
    onReorder(newOrder);
    setDraggedImage(null);
  }, [draggedImage, images, onReorder]);

  const toggleImageSelection = useCallback((imageId: string) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  }, []);

  const handleBulkDelete = useCallback(() => {
    if (selectedImages.length === 0) return;
    
    selectedImages.forEach(imageId => onDelete(imageId));
    setSelectedImages([]);
  }, [selectedImages, onDelete]);

  const selectAll = useCallback(() => {
    setSelectedImages(images.map(img => img.id));
  }, [images]);

  const clearSelection = useCallback(() => {
    setSelectedImages([]);
  }, []);

  const handleImageClick = useCallback((image: PortfolioImage) => {
    const index = images.findIndex(img => img.id === image.id);
    setPreviewIndex(index);
    setPreviewOpen(true);
  }, [images]);

  const handlePreviewClose = useCallback(() => {
    setPreviewOpen(false);
  }, []);

  const handlePreviewDelete = useCallback((image: PortfolioImage) => {
    onDelete(image.id);
    setPreviewOpen(false);
  }, [onDelete]);

  const handlePreviewSetPrimary = useCallback((image: PortfolioImage) => {
    onSetPrimary(image.id, image.type);
  }, [onSetPrimary]);

  const handlePreviewUpdateAltText = useCallback((imageId: string, altText: string) => {
    onUpdate(imageId, { alt_text: altText });
  }, [onUpdate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading images...</p>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center p-8">
        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No images yet</h3>
        <p className="text-gray-500">Upload some images to get started</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold">
            Images ({images.length})
          </h3>
          {selectedImages.length > 0 && (
            <Badge variant="secondary">
              {selectedImages.length} selected
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Selection Controls */}
          {canEdit && selectedImages.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={clearSelection}>
                Clear
              </Button>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                Delete Selected
              </Button>
            </>
          )}
          
          {canEdit && selectedImages.length === 0 && (
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
          )}

          {/* Layout Toggle */}
          <div className="flex border rounded-lg p-1">
            <Button
              variant={layout === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLayout('grid')}
              className="px-2"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={layout === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLayout('list')}
              className="px-2"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Images by Type */}
      <div className="space-y-8">
        {Object.entries(imagesByType).map(([type, typeImages]) => (
          <div key={type} className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">
              {getTypeLabel(type as ImageType)} ({typeImages.length})
            </h4>
            
            <div className={cn(
              layout === 'grid' 
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
                : 'space-y-4'
            )}>
              {typeImages.map((image) => (
                <Card 
                  key={image.id}
                  className={cn(
                    'relative group transition-all duration-200',
                    selectedImages.includes(image.id) && 'ring-2 ring-blue-500',
                    draggedImage === image.id && 'opacity-50',
                    layout === 'list' && 'flex'
                  )}
                  draggable={canEdit}
                  onDragStart={(e) => handleDragStart(e, image.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, image.id)}
                >
                  <CardContent className={cn(
                    'p-0',
                    layout === 'list' && 'flex items-center space-x-4 p-4'
                  )}>
                    {/* Image Display */}
                    <div className={cn(
                      'relative',
                      layout === 'grid' ? 'aspect-square' : 'w-16 h-16 flex-shrink-0'
                    )}>
                      <img
                        src={image.file_path}
                        alt={image.alt_text || image.file_name}
                        className="w-full h-full object-cover rounded-t-lg cursor-pointer"
                        onClick={() => handleImageClick(image)}
                      />
                      
                      {/* Selection Checkbox */}
                      {canEdit && (
                        <button
                          className="absolute top-2 left-2 w-6 h-6 rounded bg-white shadow-md flex items-center justify-center hover:bg-gray-50"
                          onClick={() => toggleImageSelection(image.id)}
                        >
                          {selectedImages.includes(image.id) && (
                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                          )}
                        </button>
                      )}

                      {/* Primary Badge */}
                      {image.is_primary && (
                        <Badge className="absolute top-2 right-2 text-xs">
                          Primary
                        </Badge>
                      )}

                      {/* Actions Overlay */}
                      {canEdit && (
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-t-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleEditImage(image)}
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleSetPrimary(image)}
                            >
                              {image.is_primary ? <StarOff className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteImage(image)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Image Info */}
                    <div className={cn(
                      layout === 'grid' ? 'p-3' : 'flex-1 min-w-0'
                    )}>
                      <div className="space-y-1">
                        <p className="text-sm font-medium truncate">
                          {image.file_name}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{formatFileSize(image.file_size)}</span>
                          {image.width && image.height && (
                            <span>{image.width}×{image.height}</span>
                          )}
                        </div>
                        {image.alt_text && layout === 'list' && (
                          <p className="text-xs text-gray-400 truncate">
                            {image.alt_text}
                          </p>
                        )}
                      </div>

                      {/* List Actions */}
                      {canEdit && layout === 'list' && (
                        <div className="flex items-center justify-end mt-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditImage(image)}>
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSetPrimary(image)}>
                                {image.is_primary ? (
                                  <>
                                    <StarOff className="w-4 h-4 mr-2" />
                                    Remove Primary
                                  </>
                                ) : (
                                  <>
                                    <Star className="w-4 h-4 mr-2" />
                                    Set Primary
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteImage(image)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialog.isOpen} onOpenChange={(open) => !open && setEditDialog({ isOpen: false, image: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
            <DialogDescription>
              Update the image details and metadata.
            </DialogDescription>
          </DialogHeader>
          
          {editDialog.image && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={editDialog.image.file_path}
                  alt={editDialog.image.alt_text || editDialog.image.file_name}
                  className="max-w-full max-h-40 object-contain rounded"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="alt_text">Alt Text</Label>
                  <Textarea
                    id="alt_text"
                    value={editForm.alt_text}
                    onChange={(e) => setEditForm(prev => ({ ...prev, alt_text: e.target.value }))}
                    placeholder="Describe this image for accessibility"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={editForm.sort_order}
                    onChange={(e) => setEditForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ isOpen: false, image: null })}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && setDeleteDialog({ isOpen: false, image: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Image</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this image? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {deleteDialog.image && (
            <div className="flex justify-center py-4">
              <img
                src={deleteDialog.image.file_path}
                alt={deleteDialog.image.alt_text || deleteDialog.image.file_name}
                className="max-w-full max-h-32 object-contain rounded"
              />
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ isOpen: false, image: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview */}
      <ImagePreview
        isOpen={previewOpen}
        onClose={handlePreviewClose}
        images={images}
        initialIndex={previewIndex}
        onDelete={canEdit ? handlePreviewDelete : undefined}
        onEdit={canEdit ? handleEditImage : undefined}
        onSetPrimary={canEdit ? handlePreviewSetPrimary : undefined}
        onUpdateAltText={canEdit ? handlePreviewUpdateAltText : undefined}
        canEdit={canEdit}
      />
    </div>
  );
}