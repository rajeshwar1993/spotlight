import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TemplateRenderer } from '@/components/templates/template-renderer';
import { SocialShare } from '@/components/portfolio/social-share';
import { portfolioService } from '@/lib/services/portfolio';
import type { PortfolioData } from '@/lib/templates/types';
import { APP_CONFIG } from '@/lib/constants';
import { 
  generatePortfolioMetaTags,
  generatePortfolioJSONLD
} from '@/lib/seo';

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

  // Use enhanced meta tag generation
  return generatePortfolioMetaTags(portfolioData);
}

export default async function PublicPortfolioPage({ params }: PageProps) {
  const { slug } = await params;
  const portfolioData = await getPortfolioData(slug);

  if (!portfolioData) {
    notFound();
  }

  const { user, portfolio } = portfolioData;
  const portfolioUrl = `${APP_CONFIG.url}/mypage/${portfolio.slug}`;

  // Generate comprehensive structured data using new SEO utilities
  const jsonLDData = generatePortfolioJSONLD(portfolioData);

  return (
    <>
      {/* Enhanced Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLDData.combined,
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