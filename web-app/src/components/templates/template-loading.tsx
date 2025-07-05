'use client';

import React from 'react';
import { TemplateType } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface TemplateLoadingSkeletonProps {
  templateType: TemplateType;
  className?: string;
}

export function TemplateLoadingSkeleton({ templateType, className }: TemplateLoadingSkeletonProps) {
  const renderSkeletonForTemplate = () => {
    switch (templateType) {
      case 'T1':
        return <T1LoadingSkeleton />;
      case 'T2':
        return <T2LoadingSkeleton />;
      case 'T3':
        return <T3LoadingSkeleton />;
      case 'T4':
        return <T4LoadingSkeleton />;
      default:
        return <DefaultLoadingSkeleton />;
    }
  };

  return (
    <div className={cn('w-full min-h-screen bg-gray-50 animate-pulse', className)}>
      {renderSkeletonForTemplate()}
    </div>
  );
}

// T1 - Classic Professional Loading Skeleton
function T1LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="mb-8 flex justify-center">
          <Skeleton className="w-32 h-32 rounded-full" />
        </div>
        <Skeleton className="h-12 w-80 mx-auto mb-4" />
        <Skeleton className="h-6 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>

      {/* About Section */}
      <div className="mb-16">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      {/* Experience Section */}
      <div className="mb-16">
        <Skeleton className="h-8 w-40 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>

      {/* Gallery Section */}
      <div className="mb-16">
        <Skeleton className="h-8 w-28 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="text-center">
        <Skeleton className="h-8 w-32 mx-auto mb-6" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-48 mx-auto" />
          <Skeleton className="h-4 w-40 mx-auto" />
        </div>
      </div>
    </div>
  );
}

// T2 - Modern Bold Loading Skeleton
function T2LoadingSkeleton() {
  return (
    <div className="bg-gray-900 min-h-screen">
      {/* Hero Section with Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        <div className="p-8 lg:p-16 flex flex-col justify-center">
          <Skeleton className="h-16 w-3/4 mb-6 bg-gray-700" />
          <Skeleton className="h-6 w-1/2 mb-4 bg-gray-700" />
          <div className="space-y-3 mb-8">
            <Skeleton className="h-4 w-full bg-gray-700" />
            <Skeleton className="h-4 w-5/6 bg-gray-700" />
          </div>
          <Skeleton className="h-12 w-40 bg-gray-700" />
        </div>
        <div className="relative">
          <Skeleton className="w-full h-full bg-gray-800" />
        </div>
      </div>

      {/* Showcase Section */}
      <div className="p-8 lg:p-16">
        <Skeleton className="h-10 w-48 mb-8 bg-gray-700" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video rounded-lg bg-gray-800" />
              <Skeleton className="h-4 w-3/4 bg-gray-700" />
            </div>
          ))}
        </div>
      </div>

      {/* Skills Section */}
      <div className="p-8 lg:p-16 bg-gray-800">
        <Skeleton className="h-10 w-32 mb-8 bg-gray-600" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-6 w-full bg-gray-600" />
              <Skeleton className="h-2 w-full bg-gray-600" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// T3 - Minimal Elegant Loading Skeleton
function T3LoadingSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-8 py-20">
      {/* Hero Section */}
      <div className="text-center mb-24">
        <Skeleton className="h-20 w-96 mx-auto mb-8" />
        <Skeleton className="h-6 w-64 mx-auto mb-16" />
        <div className="mb-12 flex justify-center">
          <Skeleton className="w-24 h-24 rounded-full" />
        </div>
      </div>

      {/* Introduction */}
      <div className="mb-24">
        <div className="space-y-6 text-center">
          <Skeleton className="h-4 w-full max-w-2xl mx-auto" />
          <Skeleton className="h-4 w-5/6 max-w-2xl mx-auto" />
          <Skeleton className="h-4 w-4/5 max-w-2xl mx-auto" />
        </div>
      </div>

      {/* Work Section */}
      <div className="mb-24">
        <Skeleton className="h-8 w-24 mb-12 mx-auto" />
        <div className="space-y-16">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-[4/3] w-full rounded" />
              <Skeleton className="h-6 w-48 mx-auto" />
              <div className="text-center space-y-2">
                <Skeleton className="h-3 w-3/4 mx-auto" />
                <Skeleton className="h-3 w-1/2 mx-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="text-center border-t pt-16">
        <Skeleton className="h-6 w-32 mx-auto mb-8" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-40 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    </div>
  );
}

// T4 - Creative Artistic Loading Skeleton
function T4LoadingSkeleton() {
  return (
    <div className="bg-gray-900 min-h-screen">
      {/* Creative Hero */}
      <div className="relative h-screen flex items-center justify-center p-8">
        <div className="text-center z-10">
          <Skeleton className="h-24 w-80 mx-auto mb-6 bg-gray-700" />
          <Skeleton className="h-6 w-48 mx-auto mb-8 bg-gray-700" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-72 mx-auto bg-gray-700" />
            <Skeleton className="h-4 w-64 mx-auto bg-gray-700" />
          </div>
        </div>
        {/* Background shapes */}
        <Skeleton className="absolute top-20 left-20 w-32 h-32 rounded-full bg-purple-900/20" />
        <Skeleton className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-pink-900/20" />
        <Skeleton className="absolute top-1/2 left-10 w-24 h-24 rounded-full bg-blue-900/20" />
      </div>

      {/* Creative Introduction */}
      <div className="p-8 lg:p-16">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 w-64 mb-8 bg-gray-700" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <Skeleton className="h-4 w-full bg-gray-700" />
              <Skeleton className="h-4 w-5/6 bg-gray-700" />
              <Skeleton className="h-4 w-4/5 bg-gray-700" />
            </div>
            <Skeleton className="aspect-square rounded-2xl bg-gray-800" />
          </div>
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="p-8 lg:p-16 bg-gray-800">
        <Skeleton className="h-12 w-48 mb-12 bg-gray-600 mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className={cn(
                "rounded-xl bg-gray-700",
                i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/3]"
              )} />
              <Skeleton className="h-4 w-3/4 bg-gray-600" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Default Loading Skeleton
function DefaultLoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <Skeleton className="w-24 h-24 rounded-full mx-auto mb-6" />
        <Skeleton className="h-10 w-64 mx-auto mb-4" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
      
      <div className="space-y-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  );
}