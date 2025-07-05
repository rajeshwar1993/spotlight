'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/hooks/use-user';
import { ROUTES } from '@/lib/constants';

export default function Home() {
  const { user, loading, isAuthenticated } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-spotlight-50/30 to-spotlight-100/50 dark:from-background dark:via-spotlight-950/30 dark:to-spotlight-900/20">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="container-spotlight py-16 lg:py-24">
        <div className="text-center">
          <h1 className="text-display mb-6 text-gradient">
            Welcome to Spotlight
          </h1>
          <p className="text-body-large text-muted-foreground mb-12 max-w-3xl mx-auto">
            Create your professional portfolio in under 5 minutes. 
            Showcase your talent to the world with stunning templates designed for actors and models.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            {isAuthenticated ? (
              <>
                <Button 
                  size="xl" 
                  variant="spotlight" 
                  asChild
                  className="min-w-[200px]"
                >
                  <Link href={ROUTES.dashboard}>
                    Go to Dashboard
                  </Link>
                </Button>
                <div className="flex items-center justify-center">
                  <p className="text-body text-muted-foreground">
                    Welcome back, <span className="font-medium text-foreground">{user?.full_name || 'User'}</span>!
                  </p>
                </div>
              </>
            ) : (
              <>
                <Button 
                  size="xl" 
                  variant="spotlight" 
                  asChild
                  className="min-w-[200px]"
                >
                  <Link href={ROUTES.signup}>
                    Get Started
                  </Link>
                </Button>
                <Button 
                  size="xl" 
                  variant="spotlight-outline" 
                  asChild
                  className="min-w-[200px]"
                >
                  <Link href={ROUTES.signin}>
                    Sign In
                  </Link>
                </Button>
              </>
            )}
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card variant="soft" className="text-center group hover:shadow-spotlight transition-all duration-300">
              <CardContent className="pt-8">
                <div className="bg-gradient-to-br from-spotlight-100 to-spotlight-200 dark:from-spotlight-800 dark:to-spotlight-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-2xl">🎭</span>
                </div>
                <h3 className="text-title mb-4 text-gradient">For Actors</h3>
                <p className="text-body text-muted-foreground leading-relaxed">
                  Showcase your headshots, reels, and experience with professional templates.
                </p>
              </CardContent>
            </Card>
            
            <Card variant="soft" className="text-center group hover:shadow-spotlight transition-all duration-300">
              <CardContent className="pt-8">
                <div className="bg-gradient-to-br from-spotlight-100 to-spotlight-200 dark:from-spotlight-800 dark:to-spotlight-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-2xl">📸</span>
                </div>
                <h3 className="text-title mb-4 text-gradient">For Models</h3>
                <p className="text-body text-muted-foreground leading-relaxed">
                  Display your portfolio with stunning layouts that highlight your best work.
                </p>
              </CardContent>
            </Card>
            
            <Card variant="soft" className="text-center group hover:shadow-spotlight transition-all duration-300">
              <CardContent className="pt-8">
                <div className="bg-gradient-to-br from-spotlight-100 to-spotlight-200 dark:from-spotlight-800 dark:to-spotlight-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-title mb-4 text-gradient">Quick & Easy</h3>
                <p className="text-body text-muted-foreground leading-relaxed">
                  Create your professional portfolio in under 5 minutes with our intuitive builder.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}