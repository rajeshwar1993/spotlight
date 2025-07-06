'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Quote, Star, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Portfolio, User } from '@/types';

interface TestimonialsSectionProps {
  portfolio: Portfolio;
  user: User;
  isEditing?: boolean;
  className?: string;
}

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  project: string;
  date: string;
  avatar?: string;
  featured: boolean;
}

export function TestimonialsSection({ portfolio, user, isEditing = false, className = '' }: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Mock testimonials - in a real app, this would come from the database
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Creative Director",
      company: "Vogue Magazine",
      content: "Working with this artist was an absolute dream. Their ability to capture emotion and tell a story through their lens is unparalleled. The professionalism and creative vision exceeded all our expectations.",
      rating: 5,
      project: "Fashion Editorial",
      date: "December 2023",
      featured: true
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Marketing Manager",
      company: "Nike",
      content: "The commercial campaign they delivered was nothing short of spectacular. Every shot was perfectly composed, and they brought a unique artistic flair that elevated our brand story.",
      rating: 5,
      project: "Brand Campaign",
      date: "November 2023",
      featured: true
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      role: "Theatre Director",
      company: "Royal Shakespeare Company",
      content: "Their performance as Hamlet was transformative. The depth of character interpretation and emotional range displayed throughout the production was truly exceptional. A rising star in the theatre world.",
      rating: 5,
      project: "Hamlet Production",
      date: "October 2023",
      featured: false
    },
    {
      id: 4,
      name: "David Thompson",
      role: "Film Producer",
      company: "Independent Films Ltd",
      content: "Incredible talent and dedication to craft. Their ability to embody the character completely made our film what it is today. Professional, prepared, and passionate about the art.",
      rating: 5,
      project: "Independent Film",
      date: "September 2023",
      featured: false
    },
    {
      id: 5,
      name: "Lisa Park",
      role: "Brand Manager",
      company: "L'Oréal",
      content: "The creative vision and execution for our beauty campaign was flawless. They understood our brand identity perfectly and delivered visuals that truly resonated with our target audience.",
      rating: 5,
      project: "Beauty Campaign",
      date: "August 2023",
      featured: true
    }
  ];

  const featuredTestimonials = testimonials.filter(t => t.featured);

  useEffect(() => {
    if (isAutoPlaying && featuredTestimonials.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredTestimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, featuredTestimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredTestimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredTestimonials.length) % featuredTestimonials.length);
    setIsAutoPlaying(false);
  };

  const currentTestimonial = featuredTestimonials[currentIndex];

  const averageRating = testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length;

  return (
    <section className={`py-16 lg:py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What People Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Testimonials from directors, producers, brands, and collaborators who've experienced the work firsthand.
            </p>
            
            {/* Overall Rating */}
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className={`w-5 h-5 ${
                      index < Math.floor(averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {averageRating.toFixed(1)} out of 5
              </span>
              <span className="text-gray-600">
                ({testimonials.length} reviews)
              </span>
            </div>
          </div>

          {/* Featured Testimonial Carousel */}
          {featuredTestimonials.length > 0 && (
            <div className="mb-16">
              <Card className="bg-white shadow-xl border-0 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    {/* Main Testimonial */}
                    <div className="p-8 lg:p-12 text-center">
                      <Quote className="w-12 h-12 text-blue-600 mx-auto mb-6" />
                      
                      <blockquote className="text-xl lg:text-2xl text-gray-700 leading-relaxed mb-8 font-light italic max-w-4xl mx-auto">
                        "{currentTestimonial?.content}"
                      </blockquote>
                      
                      <div className="flex flex-col items-center gap-4">
                        <div className="text-center">
                          <h4 className="text-xl font-bold text-gray-900">
                            {currentTestimonial?.name}
                          </h4>
                          <p className="text-blue-600 font-medium">
                            {currentTestimonial?.role}
                          </p>
                          <p className="text-gray-600">
                            {currentTestimonial?.company}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary" className="px-3 py-1">
                            {currentTestimonial?.project}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {currentTestimonial?.date}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, index) => (
                            <Star
                              key={index}
                              className="w-4 h-4 text-yellow-400 fill-current"
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Navigation Arrows */}
                    {featuredTestimonials.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 p-0 bg-white shadow-lg hover:shadow-xl"
                          onClick={prevTestimonial}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 p-0 bg-white shadow-lg hover:shadow-xl"
                          onClick={nextTestimonial}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </>
                    )}

                    {/* Dots Indicator */}
                    {featuredTestimonials.length > 1 && (
                      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {featuredTestimonials.map((_, index) => (
                          <button
                            key={index}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                            onClick={() => {
                              setCurrentIndex(index);
                              setIsAutoPlaying(false);
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Auto-play indicator */}
                    <div className="absolute top-4 right-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                      >
                        <Play className={`w-4 h-4 ${isAutoPlaying ? 'opacity-100' : 'opacity-50'}`} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* All Testimonials Grid */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">More Reviews</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.slice(0, 6).map((testimonial) => (
                <Card key={testimonial.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(testimonial.rating)].map((_, index) => (
                          <Star
                            key={index}
                            className="w-4 h-4 text-yellow-400 fill-current"
                          />
                        ))}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {testimonial.project}
                      </Badge>
                    </div>
                    
                    <Quote className="w-6 h-6 text-blue-600 mb-3" />
                    
                    <blockquote className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-4">
                      "{testimonial.content}"
                    </blockquote>
                    
                    <div className="border-t border-gray-100 pt-4">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {testimonial.name}
                      </h4>
                      <p className="text-blue-600 text-xs font-medium">
                        {testimonial.role}
                      </p>
                      <p className="text-gray-600 text-xs">
                        {testimonial.company}
                      </p>
                      <p className="text-gray-500 text-xs mt-2">
                        {testimonial.date}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Testimonial Stats */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">{testimonials.length}</div>
                <div className="text-blue-100">Total Reviews</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">
                  {averageRating.toFixed(1)}★
                </div>
                <div className="text-blue-100">Average Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">
                  {testimonials.filter(t => t.rating === 5).length}
                </div>
                <div className="text-blue-100">5-Star Reviews</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">100%</div>
                <div className="text-blue-100">Would Recommend</div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Ready to Work Together?
            </h3>
            <p className="text-gray-600 mb-6">
              Join the list of satisfied clients and let's create something amazing.
            </p>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Start Your Project
            </Button>
          </div>

          {/* Placeholder for editing */}
          {isEditing && testimonials.length === 0 && (
            <div className="mt-12 p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <Quote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Add Client Testimonials</h3>
              <p className="text-gray-500 mb-4">Showcase reviews and feedback from your clients</p>
              <Button variant="outline">Add Testimonial</Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}