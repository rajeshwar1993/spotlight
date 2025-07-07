import { generateHomePageMetaTags } from '@/lib/seo';
import { HeroSection } from '@/components/home/hero-section';
import { FeaturedPortfolios } from '@/components/home/featured-portfolios';
import { HowItWorks } from '@/components/home/how-it-works';
import { FeaturesSection } from '@/components/home/features-section';
import { StatisticsSection } from '@/components/home/statistics-section';
import { CTASection } from '@/components/home/cta-section';

// Generate comprehensive SEO metadata for the home page
export const metadata = generateHomePageMetaTags();

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Portfolios */}
      <FeaturedPortfolios />

      {/* How It Works */}
      <HowItWorks />

      {/* Features Section */}
      <FeaturesSection />

      {/* Statistics Section */}
      <StatisticsSection />

      {/* Final CTA Section */}
      <CTASection />
    </main>
  );
}