'use client';

import { useUser } from '@/hooks/use-user';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProfileCompletion } from '@/components/ui/profile-completion';
import { EmailVerificationBanner } from '@/components/email-verification/verification-banner';
import { emailVerificationService } from '@/lib/services/email-verification';
import { useState, useEffect } from 'react';
import { Plus, Eye, Grid, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Portfolio {
  id: string;
  title: string;
  slug: string;
  template: string;
  status: string;
  view_count: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface PortfolioStats {
  total: number;
  published: number;
  draft: number;
  totalViews: number;
}

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useUser();
  const { signOut } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>({
    total: 0,
    published: 0,
    draft: 0,
    totalViews: 0
  });
  const [portfoliosLoading, setPortfoliosLoading] = useState(true);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleResendVerification = async () => {
    return emailVerificationService.resendVerificationEmail();
  };

  const fetchPortfolioStats = async () => {
    try {
      const response = await fetch('/api/portfolios?limit=5');
      if (response.ok) {
        const data = await response.json();
        const portfolioData = data.data || [];
        setPortfolios(portfolioData);
        
        const stats = portfolioData.reduce((acc: PortfolioStats, portfolio: Portfolio) => {
          acc.total += 1;
          if (portfolio.status === 'published') acc.published += 1;
          if (portfolio.status === 'draft') acc.draft += 1;
          acc.totalViews += portfolio.view_count;
          return acc;
        }, { total: 0, published: 0, draft: 0, totalViews: 0 });
        
        setPortfolioStats(stats);
      }
    } catch (error) {
      console.error('Failed to fetch portfolio stats:', error);
    } finally {
      setPortfoliosLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPortfolioStats();
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
        <div className="text-lg">Please sign in to access the dashboard.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Email Verification Banner */}
        <EmailVerificationBanner
          isVisible={!user?.is_email_verified}
          isEmailVerified={user?.is_email_verified}
          userEmail={user?.email}
          onResendVerification={handleResendVerification}
          className="mb-6"
          variant="prominent"
        />

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.full_name || 'User'}!</p>
          </div>
          <div className="flex space-x-3">
            <Link href="/profile">
              <Button variant="outline">
                Edit Profile
              </Button>
            </Link>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Card */}
            <Card>
              <CardHeader>
                <CardTitle>Account Overview</CardTitle>
                <CardDescription>
                  Your account information and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-lg">{user?.email}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Profession</label>
                      <p className="text-lg">{user?.profession || 'Not specified'}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Location</label>
                      <p className="text-lg">{user?.location || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email Status</label>
                      <p className="text-lg">
                        {user?.is_email_verified ? (
                          <span className="text-green-600">✓ Verified</span>
                        ) : (
                          <span className="text-orange-600">⚠ Not verified</span>
                        )}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Profile Status</label>
                      <p className="text-lg">
                        {user?.is_profile_complete ? (
                          <span className="text-green-600">✓ Complete</span>
                        ) : (
                          <span className="text-orange-600">⚠ Incomplete</span>
                        )}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Member Since</label>
                      <p className="text-lg">
                        {user?.created_at 
                          ? new Date(user.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long'
                            })
                          : 'Unknown'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Link href="/profile" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <span className="mr-2">👤</span>
                        Edit Profile
                      </Button>
                    </Link>
                    <Link href="/profile/settings" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <span className="mr-2">⚙️</span>
                        Settings
                      </Button>
                    </Link>
                    <Link href="/dashboard/portfolios" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <span className="mr-2">📊</span>
                        Portfolios
                      </Button>
                    </Link>
                    <Link href="/create" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <span className="mr-2">🎨</span>
                        Create Portfolio
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Getting Started */}
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>
                  Complete these steps to make the most of Spotlight
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      user?.is_email_verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user?.is_email_verified ? '✓' : '1'}
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium">Verify your email address</p>
                      <p className="text-sm text-gray-600">Confirm your email to secure your account</p>
                    </div>
                    {!user?.is_email_verified && (
                      <Link href="/auth/verify">
                        <Button size="sm">Verify</Button>
                      </Link>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      user?.is_profile_complete ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user?.is_profile_complete ? '✓' : '2'}
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium">Complete your profile</p>
                      <p className="text-sm text-gray-600">Add your bio, location, and professional information</p>
                    </div>
                    {!user?.is_profile_complete && (
                      <Link href="/profile">
                        <Button size="sm">Complete</Button>
                      </Link>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      portfolioStats.total > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {portfolioStats.total > 0 ? '✓' : '3'}
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium">Create your first portfolio</p>
                      <p className="text-sm text-gray-600">Showcase your work with a professional portfolio</p>
                    </div>
                    {portfolioStats.total === 0 ? (
                      <Link href="/create">
                        <Button size="sm">Create</Button>
                      </Link>
                    ) : (
                      <Link href="/dashboard/portfolios">
                        <Button size="sm" variant="outline">Manage</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Overview */}
            {portfolioStats.total > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle>Portfolio Overview</CardTitle>
                    <CardDescription>
                      Your portfolio statistics and recent activity
                    </CardDescription>
                  </div>
                  <Link href="/dashboard/portfolios">
                    <Button variant="outline" size="sm">
                      <Grid className="h-4 w-4 mr-1" />
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{portfolioStats.total}</div>
                      <div className="text-sm text-gray-600">Total Portfolios</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{portfolioStats.published}</div>
                      <div className="text-sm text-gray-600">Published</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{portfolioStats.draft}</div>
                      <div className="text-sm text-gray-600">Drafts</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{portfolioStats.totalViews}</div>
                      <div className="text-sm text-gray-600">Total Views</div>
                    </div>
                  </div>

                  {/* Recent Portfolios */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Recent Portfolios</h4>
                    {portfoliosLoading ? (
                      <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg animate-pulse">
                            <div className="w-12 h-12 bg-gray-200 rounded"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : portfolios.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-gray-500 mb-4">
                          <Grid className="h-12 w-12 mx-auto text-gray-300" />
                        </div>
                        <p className="text-gray-600 mb-4">No portfolios created yet</p>
                        <Link href="/create">
                          <Button>
                            <Plus className="h-4 w-4 mr-1" />
                            Create Your First Portfolio
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {portfolios.slice(0, 3).map((portfolio) => (
                          <div key={portfolio.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                                {portfolio.template}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{portfolio.title}</p>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Badge variant={portfolio.status === 'published' ? 'default' : 'secondary'}>
                                    {portfolio.status}
                                  </Badge>
                                  <span className="flex items-center">
                                    <Eye className="h-3 w-3 mr-1" />
                                    {portfolio.view_count}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Link href={`/mypage/${portfolio.slug}`} target="_blank">
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/dashboard/portfolios?edit=${portfolio.id}`}>
                                <Button variant="ghost" size="sm">
                                  Edit
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                        
                        {portfolios.length > 3 && (
                          <div className="text-center pt-2">
                            <Link href="/dashboard/portfolios">
                              <Button variant="outline" size="sm">
                                View all {portfolioStats.total} portfolios
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <ProfileCompletion 
              showDetails={true} 
              showCTA={true}
            />

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  <p>No recent activity yet.</p>
                  <p className="mt-2">Start by completing your profile to see updates here.</p>
                </div>
              </CardContent>
            </Card>

            {/* Help & Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Help & Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                  <span className="mr-2">📚</span>
                  User Guide
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                  <span className="mr-2">💬</span>
                  Contact Support
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                  <span className="mr-2">🎥</span>
                  Video Tutorials
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}