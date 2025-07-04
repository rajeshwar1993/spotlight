'use client';

import { useUser } from '@/hooks/use-user';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileCompletion } from '@/components/ui/profile-completion';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useUser();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

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
                    <Button variant="outline" className="w-full justify-start" disabled>
                      <span className="mr-2">📊</span>
                      Analytics
                    </Button>
                    <Button variant="outline" className="w-full justify-start" disabled>
                      <span className="mr-2">🎨</span>
                      Portfolio
                    </Button>
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
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium bg-gray-100 text-gray-800">
                      3
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium">Create your first portfolio</p>
                      <p className="text-sm text-gray-600">Showcase your work with a professional portfolio</p>
                    </div>
                    <Button size="sm" disabled>Coming Soon</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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