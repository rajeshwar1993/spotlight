'use client';

import * as React from 'react';
import { X, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getVisibleAnnouncements, announcementStorage } from '@/lib/services/announcements';
import type { Announcement } from '@/types';
import { cn } from '@/lib/utils';

// Map announcement types to visual styles
const ANNOUNCEMENT_STYLES = {
  info: {
    icon: Info,
    className: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-100',
    iconClassName: 'text-blue-600 dark:text-blue-400',
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-950/30 dark:border-yellow-800 dark:text-yellow-100',
    iconClassName: 'text-yellow-600 dark:text-yellow-400',
  },
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 border-green-200 text-green-900 dark:bg-green-950/30 dark:border-green-800 dark:text-green-100',
    iconClassName: 'text-green-600 dark:text-green-400',
  },
  error: {
    icon: AlertCircle,
    className: 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/30 dark:border-red-800 dark:text-red-100',
    iconClassName: 'text-red-600 dark:text-red-400',
  },
} as const;

interface AnnouncementItemProps {
  announcement: Announcement;
  onDismiss: (id: string) => void;
}

function AnnouncementItem({ announcement, onDismiss }: AnnouncementItemProps) {
  const style = ANNOUNCEMENT_STYLES[announcement.type as keyof typeof ANNOUNCEMENT_STYLES] || ANNOUNCEMENT_STYLES.info;
  const Icon = style.icon;

  const handleDismiss = () => {
    onDismiss(announcement.id);
  };

  return (
    <div className={cn(
      'flex items-start space-x-3 p-4 border rounded-lg transition-all duration-300',
      style.className
    )}>
      <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', style.iconClassName)} />
      
      <div className="flex-1 min-w-0">
        {announcement.title && (
          <h3 className="font-medium text-sm mb-1">
            {announcement.title}
          </h3>
        )}
        <div 
          className="text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: announcement.content }}
        />
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        className={cn(
          'h-6 w-6 p-0 hover:bg-black/10 dark:hover:bg-white/10',
          style.iconClassName
        )}
        aria-label={`Dismiss ${announcement.title || 'announcement'}`}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface AnnouncementBannerProps {
  className?: string;
}

export function AnnouncementBanner({ className }: AnnouncementBannerProps) {
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch announcements on mount
  React.useEffect(() => {
    async function fetchAnnouncements() {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await getVisibleAnnouncements();
        
        if (fetchError) {
          setError('Failed to load announcements');
          console.error('Error fetching announcements:', fetchError);
        } else {
          setAnnouncements(data || []);
        }
      } catch (err) {
        setError('Failed to load announcements');
        console.error('Error in fetchAnnouncements:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnnouncements();
  }, []);

  const handleDismiss = React.useCallback((announcementId: string) => {
    // Mark as dismissed in localStorage
    announcementStorage.dismiss(announcementId);
    
    // Remove from state with animation
    setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
  }, []);

  // Don't render anything while loading or if there's an error or no announcements
  if (loading || error || announcements.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      {announcements.map((announcement) => (
        <AnnouncementItem
          key={announcement.id}
          announcement={announcement}
          onDismiss={handleDismiss}
        />
      ))}
    </div>
  );
}

// Container component that handles the banner positioning
export function AnnouncementBannerContainer() {
  const [hasAnnouncements, setHasAnnouncements] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function checkAnnouncements() {
      try {
        const { data } = await getVisibleAnnouncements();
        setHasAnnouncements((data?.length || 0) > 0);
      } catch (err) {
        console.error('Error checking announcements:', err);
        setHasAnnouncements(false);
      } finally {
        setLoading(false);
      }
    }

    checkAnnouncements();
  }, []);

  // Don't render the container if there are no announcements
  if (loading || !hasAnnouncements) {
    return null;
  }

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-spotlight py-3">
        <AnnouncementBanner />
      </div>
    </div>
  );
}