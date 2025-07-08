'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Plus, 
  Edit, 
  Eye, 
  Share2,
  Calendar,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface Portfolio {
  id: string;
  title: string;
  slug: string;
  view_count: number;
  status: string;
  created_at: string;
  updated_at: string;
  template: string;
}

interface RecentActivityProps {
  portfolios: Portfolio[];
}

interface ActivityItem {
  id: string;
  type: 'created' | 'updated' | 'published' | 'viewed';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
  portfolio?: Portfolio;
}

export function RecentActivity({ portfolios }: RecentActivityProps) {
  // Generate activity items from portfolios
  const generateActivityItems = (): ActivityItem[] => {
    const activities: ActivityItem[] = [];

    portfolios.forEach(portfolio => {
      // Add creation activity
      activities.push({
        id: `create-${portfolio.id}`,
        type: 'created',
        title: 'Portfolio Created',
        description: `Created "${portfolio.title}"`,
        timestamp: portfolio.created_at,
        icon: <Plus className="h-4 w-4" />,
        color: 'text-green-600',
        portfolio
      });

      // Add update activity if different from creation
      if (portfolio.updated_at !== portfolio.created_at) {
        activities.push({
          id: `update-${portfolio.id}`,
          type: 'updated',
          title: 'Portfolio Updated',
          description: `Modified "${portfolio.title}"`,
          timestamp: portfolio.updated_at,
          icon: <Edit className="h-4 w-4" />,
          color: 'text-blue-600',
          portfolio
        });
      }

      // Add published activity if portfolio is published
      if (portfolio.status === 'published') {
        activities.push({
          id: `publish-${portfolio.id}`,
          type: 'published',
          title: 'Portfolio Published',
          description: `Published "${portfolio.title}" to public`,
          timestamp: portfolio.updated_at, // Approximation
          icon: <Share2 className="h-4 w-4" />,
          color: 'text-purple-600',
          portfolio
        });
      }

      // Add view activity for portfolios with views
      if (portfolio.view_count > 0) {
        activities.push({
          id: `view-${portfolio.id}`,
          type: 'viewed',
          title: 'Portfolio Views',
          description: `"${portfolio.title}" received ${portfolio.view_count} views`,
          timestamp: portfolio.updated_at, // Approximation
          icon: <Eye className="h-4 w-4" />,
          color: 'text-orange-600',
          portfolio
        });
      }
    });

    // Sort by timestamp (most recent first)
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10); // Show only latest 10 activities
  };

  const activities = generateActivityItems();

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return past.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: past.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Recent Activity
          </div>
          <Button variant="outline" size="sm" disabled>
            <Calendar className="h-4 w-4 mr-1" />
            View All
          </Button>
        </CardTitle>
        <CardDescription>
          Your latest portfolio activities and milestones
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 mb-4">No recent activity yet</p>
            <Link href="/create">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Create Your First Portfolio
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                {/* Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ${activity.color}`}>
                  {activity.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {getRelativeTime(activity.timestamp)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.description}
                  </p>

                  {/* Additional context for certain activities */}
                  {activity.portfolio && (
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {activity.portfolio.template}
                      </Badge>
                      <Badge variant={activity.portfolio.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                        {activity.portfolio.status}
                      </Badge>
                      {activity.type === 'viewed' && (
                        <span className="text-xs text-gray-500">
                          Total: {activity.portfolio.view_count} views
                        </span>
                      )}
                    </div>
                  )}

                  {/* Quick actions */}
                  {activity.portfolio && (
                    <div className="flex space-x-2 mt-2">
                      <Link href={`/mypage/${activity.portfolio.slug}`} target="_blank">
                        <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                          View
                        </Button>
                      </Link>
                      <Link href={`/dashboard/portfolios?edit=${activity.portfolio.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {activities.length >= 10 && (
              <div className="text-center pt-4">
                <Button variant="outline" size="sm" disabled>
                  View Complete Activity History
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Activity Summary */}
        {activities.length > 0 && (
          <div className="mt-6 pt-4 border-t bg-gray-50 -mx-6 px-6 pb-0">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-green-600">
                  {activities.filter(a => a.type === 'created').length}
                </div>
                <div className="text-xs text-gray-600">Created</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-600">
                  {activities.filter(a => a.type === 'updated').length}
                </div>
                <div className="text-xs text-gray-600">Updated</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-purple-600">
                  {activities.filter(a => a.type === 'published').length}
                </div>
                <div className="text-xs text-gray-600">Published</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-orange-600">
                  {portfolios.reduce((sum, p) => sum + p.view_count, 0)}
                </div>
                <div className="text-xs text-gray-600">Total Views</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}