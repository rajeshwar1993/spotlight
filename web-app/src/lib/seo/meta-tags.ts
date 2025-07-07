import { Metadata } from 'next';
import type { PortfolioData } from '@/lib/templates/types';
import { APP_CONFIG } from '@/lib/constants';

export interface EnhancedMetaTagsOptions {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile' | 'book' | 'music' | 'video';
  siteName?: string;
  locale?: string;
  alternateLocales?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
  tags?: string[];
  twitterHandle?: string;
  facebookAppId?: string;
  themeColor?: string;
  backgroundColor?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
}

/**
 * Generate comprehensive meta tags for portfolio pages
 */
export function generatePortfolioMetaTags(portfolioData: PortfolioData): Metadata {
  const { user, portfolio } = portfolioData;
  
  const title = `${user.full_name || portfolio.title} | ${user.profession || 'Portfolio'} | Spotlight`;
  const description = portfolio.bio || 
    `Professional ${user.profession?.toLowerCase()} portfolio for ${user.full_name || portfolio.title}. ${user.location ? `Based in ${user.location}.` : ''}`;
  
  const portfolioUrl = `${APP_CONFIG.url}/mypage/${portfolio.slug}`;
  const imageUrl = portfolioData.images.hero?.file_path || 
                   portfolioData.images.profile?.file_path || 
                   `${APP_CONFIG.url}/images/default-portfolio-share.jpg`;

  const keywords = [
    user.profession?.toLowerCase(),
    user.full_name?.toLowerCase(),
    user.location?.toLowerCase(),
    'portfolio',
    'actor',
    'model',
    'spotlight',
    'professional',
    'headshots',
    'talent',
    ...(portfolio.skills || [])
  ].filter(Boolean);

  return {
    title,
    description,
    keywords,
    authors: [{ name: user.full_name || 'Portfolio Owner' }],
    creator: user.full_name || 'Portfolio Owner',
    publisher: 'Spotlight',
    category: 'Portfolio',
    
    // Open Graph
    openGraph: {
      type: 'profile',
      title,
      description,
      url: portfolioUrl,
      siteName: 'Spotlight',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${user.full_name || portfolio.title} - Professional Portfolio`,
        },
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: `${user.full_name || portfolio.title} - Professional Portfolio`,
        }
      ],
      locale: 'en_US',
      modifiedTime: portfolio.updated_at,
      publishedTime: portfolio.created_at,
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@SpotlightApp',
      site: '@SpotlightApp',
    },

    // Additional SEO
    canonical: portfolioUrl,
    alternates: {
      canonical: portfolioUrl,
    },
    
    // Profile-specific meta
    other: {
      'profile:first_name': user.full_name?.split(' ')[0] || '',
      'profile:last_name': user.full_name?.split(' ').slice(1).join(' ') || '',
      'profile:username': portfolio.slug,
      'profile:gender': user.gender || '',
      
      // Mobile optimization
      'theme-color': '#ffffff',
      'msapplication-navbutton-color': '#ffffff',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'apple-mobile-web-app-title': title,
      
      // PWA
      'mobile-web-app-capable': 'yes',
      'application-name': 'Spotlight',
      
      // Additional SEO
      'revisit-after': '7 days',
      'rating': 'general',
      'distribution': 'global',
      'robots': 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      
      // Social media
      'fb:app_id': process.env.FACEBOOK_APP_ID || '',
      'article:author': user.full_name || '',
      'article:publisher': 'Spotlight',
      'article:published_time': portfolio.created_at,
      'article:modified_time': portfolio.updated_at,
      'article:section': user.profession || 'Portfolio',
      'article:tag': keywords.join(', '),
      
      // Schema.org
      'parsely-title': title,
      'parsely-link': portfolioUrl,
      'parsely-type': 'post',
      'parsely-image-url': imageUrl,
      'parsely-author': user.full_name || 'Portfolio Owner',
      'parsely-pub-date': portfolio.created_at,
      'parsely-section': user.profession || 'Portfolio',
      'parsely-tags': keywords.join(', '),
    },

    // Verification
    verification: {
      google: process.env.GOOGLE_VERIFICATION || '',
      yahoo: process.env.YAHOO_VERIFICATION || '',
      bing: process.env.BING_VERIFICATION || '',
    },

    // Robots
    robots: {
      index: portfolio.is_published,
      follow: portfolio.is_published,
      googleBot: {
        index: portfolio.is_published,
        follow: portfolio.is_published,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },

    // App links for mobile
    appLinks: {
      ios: {
        app_store_id: process.env.IOS_APP_STORE_ID || '',
        url: portfolioUrl,
      },
      android: {
        package: process.env.ANDROID_PACKAGE_NAME || '',
        url: portfolioUrl,
      },
      web: {
        url: portfolioUrl,
      },
    },
  };
}

/**
 * Generate enhanced meta tags with custom options
 */
export function generateEnhancedMetaTags(options: EnhancedMetaTagsOptions): Metadata {
  const {
    title,
    description,
    keywords = [],
    image,
    url,
    type = 'website',
    siteName = 'Spotlight',
    locale = 'en_US',
    alternateLocales = [],
    publishedTime,
    modifiedTime,
    authors = [],
    section,
    tags = [],
    twitterHandle = '@SpotlightApp',
    facebookAppId,
    themeColor = '#ffffff',
    backgroundColor = '#ffffff',
    noIndex = false,
    canonicalUrl,
  } = options;

  return {
    title,
    description,
    keywords,
    authors: authors.map(author => ({ name: author })),
    creator: authors[0] || 'Spotlight',
    publisher: siteName,
    category: section || 'Portfolio',
    
    // Open Graph
    openGraph: {
      type: type as any,
      title,
      description,
      url: url || canonicalUrl,
      siteName,
      images: image ? [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        }
      ] : [],
      locale,
      alternateLocale: alternateLocales,
      publishedTime,
      modifiedTime,
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
      creator: twitterHandle,
      site: twitterHandle,
    },

    // Additional SEO
    canonical: canonicalUrl || url,
    alternates: canonicalUrl || url ? {
      canonical: canonicalUrl || url,
    } : undefined,
    
    // Enhanced meta
    other: {
      // Mobile optimization
      'theme-color': themeColor,
      'msapplication-navbutton-color': themeColor,
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'apple-mobile-web-app-title': title,
      
      // PWA
      'mobile-web-app-capable': 'yes',
      'application-name': siteName,
      
      // Additional SEO
      'revisit-after': '7 days',
      'rating': 'general',
      'distribution': 'global',
      
      // Social media
      'fb:app_id': facebookAppId || '',
      'article:author': authors.join(', '),
      'article:publisher': siteName,
      'article:published_time': publishedTime,
      'article:modified_time': modifiedTime,
      'article:section': section,
      'article:tag': tags.join(', '),
    },

    // Robots
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  };
}

/**
 * Generate meta tags for the home page
 */
export function generateHomePageMetaTags(): Metadata {
  return generateEnhancedMetaTags({
    title: 'Spotlight - Professional Portfolio Platform for Actors & Models',
    description: 'Create stunning professional portfolios in minutes. Showcase your talent with beautiful templates, image galleries, and powerful SEO optimization. Perfect for actors, models, and creative professionals.',
    keywords: [
      'portfolio platform',
      'actor portfolio',
      'model portfolio',
      'creative portfolio',
      'professional headshots',
      'talent showcase',
      'casting platform',
      'portfolio builder',
      'talent agency',
      'creative professionals'
    ],
    image: `${APP_CONFIG.url}/images/homepage-hero.jpg`,
    url: APP_CONFIG.url,
    type: 'website',
    section: 'Homepage',
    tags: ['portfolio', 'acting', 'modeling', 'creative', 'professional'],
    canonicalUrl: APP_CONFIG.url,
  });
}

/**
 * Generate meta tags for dashboard pages
 */
export function generateDashboardMetaTags(pageTitle: string): Metadata {
  return generateEnhancedMetaTags({
    title: `${pageTitle} - Spotlight Dashboard`,
    description: 'Manage your professional portfolio, edit your information, and track your portfolio performance.',
    keywords: [
      'portfolio management',
      'dashboard',
      'portfolio editor',
      'professional profile',
      'portfolio analytics'
    ],
    noIndex: true, // Don't index private dashboard pages
    canonicalUrl: `${APP_CONFIG.url}/dashboard`,
  });
}

/**
 * Generate meta tags for authentication pages
 */
export function generateAuthMetaTags(pageType: 'signin' | 'signup' | 'reset-password'): Metadata {
  const titles = {
    signin: 'Sign In to Spotlight',
    signup: 'Create Your Spotlight Account',
    'reset-password': 'Reset Your Password - Spotlight'
  };

  const descriptions = {
    signin: 'Sign in to your Spotlight account to manage your professional portfolio.',
    signup: 'Join Spotlight and create your professional portfolio in minutes. Perfect for actors, models, and creative professionals.',
    'reset-password': 'Reset your Spotlight account password to regain access to your portfolio.'
  };

  return generateEnhancedMetaTags({
    title: titles[pageType],
    description: descriptions[pageType],
    keywords: [
      'spotlight login',
      'portfolio login',
      'actor login',
      'model login',
      'creative login',
      'professional account'
    ],
    url: `${APP_CONFIG.url}/auth/${pageType}`,
    type: 'website',
    canonicalUrl: `${APP_CONFIG.url}/auth/${pageType}`,
  });
}

/**
 * Generate error page meta tags
 */
export function generateErrorPageMetaTags(errorCode: 404 | 500): Metadata {
  const titles = {
    404: 'Page Not Found - Spotlight',
    500: 'Server Error - Spotlight'
  };

  const descriptions = {
    404: 'The page you are looking for could not be found. Return to Spotlight to explore professional portfolios.',
    500: 'We are experiencing technical difficulties. Please try again later.'
  };

  return generateEnhancedMetaTags({
    title: titles[errorCode],
    description: descriptions[errorCode],
    noIndex: true,
    canonicalUrl: APP_CONFIG.url,
  });
}