'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  BarChart3,
  TrendingUp,
  Eye,
  Calendar,
  Download,
  Award,
  Target,
  Zap,
  Image,
  FileText,
  Globe,
  ExternalLink,
  X
} from 'lucide-react';
import { format } from 'date-fns';
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

interface ComparisonMetric {
  id: string;
  name: string;
  description: string;
  getValue: (portfolio: Portfolio) => number | string;
  format: (value: number | string) => string;
  icon: React.ReactNode;
  higher_is_better?: boolean;
}

interface PortfolioComparisonProps {
  portfolios: Portfolio[];
  className?: string;
}

const COMPARISON_METRICS: ComparisonMetric[] = [
  {
    id: 'view_count',
    name: 'Total Views',
    description: 'Number of times this portfolio has been viewed',
    getValue: (p) => p.view_count,
    format: (v) => v.toLocaleString(),
    icon: <Eye className="h-4 w-4" />,
    higher_is_better: true
  },
  {
    id: 'image_count',
    name: 'Images',
    description: 'Number of images in the portfolio',
    getValue: (p) => p.images?.length || 0,
    format: (v) => `${v} images`,
    icon: <Image className="h-4 w-4" />,
    higher_is_better: true
  },
  {
    id: 'bio_length',
    name: 'Bio Length',
    description: 'Length of the biography section',
    getValue: (p) => p.bio?.length || 0,
    format: (v) => `${v} characters`,
    icon: <FileText className="h-4 w-4" />,
    higher_is_better: true
  },
  {
    id: 'views_per_day',
    name: 'Views per Day',
    description: 'Average daily views since creation',
    getValue: (p) => {
      const daysSinceCreation = Math.max(1, Math.floor((Date.now() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24)));
      return Math.round((p.view_count / daysSinceCreation) * 100) / 100;
    },
    format: (v) => `${v} views/day`,
    icon: <TrendingUp className="h-4 w-4" />,
    higher_is_better: true
  },
  {
    id: 'days_since_update',
    name: 'Last Updated',
    description: 'Days since last update',
    getValue: (p) => Math.floor((Date.now() - new Date(p.updated_at).getTime()) / (1000 * 60 * 60 * 24)),
    format: (v) => `${v} days ago`,
    icon: <Calendar className="h-4 w-4" />,
    higher_is_better: false
  },
  {
    id: 'template',
    name: 'Template',
    description: 'Template used for this portfolio',
    getValue: (p) => p.template,
    format: (v) => `Template ${v}`,
    icon: <Zap className="h-4 w-4" />
  },
  {
    id: 'status',
    name: 'Status',
    description: 'Current publication status',
    getValue: (p) => p.status,
    format: (v) => String(v).charAt(0).toUpperCase() + String(v).slice(1),
    icon: <Globe className="h-4 w-4" />
  }
];

export function PortfolioComparison({ portfolios, className }: PortfolioComparisonProps) {
  const [selectedPortfolios, setSelectedPortfolios] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'view_count', 'image_count', 'bio_length', 'views_per_day'
  ]);
  const [sortBy, setSortBy] = useState<string>('view_count');
  const [showOnlyPublished, setShowOnlyPublished] = useState(false);

  // Auto-select top performers when component mounts
  useEffect(() => {
    if (portfolios.length > 0) {
      const topPortfolios = [...portfolios]
        .sort((a, b) => b.view_count - a.view_count)
        .slice(0, Math.min(3, portfolios.length))
        .map(p => p.id);
      setSelectedPortfolios(topPortfolios);
    }
  }, [portfolios]);

  const filteredPortfolios = showOnlyPublished 
    ? portfolios.filter(p => p.status === 'published')
    : portfolios;

  const comparisonData = selectedPortfolios
    .map(id => filteredPortfolios.find(p => p.id === id))
    .filter(Boolean) as Portfolio[];

  const handlePortfolioToggle = (portfolioId: string, checked: boolean) => {
    if (checked) {
      if (selectedPortfolios.length < 5) { // Limit to 5 portfolios
        setSelectedPortfolios([...selectedPortfolios, portfolioId]);
      }
    } else {
      setSelectedPortfolios(selectedPortfolios.filter(id => id !== portfolioId));
    }
  };

  const handleMetricToggle = (metricId: string, checked: boolean) => {
    if (checked) {
      setSelectedMetrics([...selectedMetrics, metricId]);
    } else {
      setSelectedMetrics(selectedMetrics.filter(id => id !== metricId));
    }
  };

  const getWinner = (metric: ComparisonMetric) => {
    if (comparisonData.length === 0) return null;
    
    if (metric.higher_is_better === false) {
      return comparisonData.reduce((min, current) => 
        metric.getValue(current) < metric.getValue(min) ? current : min
      );
    } else if (metric.higher_is_better === true) {
      return comparisonData.reduce((max, current) => 
        metric.getValue(current) > metric.getValue(max) ? current : max
      );
    }
    return null;
  };

  const generateReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      portfolios: comparisonData.map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        metrics: selectedMetrics.reduce((acc, metricId) => {
          const metric = COMPARISON_METRICS.find(m => m.id === metricId);
          if (metric) {
            acc[metricId] = {
              name: metric.name,
              value: metric.getValue(p),
              formatted: metric.format(metric.getValue(p))
            };
          }
          return acc;
        }, {} as Record<string, unknown>)
      })),
      summary: {
        topPerformer: comparisonData.reduce((top, current) => 
          current.view_count > top.view_count ? current : top, comparisonData[0]
        ),
        averageViews: Math.round(comparisonData.reduce((sum, p) => sum + p.view_count, 0) / comparisonData.length),
        totalImages: comparisonData.reduce((sum, p) => sum + (p.images?.length || 0), 0)
      }
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio-comparison-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Portfolio Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Portfolio Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="published-only"
                checked={showOnlyPublished}
                onCheckedChange={setShowOnlyPublished}
              />
              <label htmlFor="published-only" className="text-sm">
                Show only published portfolios
              </label>
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view_count">Sort by Views</SelectItem>
                <SelectItem value="title">Sort by Title</SelectItem>
                <SelectItem value="created_at">Sort by Created Date</SelectItem>
                <SelectItem value="updated_at">Sort by Updated Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Portfolio Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
            {filteredPortfolios
              .sort((a, b) => {
                if (sortBy === 'title') return a.title.localeCompare(b.title);
                if (sortBy === 'created_at') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                if (sortBy === 'updated_at') return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
                return b.view_count - a.view_count; // Default: view_count
              })
              .map((portfolio) => (
                <div
                  key={portfolio.id}
                  className={cn(
                    'flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors',
                    selectedPortfolios.includes(portfolio.id)
                      ? 'bg-blue-50 border-blue-200'
                      : 'hover:bg-gray-50'
                  )}
                  onClick={() => handlePortfolioToggle(
                    portfolio.id, 
                    !selectedPortfolios.includes(portfolio.id)
                  )}
                >
                  <Checkbox
                    checked={selectedPortfolios.includes(portfolio.id)}
                    onCheckedChange={(checked) => handlePortfolioToggle(portfolio.id, checked as boolean)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{portfolio.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        className={cn(
                          'text-xs',
                          portfolio.status === 'published' && 'bg-green-100 text-green-800',
                          portfolio.status === 'draft' && 'bg-yellow-100 text-yellow-800',
                          portfolio.status === 'archived' && 'bg-gray-100 text-gray-800'
                        )}
                      >
                        {portfolio.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {portfolio.view_count} views
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="text-sm text-gray-600">
            {selectedPortfolios.length}/5 portfolios selected (max 5)
          </div>
        </CardContent>
      </Card>

      {/* Metric Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Comparison Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {COMPARISON_METRICS.map((metric) => (
              <div key={metric.id} className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedMetrics.includes(metric.id)}
                  onCheckedChange={(checked) => handleMetricToggle(metric.id, checked as boolean)}
                />
                <div className="flex items-center gap-2">
                  {metric.icon}
                  <div>
                    <p className="text-sm font-medium">{metric.name}</p>
                    <p className="text-xs text-gray-500">{metric.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {comparisonData.length > 0 && selectedMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Comparison Results
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={generateReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Portfolio</th>
                    {selectedMetrics.map((metricId) => {
                      const metric = COMPARISON_METRICS.find(m => m.id === metricId);
                      return metric ? (
                        <th key={metricId} className="text-left p-3 font-medium">
                          <div className="flex items-center gap-2">
                            {metric.icon}
                            {metric.name}
                          </div>
                        </th>
                      ) : null;
                    })}
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((portfolio) => (
                    <tr key={portfolio.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{portfolio.title}</p>
                          <p className="text-sm text-gray-500">Template {portfolio.template}</p>
                        </div>
                      </td>
                      {selectedMetrics.map((metricId) => {
                        const metric = COMPARISON_METRICS.find(m => m.id === metricId);
                        if (!metric) return null;
                        
                        const value = metric.getValue(portfolio);
                        const winner = getWinner(metric);
                        const isWinner = winner?.id === portfolio.id;
                        
                        return (
                          <td key={metricId} className="p-3">
                            <div className={cn(
                              'flex items-center gap-2',
                              isWinner && 'text-green-600 font-medium'
                            )}>
                              {isWinner && <Award className="h-4 w-4" />}
                              {metric.format(value)}
                            </div>
                          </td>
                        );
                      })}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/mypage/${portfolio.slug}`} target="_blank">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePortfolioToggle(portfolio.id, false)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Winners Summary */}
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-3">🏆 Category Winners</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedMetrics.map((metricId) => {
                  const metric = COMPARISON_METRICS.find(m => m.id === metricId);
                  const winner = getWinner(metric!);
                  if (!metric || !winner) return null;
                  
                  return (
                    <div key={metricId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {metric.icon}
                        <span className="text-sm font-medium">{metric.name}:</span>
                      </div>
                      <div className="text-sm text-green-800">
                        <strong>{winner.title}</strong> - {metric.format(metric.getValue(winner))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Insights */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-3">📊 Quick Insights</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <p>
                  <strong>Top Performer:</strong> {comparisonData.reduce((top, current) => 
                    current.view_count > top.view_count ? current : top, comparisonData[0]
                  ).title} ({comparisonData.reduce((top, current) => 
                    current.view_count > top.view_count ? current : top, comparisonData[0]
                  ).view_count.toLocaleString()} views)
                </p>
                <p>
                  <strong>Average Views:</strong> {Math.round(comparisonData.reduce((sum, p) => sum + p.view_count, 0) / comparisonData.length).toLocaleString()}
                </p>
                <p>
                  <strong>Total Images:</strong> {comparisonData.reduce((sum, p) => sum + (p.images?.length || 0), 0)}
                </p>
                <p>
                  <strong>Most Popular Template:</strong> {(() => {
                    const templateCounts = comparisonData.reduce((acc, p) => {
                      acc[p.template] = (acc[p.template] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);
                    const mostPopular = Object.entries(templateCounts).reduce((a, b) => a[1] > b[1] ? a : b);
                    return `Template ${mostPopular[0]} (${mostPopular[1]} portfolios)`;
                  })()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {comparisonData.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select Portfolios to Compare</h3>
            <p className="text-gray-600">
              Choose 2-5 portfolios from the list above to see a detailed comparison of their performance and characteristics.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}