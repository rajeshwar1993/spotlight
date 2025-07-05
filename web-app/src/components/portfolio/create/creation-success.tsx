'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getPortfolio } from '@/lib/services/portfolio';
import { getTemplateConfig } from '@/lib/templates/registry-simple';
import { CheckCircle, ExternalLink, Edit, Share2, Eye } from 'lucide-react';
import { Portfolio } from '@/types';

export function CreationSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const portfolioId = searchParams.get('portfolio');
  
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!portfolioId) {
      setError('Portfolio ID not found');
      setIsLoading(false);
      return;
    }

    const fetchPortfolio = async () => {
      try {
        const { data, error } = await getPortfolio(portfolioId);
        if (error || !data) {
          throw new Error(error?.message || 'Portfolio not found');
        }
        setPortfolio(data);
      } catch (err) {
        console.error('Error fetching portfolio:', err);
        setError(err instanceof Error ? err.message : 'Failed to load portfolio');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolio();
  }, [portfolioId]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your portfolio...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">{error || 'Portfolio not found'}</p>
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const templateConfig = getTemplateConfig(portfolio.template);
  const portfolioUrl = `/${portfolio.slug}`;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success Header */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Portfolio Created Successfully! 🎉
            </h1>
            <p className="text-lg text-gray-600">
              Your professional portfolio is ready to showcase your talent
            </p>
          </div>

          {/* Portfolio Summary */}
          <div className="bg-white rounded-lg p-6 text-left">
            <h2 className="text-xl font-bold text-gray-900 mb-3">{portfolio.title}</h2>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">
                {templateConfig?.name || portfolio.template}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {templateConfig?.category || 'Template'}
              </Badge>
              <Badge variant="outline" className={portfolio.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {portfolio.is_published ? 'Published' : 'Draft'}
              </Badge>
            </div>

            {portfolio.bio && (
              <p className="text-gray-600 text-sm leading-relaxed">
                {portfolio.bio.length > 150 
                  ? `${portfolio.bio.substring(0, 150)}...` 
                  : portfolio.bio
                }
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">What&apos;s next?</h3>
          
          <div className="space-y-4">
            {/* Preview Portfolio */}
            <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Preview your portfolio</h4>
                <p className="text-sm text-gray-600 mb-3">
                  See how your portfolio looks to visitors and clients
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(portfolioUrl, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Portfolio
                </Button>
              </div>
            </div>

            {/* Edit Portfolio */}
            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <Edit className="h-6 w-6 text-gray-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Add images & details</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Upload photos, add skills, and customize your portfolio further
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push(`/portfolio/${portfolio.id}/edit`)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Portfolio
                </Button>
              </div>
            </div>

            {/* Share Portfolio */}
            <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg">
              <Share2 className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Share with the world</h4>
                <p className="text-sm text-gray-600 mb-3">
                  When ready, publish your portfolio and share it with casting directors
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + portfolioUrl);
                      // Could add a toast notification here
                    }}
                  >
                    Copy Link
                  </Button>
                  {!portfolio.is_published && (
                    <Button 
                      size="sm"
                      onClick={() => router.push(`/portfolio/${portfolio.id}/publish`)}
                    >
                      Publish Now
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio URL */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <h3 className="font-medium text-gray-900 mb-2">Your Portfolio URL</h3>
          <div className="flex items-center space-x-2">
            <code className="flex-1 px-3 py-2 bg-white rounded border text-sm font-mono">
              {window.location.origin}{portfolioUrl}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin + portfolioUrl);
              }}
            >
              Copy
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            This is your permanent portfolio URL that you can share with anyone
          </p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <Button 
          onClick={() => router.push('/dashboard')}
          className="flex-1"
        >
          Go to Dashboard
        </Button>
        <Button 
          variant="outline"
          onClick={() => router.push('/create')}
          className="flex-1"
        >
          Create Another Portfolio
        </Button>
      </div>

      {/* Tips */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <h4 className="font-medium text-gray-900 mb-2">💡 Pro Tips</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Add high-quality photos to make your portfolio stand out</li>
            <li>• Keep your bio updated with recent projects and achievements</li>
            <li>• Share your portfolio URL on social media and in your email signature</li>
            <li>• Check your analytics to see how many people view your portfolio</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}