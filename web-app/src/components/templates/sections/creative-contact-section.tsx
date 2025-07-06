'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Send, Palette, Sparkles, Heart, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import type { Portfolio, User } from '@/types';

interface CreativeContactSectionProps {
  portfolio: Portfolio;
  user: User;
  isEditing?: boolean;
  className?: string;
}

export function CreativeContactSection({ portfolio, user, isEditing = false, className = '' }: CreativeContactSectionProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: '',
    budget: '',
    timeline: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creative form submitted:', formData);
  };

  const projectTypes = [
    'Portrait Photography',
    'Commercial Shoot',
    'Creative Direction',
    'Art Collaboration',
    'Brand Campaign',
    'Editorial Work',
    'Other'
  ];

  const budgetRanges = [
    'Under $1,000',
    '$1,000 - $5,000',
    '$5,000 - $10,000',
    '$10,000 - $25,000',
    '$25,000+',
    'Let\'s Discuss'
  ];

  return (
    <section className={`py-16 lg:py-24 bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 text-white relative overflow-hidden ${className}`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Palette className="w-8 h-8 text-pink-400" />
              <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white via-pink-200 to-purple-200 bg-clip-text text-transparent">
                Let's Create Together
              </h2>
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Ready to bring your creative vision to life? Let's collaborate and create something extraordinary.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Creative Contact Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Contact Cards */}
              <div className="space-y-6">
                {user.email && (
                  <Card className="bg-white bg-opacity-10 backdrop-blur-sm border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                          <Mail className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-1">Email Studio</h4>
                          <a 
                            href={`mailto:${user.email}`}
                            className="text-pink-200 hover:text-pink-100 transition-colors"
                          >
                            {user.email}
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {user.phone && (
                  <Card className="bg-white bg-opacity-10 backdrop-blur-sm border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                          <Phone className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-1">Call Direct</h4>
                          <a 
                            href={`tel:${user.phone}`}
                            className="text-green-200 hover:text-green-100 transition-colors"
                          >
                            {user.phone}
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {user.location && (
                  <Card className="bg-white bg-opacity-10 backdrop-blur-sm border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-1">Studio Location</h4>
                          <p className="text-yellow-200">{user.location}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Creative Services */}
              <Card className="bg-white bg-opacity-10 backdrop-blur-sm border-white border-opacity-20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Heart className="w-5 h-5 text-red-400" />
                    <h4 className="text-lg font-semibold text-white">Creative Services</h4>
                  </div>
                  <ul className="space-y-2 text-gray-200">
                    <li>• Portrait & Lifestyle Photography</li>
                    <li>• Commercial & Brand Campaigns</li>
                    <li>• Creative Direction & Consulting</li>
                    <li>• Editorial & Fashion Shoots</li>
                    <li>• Artistic Collaborations</li>
                    <li>• Custom Creative Projects</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Studio Hours */}
              <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-0">
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Studio Hours</h4>
                  <div className="space-y-2 text-gray-100">
                    <div className="flex justify-between">
                      <span>Monday - Friday:</span>
                      <span>9:00 AM - 7:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday:</span>
                      <span>10:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday:</span>
                      <span>By Appointment</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Creative Project Form */}
            <div className="lg:col-span-3">
              <Card className="bg-white bg-opacity-10 backdrop-blur-sm border-white border-opacity-20">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <MessageCircle className="w-6 h-6 text-blue-400" />
                    <h3 className="text-2xl font-bold text-white">Start Your Creative Project</h3>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name" className="text-white text-sm font-medium">
                          Your Name *
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="mt-2 bg-white bg-opacity-20 border-white border-opacity-30 text-white placeholder-gray-300 focus:border-pink-400 focus:ring-pink-400"
                          placeholder="Enter your name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-white text-sm font-medium">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="mt-2 bg-white bg-opacity-20 border-white border-opacity-30 text-white placeholder-gray-300 focus:border-pink-400 focus:ring-pink-400"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="projectType" className="text-white text-sm font-medium">
                          Project Type *
                        </Label>
                        <select
                          id="projectType"
                          name="projectType"
                          required
                          value={formData.projectType}
                          onChange={handleInputChange}
                          className="mt-2 w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-md text-white focus:border-pink-400 focus:ring-pink-400"
                        >
                          <option value="" className="text-gray-900">Select project type</option>
                          {projectTypes.map((type) => (
                            <option key={type} value={type} className="text-gray-900">
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="budget" className="text-white text-sm font-medium">
                          Budget Range
                        </Label>
                        <select
                          id="budget"
                          name="budget"
                          value={formData.budget}
                          onChange={handleInputChange}
                          className="mt-2 w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-md text-white focus:border-pink-400 focus:ring-pink-400"
                        >
                          <option value="" className="text-gray-900">Select budget range</option>
                          {budgetRanges.map((range) => (
                            <option key={range} value={range} className="text-gray-900">
                              {range}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="timeline" className="text-white text-sm font-medium">
                        Project Timeline
                      </Label>
                      <Input
                        id="timeline"
                        name="timeline"
                        type="text"
                        value={formData.timeline}
                        onChange={handleInputChange}
                        className="mt-2 bg-white bg-opacity-20 border-white border-opacity-30 text-white placeholder-gray-300 focus:border-pink-400 focus:ring-pink-400"
                        placeholder="e.g., ASAP, Next month, 2-3 weeks"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-white text-sm font-medium">
                        Project Description *
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="mt-2 bg-white bg-opacity-20 border-white border-opacity-30 text-white placeholder-gray-300 focus:border-pink-400 focus:ring-pink-400 resize-none"
                        placeholder="Tell me about your creative vision, goals, style preferences, and any specific requirements..."
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white flex-1 shadow-lg"
                      >
                        <Send className="w-5 h-5 mr-2" />
                        Send Creative Brief
                      </Button>
                      
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="lg"
                        className="border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-20"
                        onClick={() => setFormData({ name: '', email: '', projectType: '', budget: '', timeline: '', message: '' })}
                      >
                        Reset Form
                      </Button>
                    </div>

                    <div className="bg-white bg-opacity-10 rounded-lg p-4">
                      <p className="text-sm text-gray-200 leading-relaxed">
                        <strong>What happens next?</strong> I'll review your creative brief and respond within 24-48 hours with initial thoughts, availability, and next steps. Let's create something amazing together! ✨
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-white mb-8">Ready to Start Creating?</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Palette className="w-5 h-5 mr-2" />
                Book Consultation
              </Button>
              
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                View Portfolio
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="border-white border-opacity-50 text-white hover:bg-white hover:bg-opacity-20 transform hover:scale-105 transition-all duration-200"
              >
                <Heart className="w-5 h-5 mr-2" />
                Follow Journey
              </Button>
            </div>
          </div>

          {/* Placeholder for editing */}
          {isEditing && (
            <div className="mt-12 p-8 border-2 border-dashed border-white border-opacity-30 rounded-lg text-center">
              <Palette className="w-12 h-12 text-white opacity-50 mx-auto mb-4" />
              <p className="text-gray-200">Customize creative contact form and services</p>
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