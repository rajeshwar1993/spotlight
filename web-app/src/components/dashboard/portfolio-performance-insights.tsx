'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp,
  Target,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Zap,
  Image,
  FileText,
  Search,
  Users,
  Globe,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TemplateType, PortfolioStatus } from '@/types';

interface Portfolio {
  id: string;
  title: string;
  slug: string;
  template: TemplateType;
  status: PortfolioStatus;
  bio?: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  images?: Array<{
    id: string;
    url: string;
    type: string;
    alt_text?: string;
  }>;
}

interface PerformanceInsight {
  id: string;
  type: 'critical' | 'warning' | 'suggestion' | 'success';
  category: 'seo' | 'content' | 'images' | 'performance' | 'engagement';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  actionable: boolean;
  portfolioId?: string;
  suggestions: string[];
  icon: React.ReactNode;
}

interface PerformanceScore {
  overall: number;
  seo: number;
  content: number;
  images: number;
  performance: number;
  engagement: number;
}

interface PortfolioPerformanceInsightsProps {
  portfolios: Portfolio[];
  className?: string;
}

export function PortfolioPerformanceInsights({ portfolios, className }: PortfolioPerformanceInsightsProps) {
  const [insights, setInsights] = useState<PerformanceInsight[]>([]);
  const [scores, setScores] = useState<PerformanceScore>({
    overall: 0,
    seo: 0,
    content: 0,
    images: 0,
    performance: 0,
    engagement: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    analyzePortfolios();
  }, [portfolios]);

  const analyzePortfolios = () => {
    setLoading(true);
    
    const generatedInsights: PerformanceInsight[] = [];
    let totalSeoScore = 0;
    let totalContentScore = 0;
    let totalImagesScore = 0;
    let totalPerformanceScore = 0;
    let totalEngagementScore = 0;

    portfolios.forEach((portfolio) => {
      // SEO Analysis
      const seoScore = analyzeSEO(portfolio);
      totalSeoScore += seoScore;
      
      if (seoScore < 70) {
        generatedInsights.push({
          id: `seo-${portfolio.id}`,
          type: seoScore < 40 ? 'critical' : 'warning',
          category: 'seo',
          title: `SEO needs improvement for "${portfolio.title}"`,
          description: 'This portfolio has SEO issues that may limit its visibility in search results.',
          impact: 'high',
          effort: 'low',
          actionable: true,
          portfolioId: portfolio.id,
          suggestions: [
            'Add more descriptive content to your bio section',
            'Include relevant keywords for your profession',
            'Ensure all images have descriptive alt text',
            'Consider adding location information'
          ],
          icon: <Search className="h-4 w-4" />
        });
      }

      // Content Analysis
      const contentScore = analyzeContent(portfolio);
      totalContentScore += contentScore;
      
      if (!portfolio.bio || portfolio.bio.length < 100) {
        generatedInsights.push({
          id: `content-${portfolio.id}`,
          type: 'warning',
          category: 'content',
          title: `Bio section too short for "${portfolio.title}"`,
          description: 'A compelling bio helps visitors understand your experience and skills.',
          impact: 'medium',
          effort: 'low',
          actionable: true,
          portfolioId: portfolio.id,
          suggestions: [
            'Expand your bio to at least 150-200 words',
            'Include your experience and specialties',
            'Mention notable achievements or projects',
            'Add personal touch to make it engaging'
          ],
          icon: <FileText className="h-4 w-4" />
        });
      }

      // Images Analysis
      const imagesScore = analyzeImages(portfolio);
      totalImagesScore += imagesScore;
      
      const imageCount = portfolio.images?.length || 0;
      if (imageCount < 3) {
        generatedInsights.push({
          id: `images-${portfolio.id}`,
          type: 'warning',
          category: 'images',
          title: `More images needed for "${portfolio.title}"`,
          description: 'Portfolios with more high-quality images tend to perform better.',
          impact: 'high',
          effort: 'medium',
          actionable: true,
          portfolioId: portfolio.id,
          suggestions: [
            'Add at least 5-8 professional photos',
            'Include variety: headshots, full body, and action shots',
            'Ensure all images are high resolution',
            'Add descriptive alt text for accessibility'
          ],
          icon: <Image className="h-4 w-4" />
        });
      }

      // Performance Analysis
      const performanceScore = analyzePerformance(portfolio);
      totalPerformanceScore += performanceScore;

      // Engagement Analysis
      const engagementScore = analyzeEngagement(portfolio);
      totalEngagementScore += engagementScore;
      
      if (portfolio.view_count < 10 && portfolio.status === 'published') {
        generatedInsights.push({
          id: `engagement-${portfolio.id}`,
          type: 'suggestion',
          category: 'engagement',
          title: `Low visibility for "${portfolio.title}"`,
          description: 'This portfolio needs more promotion to increase views and engagement.',
          impact: 'medium',
          effort: 'medium',
          actionable: true,
          portfolioId: portfolio.id,
          suggestions: [
            'Share your portfolio on social media',
            'Add the link to your email signature',
            'Include it in your business cards',
            'Network with industry professionals',
            'Consider SEO optimization'
          ],
          icon: <TrendingUp className="h-4 w-4" />
        });
      }
    });

    // General insights for all portfolios
    const publishedCount = portfolios.filter(p => p.status === 'published').length;
    const totalViews = portfolios.reduce((sum, p) => sum + p.view_count, 0);
    
    if (publishedCount === 0) {
      generatedInsights.push({
        id: 'no-published',
        type: 'critical',
        category: 'performance',
        title: 'No published portfolios',
        description: 'You need to publish at least one portfolio to start getting visibility.',
        impact: 'high',
        effort: 'low',
        actionable: true,
        suggestions: [
          'Review and publish your best portfolio',
          'Ensure all content is complete and professional',
          'Double-check for any errors or missing information',
          'Consider starting with one strong portfolio'
        ],
        icon: <Globe className="h-4 w-4" />
      });
    }

    if (totalViews < 50 && publishedCount > 0) {
      generatedInsights.push({
        id: 'low-overall-views',
        type: 'suggestion',
        category: 'engagement',
        title: 'Overall low visibility',
        description: 'Your portfolios could benefit from better promotion and optimization.',
        impact: 'high',
        effort: 'medium',
        actionable: true,
        suggestions: [
          'Optimize portfolios for search engines',
          'Share regularly on social media platforms',
          'Network within your industry',
          'Consider professional photography',
          'Ask for testimonials and recommendations'
        ],
        icon: <Users className="h-4 w-4" />
      });
    }

    // Template diversity insight
    const templateTypes = new Set(portfolios.map(p => p.template));
    if (templateTypes.size === 1 && portfolios.length > 1) {
      generatedInsights.push({
        id: 'template-diversity',
        type: 'suggestion',
        category: 'performance',
        title: 'Consider template variety',
        description: 'Using different templates can help portfolios stand out for different purposes.',
        impact: 'low',
        effort: 'low',
        actionable: true,
        suggestions: [
          'Try different templates for different portfolio purposes',
          'Match template style to your target audience',
          'Use creative templates for artistic work',
          'Use professional templates for corporate roles'
        ],
        icon: <Zap className="h-4 w-4" />
      });
    }

    // Success insights
    const topPerformer = portfolios.reduce((top, current) => 
      current.view_count > top.view_count ? current : top, portfolios[0]
    );

    if (topPerformer && topPerformer.view_count > 50) {
      generatedInsights.push({
        id: 'top-performer',
        type: 'success',
        category: 'engagement',
        title: `"${topPerformer.title}" is performing well`,
        description: 'This portfolio is getting good engagement. Consider what makes it successful.',
        impact: 'medium',
        effort: 'low',
        actionable: true,
        portfolioId: topPerformer.id,
        suggestions: [
          'Analyze what makes this portfolio successful',
          'Apply similar strategies to other portfolios',
          'Share this portfolio more actively',
          'Use it as a template for future portfolios'
        ],
        icon: <CheckCircle className="h-4 w-4" />
      });
    }

    setInsights(generatedInsights);
    
    // Calculate overall scores
    const portfolioCount = portfolios.length || 1;
    setScores({
      overall: Math.round((totalSeoScore + totalContentScore + totalImagesScore + totalPerformanceScore + totalEngagementScore) / 5),
      seo: Math.round(totalSeoScore / portfolioCount),
      content: Math.round(totalContentScore / portfolioCount),
      images: Math.round(totalImagesScore / portfolioCount),
      performance: Math.round(totalPerformanceScore / portfolioCount),
      engagement: Math.round(totalEngagementScore / portfolioCount)
    });
    
    setLoading(false);
  };

  const analyzeSEO = (portfolio: Portfolio): number => {
    let score = 50; // Base score
    
    if (portfolio.bio && portfolio.bio.length > 100) score += 20;
    if (portfolio.bio && portfolio.bio.length > 200) score += 10;
    if (portfolio.images && portfolio.images.length > 0) score += 10;
    if (portfolio.images && portfolio.images.some(img => img.alt_text)) score += 10;
    
    return Math.min(score, 100);
  };

  const analyzeContent = (portfolio: Portfolio): number => {
    let score = 30;
    
    if (portfolio.bio && portfolio.bio.length > 50) score += 20;
    if (portfolio.bio && portfolio.bio.length > 150) score += 20;
    if (portfolio.bio && portfolio.bio.length > 300) score += 15;
    if (portfolio.title && portfolio.title.length > 5) score += 15;
    
    return Math.min(score, 100);
  };

  const analyzeImages = (portfolio: Portfolio): number => {
    const imageCount = portfolio.images?.length || 0;
    let score = 0;
    
    if (imageCount >= 1) score += 30;
    if (imageCount >= 3) score += 30;
    if (imageCount >= 5) score += 20;
    if (imageCount >= 8) score += 20;
    
    return Math.min(score, 100);
  };

  const analyzePerformance = (portfolio: Portfolio): number => {
    let score = 70; // Base score (assuming good technical performance)
    
    if (portfolio.status === 'published') score += 20;
    if (portfolio.images && portfolio.images.length <= 10) score += 10; // Not too many images
    
    return Math.min(score, 100);
  };

  const analyzeEngagement = (portfolio: Portfolio): number => {
    let score = 20;
    
    if (portfolio.view_count > 10) score += 20;
    if (portfolio.view_count > 50) score += 20;
    if (portfolio.view_count > 100) score += 20;
    if (portfolio.view_count > 500) score += 20;
    
    return Math.min(score, 100);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'suggestion':
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(insight => insight.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'All Insights', icon: <Target className="h-4 w-4" /> },
    { id: 'seo', name: 'SEO', icon: <Search className="h-4 w-4" /> },
    { id: 'content', name: 'Content', icon: <FileText className="h-4 w-4" /> },
    { id: 'images', name: 'Images', icon: <Image className="h-4 w-4" /> },
    { id: 'performance', name: 'Performance', icon: <Zap className="h-4 w-4" /> },
    { id: 'engagement', name: 'Engagement', icon: <Users className="h-4 w-4" /> }
  ];

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Analyzing portfolio performance...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Performance Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={cn('inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold', getScoreColor(scores.overall))}>
                {scores.overall}
              </div>
              <p className="text-sm font-medium mt-2">Overall</p>
              <Progress value={scores.overall} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className={cn('inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold', getScoreColor(scores.seo))}>
                {scores.seo}
              </div>
              <p className="text-sm font-medium mt-2">SEO</p>
              <Progress value={scores.seo} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className={cn('inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold', getScoreColor(scores.content))}>
                {scores.content}
              </div>
              <p className="text-sm font-medium mt-2">Content</p>
              <Progress value={scores.content} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className={cn('inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold', getScoreColor(scores.images))}>
                {scores.images}
              </div>
              <p className="text-sm font-medium mt-2">Images</p>
              <Progress value={scores.images} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className={cn('inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold', getScoreColor(scores.performance))}>
                {scores.performance}
              </div>
              <p className="text-sm font-medium mt-2">Performance</p>
              <Progress value={scores.performance} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className={cn('inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold', getScoreColor(scores.engagement))}>
                {scores.engagement}
              </div>
              <p className="text-sm font-medium mt-2">Engagement</p>
              <Progress value={scores.engagement} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Performance Insights & Recommendations
            </CardTitle>
            <Button variant="outline" size="sm" onClick={analyzePortfolios}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Analysis
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                {category.icon}
                {category.name}
                {category.id !== 'all' && (
                  <Badge variant="secondary" className="ml-1">
                    {insights.filter(i => i.category === category.id).length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {/* Insights List */}
          {filteredInsights.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Great job!</h3>
              <p className="text-gray-600">
                {selectedCategory === 'all' 
                  ? 'No performance issues found. Your portfolios are optimized well.' 
                  : `No ${selectedCategory} issues found in this category.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInsights.map((insight) => (
                <Alert key={insight.id} className={cn(
                  'border-l-4',
                  insight.type === 'critical' && 'border-l-red-500 bg-red-50',
                  insight.type === 'warning' && 'border-l-orange-500 bg-orange-50',
                  insight.type === 'suggestion' && 'border-l-blue-500 bg-blue-50',
                  insight.type === 'success' && 'border-l-green-500 bg-green-50'
                )}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            {insight.impact} impact
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {insight.effort} effort
                          </Badge>
                        </div>
                      </div>
                      <AlertDescription className="text-gray-700 mb-3">
                        {insight.description}
                      </AlertDescription>
                      
                      {insight.suggestions.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-900">Suggestions:</p>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {insight.suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-gray-400 mt-1">•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {insight.portfolioId && (
                        <div className="mt-3 pt-3 border-t">
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/portfolio/${insight.portfolioId}/edit`}>
                              <ExternalLink className="h-3 w-3 mr-2" />
                              Edit Portfolio
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}