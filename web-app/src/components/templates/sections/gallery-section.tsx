'use client';

import { ResponsiveImage } from '@/components/ui/responsive-image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ZoomIn, Download, Share2, Heart } from 'lucide-react';
import { useState } from 'react';
import type { Portfolio, User } from '@/types';

interface GallerySectionProps {
  portfolio: Portfolio;
  user: User;
  isEditing?: boolean;
  className?: string;
}

export function GallerySection({ portfolio, user, isEditing = false, className = '' }: GallerySectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const galleryImages = portfolio.images?.filter(img => img.imageType === 'GALLERY') || [];

  // Mock categories - in a real app, this would come from image metadata
  const categories = [
    { id: 'all', label: 'All Photos', count: galleryImages.length },
    { id: 'headshots', label: 'Headshots', count: Math.floor(galleryImages.length * 0.3) },
    { id: 'portfolio', label: 'Portfolio', count: Math.floor(galleryImages.length * 0.4) },
    { id: 'behind-scenes', label: 'Behind the Scenes', count: Math.floor(galleryImages.length * 0.3) }
  ];

  // Mock image data with categories
  const enhancedImages = galleryImages.map((image, index) => ({
    ...image,
    category: ['headshots', 'portfolio', 'behind-scenes'][index % 3],
    title: `Photo ${index + 1}`,
    description: 'Professional photography showcasing versatility and range.',
    likes: Math.floor(Math.random() * 100) + 10,
    featured: index < 3
  }));

  const filteredImages = selectedCategory === 'all' 
    ? enhancedImages 
    : enhancedImages.filter(img => img.category === selectedCategory);

  return (
    <section className={`py-16 lg:py-24 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Photo Gallery
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A curated collection of professional photographs showcasing range, versatility, and artistic vision.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`px-6 py-2 ${
                  selectedCategory === category.id 
                    ? "bg-gray-900 text-white" 
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Featured Images Row */}
          {selectedCategory === 'all' && enhancedImages.some(img => img.featured) && (
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Featured</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {enhancedImages.filter(img => img.featured).map((image, index) => (
                  <Card key={index} className="group overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <ResponsiveImage
                        src={image.fileName}
                        alt={image.title}
                        bucketName="portfolio-images"
                        imageType="GALLERY"
                        width={400}
                        height={500}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        enableProgressive={true}
                        showLoadingState={true}
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-3">
                          <Button size="sm" variant="secondary" className="bg-white bg-opacity-90">
                            <ZoomIn className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="secondary" className="bg-white bg-opacity-90">
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Category Badge */}
                      <Badge className="absolute top-4 left-4 bg-black bg-opacity-60 text-white border-0">
                        {image.category.replace('-', ' ')}
                      </Badge>

                      {/* Like Button */}
                      <div className="absolute top-4 right-4 flex items-center gap-1 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-sm">
                        <Heart className="w-3 h-3" />
                        {image.likes}
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-1">{image.title}</h4>
                      <p className="text-sm text-gray-600">{image.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Main Gallery Grid */}
          <div>
            {selectedCategory !== 'all' && (
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center capitalize">
                {selectedCategory.replace('-', ' ')}
              </h3>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {filteredImages.map((image, index) => (
                <Card key={index} className="group overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="relative aspect-square overflow-hidden">
                    <ResponsiveImage
                      src={image.fileName}
                      alt={image.title}
                      bucketName="portfolio-images"
                      imageType="GALLERY"
                      width={300}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      enableProgressive={true}
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-90"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Likes */}
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs">
                      <Heart className="w-3 h-3" />
                      {image.likes}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Load More Button */}
          {filteredImages.length > 12 && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg" className="px-8">
                Load More Photos
              </Button>
            </div>
          )}

          {/* Gallery Stats */}
          <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{galleryImages.length}</div>
                <div className="text-gray-600">Total Photos</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {enhancedImages.reduce((sum, img) => sum + img.likes, 0)}
                </div>
                <div className="text-gray-600">Total Likes</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">{categories.length - 1}</div>
                <div className="text-gray-600">Categories</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {enhancedImages.filter(img => img.featured).length}
                </div>
                <div className="text-gray-600">Featured</div>
              </div>
            </div>
          </div>

          {/* Placeholder for editing */}
          {isEditing && galleryImages.length === 0 && (
            <div className="mt-12 p-12 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <ZoomIn className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Build Your Gallery</h3>
              <p className="text-gray-500">Upload photos to create a stunning portfolio gallery</p>
              <Button className="mt-4">Add Photos</Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}