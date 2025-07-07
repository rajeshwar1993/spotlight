import { Metadata } from 'next';
import { generateEnhancedMetaTags, generateJSONLD } from '@/lib/seo';
import ExamplesClient from './examples-client';

// Generate metadata for SEO
export const metadata: Metadata = generateEnhancedMetaTags({
  title: 'Portfolio Examples - Discover Amazing Creative Portfolios | Spotlight',
  description: 'Explore stunning portfolios from talented actors and models. Find inspiration, discover new talent, and see what\'s possible with professional portfolio creation on Spotlight.',
  keywords: [
    'portfolio examples',
    'actor portfolios',
    'model portfolios', 
    'creative portfolios',
    'portfolio inspiration',
    'professional portfolios',
    'talent discovery',
    'casting portfolios',
    'portfolio gallery',
    'portfolio showcase'
  ],
  canonical: '/examples',
  openGraph: {
    title: 'Portfolio Examples - Discover Amazing Creative Portfolios',
    description: 'Explore stunning portfolios from talented actors and models. Find inspiration and discover new talent.',
    type: 'website',
    images: ['/images/examples-og.jpg'],
  },
  twitter: {
    title: 'Portfolio Examples - Discover Amazing Creative Portfolios',
    description: 'Explore stunning portfolios from talented actors and models.',
    images: ['/images/examples-twitter.jpg'],
  },
  robots: 'index, follow',
  alternates: {
    canonical: '/examples',
  },
});

export default function ExamplesPage() {
  // Generate structured data for portfolio discovery
  const structuredData = generateJSONLD([
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Portfolio Examples - Spotlight',
      description: 'A curated collection of professional portfolios from actors and models using Spotlight platform.',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/examples`,
      mainEntity: {
        '@type': 'ItemList',
        name: 'Professional Portfolios',
        description: 'Collection of actor and model portfolios',
        itemListElement: [] // This would be populated dynamically with actual portfolios
      },
      provider: {
        '@type': 'Organization',
        name: 'Spotlight',
        url: process.env.NEXT_PUBLIC_SITE_URL,
      },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: process.env.NEXT_PUBLIC_SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Portfolio Examples',
            item: `${process.env.NEXT_PUBLIC_SITE_URL}/examples`,
          },
        ],
      },
    },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
      <ExamplesClient />
    </>
  );
}