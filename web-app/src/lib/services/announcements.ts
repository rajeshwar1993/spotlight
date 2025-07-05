import { supabase } from '@/lib/supabase/client';
import type { Announcement } from '@/types';

export interface AnnouncementResponse {
  data?: Announcement[];
  error?: Error | null;
}

/**
 * Fetches active announcements from the database
 * Only returns announcements that are currently active and within their date range
 */
export async function getActiveAnnouncements(): Promise<AnnouncementResponse> {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', now)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching announcements:', error);
      return { error: new Error('Failed to fetch announcements') };
    }

    return { data: data || [] };
  } catch (error) {
    console.error('Error in getActiveAnnouncements:', error);
    return { error: error as Error };
  }
}

/**
 * Gets a specific announcement by ID
 */
export async function getAnnouncement(id: string): Promise<{ data?: Announcement; error?: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching announcement:', error);
      return { error: new Error('Failed to fetch announcement') };
    }

    return { data };
  } catch (error) {
    console.error('Error in getAnnouncement:', error);
    return { error: error as Error };
  }
}

/**
 * Creates a real-time subscription for announcements
 * Useful for admin interfaces or real-time updates
 */
export function subscribeToAnnouncements(
  callback: (payload: { eventType: string; new: Announcement; old: Announcement }) => void
) {
  return supabase
    .channel('announcements')
    .on(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'postgres_changes' as any,
      {
        event: '*',
        schema: 'public',
        table: 'announcements',
      },
      callback
    )
    .subscribe();
}

/**
 * Local storage helpers for announcement dismissal
 */
export const announcementStorage = {
  /**
   * Checks if an announcement has been dismissed by the user
   */
  isDismissed(announcementId: string): boolean {
    try {
      const dismissed = localStorage.getItem('dismissed_announcements');
      if (!dismissed) return false;
      
      const dismissedList = JSON.parse(dismissed);
      return Array.isArray(dismissedList) && dismissedList.includes(announcementId);
    } catch {
      return false;
    }
  },

  /**
   * Marks an announcement as dismissed
   */
  dismiss(announcementId: string): void {
    try {
      const dismissed = localStorage.getItem('dismissed_announcements');
      let dismissedList: string[] = [];
      
      if (dismissed) {
        dismissedList = JSON.parse(dismissed);
        if (!Array.isArray(dismissedList)) {
          dismissedList = [];
        }
      }
      
      if (!dismissedList.includes(announcementId)) {
        dismissedList.push(announcementId);
        localStorage.setItem('dismissed_announcements', JSON.stringify(dismissedList));
      }
    } catch (error) {
      console.error('Error dismissing announcement:', error);
    }
  },

  /**
   * Clears all dismissed announcements (useful for testing)
   */
  clearDismissed(): void {
    try {
      localStorage.removeItem('dismissed_announcements');
    } catch (error) {
      console.error('Error clearing dismissed announcements:', error);
    }
  },

  /**
   * Gets all dismissed announcement IDs
   */
  getDismissed(): string[] {
    try {
      const dismissed = localStorage.getItem('dismissed_announcements');
      if (!dismissed) return [];
      
      const dismissedList = JSON.parse(dismissed);
      return Array.isArray(dismissedList) ? dismissedList : [];
    } catch {
      return [];
    }
  },
};

/**
 * Hook-like function to get filtered active announcements
 * Filters out dismissed announcements automatically
 */
export async function getVisibleAnnouncements(): Promise<AnnouncementResponse> {
  const { data: announcements, error } = await getActiveAnnouncements();
  
  if (error || !announcements) {
    return { data: [], error };
  }

  // Filter out dismissed announcements on the client side
  const dismissedIds = announcementStorage.getDismissed();
  const visibleAnnouncements = announcements.filter(
    announcement => !dismissedIds.includes(announcement.id)
  );

  return { data: visibleAnnouncements };
}