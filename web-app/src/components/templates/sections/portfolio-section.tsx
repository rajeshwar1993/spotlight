'use client';

import { ResponsiveImage } from '@/components/ui/responsive-image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Play, ExternalLink, Calendar, Star, Eye } from 'lucide-react';
import { useState } from 'react';
import type { Portfolio, User } from '@/types';

interface PortfolioSectionProps {
  portfolio: Portfolio;
  user: User;
  isEditing?: boolean;
  className?: string;
}

export function PortfolioSection({ portfolio, user, isEditing = false, className = '' }: PortfolioSectionProps) {
  const [activeTab, setActiveTab] = useState('featured');
  const galleryImages = portfolio.images?.filter(img => img.imageType === 'GALLERY') || [];

  // Mock portfolio projects - in a real app, this would come from the database
  const portfolioProjects = [
    {
      id: 1,
      title: "The Crown - Netflix Series",
      type: "Television",
      role: "Supporting Actor",
      year: "2023",
      status: "Completed",
      description: "Multi-episode arc in the acclaimed historical drama series, portraying a complex political figure with nuanced character development.",
      image: galleryImages[0],
      tags: ["Drama", "Historical", "Netflix", "Supporting Role"],
      rating: 4.8,
      views: 2400,
      featured: true,
      category: "television"
    },
    {
      id: 2,
      title: "Macbeth - Royal Shakespeare",
      type: "Theatre",
      role: "Lead Actor",
      year: "2023",
      status: "Completed",
      description: "Starring as Macbeth in the Royal Shakespeare Company's modern interpretation of the classic tragedy.",
      image: galleryImages[1],
      tags: ["Theatre", "Shakespeare", "Lead Role", "Classical"],
      rating: 4.9,
      views: 1800,
      featured: true,
      category: "theatre"
    },
    {
      id: 3,
      title: "Coca-Cola Campaign",
      type: "Commercial",
      role: "Brand Ambassador",
      year: "2023",
      status: "Aired",
      description: "National commercial campaign for global brand, showcasing lifestyle and product integration.",
      image: galleryImages[2],
      tags: ["Commercial", "National", "Brand Ambassador"],
      rating: 4.6,
      views: 5200,
      featured: false,
      category: "commercial"
    },
    {
      id: 4,
      title: "Independent Film - 'Echoes'",
      type: "Film",
      role: "Lead Actor",
      year: "2022",
      status: "Post-Production",
      description: "Psychological thriller exploring themes of memory and identity, currently in festival circuit.",
      image: galleryImages[3],
      tags: ["Film", "Independent", "Thriller", "Lead Role"],
      rating: 4.7,
      views: 980,
      featured: true,
      category: "film"
    }
  ];

  const tabs = [
    { id: 'featured', label: 'Featured Work', count: portfolioProjects.filter(p => p.featured).length },
    { id: 'television', label: 'Television', count: portfolioProjects.filter(p => p.category === 'television').length },
    { id: 'theatre', label: 'Theatre', count: portfolioProjects.filter(p => p.category === 'theatre').length },
    { id: 'film', label: 'Film', count: portfolioProjects.filter(p => p.category === 'film').length },
    { id: 'commercial', label: 'Commercial', count: portfolioProjects.filter(p => p.category === 'commercial').length }
  ];

  const getFilteredProjects = () => {
    if (activeTab === 'featured') {
      return portfolioProjects.filter(p => p.featured);
    }
    return portfolioProjects.filter(p => p.category === activeTab);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Aired': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Post-Production': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Production': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Television': return '📺';
      case 'Theatre': return '🎭';
      case 'Film': return '🎬';
      case 'Commercial': return '📢';
      default: return '🎪';
    }
  };

  return (
    <section className={`py-16 lg:py-24 bg-white ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Professional Portfolio
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              A comprehensive showcase of professional work across television, theatre, film, and commercial projects.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                className={`px-6 py-3 ${
                  activeTab === tab.id 
                    ? "bg-gray-900 text-white shadow-lg" 
                    : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                {tab.count > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {tab.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {/* Portfolio Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {getFilteredProjects().map((project) => (
              <Card key={project.id} className="group overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0">
                <div className="relative">
                  {/* Project Image */}
                  <div className="aspect-video relative overflow-hidden">
                    {project.image ? (
                      <ResponsiveImage
                        src={project.image.fileName}
                        alt={project.title}
                        bucketName="portfolio-images"
                        imageType="GALLERY"
                        width={500}
                        height={281}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        enableProgressive={true}
                        showLoadingState={true}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <span className="text-4xl">{getTypeIcon(project.type)}</span>
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-3">
                        <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100">
                          <Play className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Type Badge */}
                    <Badge className="absolute top-4 left-4 bg-black bg-opacity-70 text-white border-0">
                      {project.type}
                    </Badge>

                    {/* Status Badge */}
                    <Badge className={`absolute top-4 right-4 text-xs ${getStatusColor(project.status)}`}>
                      {project.status}
                    </Badge>

                    {/* Featured Badge */}
                    {project.featured && (
                      <div className="absolute bottom-4 left-4">
                        <Badge className="bg-yellow-500 text-black border-0 text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <CardContent className="p-6">
                  {/* Project Title & Role */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">
                      {project.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-blue-600 font-medium">{project.role}</p>
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Calendar className="w-4 h-4" />
                        {project.year}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {project.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.tags.length - 3} more
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{project.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{project.views.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Portfolio Summary Stats */}
          <div className="mt-16 bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Career Highlights</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">{portfolioProjects.length}</div>
                <div className="text-gray-600">Total Projects</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {portfolioProjects.filter(p => p.status === 'Completed').length}
                </div>
                <div className="text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {portfolioProjects.filter(p => p.featured).length}
                </div>
                <div className="text-gray-600">Featured Work</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {Math.round(portfolioProjects.reduce((sum, p) => sum + p.rating, 0) / portfolioProjects.length * 10) / 10}
                </div>
                <div className="text-gray-600">Avg Rating</div>
              </div>
            </div>
          </div>

          {/* Placeholder for editing */}
          {isEditing && portfolioProjects.length === 0 && (
            <div className="mt-12 p-12 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Build Your Portfolio</h3>
              <p className="text-gray-500 mb-4">Add your professional projects and showcase your work</p>
              <Button>Add Project</Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}