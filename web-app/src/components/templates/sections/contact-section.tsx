'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Send, MessageCircle, Calendar, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import type { Portfolio, User } from '@/types';

interface ContactSectionProps {
  portfolio: Portfolio;
  user: User;
  isEditing?: boolean;
  className?: string;
}

export function ContactSection({ portfolio, user, isEditing = false, className = '' }: ContactSectionProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <section className={`py-16 lg:py-24 bg-gray-900 text-white ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Get In Touch
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Ready to collaborate? Let's discuss your next project and bring your vision to life.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>
                <div className="space-y-6">
                  {user.email && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-1">Email</h4>
                        <a 
                          href={`mailto:${user.email}`}
                          className="text-gray-300 hover:text-blue-400 transition-colors"
                        >
                          {user.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {user.phone && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-1">Phone</h4>
                        <a 
                          href={`tel:${user.phone}`}
                          className="text-gray-300 hover:text-green-400 transition-colors"
                        >
                          {user.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {user.location && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-1">Location</h4>
                        <p className="text-gray-300">{user.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Connect With Me</h3>
                <div className="flex gap-4">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Button>
                  <Button size="sm" className="bg-pink-600 hover:bg-pink-700">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Instagram
                  </Button>
                  <Button size="sm" className="bg-gray-700 hover:bg-gray-600">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    IMDb
                  </Button>
                </div>
              </div>

              {/* Availability */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-5 h-5 text-green-400" />
                    <h4 className="text-lg font-semibold text-white">Availability</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Current Status:</span>
                      <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-full">
                        Available
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Response Time:</span>
                      <span className="text-white">24-48 hours</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Preferred Contact:</span>
                      <span className="text-white">Email</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <MessageCircle className="w-6 h-6 text-blue-400" />
                    <h3 className="text-2xl font-bold text-white">Send a Message</h3>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name" className="text-white">
                          Your Name *
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="mt-2 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-white">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="mt-2 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject" className="text-white">
                        Subject *
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="mt-2 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                        placeholder="What's this about?"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-white">
                        Message *
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="mt-2 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 resize-none"
                        placeholder="Tell me about your project, timeline, and any specific requirements..."
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                      >
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </Button>
                      
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="lg"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        onClick={() => setFormData({ name: '', email: '', subject: '', message: '' })}
                      >
                        Clear Form
                      </Button>
                    </div>

                    <p className="text-sm text-gray-400">
                      * Required fields. Your information will be kept confidential and used only to respond to your inquiry.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Contact Actions */}
          <div className="mt-16 text-center">
            <h3 className="text-xl font-bold text-white mb-6">Prefer a Different Approach?</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user.email && (
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.location.href = `mailto:${user.email}`}
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Email Directly
                </Button>
              )}
              
              {user.phone && (
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => window.location.href = `tel:${user.phone}`}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </Button>
              )}
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Schedule Meeting
              </Button>
            </div>
          </div>

          {/* Placeholder for editing */}
          {isEditing && (
            <div className="mt-12 p-8 border-2 border-dashed border-gray-600 rounded-lg text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Customize contact information and form settings</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}