'use client';

import { Suspense } from 'react';
import { CreationSuccess } from '@/components/portfolio/create/creation-success';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }>
        <CreationSuccess />
      </Suspense>
    </div>
  );
}