'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TemplateRenderer } from '@/components/templates/template-renderer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ExternalLink, 
  Eye, 
  Clock,
  AlertTriangle,
  Shield
} from 'lucide-react';
import type { PortfolioData } from '@/lib/templates/types';
import { TemplateType } from '@/types';

interface PreviewTokenData {
  portfolioId: string;
  userId: string;
  slug: string;
  type: string;
  exp: number;
  iat: number;
  iss: string;
}

export default function TokenPreviewPage() {
  const params = useParams();
  const router = useRouter();
  
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [tokenData, setTokenData] = useState<PreviewTokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');

  const token = params.token as string;

  const verifyTokenAndFetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Decode token to verify it's valid format
      try {
        if (!token) {
          throw new Error('No token provided');
        }
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3 || !tokenParts[1]) {
          throw new Error('Invalid token format');
        }
        const payload = JSON.parse(atob(tokenParts[1]));
        setTokenData(payload);
        
        // Check if token is expired
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp < now) {
          throw new Error('Preview link has expired');
        }
      } catch {
        throw new Error('Invalid preview link');
      }

      // Fetch portfolio data using the token
      const response = await fetch(`/api/portfolios/${tokenData?.portfolioId}/data`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Preview link has expired or is invalid');
        } else if (response.status === 404) {
          throw new Error('Portfolio not found');
        } else {
          throw new Error('Failed to load portfolio preview');
        }
      }

      const result = await response.json();
      setPortfolioData(result.data);

    } catch (err) {
      console.error('Preview token verification error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load preview');
    } finally {
      setLoading(false);
    }
  }, [token, tokenData?.portfolioId]);

  useEffect(() => {
    if (token) {
      verifyTokenAndFetchData();
    }
  }, [token, verifyTokenAndFetchData]);

  useEffect(() => {
    if (!tokenData) return;
    
    const updateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const secondsLeft = tokenData.exp - now;
      
      if (secondsLeft <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const days = Math.floor(secondsLeft / (24 * 60 * 60));
      const hours = Math.floor((secondsLeft % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((secondsLeft % (60 * 60)) / 60);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [tokenData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading portfolio preview...</p>
          <p className="text-sm text-gray-500 mt-2">Verifying preview link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🔗</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Preview Link Issue</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              This could happen if:
            </p>
            <ul className="text-sm text-gray-500 text-left space-y-1">
              <li>• The preview link has expired</li>
              <li>• The portfolio has been deleted</li>
              <li>• The link was copied incorrectly</li>
            </ul>
          </div>

          <div className="mt-6">
            <Button onClick={() => router.push('/')}>
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!portfolioData || !tokenData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🎭</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Not Available</h2>
          <p className="text-gray-600">This portfolio preview is not available.</p>
        </div>
      </div>
    );
  }

  const isExpiringSoon = tokenData.exp - Math.floor(Date.now() / 1000) < 24 * 60 * 60; // Less than 24 hours

  return (
    <div className="min-h-screen bg-white">
      {/* Preview Header */}
      <div className="bg-blue-50 border-b border-blue-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Preview Mode</span>
              </div>
              <Badge variant="outline" className="bg-white">
                <Eye className="h-3 w-3 mr-1" />
                Private Preview
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-blue-700">
                <Clock className="h-4 w-4" />
                <span>Expires in {timeLeft}</span>
                {isExpiringSoon && (
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/mypage/${portfolioData.portfolio.slug}`, '_blank')}
                className="bg-white"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Public
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Expiring Soon Warning */}
      {isExpiringSoon && (
        <div className="bg-orange-50 border-b border-orange-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center space-x-2 text-orange-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">
                This preview link will expire soon. Contact the portfolio owner for a new link.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Content */}
      <div className="relative">
        <TemplateRenderer
          templateType={portfolioData.portfolio.template as TemplateType}
          data={portfolioData}
          isPreview={true}
          className="min-h-screen"
        />

        {/* Preview Watermark */}
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded-md text-xs z-50">
          Preview Mode • Spotlight
        </div>
      </div>
    </div>
  );
}