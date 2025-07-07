'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Eye, 
  ExternalLink, 
  User, 
  Calendar, 
  MapPin, 
  Star,
  Share2,
  Heart,
  // ChevronRight 
} from 'lucide-react';

interface PortfolioCardProps {
  portfolio: {
    id: string;
    title: string;
    slug: string;
    bio: string;
    template: string;
    location?: string;
    skills?: string;
    viewCount: number;
    createdAt: string;
    category: string;
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
  };
  onShare?: (portfolio: PortfolioCardProps['portfolio']) => void;
  onFavorite?: (portfolio: PortfolioCardProps['portfolio']) => void;
  className?: string;
}

export function PortfolioCard({ 
  portfolio, 
  onShare, 
  onFavorite, 
  className = '' 
}: PortfolioCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getMainImage = () => {
    return portfolio.images.hero?.file_path || 
           portfolio.images.profile?.file_path || 
           portfolio.images.gallery?.[0]?.file_path ||
           '/images/portfolio-placeholder.jpg';
  };

  const getImageAlt = () => {
    return portfolio.images.hero?.alt_text || 
           portfolio.images.profile?.alt_text || 
           portfolio.images.gallery?.[0]?.alt_text ||
           `${portfolio.user.fullName}'s portfolio`;
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(portfolio);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavorite?.(portfolio);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      professional: 'bg-blue-100 text-blue-800',
      bold: 'bg-purple-100 text-purple-800',
      minimal: 'bg-gray-100 text-gray-800',
      creative: 'bg-pink-100 text-pink-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getProfessionColor = (profession: string) => {
    const colors = {
      ACTOR: 'bg-red-100 text-red-800',
      MODEL: 'bg-green-100 text-green-800',
      BOTH: 'bg-yellow-100 text-yellow-800',
    };
    return colors[profession as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card 
      className={`group overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={getMainImage()}
          alt={getImageAlt()}
          fill
          className={`object-cover transition-all duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } ${isHovered ? 'scale-110' : 'scale-100'}`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />
        
        {/* Top badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className={`text-xs ${getCategoryColor(portfolio.category)}`}>
            {portfolio.category}
          </Badge>
          <Badge className={`text-xs ${getProfessionColor(portfolio.user.profession)}`}>
            {portfolio.user.profession}
          </Badge>
        </div>
        
        {/* View count */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-gray-700 flex items-center gap-1">
          <Eye className="w-3 h-3" />
          {portfolio.viewCount.toLocaleString()}
        </div>
        
        {/* Action buttons */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2 transition-all duration-300 ${
          isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <Link href={`/mypage/${portfolio.slug}`} target="_blank">
            <Button 
              size="sm"
              className="bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm shadow-lg"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Portfolio
            </Button>
          </Link>
        </div>
        
        {/* Bottom action buttons */}
        <div className={`absolute bottom-3 right-3 flex gap-2 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleShare}
            className="bg-white/90 hover:bg-white text-gray-600 backdrop-blur-sm w-8 h-8 p-0"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleFavorite}
            className="bg-white/90 hover:bg-white text-gray-600 backdrop-blur-sm w-8 h-8 p-0"
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4">
        {/* User info */}
        <div className="flex items-center gap-3 mb-3">
          {portfolio.user.avatarUrl ? (
            <Image
              src={portfolio.user.avatarUrl}
              alt={portfolio.user.fullName}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
              {portfolio.user.fullName}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              {portfolio.user.profession}
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>4.8</span>
          </div>
        </div>
        
        {/* Portfolio title */}
        <h4 className="font-medium text-gray-900 mb-2 line-clamp-1">
          {portfolio.title}
        </h4>
        
        {/* Bio */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {portfolio.bio}
        </p>
        
        {/* Skills */}
        {portfolio.skills && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {portfolio.skills.split(',').slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill.trim()}
                </Badge>
              ))}
              {portfolio.skills.split(',').length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{portfolio.skills.split(',').length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(portfolio.createdAt).toLocaleDateString()}
            </div>
            {portfolio.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-20">{portfolio.location}</span>
              </div>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            {portfolio.template}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}