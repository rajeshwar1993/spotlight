'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, ExternalLink, User, Calendar, ArrowRight, Star, Users } from 'lucide-react';

interface FeaturedPortfolio {
  id: string;
  title: string;
  slug: string;
  bio: string;
  template: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    profession: string;
    avatarUrl?: string;
  };
  images: {
    hero?: {
      file_path: string;
      alt_text: string;
    };
    profile?: {
      file_path: string;
      alt_text: string;
    };
    gallery?: Array<{
      file_path: string;
      alt_text: string;
    }>;
  };
}

interface FeaturedPortfoliosProps {
  className?: string;
}

export function FeaturedPortfolios({ className = '' }: FeaturedPortfoliosProps) {
  const [portfolios, setPortfolios] = useState<FeaturedPortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchFeaturedPortfolios();
  }, []);

  const fetchFeaturedPortfolios = async (profession?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (profession && profession !== 'all') {
        params.append('profession', profession);
      }
      
      const response = await fetch(`/api/portfolios/featured?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setPortfolios(result.data);
      }
    } catch (error) {
      console.error('Error fetching featured portfolios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    fetchFeaturedPortfolios(value);
  };

  const getMainImage = (portfolio: FeaturedPortfolio) => {
    return portfolio.images.hero?.file_path || 
           portfolio.images.profile?.file_path || 
           portfolio.images.gallery?.[0]?.file_path ||
           '/images/portfolio-placeholder.jpg';
  };

  const getImageAlt = (portfolio: FeaturedPortfolio) => {
    return portfolio.images.hero?.alt_text || 
           portfolio.images.profile?.alt_text || 
           portfolio.images.gallery?.[0]?.alt_text ||
           `${portfolio.user.fullName}&apos;s portfolio`;
  };

  return (
    <section className={`py-20 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="w-5 h-5 text-yellow-500" />
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Featured Portfolios
            </Badge>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Inspiring Success Stories
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover exceptional portfolios created by talented professionals using Spotlight. 
            Get inspired and see what&apos;s possible for your own career.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-12">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full max-w-md">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="actor">Actors</TabsTrigger>
              <TabsTrigger value="model">Models</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Portfolio Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {portfolios.map((portfolio) => (
              <Card 
                key={portfolio.id}
                className="group overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-lg"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={getMainImage(portfolio)}
                    alt={getImageAlt(portfolio)}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* View Count */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-gray-700 flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {portfolio.viewCount.toLocaleString()}
                  </div>
                  
                  {/* Template Badge */}
                  <div className="absolute top-3 left-3 bg-black/20 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-white">
                    {portfolio.template}
                  </div>
                  
                  {/* Hover Actions */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link href={`/mypage/${portfolio.slug}`} target="_blank">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Portfolio
                      </Button>
                    </Link>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {portfolio.user.avatarUrl ? (
                      <Image
                        src={portfolio.user.avatarUrl}
                        alt={portfolio.user.fullName}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                        {portfolio.user.fullName}
                      </h3>
                      <p className="text-xs text-gray-500">{portfolio.user.profession}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {portfolio.bio}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(portfolio.createdAt).toLocaleDateString()}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {portfolio.template}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && portfolios.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No portfolios found
            </h3>
            <p className="text-gray-500">
              Be the first to create a portfolio in this category!
            </p>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Link href="/examples">
            <Button 
              variant="outline" 
              size="lg"
              className="group hover:bg-gray-900 hover:text-white transition-all duration-300"
            >
              View All Examples
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}