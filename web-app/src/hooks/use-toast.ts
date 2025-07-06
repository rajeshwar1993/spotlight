// Simple toast hook for notifications
import { useState } from 'react';

interface Toast {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({ title, description, variant = 'default' }: Toast) => {
    // For now, just log to console
    // In a real app, this would show a toast notification
    if (variant === 'destructive') {
      console.error(`Toast: ${title}`, description);
    } else {
      console.log(`Toast: ${title}`, description);
    }
    
    // Add to toasts array (for potential future UI implementation)
    const newToast = { title, description, variant };
    setToasts(prev => [...prev, newToast]);
    
    // Remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t !== newToast));
    }, 3000);
  };

  return { toast, toasts };
}