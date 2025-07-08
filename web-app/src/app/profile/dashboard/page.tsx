'use client';

import { useUser } from '@/hooks/use-user';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProfileAnalytics } from '@/components/profile/profile-analytics';
import { RecentActivity } from '@/components/profile/recent-activity';
import { 
  User, 
  Settings, 
  TrendingUp, 
  Eye, 
  Edit, 
  Share2,
  Calendar,
  MapPin,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';

interface Portfolio {
  id: string;
  title: string;
  slug: string;
  view_count: number;
  status: string;
  created_at: string;
  template: string;
}

interface ProfileStats {
  totalPortfolios: number;
  publishedPortfolios: number;
  totalViews: number;
  profileViews: number;
  avgPortfolioViews: number;
  thisMonthViews: number;
}

export default function ProfileDashboardPage() {
  const { user, loading, isAuthenticated } = useUser();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [profileStats, setProfileStats] = useState<ProfileStats>({
    totalPortfolios: 0,
    publishedPortfolios: 0,
    totalViews: 0,
    profileViews: 0,
    avgPortfolioViews: 0,
    thisMonthViews: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchProfileData = async () => {
    try {
      setStatsLoading(true);
      
      // Fetch portfolios
      const portfoliosResponse = await fetch('/api/portfolios?limit=50');
      if (portfoliosResponse.ok) {
        const portfoliosData = await portfoliosResponse.json();
        const userPortfolios = portfoliosData.data || [];
        setPortfolios(userPortfolios);

        // Calculate stats
        const totalViews = userPortfolios.reduce((sum: number, p: Portfolio) => sum + p.view_count, 0);
        const publishedCount = userPortfolios.filter((p: Portfolio) => p.status === 'published').length;
        const avgViews = userPortfolios.length > 0 ? Math.round(totalViews / userPortfolios.length) : 0;
        
        // Mock profile views and this month's views (would come from analytics API)
        const profileViews = Math.floor(totalViews * 0.3); // Rough estimate
        const thisMonthViews = Math.floor(totalViews * 0.2); // Rough estimate

        setProfileStats({
          totalPortfolios: userPortfolios.length,
          publishedPortfolios: publishedCount,
          totalViews,
          profileViews,
          avgPortfolioViews: avgViews,
          thisMonthViews
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfileData();
    }
  }, [isAuthenticated]);

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
        <div className="text-lg">Please sign in to access your profile dashboard.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Profile Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your profile and track your portfolio performance</p>
          </div>
          <div className="flex space-x-3">
            <Link href="/profile">
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
            <Link href="/profile/settings">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Overview
                </CardTitle>
                <CardDescription>
                  Your profile information and public visibility
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile Info */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {user?.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{user?.full_name || 'Unnamed User'}</h3>
                        <p className="text-gray-600">{user?.email}</p>
                      </div>
                    </div>

                    {user?.profession && (
                      <div className="flex items-center text-gray-600">
                        <Briefcase className="h-4 w-4 mr-2" />
                        <span>{user.profession}</span>
                      </div>
                    )}

                    {user?.location && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{user.location}</span>
                      </div>
                    )}

                    {user?.created_at && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Member since {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
                      </div>
                    )}
                  </div>

                  {/* Profile Status */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Profile Status</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={user?.is_profile_complete ? 'default' : 'secondary'}>
                          {user?.is_profile_complete ? 'Complete' : 'Incomplete'}
                        </Badge>
                        <Badge variant={user?.is_email_verified ? 'default' : 'destructive'}>
                          {user?.is_email_verified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Profile Visibility</label>
                      <p className="text-lg mt-1">
                        <Badge variant="outline">Public</Badge>
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Profile Strength</label>
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${user?.is_profile_complete ? 100 : 60}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {user?.is_profile_complete ? 'Excellent' : 'Good - Add more details to improve'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Link href="/profile">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit Profile
                      </Button>
                    </Link>
                    <Link href="/create">
                      <Button variant="outline" size="sm" className="w-full">
                        <User className="h-4 w-4 mr-1" />
                        New Portfolio
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="w-full" disabled>
                      <Share2 className="h-4 w-4 mr-1" />
                      Share Profile
                    </Button>
                    <Link href="/profile/settings">
                      <Button variant="outline" size="sm" className="w-full">
                        <Settings className="h-4 w-4 mr-1" />
                        Settings
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Analytics */}
            <ProfileAnalytics 
              stats={profileStats} 
              portfolios={portfolios}
              loading={statsLoading}
            />

            {/* Recent Activity */}
            <RecentActivity portfolios={portfolios} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Portfolios</span>
                    <span className="font-semibold">{profileStats.totalPortfolios}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Published</span>
                    <span className="font-semibold">{profileStats.publishedPortfolios}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Views</span>
                    <span className="font-semibold">{profileStats.totalViews.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg. Views</span>
                    <span className="font-semibold">{profileStats.avgPortfolioViews}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-gray-600">This Month</span>
                    <span className="font-semibold text-green-600">+{profileStats.thisMonthViews}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Portfolio */}
            {portfolios.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Top Performer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const topPortfolio = portfolios.reduce((prev, current) => 
                      (prev.view_count > current.view_count) ? prev : current
                    );
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                            {topPortfolio.template}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{topPortfolio.title}</p>
                            <p className="text-sm text-gray-600">{topPortfolio.view_count} views</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Link href={`/mypage/${topPortfolio.slug}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              View
                            </Button>
                          </Link>
                          <Link href={`/dashboard/portfolios?edit=${topPortfolio.id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Profile Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">💡 Boost your visibility</p>
                  <p className="text-gray-600">Complete your profile and add professional photos to increase views.</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">🎯 Optimize portfolios</p>
                  <p className="text-gray-600">Use relevant keywords in your bio and portfolio descriptions.</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">📱 Share your work</p>
                  <p className="text-gray-600">Share your portfolio links on social media to drive traffic.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}