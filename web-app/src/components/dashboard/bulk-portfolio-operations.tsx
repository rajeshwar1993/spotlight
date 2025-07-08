'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  CheckSquare, 
  Globe, 
  Edit, 
  Archive, 
  Trash2, 
  Copy, 
  Download, 
  AlertTriangle,
  CheckCircle,
  X,
  Loader2,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PortfolioStatus } from '@/types';

interface Portfolio {
  id: string;
  title: string;
  status: PortfolioStatus;
  view_count: number;
}

interface BulkOperation {
  id: string;
  type: 'status_change' | 'delete' | 'duplicate' | 'archive' | 'export';
  name: string;
  description: string;
  icon: React.ReactNode;
  confirmationRequired: boolean;
  dangerLevel: 'low' | 'medium' | 'high';
}

interface BulkPortfolioOperationsProps {
  portfolios: Portfolio[];
  selectedPortfolios: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
  onBulkOperation: (operation: string, data?: unknown) => Promise<void>;
  className?: string;
}

const BULK_OPERATIONS: BulkOperation[] = [
  {
    id: 'publish',
    type: 'status_change',
    name: 'Publish Selected',
    description: 'Make selected portfolios public and visible',
    icon: <Globe className="h-4 w-4" />,
    confirmationRequired: false,
    dangerLevel: 'low'
  },
  {
    id: 'unpublish',
    type: 'status_change',
    name: 'Unpublish Selected',
    description: 'Make selected portfolios private (draft)',
    icon: <Edit className="h-4 w-4" />,
    confirmationRequired: false,
    dangerLevel: 'low'
  },
  {
    id: 'archive',
    type: 'archive',
    name: 'Archive Selected',
    description: 'Move selected portfolios to archive',
    icon: <Archive className="h-4 w-4" />,
    confirmationRequired: true,
    dangerLevel: 'medium'
  },
  {
    id: 'duplicate',
    type: 'duplicate',
    name: 'Duplicate Selected',
    description: 'Create copies of selected portfolios',
    icon: <Copy className="h-4 w-4" />,
    confirmationRequired: false,
    dangerLevel: 'low'
  },
  {
    id: 'export',
    type: 'export',
    name: 'Export Selected',
    description: 'Download portfolio data as JSON/CSV',
    icon: <Download className="h-4 w-4" />,
    confirmationRequired: false,
    dangerLevel: 'low'
  },
  {
    id: 'delete',
    type: 'delete',
    name: 'Delete Selected',
    description: 'Permanently delete selected portfolios',
    icon: <Trash2 className="h-4 w-4" />,
    confirmationRequired: true,
    dangerLevel: 'high'
  }
];

export function BulkPortfolioOperations({
  portfolios,
  selectedPortfolios,
  onSelectionChange,
  onBulkOperation,
  className
}: BulkPortfolioOperationsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);
  const [operationResults, setOperationResults] = useState<{
    success: number;
    failed: number;
    total: number;
  } | null>(null);

  const selectedCount = selectedPortfolios.size;
  const allSelected = selectedPortfolios.size === portfolios.length;
  const someSelected = selectedPortfolios.size > 0 && selectedPortfolios.size < portfolios.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(portfolios.map(p => p.id)));
    }
  };

  const handleSelectPortfolio = (portfolioId: string, checked: boolean) => {
    const newSelected = new Set(selectedPortfolios);
    if (checked) {
      newSelected.add(portfolioId);
    } else {
      newSelected.delete(portfolioId);
    }
    onSelectionChange(newSelected);
  };

  const handleBulkOperation = async (operation: BulkOperation, additionalData?: unknown) => {
    if (selectedCount === 0) return;

    // Confirmation for dangerous operations
    if (operation.confirmationRequired) {
      const confirmMessage = operation.dangerLevel === 'high' 
        ? `Are you sure you want to ${operation.name.toLowerCase()}? This action cannot be undone.`
        : `Are you sure you want to ${operation.name.toLowerCase()} ${selectedCount} portfolio${selectedCount > 1 ? 's' : ''}?`;
      
      if (!confirm(confirmMessage)) {
        return;
      }
    }

    setIsProcessing(true);
    setCurrentOperation(operation.name);
    setProcessProgress(0);
    setOperationResults(null);

    try {
      let successCount = 0;
      let failedCount = 0;
      const totalCount = selectedCount;

      // Process portfolios in batches to avoid overwhelming the server
      const batchSize = 5;
      const portfolioIds = Array.from(selectedPortfolios);
      
      for (let i = 0; i < portfolioIds.length; i += batchSize) {
        const batch = portfolioIds.slice(i, i + batchSize);
        const batchPromises = batch.map(async (portfolioId) => {
          try {
            await onBulkOperation(operation.id, { portfolioId, ...additionalData });
            successCount++;
          } catch (error) {
            console.error(`Failed to ${operation.id} portfolio ${portfolioId}:`, error);
            failedCount++;
          }
        });

        await Promise.all(batchPromises);
        setProcessProgress(Math.round(((i + batch.length) / totalCount) * 100));
      }

      setOperationResults({
        success: successCount,
        failed: failedCount,
        total: totalCount
      });

      // Clear selection after successful operation
      if (successCount > 0) {
        onSelectionChange(new Set());
      }

    } catch (error) {
      console.error('Bulk operation failed:', error);
    } finally {
      setIsProcessing(false);
      setCurrentOperation(null);
      setTimeout(() => {
        setOperationResults(null);
        setProcessProgress(0);
      }, 3000);
    }
  };

  const getOperationColor = (dangerLevel: string) => {
    switch (dangerLevel) {
      case 'high':
        return 'text-red-600 hover:text-red-700';
      case 'medium':
        return 'text-orange-600 hover:text-orange-700';
      default:
        return 'text-blue-600 hover:text-blue-700';
    }
  };

  const getSelectionSummary = () => {
    if (selectedCount === 0) return 'No portfolios selected';
    
    const selectedPortfoliosList = portfolios.filter(p => selectedPortfolios.has(p.id));
    const statusCount = selectedPortfoliosList.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusSummary = Object.entries(statusCount).map(([status, count]) => 
      `${count} ${status}`
    ).join(', ');

    return `${selectedCount} portfolio${selectedCount > 1 ? 's' : ''} selected (${statusSummary})`;
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Bulk Operations
            {selectedCount > 0 && (
              <Badge variant="secondary">
                {selectedCount} selected
              </Badge>
            )}
          </div>
          
          {selectedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectionChange(new Set())}
            >
              <X className="h-4 w-4 mr-2" />
              Clear Selection
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Selection Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                {allSelected ? 'Deselect All' : 'Select All'}
              </span>
            </div>
            
            <span className="text-sm text-gray-600">
              {getSelectionSummary()}
            </span>
          </div>

          {/* Portfolio List with Checkboxes */}
          {portfolios.length > 0 && (
            <div className="max-h-64 overflow-y-auto border rounded-lg">
              <div className="divide-y">
                {portfolios.map((portfolio) => (
                  <div key={portfolio.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedPortfolios.has(portfolio.id)}
                        onCheckedChange={(checked) => handleSelectPortfolio(portfolio.id, checked as boolean)}
                      />
                      <div>
                        <p className="text-sm font-medium">{portfolio.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            className={cn(
                              'text-xs',
                              portfolio.status === 'published' && 'bg-green-100 text-green-800',
                              portfolio.status === 'draft' && 'bg-yellow-100 text-yellow-800',
                              portfolio.status === 'archived' && 'bg-gray-100 text-gray-800'
                            )}
                          >
                            {portfolio.status}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {portfolio.view_count} views
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {currentOperation}...
              </span>
              <span>{processProgress}%</span>
            </div>
            <Progress value={processProgress} className="w-full" />
          </div>
        )}

        {/* Operation Results */}
        {operationResults && (
          <Alert className={operationResults.failed > 0 ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}>
            <div className="flex items-center gap-2">
              {operationResults.failed > 0 ? (
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              <AlertDescription>
                Operation completed: {operationResults.success} successful, {operationResults.failed} failed out of {operationResults.total} total.
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Bulk Operations */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Available Operations</h4>
          
          {selectedCount === 0 ? (
            <p className="text-sm text-gray-500 italic">
              Select one or more portfolios to enable bulk operations.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {BULK_OPERATIONS.map((operation) => (
                <Button
                  key={operation.id}
                  variant="outline"
                  className={cn(
                    'flex items-center justify-start gap-3 h-auto p-4 text-left',
                    getOperationColor(operation.dangerLevel)
                  )}
                  onClick={() => handleBulkOperation(operation)}
                  disabled={isProcessing}
                >
                  <div className="flex-shrink-0">
                    {operation.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{operation.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{operation.description}</p>
                  </div>
                  {operation.confirmationRequired && (
                    <AlertTriangle className="h-3 w-3 text-orange-500 flex-shrink-0" />
                  )}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Custom Status Change */}
        {selectedCount > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-medium">Custom Status Change</h4>
            <div className="flex items-center gap-3">
              <Select onValueChange={(status) => handleBulkOperation(
                { id: 'custom_status', type: 'status_change', name: 'Change Status', description: '', icon: <Settings className="h-4 w-4" />, confirmationRequired: false, dangerLevel: 'low' },
                { status }
              )}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Change to..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">
                Change {selectedCount} portfolio{selectedCount > 1 ? 's' : ''} to selected status
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}