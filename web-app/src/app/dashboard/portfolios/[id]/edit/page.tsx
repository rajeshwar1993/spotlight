'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { useAutoSave } from '@/hooks/use-auto-save';
import { useUndoRedo } from '@/hooks/use-undo-redo';
import { EditPanel } from '@/components/portfolio/edit/edit-panel';
import { PreviewContainer } from '@/components/portfolio/preview/preview-container';
import { 
  ArrowLeft, 
  Eye, 
  Save,
  AlertTriangle,
  PanelLeftClose,
  PanelRightClose
} from 'lucide-react';
import Link from 'next/link';
import type { PortfolioData } from '@/lib/templates/types';

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
}

export default function PortfolioEditPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useUser();
  const { toast } = useToast();
  
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareableLink, setShareableLink] = useState<string>('');
  const [showPreview, setShowPreview] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const portfolioId = params.id as string;

  // Initialize undo/redo system
  const {
    currentData,
    setCurrentData,
    saveState,
    undo,
    redo,
    canUndo,
    canRedo
  } = useUndoRedo<PortfolioData>({} as PortfolioData, {
    maxHistorySize: 50,
    debounceMs: 1000,
    enableKeyboardShortcuts: true
  });

  // Save function for auto-save
  const handleAutoSave = useCallback(async (data: PortfolioData) => {
    try {
      const response = await fetch(`/api/portfolios/${portfolioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.portfolio.title,
          slug: data.portfolio.slug,
          bio: data.portfolio.bio,
          template: data.portfolio.template,
          user_updates: {
            full_name: data.user.full_name,
            profession: data.user.profession,
            location: data.user.location
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save portfolio');
      }

      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Auto-save error:', error);
      throw error;
    }
  }, [portfolioId]);

  // Auto-save hook
  const autoSave = useAutoSave(currentData, {
    delay: 2000,
    onSave: handleAutoSave,
    onError: (error) => {
      console.error('Auto-save failed:', error);
    },
    enabled: !!currentData && hasUnsavedChanges
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin');
      return;
    }

    fetchPortfolioData();
  }, [portfolioId, isAuthenticated, router]);

  const fetchPortfolioData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch portfolio basic info
      const portfolioResponse = await fetch(`/api/portfolios/${portfolioId}`);
      if (!portfolioResponse.ok) {
        throw new Error('Failed to fetch portfolio');
      }
      const portfolioResult = await portfolioResponse.json();
      setPortfolio(portfolioResult.data);

      // Fetch complete portfolio data for editing
      const dataResponse = await fetch(`/api/portfolios/${portfolioId}/data`);
      if (!dataResponse.ok) {
        throw new Error('Failed to fetch portfolio data');
      }
      const dataResult = await dataResponse.json();
      
      setCurrentData(dataResult.data);

      // Generate shareable link
      const domain = window.location.origin;
      setShareableLink(`${domain}/mypage/${portfolioResult.data.slug}`);

    } catch (err) {
      console.error('Error fetching portfolio data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  }, [portfolioId]);

  const handleDataChange = useCallback((changes: Partial<PortfolioData>) => {
    setCurrentData(prevData => {
      const newData = { ...prevData, ...changes };
      
      // Merge nested objects properly
      if (changes.portfolio) {
        newData.portfolio = { ...prevData.portfolio, ...changes.portfolio };
      }
      if (changes.user) {
        newData.user = { ...prevData.user, ...changes.user };
      }
      if (changes.social_links) {
        newData.social_links = { ...prevData.social_links, ...changes.social_links };
      }
      if (changes.contact_info) {
        newData.contact_info = { ...prevData.contact_info, ...changes.contact_info };
      }

      return newData;
    });
    
    setHasUnsavedChanges(true);
    saveState(currentData, 'Edit portfolio data');
  }, [currentData, saveState, setCurrentData]);

  const handleManualSave = async () => {
    try {
      await handleAutoSave(currentData);
      toast({
        title: "Saved successfully",
        description: "Your portfolio has been saved",
      });
    } catch {
      toast({
        title: "Save failed",
        description: "Failed to save your portfolio",
        variant: "destructive",
      });
    }
  };

  const handleUndo = () => {
    const newData = undo();
    if (newData !== currentData) {
      setHasUnsavedChanges(true);
    }
  };

  const handleRedo = () => {
    const newData = redo();
    if (newData !== currentData) {
      setHasUnsavedChanges(true);
    }
  };

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges || autoSave.isPending) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, autoSave.isPending]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading portfolio editor...</p>
        </div>
      </div>
    );
  }

  if (error || !portfolio || !currentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎭</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'Portfolio data could not be loaded'}</p>
          <Link href="/dashboard/portfolios">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portfolios
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/portfolios">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Edit: {portfolio.title}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  {hasUnsavedChanges && (
                    <div className="flex items-center space-x-1 text-orange-600">
                      <AlertTriangle className="h-3 w-3" />
                      <span className="text-xs">Unsaved changes</span>
                    </div>
                  )}
                  {autoSave.status === 'saving' && (
                    <span className="text-xs text-blue-600">Saving...</span>
                  )}
                  {autoSave.status === 'saved' && (
                    <span className="text-xs text-green-600">All changes saved</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="hidden md:flex"
              >
                {showPreview ? <PanelRightClose className="h-4 w-4 mr-2" /> : <PanelLeftClose className="h-4 w-4 mr-2" />}
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>

              <Link href={`/dashboard/portfolios/${portfolioId}/preview`}>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Full Preview
                </Button>
              </Link>

              <Button
                size="sm"
                onClick={handleManualSave}
                disabled={autoSave.status === 'saving'}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Edit Panel */}
        <div className={`${showPreview ? 'w-1/2' : 'w-full'} border-r border-gray-200 transition-all duration-300`}>
          <EditPanel
            portfolioData={currentData}
            onDataChange={handleDataChange}
            onSave={handleManualSave}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={canUndo}
            canRedo={canRedo}
            autoSaveStatus={autoSave.status}
            lastSaved={autoSave.lastSaved}
          />
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="w-1/2 transition-all duration-300">
            <PreviewContainer
              portfolioData={currentData}
              shareableLink={shareableLink}
              onRefresh={fetchPortfolioData}
            />
          </div>
        )}
      </div>
    </div>
  );
}