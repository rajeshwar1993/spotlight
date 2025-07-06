'use client';

import { ResponsiveImage } from '@/components/ui/responsive-image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, ExternalLink, Award, Calendar } from 'lucide-react';
import type { Portfolio, User } from '@/types';

interface ShowcaseSectionProps {
  portfolio: Portfolio;
  user: User;
  isEditing?: boolean;
  className?: string;
}

export function ShowcaseSection({ portfolio, user, isEditing = false, className = '' }: ShowcaseSectionProps) {
  const galleryImages = portfolio.images?.filter(img => img.imageType === 'GALLERY') || [];

  // Mock showcase items - in a real app, this would come from the portfolio
  const showcaseItems = [
    {
      title: "Hamlet - Lead Role",
      type: "Theatre",
      year: "2023",
      description: "Starring as Hamlet in Shakespeare's timeless tragedy at the Metropolitan Theatre. A career-defining performance that showcased dramatic range.",
      image: galleryImages[0],
      tags: ["Drama", "Classical", "Lead Role"],
      featured: true
    },
    {
      title: "Commercial Campaign",
      type: "Commercial",
      year: "2023",
      description: "National television commercial for luxury brand, reaching millions of viewers across multiple markets.",
      image: galleryImages[1],
      tags: ["Commercial", "Television", "National"],
      featured: false
    },
    {
      title: "Independent Film",
      type: "Film",
      year: "2022",
      description: "Supporting role in award-winning independent film that premiered at international film festivals.",
      image: galleryImages[2],
      tags: ["Film", "Independent", "Festival"],
      featured: true
    },
    {
      title: "Voice Over Work",
      type: "Voice",
      year: "2022",
      description: "Character voice for animated series, bringing life to memorable characters through vocal performance.",
      image: galleryImages[3],
      tags: ["Voice Acting", "Animation", "Character"],
      featured: false
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Theatre": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Film": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Commercial": return "bg-green-100 text-green-800 border-green-200";
      case "Voice": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <section className={`py-16 lg:py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Featured Showcase
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Highlights from my professional journey, showcasing versatility and excellence across different mediums.
            </p>
          </div>

          {/* Featured Items Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {showcaseItems.filter(item => item.featured).map((item, index) => (
              <Card key={index} className="bg-white bg-opacity-10 backdrop-blur-sm border-white border-opacity-20 overflow-hidden group hover:bg-opacity-20 transition-all duration-300">
                <div className="relative">
                  {item.image ? (
                    <div className="aspect-video relative overflow-hidden">
                      <ResponsiveImage
                        src={item.image.fileName}
                        alt={item.title}
                        bucketName="portfolio-images"
                        imageType="GALLERY"
                        width={600}
                        height={338}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        enableProgressive={true}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button size="lg" className="bg-white bg-opacity-20 backdrop-blur-sm border-white border-opacity-30 text-white hover:bg-opacity-30">
                          <Play className="w-5 h-5 mr-2" />
                          View Project
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                      <Play className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  
                  <Badge className={`absolute top-4 left-4 ${getTypeColor(item.type)}`}>
                    {item.type}
                  </Badge>
                  
                  <div className="absolute top-4 right-4 flex items-center gap-2 text-white text-sm">
                    <Calendar className="w-4 h-4" />
                    {item.year}
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-300 mb-4 leading-relaxed">{item.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary" className="bg-white bg-opacity-20 text-white border-white border-opacity-30">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Other Projects Grid */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-8 text-center">Recent Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {showcaseItems.filter(item => !item.featured).map((item, index) => (
                <Card key={index} className="bg-white bg-opacity-5 backdrop-blur-sm border-white border-opacity-10 overflow-hidden group hover:bg-opacity-10 transition-all duration-300">
                  <div className="flex">
                    <div className="w-1/3">
                      {item.image ? (
                        <div className="aspect-square relative overflow-hidden">
                          <ResponsiveImage
                            src={item.image.fileName}
                            alt={item.title}
                            bucketName="portfolio-images"
                            imageType="GALLERY"
                            width={200}
                            height={200}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            enableProgressive={true}
                          />
                        </div>
                      ) : (
                        <div className="aspect-square bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                          <Play className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-lg font-semibold text-white">{item.title}</h4>
                        <Badge className={`text-xs ${getTypeColor(item.type)}`}>
                          {item.type}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">{item.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                          <Calendar className="w-3 h-3" />
                          {item.year}
                        </div>
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white hover:bg-opacity-20 p-1">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">15+</div>
                <div className="text-gray-300 text-sm">Productions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">5</div>
                <div className="text-gray-300 text-sm">Awards</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">8</div>
                <div className="text-gray-300 text-sm">Lead Roles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">3</div>
                <div className="text-gray-300 text-sm">Years Experience</div>
              </div>
            </div>
          </div>

          {/* Placeholder for editing */}
          {isEditing && showcaseItems.length === 0 && (
            <div className="mt-12 p-8 border-2 border-dashed border-white border-opacity-30 rounded-lg text-center">
              <Award className="w-12 h-12 text-white opacity-50 mx-auto mb-4" />
              <p className="text-gray-300">Add your featured projects and showcase items</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}