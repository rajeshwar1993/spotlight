'use client';

import React, { useState } from 'react';
import { useUser } from '@/hooks/use-user';
import { PortfolioList } from '@/components/portfolio/portfolio-list';
import { PortfolioEditForm } from '@/components/portfolio/portfolio-edit-form-simple';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
// import { useSearchParams } from 'next/navigation';

interface Portfolio {
  id: string;
  title: string;
  slug: string;
  template: string;
  status: string;
  bio?: string;
  view_count: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  images?: Array<{
    id: string;
    url: string;
    type: string;
    alt_text?: string;
  }>;
}

export default function PortfoliosPage() {
  const { loading, isAuthenticated } = useUser();
  // const searchParams = useSearchParams();
  // const editId = searchParams.get('edit'); // For future use
  
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEdit = (portfolio: Portfolio) => {
    setEditingPortfolio(portfolio);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditingPortfolio(null);
    setIsCreating(true);
  };

  const handleSave = () => {
    setEditingPortfolio(null);
    setIsCreating(false);
    setRefreshKey(prev => prev + 1); // Trigger refresh of portfolio list
  };

  const handleCancel = () => {
    setEditingPortfolio(null);
    setIsCreating(false);
  };

  const handleDelete = () => {
    setRefreshKey(prev => prev + 1); // Trigger refresh of portfolio list
  };

  const handleDuplicate = () => {
    setRefreshKey(prev => prev + 1); // Trigger refresh of portfolio list
  };

  const handleStatusChange = () => {
    setRefreshKey(prev => prev + 1); // Trigger refresh of portfolio list
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Please sign in to access your portfolios.</div>
      </div>
    );
  }

  // Show edit form
  if (editingPortfolio || isCreating) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={handleCancel}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Portfolios
              </Button>
              <div>
                <h1 className="text-3xl font-bold">
                  {isCreating ? 'Create Portfolio' : 'Edit Portfolio'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isCreating 
                    ? 'Create a new portfolio to showcase your work' 
                    : `Editing "${editingPortfolio?.title}"`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <PortfolioEditForm
            portfolio={editingPortfolio || undefined}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </div>
    );
  }

  // Show portfolio list
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Portfolio Management</h1>
            <p className="text-gray-600 mt-1">
              Manage your portfolios, track performance, and create new ones
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Dashboard
              </Button>
            </Link>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-1" />
              Create Portfolio
            </Button>
          </div>
        </div>

        {/* Portfolio List */}
        <div className="space-y-6">
          <PortfolioList
            key={refreshKey} // Force re-render when refreshKey changes
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onStatusChange={handleStatusChange}
          />
        </div>

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Portfolio Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">📸 High-Quality Images</h4>
                <p className="text-sm text-blue-800">
                  Use professional, high-resolution photos that showcase your best work and personality.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">✍️ Compelling Bio</h4>
                <p className="text-sm text-green-800">
                  Write an engaging bio that tells your story and highlights your unique strengths.
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">🎯 SEO Optimization</h4>
                <p className="text-sm text-purple-800">
                  Add relevant keywords and descriptions to improve your portfolio visibility.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}