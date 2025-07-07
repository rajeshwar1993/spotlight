import type { PortfolioData } from '@/lib/templates/types';
import { APP_CONFIG } from '@/lib/constants';

// Base Schema.org types
export interface SchemaBase {
  '@context': string;
  '@type': string;
}

export interface PersonSchema extends SchemaBase {
  '@type': 'Person';
  name: string;
  jobTitle?: string;
  description?: string;
  url?: string;
  image?: string;
  address?: {
    '@type': 'Place';
    name: string;
  };
  sameAs?: string[];
  knowsAbout?: string[];
  alumniOf?: string[];
  award?: string[];
  email?: string;
  telephone?: string;
  birthPlace?: string;
  nationality?: string;
  gender?: string;
  height?: string;
  weight?: string;
  eyeColor?: string;
  hairColor?: string;
  worksFor?: OrganizationSchema;
  memberOf?: OrganizationSchema[];
}

export interface OrganizationSchema extends SchemaBase {
  '@type': 'Organization';
  name: string;
  description?: string;
  url?: string;
  logo?: string;
  foundingDate?: string;
  founder?: PersonSchema;
  sameAs?: string[];
  address?: {
    '@type': 'PostalAddress';
    addressCountry?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    streetAddress?: string;
  };
  contactPoint?: {
    '@type': 'ContactPoint';
    telephone?: string;
    email?: string;
    contactType?: string;
  };
}

export interface CreativeWorkSchema extends SchemaBase {
  '@type': 'CreativeWork' | 'VisualArtwork' | 'Photograph' | 'VideoObject';
  name: string;
  description?: string;
  creator?: PersonSchema;
  dateCreated?: string;
  dateModified?: string;
  url?: string;
  image?: string;
  keywords?: string[];
  genre?: string;
  about?: string;
  isPartOf?: {
    '@type': 'CreativeWorkSeries';
    name: string;
  };
}

export interface PortfolioSchema extends SchemaBase {
  '@type': 'CreativeWorkSeries';
  name: string;
  description?: string;
  creator?: PersonSchema;
  hasPart?: CreativeWorkSchema[];
  dateCreated?: string;
  dateModified?: string;
  url?: string;
  image?: string;
  keywords?: string[];
  genre?: string;
  about?: string;
  mainEntity?: PersonSchema;
}

export interface LocalBusinessSchema extends SchemaBase {
  '@type': 'LocalBusiness' | 'ProfessionalService';
  name: string;
  description?: string;
  url?: string;
  image?: string;
  address?: {
    '@type': 'PostalAddress';
    addressCountry?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    streetAddress?: string;
  };
  geo?: {
    '@type': 'GeoCoordinates';
    latitude?: number;
    longitude?: number;
  };
  telephone?: string;
  email?: string;
  openingHours?: string[];
  priceRange?: string;
  acceptsReservations?: boolean;
  servesCuisine?: string[];
  serviceArea?: {
    '@type': 'GeoCircle';
    geoMidpoint?: {
      '@type': 'GeoCoordinates';
      latitude?: number;
      longitude?: number;
    };
    geoRadius?: string;
  };
}

export interface BreadcrumbSchema extends SchemaBase {
  '@type': 'BreadcrumbList';
  itemListElement: {
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
  }[];
}

export interface WebSiteSchema extends SchemaBase {
  '@type': 'WebSite';
  name: string;
  description?: string;
  url: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
  publisher?: OrganizationSchema;
  author?: PersonSchema;
  inLanguage?: string;
  copyrightYear?: number;
  copyrightHolder?: OrganizationSchema;
}

/**
 * Generate enhanced Person schema for portfolio owner
 */
export function generatePersonSchema(portfolioData: PortfolioData): PersonSchema {
  const { user, portfolio } = portfolioData;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: user.full_name || portfolio.title,
    jobTitle: user.profession,
    description: portfolio.bio,
    url: `${APP_CONFIG.url}/mypage/${portfolio.slug}`,
    image: portfolioData.images.profile?.file_path || portfolioData.images.hero?.file_path,
    address: user.location ? {
      '@type': 'Place',
      name: user.location
    } : undefined,
    sameAs: [
      user.website_url,
      portfolioData.social_links.instagram ? `https://instagram.com/${portfolioData.social_links.instagram}` : null,
      portfolioData.social_links.twitter ? `https://twitter.com/${portfolioData.social_links.twitter}` : null,
      portfolioData.social_links.linkedin ? `https://linkedin.com/in/${portfolioData.social_links.linkedin}` : null,
      portfolioData.social_links.tiktok ? `https://tiktok.com/@${portfolioData.social_links.tiktok}` : null,
      portfolioData.social_links.youtube ? `https://youtube.com/@${portfolioData.social_links.youtube}` : null,
    ].filter(Boolean),
    knowsAbout: portfolio.skills,
    email: user.email,
    gender: user.gender,
    height: user.height,
    weight: user.weight,
    eyeColor: user.eye_color,
    hairColor: user.hair_color,
    worksFor: generateSpotlightOrganizationSchema(),
  };
}

/**
 * Generate Portfolio schema as CreativeWorkSeries
 */
export function generatePortfolioSchema(portfolioData: PortfolioData): PortfolioSchema {
  const { user, portfolio } = portfolioData;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWorkSeries',
    name: `${user.full_name || portfolio.title} - Portfolio`,
    description: portfolio.bio,
    creator: generatePersonSchema(portfolioData),
    mainEntity: generatePersonSchema(portfolioData),
    dateCreated: portfolio.created_at,
    dateModified: portfolio.updated_at,
    url: `${APP_CONFIG.url}/mypage/${portfolio.slug}`,
    image: portfolioData.images.hero?.file_path || portfolioData.images.profile?.file_path,
    keywords: [
      user.profession?.toLowerCase(),
      user.full_name?.toLowerCase(),
      user.location?.toLowerCase(),
      'portfolio',
      ...(portfolio.skills || [])
    ].filter(Boolean),
    genre: user.profession,
    about: user.profession,
    hasPart: generateCreativeWorksFromImages(portfolioData),
  };
}

/**
 * Generate CreativeWork schemas from portfolio images
 */
export function generateCreativeWorksFromImages(portfolioData: PortfolioData): CreativeWorkSchema[] {
  const { user, portfolio } = portfolioData;
  const creativeWorks: CreativeWorkSchema[] = [];
  
  // Generate creative works from gallery images
  if (portfolioData.images.gallery && portfolioData.images.gallery.length > 0) {
    portfolioData.images.gallery.forEach((image, index) => {
      creativeWorks.push({
        '@context': 'https://schema.org',
        '@type': 'Photograph',
        name: `${user.full_name || portfolio.title} - Photo ${index + 1}`,
        description: image.alt_text || `Professional photo of ${user.full_name || portfolio.title}`,
        creator: generatePersonSchema(portfolioData),
        dateCreated: image.created_at,
        url: image.file_path,
        image: image.file_path,
        keywords: portfolio.skills,
        genre: user.profession,
        about: user.profession,
        isPartOf: {
          '@type': 'CreativeWorkSeries',
          name: `${user.full_name || portfolio.title} - Portfolio`
        }
      });
    });
  }
  
  // Add hero image as creative work
  if (portfolioData.images.hero) {
    creativeWorks.push({
      '@context': 'https://schema.org',
      '@type': 'Photograph',
      name: `${user.full_name || portfolio.title} - Hero Image`,
      description: portfolioData.images.hero.alt_text || `Professional hero image of ${user.full_name || portfolio.title}`,
      creator: generatePersonSchema(portfolioData),
      dateCreated: portfolioData.images.hero.created_at,
      url: portfolioData.images.hero.file_path,
      image: portfolioData.images.hero.file_path,
      keywords: portfolio.skills,
      genre: user.profession,
      about: user.profession,
      isPartOf: {
        '@type': 'CreativeWorkSeries',
        name: `${user.full_name || portfolio.title} - Portfolio`
      }
    });
  }
  
  return creativeWorks;
}

/**
 * Generate Organization schema for Spotlight platform
 */
export function generateSpotlightOrganizationSchema(): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Spotlight',
    description: 'Professional portfolio platform for actors, models, and creative professionals',
    url: APP_CONFIG.url,
    logo: `${APP_CONFIG.url}/images/logo.png`,
    foundingDate: '2024',
    sameAs: [
      // Add social media URLs when available
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@spotlight.com',
      contactType: 'customer service'
    }
  };
}

/**
 * Generate LocalBusiness schema for location-based professionals
 */
export function generateLocalBusinessSchema(portfolioData: PortfolioData): LocalBusinessSchema | null {
  const { user, portfolio } = portfolioData;
  
  if (!user.location) {
    return null;
  }
  
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: user.full_name || portfolio.title,
    description: portfolio.bio,
    url: `${APP_CONFIG.url}/mypage/${portfolio.slug}`,
    image: portfolioData.images.profile?.file_path || portfolioData.images.hero?.file_path,
    address: {
      '@type': 'PostalAddress',
      addressLocality: user.location,
    },
    email: user.email,
    priceRange: '$$',
    acceptsReservations: true,
  };
}

/**
 * Generate Breadcrumb schema for portfolio navigation
 */
export function generateBreadcrumbSchema(portfolioData: PortfolioData): BreadcrumbSchema {
  const { user, portfolio } = portfolioData;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: APP_CONFIG.url
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Portfolios',
        item: `${APP_CONFIG.url}/portfolios`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: user.full_name || portfolio.title,
        item: `${APP_CONFIG.url}/mypage/${portfolio.slug}`
      }
    ]
  };
}

/**
 * Generate WebSite schema for the platform
 */
export function generateWebSiteSchema(): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Spotlight',
    description: 'Professional portfolio platform for actors, models, and creative professionals',
    url: APP_CONFIG.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${APP_CONFIG.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    },
    publisher: generateSpotlightOrganizationSchema(),
    inLanguage: 'en-US',
    copyrightYear: new Date().getFullYear(),
    copyrightHolder: generateSpotlightOrganizationSchema()
  };
}

/**
 * Generate comprehensive structured data for a portfolio page
 */
export function generatePortfolioStructuredData(portfolioData: PortfolioData) {
  return {
    person: generatePersonSchema(portfolioData),
    portfolio: generatePortfolioSchema(portfolioData),
    organization: generateSpotlightOrganizationSchema(),
    localBusiness: generateLocalBusinessSchema(portfolioData),
    breadcrumb: generateBreadcrumbSchema(portfolioData),
    website: generateWebSiteSchema(),
  };
}