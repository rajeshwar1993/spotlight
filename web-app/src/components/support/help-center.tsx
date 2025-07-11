'use client';

import { useState, useEffect } from 'react';
import { Search, BookOpen, ChevronRight, ThumbsUp, ThumbsDown, Eye, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface HelpCenterProps {
  category?: string;
  searchQuery?: string;
}

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  helpful: number;
  notHelpful: number;
  lastUpdated: string;
  readTime: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
}

const HELP_ARTICLES: Article[] = [
  {
    id: 'create-first-portfolio',
    title: 'How to create your first portfolio',
    content: `Creating your first portfolio on Spotlight is easy! Follow these simple steps:

## Getting Started

1. **Sign up for an account** - Visit spotlight.com and click "Get Started"
2. **Verify your email** - Check your inbox and click the verification link
3. **Complete your profile** - Add your basic information

## Creating Your Portfolio

### Step 1: Choose a Template
We offer 4 professional templates:
- **Classic Professional**: Traditional and elegant
- **Modern Bold**: Contemporary and eye-catching
- **Minimal Elegant**: Clean and sophisticated
- **Creative Artistic**: Unique and expressive

### Step 2: Add Your Content
- Upload 10-15 high-quality photos
- Write a compelling bio (2-3 sentences)
- Add your experience and credits
- Include your contact information

### Step 3: Customize Your Design
- Choose your brand colors
- Select fonts that match your style
- Adjust layout and spacing
- Preview on different devices

### Step 4: Publish and Share
- Review your portfolio
- Click "Publish" when ready
- Share your unique URL

## Tips for Success

- Use high-resolution images (1920x1080 or higher)
- Keep your bio concise and engaging
- Update regularly with new work
- Include a variety of shot types

Need help? Contact our support team at support@spotlight.com`,
    category: 'getting-started',
    tags: ['beginner', 'tutorial', 'portfolio'],
    views: 15420,
    helpful: 134,
    notHelpful: 8,
    lastUpdated: '2024-01-15',
    readTime: 5
  },
  {
    id: 'choosing-template',
    title: 'Choosing the right template for your portfolio',
    content: `Selecting the right template is crucial for your portfolio's success. Here's how to choose:

## Template Overview

### Classic Professional
**Best for**: Traditional headshots, commercial actors
**Features**: 
- Clean, industry-standard layout
- Focus on headshots and contact info
- Professional color scheme
- Mobile-optimized design

### Modern Bold
**Best for**: Fashion models, commercial work
**Features**:
- Eye-catching design elements
- Large image displays
- Bold typography
- Social media integration

### Minimal Elegant
**Best for**: Theater actors, artistic work
**Features**:
- Clean lines and white space
- Typography-focused design
- Subtle animations
- Gallery-style image layout

### Creative Artistic
**Best for**: Character actors, unique personalities
**Features**:
- Unconventional layouts
- Creative image arrangements
- Custom animations
- Artistic color schemes

## Choosing Your Template

Consider these factors:

1. **Your profession**: Different industries prefer different styles
2. **Your personality**: Choose a template that reflects who you are
3. **Your photos**: Some templates work better with certain types of images
4. **Your target audience**: Consider who will be viewing your portfolio

## Can I change templates later?

Yes! You can switch templates at any time. Your content will automatically adapt to the new design.`,
    category: 'templates',
    tags: ['template', 'design', 'selection'],
    views: 8750,
    helpful: 89,
    notHelpful: 3,
    lastUpdated: '2024-01-10',
    readTime: 3
  },
  {
    id: 'photo-best-practices',
    title: 'Best practices for photo selection and organization',
    content: `Great photos are the foundation of a successful portfolio. Here's how to select and organize them effectively:

## Photo Selection Guidelines

### Quality Standards
- **Resolution**: Minimum 1920x1080, preferably higher
- **File format**: JPG or PNG
- **File size**: Under 5MB for optimal loading
- **Lighting**: Professional lighting preferred
- **Focus**: Sharp, clear images only

### Types of Photos to Include

1. **Headshots** (3-5 photos)
   - Professional headshot
   - Casual/approachable look
   - Character headshots (if applicable)

2. **Full Body Shots** (2-4 photos)
   - Standing poses
   - Different outfits/styles
   - Action shots if relevant

3. **Work Samples** (3-6 photos)
   - Behind-the-scenes shots
   - Performance photos
   - Professional work examples

## Organization Tips

### Portfolio Flow
1. **Lead with your strongest image** - Make a great first impression
2. **Group similar shots together** - Create visual cohesion
3. **Vary the types** - Mix headshots, full body, and work samples
4. **End strong** - Leave a lasting impression

### Image Order
- Start with your best headshot
- Follow with full body shots
- Include work samples
- End with a memorable image

## Technical Tips

### Image Optimization
- Compress images for web without losing quality
- Use descriptive filenames
- Add alt text for accessibility
- Test loading times

### Mobile Considerations
- Images should look great on small screens
- Avoid overly detailed shots that don't scale well
- Test your portfolio on various devices

## Common Mistakes to Avoid

1. **Too many similar photos** - Variety is key
2. **Poor image quality** - Only use professional-grade photos
3. **Outdated photos** - Keep your portfolio current
4. **Inconsistent style** - Maintain a cohesive look

Remember: Less is more. It's better to have 10 amazing photos than 20 mediocre ones.`,
    category: 'portfolio-creation',
    tags: ['photos', 'best-practices', 'organization'],
    views: 12340,
    helpful: 156,
    notHelpful: 12,
    lastUpdated: '2024-01-18',
    readTime: 6
  }
];

const FAQS: FAQ[] = [
  {
    id: 'faq-1',
    question: 'How many photos should I include in my portfolio?',
    answer: 'We recommend 10-15 high-quality photos. This gives you enough variety to showcase your range while keeping your portfolio focused and engaging.',
    category: 'portfolio-creation',
    helpful: 89
  },
  {
    id: 'faq-2',
    question: 'Can I change my template after publishing?',
    answer: 'Yes! You can switch templates at any time. Your content will automatically adapt to the new design, though you may want to review and adjust the layout after switching.',
    category: 'templates',
    helpful: 67
  },
  {
    id: 'faq-3',
    question: 'What file formats are supported for photos?',
    answer: 'We support JPG, PNG, and WebP formats. For best results, use JPG for photos and PNG for images with transparency. Files should be under 5MB each.',
    category: 'portfolio-creation',
    helpful: 43
  },
  {
    id: 'faq-4',
    question: 'How do I make my portfolio private?',
    answer: 'Go to your portfolio settings and toggle the "Private Portfolio" option. This will make your portfolio only accessible via direct link and remove it from search engines.',
    category: 'sharing',
    helpful: 52
  }
];

export function HelpCenter({ category, searchQuery }: HelpCenterProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchQuery || '');
  const [filteredArticles, setFilteredArticles] = useState<Article[]>(HELP_ARTICLES);
  const [filteredFAQs, setFilteredFAQs] = useState<FAQ[]>(FAQS);

  useEffect(() => {
    let articles = HELP_ARTICLES;
    let faqs = FAQS;

    // Filter by category
    if (category && category !== 'help-center') {
      articles = articles.filter(article => article.category === category);
      faqs = faqs.filter(faq => faq.category === category);
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      articles = articles.filter(article => 
        article.title.toLowerCase().includes(searchLower) ||
        article.content.toLowerCase().includes(searchLower) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
      faqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchLower) ||
        faq.answer.toLowerCase().includes(searchLower)
      );
    }

    setFilteredArticles(articles);
    setFiltereredFAQs(faqs);
  }, [category, searchTerm]);

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    // Track article view
    console.log('Article viewed:', article.id);
  };

  const handleHelpfulClick = (articleId: string, helpful: boolean) => {
    // Track helpful feedback
    console.log('Feedback:', articleId, helpful);
  };

  if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => setSelectedArticle(null)}
          variant="ghost"
          className="mb-6"
        >
          ← Back to articles
        </Button>

        <article className="prose prose-lg max-w-none">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">{selectedArticle.title}</h1>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-6">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>{selectedArticle.views.toLocaleString()} views</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{selectedArticle.readTime} min read</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>Updated: {new Date(selectedArticle.lastUpdated).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex space-x-2 mb-6">
              {selectedArticle.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div 
            className="prose-spotlight"
            dangerouslySetInnerHTML={{ 
              __html: selectedArticle.content.replace(/\n/g, '<br>').replace(/##/g, '<h2>').replace(/<h2>/g, '<h2 class="text-xl font-semibold mt-6 mb-3">') 
            }} 
          />

          <Separator className="my-8" />

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Was this article helpful?</h3>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => handleHelpfulClick(selectedArticle.id, true)}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <ThumbsUp className="h-4 w-4" />
                <span>Yes ({selectedArticle.helpful})</span>
              </Button>
              <Button
                onClick={() => handleHelpfulClick(selectedArticle.id, false)}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <ThumbsDown className="h-4 w-4" />
                <span>No ({selectedArticle.notHelpful})</span>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Help us improve our documentation by providing feedback.
            </p>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Search */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search articles and FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Results Summary */}
      {(searchTerm || category) && (
        <div className="text-center">
          <p className="text-muted-foreground">
            {filteredArticles.length + filteredFAQs.length} results found
            {category && ` in ${category.replace('-', ' ')}`}
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Articles */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Help Articles</h2>
          
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No articles found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or browse by category.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <Card 
                  key={article.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleArticleClick(article)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 hover:text-spotlight-600">
                          {article.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {article.content.substring(0, 150)}...
                        </CardDescription>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{article.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{article.readTime} min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="h-3 w-3" />
                          <span>{article.helpful}</span>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        {article.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* FAQs Sidebar */}
        <div>
          <h3 className="text-xl font-bold mb-6">Frequently Asked Questions</h3>
          
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No FAQs found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <Card key={faq.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {faq.answer}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <ThumbsUp className="h-3 w-3" />
                        <span>{faq.helpful} found helpful</span>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost" className="h-6 px-2">
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 px-2">
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}