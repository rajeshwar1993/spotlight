'use client';

import { ResponsiveImage } from '@/components/ui/responsive-image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Calendar, MapPin, Users } from 'lucide-react';
import type { Portfolio, User } from '@/types';

interface WorkSectionProps {
  portfolio: Portfolio;
  user: User;
  isEditing?: boolean;
  className?: string;
}

export function WorkSection({ portfolio, user, isEditing = false, className = '' }: WorkSectionProps) {
  const galleryImages = portfolio.images?.filter(img => img.imageType === 'GALLERY') || [];

  // Mock work entries - in a real app, this would come from the database
  const workEntries = [
    {
      id: 1,
      title: "Royal Shakespeare Company",
      role: "Hamlet",
      type: "Theatre",
      year: "2023",
      location: "Stratford-upon-Avon, UK",
      description: "Starred as the titular character in Shakespeare's most famous tragedy. A critically acclaimed performance that ran for 6 months to sold-out audiences.",
      image: galleryImages[0],
      collaborators: ["Kenneth Branagh", "Judi Dench", "Ian McKellen"],
      achievements: ["Critics' Choice Award", "Standing Ovations", "Extended Run"],
      featured: true
    },
    {
      id: 2,
      title: "BBC Television",
      role: "Supporting Character",
      type: "Television",
      year: "2023",
      location: "London, UK",
      description: "Multi-episode arc in award-winning drama series. Character development across 8 episodes showcasing emotional range and dramatic depth.",
      image: galleryImages[1],
      collaborators: ["Sarah Lancashire", "Benedict Cumberbatch"],
      achievements: ["BAFTA Nomination", "Audience Choice"],
      featured: true
    },
    {
      id: 3,
      title: "Independent Film Festival",
      role: "Lead Actor",
      type: "Film",
      year: "2022",
      location: "Edinburgh, Scotland",
      description: "Psychological thriller exploring themes of identity and memory. Film premiered at Edinburgh International Film Festival to critical acclaim.",
      image: galleryImages[2],
      collaborators: ["Anya Taylor-Joy", "Oscar Isaac"],
      achievements: ["Festival Selection", "Best Actor Nomination"],
      featured: false
    },
    {
      id: 4,
      title: "National Theatre",
      role: "Ensemble",
      type: "Theatre",
      year: "2022",
      location: "London, UK",
      description: "Part of acclaimed ensemble cast in contemporary adaptation of classic play. Developed multiple character roles throughout the production.",
      image: galleryImages[3],
      collaborators: ["Helen Mirren", "Mark Rylance"],
      achievements: ["Olivier Nomination", "Critical Acclaim"],
      featured: false
    }
  ];

  const featuredWork = workEntries.filter(work => work.featured);
  const otherWork = workEntries.filter(work => !work.featured);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Theatre': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Television': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Film': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <section className={`py-16 lg:py-24 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-light text-gray-900 mb-6">
              Selected Work
            </h2>
            <div className="w-24 h-px bg-gray-300 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
              A curated selection of notable performances and collaborations across theatre, television, and film.
            </p>
          </div>

          {/* Featured Work */}
          {featuredWork.length > 0 && (
            <div className="mb-20">
              <h3 className="text-2xl font-light text-gray-900 mb-12 text-center">Featured Projects</h3>
              <div className="space-y-16">
                {featuredWork.map((work, index) => (
                  <div key={work.id} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                    index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                  }`}>
                    {/* Content */}
                    <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <Badge className={getTypeColor(work.type)}>
                            {work.type}
                          </Badge>
                          <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Calendar className="w-4 h-4" />
                            {work.year}
                          </div>
                        </div>
                        
                        <h4 className="text-2xl sm:text-3xl font-light text-gray-900 mb-2">
                          {work.title}
                        </h4>
                        
                        <p className="text-xl text-gray-700 font-medium mb-4">
                          {work.role}
                        </p>

                        <div className="flex items-center gap-2 text-gray-600 mb-6">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{work.location}</span>
                        </div>
                      </div>

                      <p className="text-gray-700 leading-relaxed text-lg font-light">
                        {work.description}
                      </p>

                      {/* Collaborators */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">Notable Collaborators</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {work.collaborators.map((collaborator, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs font-light">
                              {collaborator}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Achievements */}
                      <div>
                        <span className="text-sm font-medium text-gray-900 mb-3 block">Recognition</span>
                        <div className="flex flex-wrap gap-2">
                          {work.achievements.map((achievement, idx) => (
                            <Badge key={idx} className="bg-gray-900 text-white text-xs">
                              {achievement}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button variant="outline" className="group">
                        Learn More
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>

                    {/* Image */}
                    <div className={`${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                      {work.image ? (
                        <div className="aspect-[4/5] rounded-lg overflow-hidden shadow-lg">
                          <ResponsiveImage
                            src={work.image.fileName}
                            alt={`${work.title} - ${work.role}`}
                            bucketName="portfolio-images"
                            imageType="GALLERY"
                            width={500}
                            height={625}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            enableProgressive={true}
                            showLoadingState={true}
                          />
                        </div>
                      ) : (
                        <div className="aspect-[4/5] rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-lg">
                          <div className="text-center text-gray-500">
                            <span className="text-4xl mb-4 block">🎭</span>
                            <p className="text-sm font-light">{work.title}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Work */}
          {otherWork.length > 0 && (
            <div>
              <h3 className="text-2xl font-light text-gray-900 mb-12 text-center">Additional Work</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {otherWork.map((work) => (
                  <Card key={work.id} className="group overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border-0">
                    <div className="flex">
                      {/* Image */}
                      <div className="w-1/3">
                        {work.image ? (
                          <div className="aspect-square relative overflow-hidden">
                            <ResponsiveImage
                              src={work.image.fileName}
                              alt={`${work.title} - ${work.role}`}
                              bucketName="portfolio-images"
                              imageType="GALLERY"
                              width={200}
                              height={200}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              enableProgressive={true}
                            />
                          </div>
                        ) : (
                          <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <span className="text-2xl">🎭</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <CardContent className="flex-1 p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`text-xs ${getTypeColor(work.type)}`}>
                            {work.type}
                          </Badge>
                          <span className="text-xs text-gray-500">{work.year}</span>
                        </div>
                        
                        <h4 className="text-lg font-medium text-gray-900 mb-1">
                          {work.title}
                        </h4>
                        
                        <p className="text-gray-700 font-medium mb-2">
                          {work.role}
                        </p>

                        <p className="text-sm text-gray-600 line-clamp-2 mb-3 font-light">
                          {work.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-gray-500 text-xs">
                            <MapPin className="w-3 h-3" />
                            <span>{work.location}</span>
                          </div>
                          <Button size="sm" variant="ghost" className="p-1">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Work Summary */}
          <div className="mt-20 text-center">
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
              <div>
                <div className="text-2xl font-light text-gray-900 mb-2">{workEntries.length}</div>
                <div className="text-sm text-gray-600 font-light">Projects</div>
              </div>
              <div>
                <div className="text-2xl font-light text-gray-900 mb-2">{featuredWork.length}</div>
                <div className="text-sm text-gray-600 font-light">Featured</div>
              </div>
              <div>
                <div className="text-2xl font-light text-gray-900 mb-2">
                  {workEntries.flatMap(w => w.achievements).length}
                </div>
                <div className="text-sm text-gray-600 font-light">Awards</div>
              </div>
            </div>
          </div>

          {/* Placeholder for editing */}
          {isEditing && workEntries.length === 0 && (
            <div className="mt-12 p-12 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <div className="text-6xl mb-4">🎭</div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">Showcase Your Work</h3>
              <p className="text-gray-500 mb-4 font-light">Add your professional projects and performances</p>
              <Button variant="outline">Add Work</Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}