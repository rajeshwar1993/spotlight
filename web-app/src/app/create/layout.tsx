import { Metadata } from 'next';
import { PortfolioCreationProvider } from '@/components/portfolio/create/portfolio-creation-context';
import { PortfolioProgress } from '@/components/portfolio/create/portfolio-progress';

export const metadata: Metadata = {
  title: 'Create Your Portfolio | Spotlight',
  description: 'Create your professional portfolio in under 5 minutes with Spotlight\'s easy 3-step process.',
  robots: {
    index: false,
    follow: false,
  },
};

interface CreateLayoutProps {
  children: React.ReactNode;
}

export default function CreateLayout({ children }: CreateLayoutProps) {
  return (
    <PortfolioCreationProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header with Progress */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Create Your Portfolio
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Build your professional portfolio in just 3 easy steps
                </p>
              </div>
              
              {/* Progress Indicator */}
              <PortfolioProgress />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </PortfolioCreationProvider>
  );
}