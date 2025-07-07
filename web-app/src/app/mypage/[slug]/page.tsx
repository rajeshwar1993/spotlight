import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TemplateRenderer } from '@/components/templates/template-renderer';
import { SocialShare } from '@/components/portfolio/social-share';
import { portfolioService } from '@/lib/services/portfolio';
import type { PortfolioData } from '@/lib/templates/types';
import { APP_CONFIG } from '@/lib/constants';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static paths for published portfolios
export async function generateStaticParams() {
  try {
    const { data: portfolios, error } = await portfolioService.getPublishedPortfolios();
    
    if (error || !portfolios) {
      console.error('Error generating static params:', error);
      return [];
    }

    return portfolios.map((portfolio) => ({
      slug: portfolio.slug,
    }));
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    return [];
  }
}

// Fetch portfolio data for SSG/ISR
async function getPortfolioData(slug: string): Promise<PortfolioData | null> {
  try {
    // Use the API route to get portfolio data with view tracking
    const response = await fetch(`${APP_CONFIG.url}/api/portfolios/slug/${slug}`, {
      next: { 
        revalidate: 60, // ISR: revalidate every 60 seconds
        tags: [`portfolio-${slug}`] // For on-demand revalidation
      }
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.data || null;
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    return null;
  }
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const portfolioData = await getPortfolioData(slug);

  if (!portfolioData) {
    return {
      title: 'Portfolio Not Found | Spotlight',
      description: 'The requested portfolio could not be found.',
      robots: 'noindex, nofollow',
    };
  }

  const { user, portfolio } = portfolioData;
  const title = `${user.full_name || portfolio.title} | ${user.profession || 'Portfolio'} | Spotlight`;
  const description = portfolio.bio || 
    `Professional ${user.profession?.toLowerCase()} portfolio for ${user.full_name || portfolio.title}. ${user.location ? `Based in ${user.location}.` : ''}`;
  
  const portfolioUrl = `${APP_CONFIG.url}/mypage/${portfolio.slug}`;
  const imageUrl = portfolioData.images.hero?.file_path || 
                   portfolioData.images.profile?.file_path || 
                   `${APP_CONFIG.url}/images/default-portfolio-share.jpg`;

  return {
    title,
    description,
    keywords: [
      user.profession?.toLowerCase(),
      user.full_name?.toLowerCase(),
      user.location?.toLowerCase(),
      'portfolio',
      'actor',
      'model',
      'spotlight',
      ...(portfolio.skills || [])
    ].filter(Boolean),
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
          alt: `${user.full_name || portfolio.title} - Portfolio`,
        }
      ],
      locale: 'en_US',
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@SpotlightApp', // TODO: Update with actual Twitter handle
    },

    // Additional SEO
    canonical: portfolioUrl,
    alternates: {
      canonical: portfolioUrl,
    },
    
    // Schema.org structured data will be added in the component
    other: {
      'profile:first_name': user.full_name?.split(' ')[0] || '',
      'profile:last_name': user.full_name?.split(' ').slice(1).join(' ') || '',
      'profile:username': portfolio.slug,
    },
  };
}

export default async function PublicPortfolioPage({ params }: PageProps) {
  const { slug } = await params;
  const portfolioData = await getPortfolioData(slug);

  if (!portfolioData) {
    notFound();
  }

  const { user, portfolio } = portfolioData;
  const portfolioUrl = `${APP_CONFIG.url}/mypage/${portfolio.slug}`;

  // Generate JSON-LD structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: user.full_name || portfolio.title,
    jobTitle: user.profession,
    description: portfolio.bio,
    url: portfolioUrl,
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
    ].filter(Boolean),
    knowsAbout: portfolio.skills,
    alumniOf: undefined, // TODO: Add education data when available
    award: undefined, // TODO: Add awards data when available
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      {/* Main Portfolio Content */}
      <div className="min-h-screen bg-white">
        {/* Social Share Toolbar */}
        <div className="fixed top-4 right-4 z-50 hidden md:block">
          <SocialShare
            url={portfolioUrl}
            title={`${user.full_name || portfolio.title} - Portfolio`}
            description={portfolio.bio || `Professional ${user.profession?.toLowerCase()} portfolio`}
            image={portfolioData.images.hero?.file_path || portfolioData.images.profile?.file_path}
          />
        </div>

        {/* Portfolio Template Renderer */}
        <TemplateRenderer
          templateType={portfolio.template}
          data={portfolioData}
          isPreview={false}
          isEditing={false}
          className="w-full"
        />

        {/* Mobile Social Share */}
        <div className="block md:hidden fixed bottom-4 right-4 z-50">
          <SocialShare
            url={portfolioUrl}
            title={`${user.full_name || portfolio.title} - Portfolio`}
            description={portfolio.bio || `Professional ${user.profession?.toLowerCase()} portfolio`}
            image={portfolioData.images.hero?.file_path || portfolioData.images.profile?.file_path}
            size="sm"
          />
        </div>

        {/* Portfolio Footer */}
        <footer className="bg-gray-50 border-t border-gray-200 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-4">
                <span>Portfolio views: {portfolio.view_count?.toLocaleString() || 0}</span>
                <span>•</span>
                <span>Last updated: {new Date(portfolio.updated_at).toLocaleDateString()}</span>
              </div>
              
              <div className="text-xs text-gray-400">
                <p>
                  Powered by{' '}
                  <a 
                    href={APP_CONFIG.url} 
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Spotlight
                  </a>
                  {' '}• Create your portfolio in minutes
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 60; // Revalidate every 60 seconds
export const dynamic = 'force-static';
export const dynamicParams = true;