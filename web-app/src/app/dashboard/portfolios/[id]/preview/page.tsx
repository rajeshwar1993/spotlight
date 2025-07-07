'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TemplateRenderer } from '@/components/templates/template-renderer';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Edit, 
  Share2, 
  ExternalLink, 
  Monitor, 
  Tablet, 
  Smartphone,
  Eye,
  Copy,
  Settings,
  RefreshCcw
} from 'lucide-react';
import Link from 'next/link';
import type { PortfolioData } from '@/lib/templates/types';
import { TemplateType } from '@/types';

type PreviewMode = 'desktop' | 'tablet' | 'mobile';

interface Portfolio {
  id: string;
  title: string;
  slug: string;
  template: TemplateType;
  status: string;
  bio?: string;
  view_count: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export default function PortfolioPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useUser();
  const { toast } = useToast();
  
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [shareableLink, setShareableLink] = useState<string>('');
  const [previewLink, setPreviewLink] = useState<string>('');
  const [generatingPreviewLink, setGeneratingPreviewLink] = useState(false);

  const portfolioId = params.id as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin');
      return;
    }

    fetchPortfolioData();
  }, [portfolioId, isAuthenticated, router]);

  const fetchPortfolioData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch portfolio basic info
      const portfolioResponse = await fetch(`/api/portfolios/${portfolioId}`);
      if (!portfolioResponse.ok) {
        throw new Error('Failed to fetch portfolio');
      }
      const portfolioResult = await portfolioResponse.json();
      setPortfolio(portfolioResult.data);

      // Fetch complete portfolio data for rendering
      const dataResponse = await fetch(`/api/portfolios/${portfolioId}/data`);
      if (!dataResponse.ok) {
        throw new Error('Failed to fetch portfolio data');
      }
      const dataResult = await dataResponse.json();
      setPortfolioData(dataResult.data);

      // Generate shareable link
      const domain = window.location.origin;
      setShareableLink(`${domain}/mypage/${portfolioResult.data.slug}`);

    } catch (err) {
      console.error('Error fetching portfolio data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  }, [portfolioId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPortfolioData();
    setRefreshing(false);
    toast({
      title: "Preview refreshed",
      description: "Portfolio preview has been updated with latest changes",
    });
  };

  const handleCopyLink = async (link?: string) => {
    try {
      const linkToCopy = link || shareableLink;
      await navigator.clipboard.writeText(linkToCopy);
      toast({
        title: "Link copied!",
        description: "Portfolio link has been copied to clipboard",
      });
    } catch (err) {
      console.error('Failed to copy link:', err);
      toast({
        title: "Copy failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const generatePreviewLink = async () => {
    try {
      setGeneratingPreviewLink(true);
      const response = await fetch(`/api/portfolios/${portfolioId}/preview-link`);
      
      if (!response.ok) {
        throw new Error('Failed to generate preview link');
      }
      
      const result = await response.json();
      setPreviewLink(result.data.previewUrl);
      
      toast({
        title: "Preview link generated!",
        description: "Shareable preview link has been created",
      });
    } catch (err) {
      console.error('Failed to generate preview link:', err);
      toast({
        title: "Generation failed",
        description: "Failed to generate preview link",
        variant: "destructive",
      });
    } finally {
      setGeneratingPreviewLink(false);
    }
  };

  const getPreviewModeIcon = (mode: PreviewMode) => {
    switch (mode) {
      case 'desktop':
        return <Monitor className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
    }
  };

  const getPreviewModeClass = (mode: PreviewMode) => {
    switch (mode) {
      case 'desktop':
        return 'w-full max-w-none';
      case 'tablet':
        return 'w-full max-w-3xl mx-auto';
      case 'mobile':
        return 'w-full max-w-sm mx-auto';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading portfolio preview...</p>
        </div>
      </div>
    );
  }

  if (error || !portfolio || !portfolioData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎭</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'Portfolio data could not be loaded'}</p>
          <Link href="/dashboard/portfolios">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portfolios
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Back button and title */}
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/portfolios">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{portfolio.title}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={portfolio.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                    {portfolio.status}
                  </Badge>
                  <span className="text-sm text-gray-500 flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    {portfolio.view_count} views
                  </span>
                </div>
              </div>
            </div>

            {/* Center - Preview mode toggle */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              {(['desktop', 'tablet', 'mobile'] as PreviewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPreviewMode(mode)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    previewMode === mode
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {getPreviewModeIcon(mode)}
                  <span className="capitalize hidden sm:inline">{mode}</span>
                </button>
              ))}
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="hidden sm:flex"
              >
                <RefreshCcw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyLink()}
                className="hidden md:flex"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              
              <Link href={shareableLink} target="_blank">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">View Live</span>
                </Button>
              </Link>

              <Link href={`/dashboard/portfolios/${portfolioId}/edit`}>
                <Button size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Preview Container */}
          <div className={`transition-all duration-300 ${getPreviewModeClass(previewMode)}`}>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Browser Chrome */}
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1.5">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="bg-white rounded-md px-3 py-1.5 text-sm text-gray-600 font-mono border min-w-0 flex-1 max-w-md">
                      <span className="truncate">{shareableLink}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyLink()}
                      className="md:hidden"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="sm:hidden"
                    >
                      <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Template Renderer */}
              <div className="overflow-auto bg-white">
                <TemplateRenderer
                  templateType={portfolio.template}
                  data={portfolioData}
                  isPreview={true}
                  className="min-h-[600px]"
                />
              </div>
            </div>
          </div>

          {/* Preview Info */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Portfolio Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Template</label>
                  <p className="text-sm text-gray-900 font-mono">{portfolio.template}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={portfolio.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                      {portfolio.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-sm text-gray-900">
                    {new Date(portfolio.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Views</label>
                  <p className="text-sm text-gray-900">{portfolio.view_count.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sharing & SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Public URL</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      type="text"
                      value={shareableLink}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 font-mono"
                    />
                    <Button size="sm" variant="outline" onClick={() => handleCopyLink()}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Preview Link (Shareable)</label>
                  <div className="space-y-2 mt-1">
                    {previewLink ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={previewLink}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 font-mono"
                        />
                        <Button size="sm" variant="outline" onClick={() => handleCopyLink(previewLink)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={generatePreviewLink}
                        disabled={generatingPreviewLink}
                        className="w-full"
                      >
                        {generatingPreviewLink ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Share2 className="h-4 w-4 mr-2" />
                            Generate Preview Link
                          </>
                        )}
                      </Button>
                    )}
                    {previewLink && (
                      <p className="text-xs text-gray-500">
                        This link allows anyone to preview your portfolio for 7 days without requiring login.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">SEO Status</label>
                  <p className="text-sm text-gray-900">
                    {portfolio.is_published ? (
                      <span className="text-green-600">✓ Public & Indexed</span>
                    ) : (
                      <span className="text-orange-600">⚠ Draft (Not indexed)</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-sm text-gray-900">
                    {new Date(portfolio.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/dashboard/portfolios/${portfolioId}/edit`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Portfolio
                  </Button>
                </Link>
                <Link href={shareableLink} target="_blank" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Live Site
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCcw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh Preview
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Settings className="h-4 w-4 mr-2" />
                  Template Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}