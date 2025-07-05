'use client';

import * as React from 'react';
import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/lib/constants';


export default function NotFound() {

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-spotlight-50/30 to-spotlight-100/50 dark:from-background dark:via-spotlight-950/30 dark:to-spotlight-900/20">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
            <Search className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <div className="text-6xl font-bold text-spotlight-600 dark:text-spotlight-400">
              404
            </div>
            <CardTitle className="text-2xl">Page Not Found</CardTitle>
            <CardDescription className="text-base">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-3">
            <Button asChild className="w-full">
              <Link href={ROUTES.home}>
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.history.back()} 
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          
          {/* Helpful Links */}
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">
              Popular Pages
            </h3>
            <div className="space-y-2">
              <Link 
                href={ROUTES.dashboard} 
                className="block text-sm text-spotlight-600 hover:text-spotlight-700 dark:text-spotlight-400 dark:hover:text-spotlight-300 transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                href={ROUTES.examples} 
                className="block text-sm text-spotlight-600 hover:text-spotlight-700 dark:text-spotlight-400 dark:hover:text-spotlight-300 transition-colors"
              >
                Examples
              </Link>
              <Link 
                href={ROUTES.templates} 
                className="block text-sm text-spotlight-600 hover:text-spotlight-700 dark:text-spotlight-400 dark:hover:text-spotlight-300 transition-colors"
              >
                Templates
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}