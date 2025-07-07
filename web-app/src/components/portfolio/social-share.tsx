'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Share2, 
  Copy, 
  Facebook, 
  Twitter, 
  Linkedin, 
  MessageCircle,
  Mail,
  Link,
  Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export function SocialShare({
  url,
  title,
  description = '',
  image = '',
  size = 'default',
  variant = 'outline',
  className
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&via=SpotlightApp`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${url}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Portfolio link has been copied to clipboard",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      toast({
        title: "Copy failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleShare = (platform: string) => {
    const link = shareLinks[platform as keyof typeof shareLinks];
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer,width=600,height=400');
    }
  };

  // Native Web Share API (for mobile devices)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
        // Fallback to dropdown menu
      }
    }
  };

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: copied ? Check : Copy,
      action: handleCopyLink,
      color: 'text-gray-600',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      action: () => handleShare('facebook'),
      color: 'text-blue-600',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      action: () => handleShare('twitter'),
      color: 'text-sky-600',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      action: () => handleShare('linkedin'),
      color: 'text-blue-700',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      action: () => handleShare('whatsapp'),
      color: 'text-green-600',
    },
    {
      name: 'Email',
      icon: Mail,
      action: () => handleShare('email'),
      color: 'text-gray-600',
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(
            'gap-2 shadow-lg backdrop-blur-sm bg-white/90 hover:bg-white border-gray-200',
            className
          )}
          onClick={navigator.share ? handleNativeShare : undefined}
        >
          <Share2 className={cn(
            'transition-transform group-hover:scale-110',
            size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'
          )} />
          <span className={cn(
            'hidden sm:inline',
            size === 'sm' && 'sr-only'
          )}>
            Share
          </span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-white/95 backdrop-blur-md border-gray-200"
      >
        {shareOptions.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.name}
              onClick={option.action}
              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
            >
              <Icon className={cn('h-4 w-4', option.color)} />
              <span className="text-sm font-medium text-gray-700">
                {option.name}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact inline share buttons (alternative layout)
export function InlineSocialShare({
  url,
  title,
  description = '',
  className
}: Omit<SocialShareProps, 'size' | 'variant'>) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&via=SpotlightApp`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Portfolio link has been copied to clipboard",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      toast({
        title: "Copy failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleShare = (platform: string) => {
    const link = shareLinks[platform as keyof typeof shareLinks];
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer,width=600,height=400');
    }
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <span className="text-sm font-medium text-gray-600">Share:</span>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleShare('facebook')}
        className="p-2 hover:bg-blue-50"
        title="Share on Facebook"
      >
        <Facebook className="h-4 w-4 text-blue-600" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleShare('twitter')}
        className="p-2 hover:bg-sky-50"
        title="Share on Twitter"
      >
        <Twitter className="h-4 w-4 text-sky-600" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleShare('linkedin')}
        className="p-2 hover:bg-blue-50"
        title="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4 text-blue-700" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleShare('whatsapp')}
        className="p-2 hover:bg-green-50"
        title="Share on WhatsApp"
      >
        <MessageCircle className="h-4 w-4 text-green-600" />
      </Button>
      
      <div className="h-4 w-px bg-gray-300" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopyLink}
        className="p-2 hover:bg-gray-50"
        title="Copy link"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Link className="h-4 w-4 text-gray-600" />
        )}
      </Button>
    </div>
  );
}

export default SocialShare;