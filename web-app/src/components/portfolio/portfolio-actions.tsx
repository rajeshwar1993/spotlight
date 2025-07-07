'use client';

import React, { useState } from 'react';
import { PortfolioStatus } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Trash2, 
  Copy, 
  Share2, 
  Download, 
  Settings, 
  Eye, 
  EyeOff, 
  Archive, 
  ArchiveRestore,
  ExternalLink,
  Loader2,
  Check,
  AlertTriangle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface Portfolio {
  id: string;
  title: string;
  slug: string;
  template: string;
  status: PortfolioStatus;
  bio?: string;
  view_count: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface PortfolioActionsProps {
  portfolio: Portfolio;
  onUpdate?: (portfolio: Portfolio) => void;
  onDelete?: (portfolioId: string) => void;
  onDuplicate?: (portfolio: Portfolio, newTitle: string) => void;
  userEmailVerified?: boolean;
  onRequestEmailVerification?: () => void;
  className?: string;
}

export function PortfolioActions({
  portfolio,
  onUpdate,
  onDelete,
  onDuplicate,
  userEmailVerified = true,
  onRequestEmailVerification,
  className
}: PortfolioActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateTitle, setDuplicateTitle] = useState(`${portfolio.title} (Copy)`);
  const { toast } = useToast();

  const portfolioUrl = `${window.location.origin}/mypage/${portfolio.slug}`;

  const handleStatusChange = async (newStatus: PortfolioStatus) => {
    try {
      setIsUpdatingStatus(true);
      
      const response = await fetch(`/api/portfolios/${portfolio.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          is_published: newStatus === 'PUBLISHED'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        
        // Handle email verification error specifically
        if (error.requiresEmailVerification) {
          toast({
            title: 'Email Verification Required',
            description: 'Please verify your email address before publishing your portfolio.',
            variant: 'destructive',
            action: onRequestEmailVerification ? (
              <Button variant="outline" size="sm" onClick={onRequestEmailVerification}>
                Verify Email
              </Button>
            ) : undefined,
          });
          return;
        }
        
        throw new Error(error.error || 'Failed to update portfolio status');
      }

      const { data: updatedPortfolio } = await response.json();
      onUpdate?.(updatedPortfolio);

      toast({
        title: 'Status Updated',
        description: `Portfolio ${newStatus === 'PUBLISHED' ? 'published' : 'unpublished'} successfully.`,
      });

    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/portfolios/${portfolio.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete portfolio');
      }

      onDelete?.(portfolio.id);
      setShowDeleteDialog(false);

      toast({
        title: 'Portfolio Deleted',
        description: 'Your portfolio has been permanently deleted.',
      });

    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete portfolio',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      setIsDuplicating(true);
      
      const response = await fetch(`/api/portfolios/${portfolio.id}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: duplicateTitle
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to duplicate portfolio');
      }

      const { data: duplicatedPortfolio } = await response.json();
      onDuplicate?.(duplicatedPortfolio, duplicateTitle);
      setShowDuplicateDialog(false);

      toast({
        title: 'Portfolio Duplicated',
        description: 'A copy of your portfolio has been created.',
      });

    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to duplicate portfolio',
        variant: 'destructive',
      });
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(portfolioUrl);
      toast({
        title: 'Link Copied',
        description: 'Portfolio link has been copied to clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy link to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: PortfolioStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className={cn('flex flex-wrap items-center gap-2', className)}>
        {/* Status Badge */}
        <Badge className={getStatusColor(portfolio.status)}>
          {portfolio.status}
        </Badge>

        {/* View Portfolio */}
        <Button variant="outline" size="sm" asChild>
          <a href={portfolioUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-1" />
            View
          </a>
        </Button>

        {/* Status Toggle */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusChange(
              portfolio.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
            )}
            disabled={isUpdatingStatus || (!userEmailVerified && portfolio.status !== 'PUBLISHED')}
            className={!userEmailVerified && portfolio.status !== 'PUBLISHED' ? 'opacity-60' : ''}
          >
            {isUpdatingStatus ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : portfolio.status === 'PUBLISHED' ? (
              <EyeOff className="h-4 w-4 mr-1" />
            ) : (
              <>
                {!userEmailVerified && <AlertTriangle className="h-4 w-4 mr-1 text-amber-500" />}
                <Eye className="h-4 w-4 mr-1" />
              </>
            )}
            {portfolio.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
          </Button>
          {!userEmailVerified && portfolio.status !== 'PUBLISHED' && (
            <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              !
            </div>
          )}
        </div>

        {/* Archive/Unarchive */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStatusChange(
            portfolio.status === 'ARCHIVED' ? 'DRAFT' : 'ARCHIVED'
          )}
          disabled={isUpdatingStatus}
        >
          {portfolio.status === 'ARCHIVED' ? (
            <ArchiveRestore className="h-4 w-4 mr-1" />
          ) : (
            <Archive className="h-4 w-4 mr-1" />
          )}
          {portfolio.status === 'ARCHIVED' ? 'Restore' : 'Archive'}
        </Button>

        {/* Share */}
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>

        {/* Duplicate */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowDuplicateDialog(true)}
        >
          <Copy className="h-4 w-4 mr-1" />
          Duplicate
        </Button>

        {/* Delete */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowDeleteDialog(true)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Portfolio
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to delete "<strong>{portfolio.title}</strong>"? 
                This action cannot be undone.
              </p>
              <Alert>
                <AlertDescription>
                  This will permanently remove the portfolio and all associated images. 
                  Any external links to this portfolio will stop working.
                </AlertDescription>
              </Alert>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Portfolio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate Dialog */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5" />
              Duplicate Portfolio
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="duplicate-title">New Portfolio Title</Label>
              <Input
                id="duplicate-title"
                value={duplicateTitle}
                onChange={(e) => setDuplicateTitle(e.target.value)}
                placeholder="Enter title for the duplicate"
              />
            </div>
            
            <Alert>
              <AlertDescription>
                This will create a new portfolio with the same content and settings, 
                but with a new title and slug. Images will be copied if possible.
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
              <p className="text-sm font-medium">Original Portfolio:</p>
              <p className="text-sm text-gray-600">{portfolio.title}</p>
              <p className="text-sm text-gray-600">Template: {portfolio.template}</p>
              <p className="text-sm text-gray-600">Views: {portfolio.view_count}</p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDuplicateDialog(false)}
              disabled={isDuplicating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDuplicate}
              disabled={isDuplicating || !duplicateTitle.trim()}
            >
              {isDuplicating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              Create Duplicate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Quick Status Toggle Component
interface StatusToggleProps {
  portfolio: Portfolio;
  onUpdate?: (portfolio: Portfolio) => void;
  userEmailVerified?: boolean;
  onRequestEmailVerification?: () => void;
  size?: 'sm' | 'default';
  className?: string;
}

export function StatusToggle({ 
  portfolio, 
  onUpdate, 
  userEmailVerified = true,
  onRequestEmailVerification,
  size = 'default',
  className 
}: StatusToggleProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleToggle = async () => {
    try {
      setIsUpdating(true);
      
      const newStatus = portfolio.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      
      const response = await fetch(`/api/portfolios/${portfolio.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          is_published: newStatus === 'PUBLISHED'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        
        // Handle email verification error specifically
        if (error.requiresEmailVerification) {
          toast({
            title: 'Email Verification Required',
            description: 'Please verify your email address before publishing your portfolio.',
            variant: 'destructive',
            action: onRequestEmailVerification ? (
              <Button variant="outline" size="sm" onClick={onRequestEmailVerification}>
                Verify Email
              </Button>
            ) : undefined,
          });
          return;
        }
        
        throw new Error(error.error || 'Failed to update portfolio status');
      }

      const { data: updatedPortfolio } = await response.json();
      onUpdate?.(updatedPortfolio);

      toast({
        title: 'Status Updated',
        description: `Portfolio ${newStatus === 'PUBLISHED' ? 'published' : 'unpublished'} successfully.`,
      });

    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant={portfolio.status === 'PUBLISHED' ? 'default' : 'outline'}
        size={size}
        onClick={handleToggle}
        disabled={isUpdating || (!userEmailVerified && portfolio.status !== 'PUBLISHED')}
        className={cn(
          portfolio.status === 'PUBLISHED' 
            ? 'bg-green-600 hover:bg-green-700' 
            : '',
          !userEmailVerified && portfolio.status !== 'PUBLISHED' ? 'opacity-60' : '',
          className
        )}
      >
        {isUpdating ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : portfolio.status === 'PUBLISHED' ? (
          <Eye className="h-4 w-4 mr-1" />
        ) : (
          <>
            {!userEmailVerified && <AlertTriangle className="h-4 w-4 mr-1 text-amber-500" />}
            <EyeOff className="h-4 w-4 mr-1" />
          </>
        )}
        {portfolio.status === 'PUBLISHED' ? 'Published' : 'Draft'}
      </Button>
      {!userEmailVerified && portfolio.status !== 'PUBLISHED' && (
        <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
          !
        </div>
      )}
    </div>
  );
}