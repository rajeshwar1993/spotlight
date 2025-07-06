'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface PortfolioEditFormProps {
  portfolio?: any;
  onSave?: (portfolio: any) => void;
  onCancel?: () => void;
  className?: string;
}

export function PortfolioEditForm({
  portfolio,
  onSave,
  onCancel,
  className
}: PortfolioEditFormProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {portfolio ? 'Edit Portfolio' : 'Create Portfolio'}
        </h1>
        <Button onClick={onCancel}>Cancel</Button>
      </div>
      <div>
        <p>Portfolio edit form - under construction</p>
      </div>
    </div>
  );
}