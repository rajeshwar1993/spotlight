'use client';

import { ResponsiveImage } from '@/components/ui/responsive-image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Palette, Sparkles, Heart, Eye, Share2, Download } from 'lucide-react';
import { useState } from 'react';
import type { Portfolio, User } from '@/types';

interface PortfolioGridSectionProps {
  portfolio: Portfolio;
  user: User;
  isEditing?: boolean;
  className?: string;
}

export function PortfolioGridSection({ portfolio, user, isEditing = false, className = '' }: PortfolioGridSectionProps) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const galleryImages = portfolio.images?.filter(img => img.imageType === 'GALLERY') || [];

  // Enhanced gallery items with artistic metadata
  const portfolioItems = galleryImages.map((image, index) => ({
    id: index + 1,
    image,
    title: `Artistic Vision ${index + 1}`,
    category: ['portraits', 'creative', 'conceptual', 'lifestyle'][index % 4],
    medium: ['Digital Art', 'Photography', 'Mixed Media', 'Concept Art'][index % 4],
    year: 2023 - (index % 3),
    description: [
      'A bold exploration of light and shadow, capturing raw emotion through dramatic composition.',
      'Conceptual piece merging traditional techniques with modern digital artistry.',
      'Minimalist approach showcasing the beauty of simplicity and negative space.',
      'Dynamic lifestyle capture celebrating authenticity and natural movement.'
    ][index % 4],
    likes: Math.floor(Math.random() * 150) + 20,
    views: Math.floor(Math.random() * 1000) + 100,
    featured: index < 4,
    colors: [
      ['#FF6B6B', '#4ECDC4', '#45B7D1'],
      ['#96CEB4', '#FFEAA7', '#DDA0DD'],
      ['#74B9FF', '#FD79A8', '#FDCB6E'],
      ['#A29BFE', '#6C5CE7', '#00B894']
    ][index % 4]
  }));

  const categories = [
    { id: 'all', label: 'All Work', count: portfolioItems.length },
    { id: 'portraits', label: 'Portraits', count: portfolioItems.filter(item => item.category === 'portraits').length },
    { id: 'creative', label: 'Creative', count: portfolioItems.filter(item => item.category === 'creative').length },
    { id: 'conceptual', label: 'Conceptual', count: portfolioItems.filter(item => item.category === 'conceptual').length },
    { id: 'lifestyle', label: 'Lifestyle', count: portfolioItems.filter(item => item.category === 'lifestyle').length }
  ];

  const filteredItems = selectedFilter === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === selectedFilter);

  const featuredItems = portfolioItems.filter(item => item.featured);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'portraits': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'creative': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'conceptual': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'lifestyle': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <section className={`py-16 lg:py-24 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden ${className}`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Palette className="w-8 h-8 text-purple-600" />
              <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Creative Portfolio
              </h2>
              <Sparkles className="w-8 h-8 text-pink-600" />
            </div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              An immersive collection of artistic works showcasing creativity, vision, and technical mastery across various mediums.
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedFilter === category.id ? "default" : "outline"}
                className={`px-6 py-3 rounded-full ${
                  selectedFilter === category.id 
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg" 
                    : "bg-white bg-opacity-80 backdrop-blur-sm text-gray-700 hover:bg-opacity-100 border-gray-300"
                }`}
                onClick={() => setSelectedFilter(category.id)}
              >
                {category.label}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Featured Grid */}
          {selectedFilter === 'all' && featuredItems.length > 0 && (
            <div className="mb-20">
              <div className="flex items-center justify-center gap-2 mb-12">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="text-2xl font-bold text-gray-900">Featured Creations</h3>
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredItems.map((item) => (
                  <Card 
                    key={item.id} 
                    className="group overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border-0 bg-white bg-opacity-90 backdrop-blur-sm"
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      {item.image ? (
                        <ResponsiveImage
                          src={item.image.fileName}
                          alt={item.title}
                          bucketName="portfolio-images"
                          imageType="GALLERY"
                          width={400}
                          height={400}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          enableProgressive={true}
                          showLoadingState={true}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                          <Palette className="w-16 h-16 text-purple-500" />
                        </div>
                      )}
                      
                      {/* Color Palette */}
                      <div className="absolute top-4 left-4 flex gap-1">
                        {item.colors.map((color, colorIndex) => (
                          <div 
                            key={colorIndex}
                            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: color }}
                          ></div>
                        ))}
                      </div>

                      {/* Hover Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent transition-all duration-300 ${
                        hoveredItem === item.id ? 'opacity-70' : 'opacity-0'
                      }`}>
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-4 text-white text-sm">
                              <div className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                {item.likes}
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {item.views}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
                                <Share2 className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Category Badge */}
                      <Badge className={`absolute bottom-4 right-4 text-xs ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </Badge>
                    </div>

                    <CardContent className="p-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{item.medium} • {item.year}</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Main Portfolio Grid */}
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
              {filteredItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="group overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white bg-opacity-80 backdrop-blur-sm"
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className="relative aspect-square overflow-hidden">
                    {item.image ? (
                      <ResponsiveImage
                        src={item.image.fileName}
                        alt={item.title}
                        bucketName="portfolio-images"
                        imageType="GALLERY"
                        width={300}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        enableProgressive={true}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <Palette className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Quick Actions */}
                    <div className={`absolute inset-0 bg-black transition-all duration-300 flex items-center justify-center ${
                      hoveredItem === item.id ? 'bg-opacity-40' : 'bg-opacity-0'
                    }`}>
                      <div className={`flex gap-2 transition-all duration-300 ${
                        hoveredItem === item.id ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                      }`}>
                        <Button size="sm" className="bg-white bg-opacity-90 text-gray-900 hover:bg-white">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" className="bg-white bg-opacity-90 text-gray-900 hover:bg-white">
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-xs">
                      <div className="flex items-center gap-3 bg-black bg-opacity-50 px-2 py-1 rounded">
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {item.likes}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {item.views}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Portfolio Stats */}
          <div className="mt-20 bg-white bg-opacity-80 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Creative Impact</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">{portfolioItems.length}</div>
                <div className="text-gray-600">Artworks</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-pink-600 mb-2">
                  {portfolioItems.reduce((sum, item) => sum + item.likes, 0)}
                </div>
                <div className="text-gray-600">Total Likes</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {portfolioItems.reduce((sum, item) => sum + item.views, 0)}
                </div>
                <div className="text-gray-600">Total Views</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">{categories.length - 1}</div>
                <div className="text-gray-600">Categories</div>
              </div>
            </div>
          </div>

          {/* Placeholder for editing */}
          {isEditing && portfolioItems.length === 0 && (
            <div className="mt-12 p-12 border-2 border-dashed border-purple-300 bg-white bg-opacity-50 rounded-2xl text-center">
              <Palette className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Create Your Artistic Portfolio</h3>
              <p className="text-gray-500 mb-4">Upload your creative works and build a stunning visual portfolio</p>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                Add Artwork
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}