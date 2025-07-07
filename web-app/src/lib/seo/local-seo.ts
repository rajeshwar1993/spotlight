import type { PortfolioData } from '@/lib/templates/types';
import { generateLocalBusinessSchema, type LocalBusinessSchema } from './schema';
import { APP_CONFIG } from '@/lib/constants';

export interface LocationData {
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  geo?: {
    latitude?: number;
    longitude?: number;
  };
  businessHours?: {
    dayOfWeek: string;
    opens: string;
    closes: string;
  }[];
  serviceArea?: {
    geoMidpoint?: {
      latitude: number;
      longitude: number;
    };
    geoRadius?: string; // e.g., "50 miles", "100 km"
  };
  priceRange?: string; // e.g., "$", "$$", "$$$", "$$$$"
  acceptsReservations?: boolean;
  telephone?: string;
  email?: string;
}

export interface LocalSEOOptions {
  businessType?: 'ProfessionalService' | 'LocalBusiness' | 'Organization';
  serviceCategories?: string[];
  languages?: string[];
  paymentMethods?: string[];
  accessibility?: string[];
  amenities?: string[];
  awards?: string[];
  certifications?: string[];
}

/**
 * Generate comprehensive local business schema
 */
export function generateEnhancedLocalBusinessSchema(
  portfolioData: PortfolioData,
  locationData: LocationData,
  options: LocalSEOOptions = {}
): LocalBusinessSchema {
  const { user, portfolio } = portfolioData;
  const baseSchema = generateLocalBusinessSchema(portfolioData);
  
  if (!baseSchema) {
    return {
      '@context': 'https://schema.org',
      '@type': options.businessType || 'ProfessionalService',
      name: user.full_name || portfolio.title,
      description: portfolio.bio,
      url: `${APP_CONFIG.url}/mypage/${portfolio.slug}`,
    };
  }
  
  return {
    ...baseSchema,
    '@type': options.businessType || 'ProfessionalService',
    
    // Enhanced address information
    address: locationData.address ? {
      '@type': 'PostalAddress',
      streetAddress: locationData.address.streetAddress,
      addressLocality: locationData.address.addressLocality || user.location,
      addressRegion: locationData.address.addressRegion,
      postalCode: locationData.address.postalCode,
      addressCountry: locationData.address.addressCountry || 'US',
    } : baseSchema.address,
    
    // Geographic coordinates
    geo: locationData.geo ? {
      '@type': 'GeoCoordinates',
      latitude: locationData.geo.latitude,
      longitude: locationData.geo.longitude,
    } : undefined,
    
    // Business hours
    openingHours: locationData.businessHours?.map(hours => 
      `${hours.dayOfWeek} ${hours.opens}-${hours.closes}`
    ),
    
    // Service area
    areaServed: locationData.serviceArea ? {
      '@type': 'GeoCircle',
      geoMidpoint: locationData.serviceArea.geoMidpoint ? {
        '@type': 'GeoCoordinates',
        latitude: locationData.serviceArea.geoMidpoint.latitude,
        longitude: locationData.serviceArea.geoMidpoint.longitude,
      } : undefined,
      geoRadius: locationData.serviceArea.geoRadius,
    } : undefined,
    
    // Contact information
    telephone: locationData.telephone || user.phone,
    email: locationData.email || user.email,
    
    // Business details
    priceRange: locationData.priceRange || '$$',
    acceptsReservations: locationData.acceptsReservations ?? true,
    
    // Services and categories
    serviceType: options.serviceCategories,
    knowsLanguage: options.languages,
    paymentAccepted: options.paymentMethods,
    
    // Accessibility and amenities
    amenityFeature: options.amenities?.map(amenity => ({
      '@type': 'LocationFeatureSpecification',
      name: amenity,
      value: true,
    })),
    
    // Professional credentials
    hasCredential: options.certifications?.map(cert => ({
      '@type': 'EducationalOccupationalCredential',
      name: cert,
    })),
    
    // Awards and recognition
    award: options.awards,
    
    // Business ratings (placeholder for future implementation)
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      reviewCount: '1',
      bestRating: '5',
      worstRating: '1',
    },
    
    // Image gallery
    image: [
      portfolioData.images.profile?.file_path,
      portfolioData.images.hero?.file_path,
      ...(portfolioData.images.gallery?.map(img => img.file_path) || [])
    ].filter(Boolean),
    
    // Social media presence
    sameAs: [
      user.website_url,
      portfolioData.social_links.instagram ? `https://instagram.com/${portfolioData.social_links.instagram}` : null,
      portfolioData.social_links.twitter ? `https://twitter.com/${portfolioData.social_links.twitter}` : null,
      portfolioData.social_links.linkedin ? `https://linkedin.com/in/${portfolioData.social_links.linkedin}` : null,
      portfolioData.social_links.tiktok ? `https://tiktok.com/@${portfolioData.social_links.tiktok}` : null,
      portfolioData.social_links.youtube ? `https://youtube.com/@${portfolioData.social_links.youtube}` : null,
    ].filter(Boolean),
  };
}

/**
 * Generate local business review schema
 */
export function generateLocalBusinessReviewSchema(
  portfolioData: PortfolioData,
  reviews: Array<{
    author: string;
    rating: number;
    reviewBody: string;
    datePublished: string;
  }>
) {
  const { user, portfolio } = portfolioData;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: user.full_name || portfolio.title,
    url: `${APP_CONFIG.url}/mypage/${portfolio.slug}`,
    review: reviews.map(review => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: review.reviewBody,
      datePublished: review.datePublished,
    })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1),
      reviewCount: reviews.length,
      bestRating: 5,
      worstRating: 1,
    },
  };
}

/**
 * Generate service schema for specific services offered
 */
export function generateServiceSchema(
  portfolioData: PortfolioData,
  services: Array<{
    name: string;
    description: string;
    price?: string;
    currency?: string;
    duration?: string;
    category?: string;
  }>
) {
  const { user, portfolio } = portfolioData;
  
  return services.map(service => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: {
      '@type': 'Person',
      name: user.full_name || portfolio.title,
      url: `${APP_CONFIG.url}/mypage/${portfolio.slug}`,
    },
    category: service.category || user.profession,
    offers: service.price ? {
      '@type': 'Offer',
      price: service.price,
      priceCurrency: service.currency || 'USD',
      availability: 'https://schema.org/InStock',
    } : undefined,
    duration: service.duration,
    serviceType: service.name,
    areaServed: user.location,
  }));
}

/**
 * Generate local event schema for portfolio-related events
 */
export function generateLocalEventSchema(
  portfolioData: PortfolioData,
  events: Array<{
    name: string;
    description: string;
    startDate: string;
    endDate?: string;
    location: {
      name: string;
      address?: string;
    };
    eventType?: string;
    offers?: {
      price: string;
      currency: string;
    };
  }>
) {
  const { user, portfolio } = portfolioData;
  
  return events.map(event => ({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    location: {
      '@type': 'Place',
      name: event.location.name,
      address: event.location.address ? {
        '@type': 'PostalAddress',
        name: event.location.address,
      } : undefined,
    },
    organizer: {
      '@type': 'Person',
      name: user.full_name || portfolio.title,
      url: `${APP_CONFIG.url}/mypage/${portfolio.slug}`,
    },
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    offers: event.offers ? {
      '@type': 'Offer',
      price: event.offers.price,
      priceCurrency: event.offers.currency,
      availability: 'https://schema.org/InStock',
    } : undefined,
  }));
}

/**
 * Generate local FAQ schema for common questions
 */
export function generateLocalFAQSchema(
  portfolioData: PortfolioData,
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
    about: {
      '@type': 'Person',
      name: portfolioData.user.full_name || portfolioData.portfolio.title,
      url: `${APP_CONFIG.url}/mypage/${portfolioData.portfolio.slug}`,
    },
  };
}

/**
 * Generate optimized local SEO meta tags
 */
export function generateLocalSEOMetaTags(
  portfolioData: PortfolioData,
  locationData: LocationData
) {
  const { user, portfolio } = portfolioData;
  const location = locationData.address?.addressLocality || user.location;
  
  const localKeywords = [
    user.profession?.toLowerCase(),
    user.full_name?.toLowerCase(),
    location?.toLowerCase(),
    `${user.profession?.toLowerCase()} in ${location}`,
    `${location} ${user.profession?.toLowerCase()}`,
    `professional ${user.profession?.toLowerCase()}`,
    `local ${user.profession?.toLowerCase()}`,
    'near me',
    portfolio.skills?.map(skill => `${skill.toLowerCase()} ${location}`),
  ].flat().filter(Boolean);
  
  return {
    keywords: localKeywords,
    'geo.region': locationData.address?.addressRegion,
    'geo.placename': location,
    'geo.position': locationData.geo ? 
      `${locationData.geo.latitude};${locationData.geo.longitude}` : undefined,
    'ICBM': locationData.geo ? 
      `${locationData.geo.latitude}, ${locationData.geo.longitude}` : undefined,
    'location': location,
    'business.name': user.full_name || portfolio.title,
    'business.category': user.profession,
    'business.telephone': locationData.telephone || user.phone,
    'business.email': locationData.email || user.email,
    'business.hours': locationData.businessHours?.map(hours => 
      `${hours.dayOfWeek}: ${hours.opens}-${hours.closes}`
    ).join(', '),
  };
}

/**
 * Generate comprehensive local SEO data for a portfolio
 */
export function generateComprehensiveLocalSEO(
  portfolioData: PortfolioData,
  locationData: LocationData,
  options: LocalSEOOptions & {
    reviews?: Array<{
      author: string;
      rating: number;
      reviewBody: string;
      datePublished: string;
    }>;
    services?: Array<{
      name: string;
      description: string;
      price?: string;
      currency?: string;
      duration?: string;
      category?: string;
    }>;
    events?: Array<{
      name: string;
      description: string;
      startDate: string;
      endDate?: string;
      location: {
        name: string;
        address?: string;
      };
      eventType?: string;
      offers?: {
        price: string;
        currency: string;
      };
    }>;
    faqs?: Array<{ question: string; answer: string }>;
  } = {}
) {
  const localBusiness = generateEnhancedLocalBusinessSchema(
    portfolioData, 
    locationData, 
    options
  );
  
  const reviews = options.reviews ? 
    generateLocalBusinessReviewSchema(portfolioData, options.reviews) : null;
  
  const services = options.services ? 
    generateServiceSchema(portfolioData, options.services) : null;
  
  const events = options.events ? 
    generateLocalEventSchema(portfolioData, options.events) : null;
  
  const faqs = options.faqs ? 
    generateLocalFAQSchema(portfolioData, options.faqs) : null;
  
  const metaTags = generateLocalSEOMetaTags(portfolioData, locationData);
  
  // Combined schema.org graph
  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      localBusiness,
      ...(reviews ? [reviews] : []),
      ...(services ? services : []),
      ...(events ? events : []),
      ...(faqs ? [faqs] : []),
    ].filter(Boolean),
  };
  
  return {
    localBusiness,
    reviews,
    services,
    events,
    faqs,
    metaTags,
    combinedSchema,
    jsonLD: JSON.stringify(combinedSchema, null, 2),
  };
}