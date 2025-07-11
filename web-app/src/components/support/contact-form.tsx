'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Bug,
  HelpCircle,
  Star,
  CreditCard
} from 'lucide-react';

interface ContactFormProps {
  onClose?: () => void;
}

interface SupportCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  responseTime: string;
  priority: 'low' | 'medium' | 'high';
}

const SUPPORT_CATEGORIES: SupportCategory[] = [
  {
    id: 'technical',
    name: 'Technical Issue',
    description: 'Problems with the platform functionality',
    icon: <Bug className="h-4 w-4" />,
    responseTime: 'Within 24 hours',
    priority: 'high'
  },
  {
    id: 'billing',
    name: 'Billing & Account',
    description: 'Subscription, payments, and account issues',
    icon: <CreditCard className="h-4 w-4" />,
    responseTime: 'Within 12 hours',
    priority: 'high'
  },
  {
    id: 'portfolio',
    name: 'Portfolio Help',
    description: 'Help with creating and managing portfolios',
    icon: <FileText className="h-4 w-4" />,
    responseTime: 'Within 24 hours',
    priority: 'medium'
  },
  {
    id: 'general',
    name: 'General Question',
    description: 'General inquiries and how-to questions',
    icon: <HelpCircle className="h-4 w-4" />,
    responseTime: 'Within 48 hours',
    priority: 'low'
  },
  {
    id: 'feedback',
    name: 'Feedback & Suggestions',
    description: 'Share your thoughts and ideas',
    icon: <Star className="h-4 w-4" />,
    responseTime: 'Within 72 hours',
    priority: 'low'
  }
];

export function ContactForm({ onClose }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleCategorySelect = (categoryId: string) => {
    const category = SUPPORT_CATEGORIES.find(c => c.id === categoryId);
    setFormData(prev => ({
      ...prev,
      category: categoryId,
      priority: category?.priority || 'medium'
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.email.includes('@')) return 'Valid email is required';
    if (!formData.category) return 'Please select a category';
    if (!formData.subject.trim()) return 'Subject is required';
    if (!formData.message.trim()) return 'Message is required';
    if (formData.message.length < 10) return 'Message must be at least 10 characters';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/support/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit support request');
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Support form error:', error);
      setError('Failed to submit your request. Please try again or email us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = SUPPORT_CATEGORIES.find(c => c.id === formData.category);

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Thank you for contacting us!</h2>
            <p className="text-muted-foreground mb-6">
              We've received your support request and will get back to you soon.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Ticket #:</span>
                <span className="font-mono">SP-{Date.now().toString().slice(-6)}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="font-medium">Expected response:</span>
                <span>{selectedCategory?.responseTime || 'Within 24 hours'}</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                We'll send updates to <strong>{formData.email}</strong>
              </p>
              
              {onClose && (
                <Button onClick={onClose} className="w-full">
                  Return to Help Center
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Contact Support</h1>
        <p className="text-xl text-muted-foreground">
          Get personalized help from our support team
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Submit a Support Request</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={handleCategorySelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORT_CATEGORIES.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center space-x-2">
                            {category.icon}
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCategory && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        {selectedCategory.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">Response time: {selectedCategory.responseTime}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="Brief description of your issue or question"
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Please provide as much detail as possible about your issue or question. Include any error messages, steps you've tried, and what you expected to happen."
                    rows={6}
                    required
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                      Minimum 10 characters
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formData.message.length} characters
                    </span>
                  </div>
                </div>

                {/* Priority (auto-set based on category) */}
                {selectedCategory && (
                  <div>
                    <Label>Priority</Label>
                    <div className="mt-1">
                      <Badge 
                        variant={
                          formData.priority === 'high' 
                            ? 'destructive' 
                            : formData.priority === 'medium' 
                              ? 'default' 
                              : 'secondary'
                        }
                      >
                        {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)} Priority
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Support Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Response Times */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Response Times</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {SUPPORT_CATEGORIES.map((category) => (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {category.icon}
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <Badge 
                    variant={
                      category.priority === 'high' 
                        ? 'destructive' 
                        : category.priority === 'medium' 
                          ? 'default' 
                          : 'secondary'
                    }
                    className="text-xs"
                  >
                    {category.responseTime.replace('Within ', '')}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Alternative Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Other Ways to Reach Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium">Email</h4>
                <p className="text-sm text-muted-foreground">support@spotlight.com</p>
              </div>
              <div>
                <h4 className="font-medium">Live Chat</h4>
                <p className="text-sm text-muted-foreground">
                  Available Mon-Fri 9AM-6PM EST
                </p>
              </div>
              <div>
                <h4 className="font-medium">Community Forum</h4>
                <p className="text-sm text-muted-foreground">
                  Get help from other users
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips for Faster Support</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Be specific about your issue</li>
                <li>• Include error messages if any</li>
                <li>• Mention your browser and device</li>
                <li>• Attach screenshots if helpful</li>
                <li>• Check our FAQ first</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}