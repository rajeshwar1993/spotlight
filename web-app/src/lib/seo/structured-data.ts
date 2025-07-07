import type { PortfolioData } from '@/lib/templates/types';
import { 
  generatePortfolioStructuredData,
  generateWebSiteSchema,
  generateSpotlightOrganizationSchema,
  type PersonSchema,
  type OrganizationSchema,
  type PortfolioSchema,
  type LocalBusinessSchema,
  type BreadcrumbSchema,
  type WebSiteSchema
} from './schema';

/**
 * Convert structured data to JSON-LD script tag
 */
export function generateJSONLD(data: any): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Generate multiple structured data schemas for a portfolio page
 */
export function generatePortfolioJSONLD(portfolioData: PortfolioData): {
  person: string;
  portfolio: string;
  organization: string;
  localBusiness?: string;
  breadcrumb: string;
  website: string;
  combined: string;
} {
  const structuredData = generatePortfolioStructuredData(portfolioData);
  
  // Create combined schema with multiple entities
  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      structuredData.person,
      structuredData.portfolio,
      structuredData.organization,
      structuredData.breadcrumb,
      structuredData.website,
      ...(structuredData.localBusiness ? [structuredData.localBusiness] : [])
    ]
  };

  return {
    person: generateJSONLD(structuredData.person),
    portfolio: generateJSONLD(structuredData.portfolio),
    organization: generateJSONLD(structuredData.organization),
    localBusiness: structuredData.localBusiness ? generateJSONLD(structuredData.localBusiness) : undefined,
    breadcrumb: generateJSONLD(structuredData.breadcrumb),
    website: generateJSONLD(structuredData.website),
    combined: generateJSONLD(combinedSchema),
  };
}

/**
 * Generate FAQ structured data
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

/**
 * Generate HowTo structured data for portfolio creation
 */
export function generateHowToSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Create a Professional Portfolio on Spotlight',
    description: 'Learn how to create a stunning professional portfolio for actors, models, and creative professionals',
    image: 'https://spotlight.com/images/how-to-create-portfolio.jpg',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0'
    },
    totalTime: 'PT5M',
    supply: [
      {
        '@type': 'HowToSupply',
        name: 'Professional headshots'
      },
      {
        '@type': 'HowToSupply',
        name: 'Portfolio images'
      },
      {
        '@type': 'HowToSupply',
        name: 'Professional bio'
      }
    ],
    tool: [
      {
        '@type': 'HowToTool',
        name: 'Spotlight Platform'
      }
    ],
    step: [
      {
        '@type': 'HowToStep',
        name: 'Sign up for Spotlight',
        text: 'Create your free Spotlight account to get started',
        url: 'https://spotlight.com/auth/signup',
        image: 'https://spotlight.com/images/step-1-signup.jpg'
      },
      {
        '@type': 'HowToStep',
        name: 'Add your information',
        text: 'Enter your professional details, bio, and contact information',
        url: 'https://spotlight.com/create',
        image: 'https://spotlight.com/images/step-2-info.jpg'
      },
      {
        '@type': 'HowToStep',
        name: 'Choose a template',
        text: 'Select from our professionally designed templates',
        url: 'https://spotlight.com/templates',
        image: 'https://spotlight.com/images/step-3-template.jpg'
      },
      {
        '@type': 'HowToStep',
        name: 'Upload your photos',
        text: 'Add your professional headshots and portfolio images',
        url: 'https://spotlight.com/create',
        image: 'https://spotlight.com/images/step-4-photos.jpg'
      },
      {
        '@type': 'HowToStep',
        name: 'Publish your portfolio',
        text: 'Review and publish your professional portfolio',
        url: 'https://spotlight.com/dashboard',
        image: 'https://spotlight.com/images/step-5-publish.jpg'
      }
    ]
  };
}

/**
 * Generate Article structured data for blog posts
 */
export function generateArticleSchema(article: {
  title: string;
  description: string;
  author: string;
  publishedDate: string;
  modifiedDate?: string;
  image?: string;
  url: string;
  section: string;
  tags: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author
    },
    publisher: generateSpotlightOrganizationSchema(),
    datePublished: article.publishedDate,
    dateModified: article.modifiedDate || article.publishedDate,
    image: article.image,
    url: article.url,
    articleSection: article.section,
    keywords: article.tags,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url
    }
  };
}

/**
 * Generate Review structured data
 */
export function generateReviewSchema(review: {
  itemName: string;
  reviewBody: string;
  rating: number;
  author: string;
  datePublished: string;
  url?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Service',
      name: review.itemName
    },
    reviewBody: review.reviewBody,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5
    },
    author: {
      '@type': 'Person',
      name: review.author
    },
    datePublished: review.datePublished,
    url: review.url
  };
}

/**
 * Generate Course structured data for tutorials
 */
export function generateCourseSchema(course: {
  name: string;
  description: string;
  provider: string;
  url: string;
  image?: string;
  duration?: string;
  courseCode?: string;
  hasCourseInstance?: Array<{
    courseMode: string;
    startDate: string;
    endDate?: string;
    instructor: string;
  }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: course.provider
    },
    url: course.url,
    image: course.image,
    timeRequired: course.duration,
    courseCode: course.courseCode,
    hasCourseInstance: course.hasCourseInstance?.map(instance => ({
      '@type': 'CourseInstance',
      courseMode: instance.courseMode,
      startDate: instance.startDate,
      endDate: instance.endDate,
      instructor: {
        '@type': 'Person',
        name: instance.instructor
      }
    }))
  };
}

/**
 * Generate Event structured data
 */
export function generateEventSchema(event: {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: {
    name: string;
    address?: string;
  };
  organizer: string;
  url?: string;
  image?: string;
  offers?: {
    price: string;
    currency: string;
    availability: string;
  };
}) {
  return {
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
        name: event.location.address
      } : undefined
    },
    organizer: {
      '@type': 'Organization',
      name: event.organizer
    },
    url: event.url,
    image: event.image,
    offers: event.offers ? {
      '@type': 'Offer',
      price: event.offers.price,
      priceCurrency: event.offers.currency,
      availability: event.offers.availability
    } : undefined
  };
}

/**
 * Generate JobPosting structured data
 */
export function generateJobPostingSchema(job: {
  title: string;
  description: string;
  company: string;
  location: string;
  employmentType: string;
  datePosted: string;
  validThrough?: string;
  salary?: {
    currency: string;
    value: string;
  };
  url?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company
    },
    jobLocation: {
      '@type': 'Place',
      name: job.location
    },
    employmentType: job.employmentType,
    datePosted: job.datePosted,
    validThrough: job.validThrough,
    baseSalary: job.salary ? {
      '@type': 'MonetaryAmount',
      currency: job.salary.currency,
      value: job.salary.value
    } : undefined,
    url: job.url
  };
}

/**
 * Validate structured data schema
 */
export function validateStructuredData(schema: any): boolean {
  try {
    // Basic validation
    if (!schema['@context'] || !schema['@type']) {
      return false;
    }

    // Check if JSON is valid
    JSON.stringify(schema);
    
    return true;
  } catch (error) {
    console.error('Schema validation error:', error);
    return false;
  }
}

/**
 * Generate comprehensive structured data for the home page
 */
export function generateHomePageStructuredData() {
  const websiteSchema = generateWebSiteSchema();
  const organizationSchema = generateSpotlightOrganizationSchema();
  const howToSchema = generateHowToSchema();
  
  return {
    '@context': 'https://schema.org',
    '@graph': [
      websiteSchema,
      organizationSchema,
      howToSchema
    ]
  };
}