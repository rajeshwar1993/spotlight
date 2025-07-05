'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePortfolioPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to step 1 immediately
    router.replace('/create/step/1');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Redirecting to portfolio creation...</p>
      </div>
    </div>
  );
}