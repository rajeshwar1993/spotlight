'use client';

import { useState } from 'react';
import { Search, BookOpen, MessageCircle, Mail, Phone, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpCenter } from '@/components/support/help-center';
import { ContactForm } from '@/components/support/contact-form';

interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  articleCount: number;
  popularArticles: string[];
}

interface SupportOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  availability: string;
  responseTime: string;
  action: () => void;
}

const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Learn the basics of creating your portfolio',
    icon: <BookOpen className="h-6 w-6" />,
    articleCount: 12,
    popularArticles: [
      'How to create your first portfolio',
      'Choosing the right template',
      'Uploading and organizing photos'
    ]
  },
  {
    id: 'portfolio-creation',
    name: 'Portfolio Creation',
    description: 'Advanced tips for building stunning portfolios',
    icon: <BookOpen className="h-6 w-6" />,
    articleCount: 18,
    popularArticles: [
      'Best practices for photo selection',
      'Writing compelling bios',
      'Customizing your design'
    ]
  },
  {
    id: 'templates',
    name: 'Templates & Design',
    description: 'Customization and design options',
    icon: <BookOpen className="h-6 w-6" />,
    articleCount: 8,
    popularArticles: [
      'Template comparison guide',
      'Color customization options',
      'Font and typography settings'
    ]
  },
  {
    id: 'sharing',
    name: 'Sharing & Publishing',
    description: 'Publishing and sharing your portfolio',
    icon: <BookOpen className="h-6 w-6" />,
    articleCount: 10,
    popularArticles: [
      'How to publish your portfolio',
      'Sharing on social media',
      'Setting privacy controls'
    ]
  },
  {
    id: 'analytics',
    name: 'Analytics & Insights',
    description: 'Understanding your portfolio performance',
    icon: <BookOpen className="h-6 w-6" />,
    articleCount: 6,
    popularArticles: [
      'Reading your analytics dashboard',
      'Tracking portfolio views',
      'Optimizing for better results'
    ]
  },
  {
    id: 'account',
    name: 'Account & Billing',
    description: 'Managing your account and subscriptions',
    icon: <BookOpen className="h-6 w-6" />,
    articleCount: 14,
    popularArticles: [
      'Upgrading to Pro',
      'Managing your subscription',
      'Deleting your account'
    ]
  }
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);

  const supportOptions: SupportOption[] = [
    {
      id: 'help-center',
      name: 'Help Center',
      description: 'Browse our comprehensive knowledge base',
      icon: <BookOpen className="h-5 w-5" />,
      availability: '24/7',
      responseTime: 'Instant',
      action: () => setSelectedCategory('help-center')
    },
    {
      id: 'contact-form',
      name: 'Contact Support',
      description: 'Get personalized help from our team',
      icon: <Mail className="h-5 w-5" />,
      availability: 'Mon-Fri 9AM-6PM EST',
      responseTime: 'Within 24 hours',
      action: () => setShowContactForm(true)
    },
    {
      id: 'live-chat',
      name: 'Live Chat',
      description: 'Chat with our support team in real-time',
      icon: <MessageCircle className="h-5 w-5" />,
      availability: 'Mon-Fri 9AM-6PM EST',
      responseTime: 'Under 2 minutes',
      action: () => {
        // Integration with live chat service
        console.log('Opening live chat...');
      }
    }
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search functionality
  };

  if (showContactForm) {
    return (
      <div className="container mx-auto py-8">
        <Button
          onClick={() => setShowContactForm(false)}
          variant="ghost"
          className="mb-6"
        >
          ← Back to Help Center
        </Button>
        <ContactForm onClose={() => setShowContactForm(false)} />
      </div>
    );
  }

  if (selectedCategory) {
    return (
      <div className="container mx-auto py-8">
        <Button
          onClick={() => setSelectedCategory(null)}
          variant="ghost"
          className="mb-6"
        >
          ← Back to Help Center
        </Button>
        <HelpCenter 
          category={selectedCategory} 
          searchQuery={searchQuery}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">How can we help you?</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get the answers you need to create amazing portfolios and grow your career
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search for help articles, tutorials, and guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-3 text-lg"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch(searchQuery);
              }
            }}
          />
        </div>
        
        {/* Popular Searches */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <span className="text-sm text-muted-foreground">Popular:</span>
          {['Create portfolio', 'Upload photos', 'Choose template', 'Publish portfolio'].map((term) => (
            <Button
              key={term}
              variant="outline"
              size="sm"
              onClick={() => handleSearch(term)}
              className="text-xs"
            >
              {term}
            </Button>
          ))}
        </div>
      </div>

      {/* Support Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {supportOptions.map((option) => (
          <Card key={option.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-spotlight-100 rounded-lg">
                  <div className="text-spotlight-600">
                    {option.icon}
                  </div>
                </div>
                <div>
                  <CardTitle className="text-lg">{option.name}</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {option.availability}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {option.description}
              </CardDescription>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Response: {option.responseTime}
                </span>
                <Button onClick={option.action} size="sm">
                  Get Help
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Help Categories */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Browse Help Topics</h2>
          <p className="text-muted-foreground">
            Find detailed guides and tutorials organized by topic
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {HELP_CATEGORIES.map((category) => (
            <Card 
              key={category.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="text-spotlight-600">
                    {category.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {category.articleCount} articles
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {category.description}
                </CardDescription>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Popular articles:</p>
                  {category.popularArticles.slice(0, 2).map((article, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <div className="w-1 h-1 bg-spotlight-600 rounded-full mr-2" />
                      {article}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4 text-center">Quick Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" className="justify-start h-auto p-4">
            <div className="text-left">
              <div className="font-medium">Video Tutorials</div>
              <div className="text-sm text-muted-foreground">Watch step-by-step guides</div>
            </div>
          </Button>
          
          <Button variant="outline" className="justify-start h-auto p-4">
            <div className="text-left">
              <div className="font-medium">Community Forum</div>
              <div className="text-sm text-muted-foreground">Connect with other users</div>
            </div>
          </Button>
          
          <Button variant="outline" className="justify-start h-auto p-4">
            <div className="text-left">
              <div className="font-medium">System Status</div>
              <div className="text-sm text-muted-foreground">Check platform status</div>
            </div>
          </Button>
          
          <Button variant="outline" className="justify-start h-auto p-4">
            <div className="text-left">
              <div className="font-medium">Feature Requests</div>
              <div className="text-sm text-muted-foreground">Suggest improvements</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Contact Information */}
      <div className="text-center space-y-4">
        <h3 className="text-xl font-semibold">Still need help?</h3>
        <p className="text-muted-foreground">
          Our support team is here to help you succeed
        </p>
        <div className="flex justify-center space-x-6">
          <a 
            href="mailto:support@spotlight.com"
            className="flex items-center space-x-2 text-spotlight-600 hover:text-spotlight-700"
          >
            <Mail className="h-4 w-4" />
            <span>support@spotlight.com</span>
          </a>
          <a 
            href="tel:+1-555-SPOTLIGHT"
            className="flex items-center space-x-2 text-spotlight-600 hover:text-spotlight-700"
          >
            <Phone className="h-4 w-4" />
            <span>+1 (555) SPOTLIGHT</span>
          </a>
        </div>
      </div>
    </div>
  );
}