'use client';

import { useState } from 'react';
import { useUser } from '@/hooks/use-user';
import { UserProfileFormComponent } from '@/components/forms/user-profile-form';
import { AvatarUpload } from '@/components/forms/avatar-upload';
import { ProfileCompletion } from '@/components/ui/profile-completion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/auth/protected-route';
import Link from 'next/link';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'avatar' | 'completion'>('profile');
  const { user, isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return <ProtectedRoute>Loading...</ProtectedRoute>;
  }

  const tabs = [
    { id: 'profile' as const, label: 'Edit Profile', icon: '👤' },
    { id: 'avatar' as const, label: 'Profile Photo', icon: '📸' },
    { id: 'completion' as const, label: 'Profile Status', icon: '📊' },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Profile Management
                </h1>
                <p className="mt-2 text-gray-600">
                  Manage your personal information and preferences
                </p>
              </div>
              <div className="flex space-x-3">
                <Link href="/dashboard">
                  <Button variant="outline">
                    Back to Dashboard
                  </Button>
                </Link>
                <Link href="/profile/settings">
                  <Button variant="outline">
                    Account Settings
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* User Info Header */}
          <div className="mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
                      {user?.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name || 'Profile'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {user?.full_name || 'Welcome'}
                    </h2>
                    <p className="text-gray-600">{user?.email}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {user?.profession} • {user?.location || 'Location not set'}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Profile Status</div>
                      <div className="flex items-center justify-end mt-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user?.is_profile_complete
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {user?.is_profile_complete ? '✓ Complete' : 'Incomplete'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeTab === 'profile' && (
                <UserProfileFormComponent
                  onSuccess={(updatedUser) => {
                    console.log('Profile updated:', updatedUser);
                  }}
                />
              )}

              {activeTab === 'avatar' && (
                <AvatarUpload
                  onSuccess={(avatarUrl) => {
                    console.log('Avatar uploaded:', avatarUrl);
                  }}
                  onError={(error) => {
                    console.error('Avatar upload error:', error);
                  }}
                />
              )}

              {activeTab === 'completion' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Completion Guide</CardTitle>
                    <CardDescription>
                      Complete these sections to improve your profile visibility
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProfileCompletion 
                      showDetails={true} 
                      showCTA={false}
                    />
                    
                    <div className="mt-6 space-y-4">
                      <h3 className="font-medium">Quick Actions</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab('profile')}
                          className="justify-start"
                        >
                          <span className="mr-2">📝</span>
                          Edit Profile Information
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab('avatar')}
                          className="justify-start"
                        >
                          <span className="mr-2">📸</span>
                          Upload Profile Photo
                        </Button>
                        <Link href="/profile/settings" className="block">
                          <Button variant="outline" className="w-full justify-start">
                            <span className="mr-2">⚙️</span>
                            Account Settings
                          </Button>
                        </Link>
                        <Link href="/dashboard" className="block">
                          <Button variant="outline" className="w-full justify-start">
                            <span className="mr-2">📊</span>
                            View Dashboard
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Completion */}
              <ProfileCompletion 
                showDetails={activeTab !== 'completion'} 
                showCTA={true}
              />

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500">Member Since</div>
                    <div className="font-medium">
                      {user?.created_at 
                        ? new Date(user.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Unknown'
                      }
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Last Updated</div>
                    <div className="font-medium">
                      {user?.updated_at 
                        ? new Date(user.updated_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Never'
                      }
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email Status</div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user?.is_email_verified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user?.is_email_verified ? '✓ Verified' : '✗ Not Verified'}
                      </span>
                    </div>
                  </div>
                  {!user?.is_email_verified && (
                    <div className="pt-2">
                      <Link href="/auth/verify">
                        <Button size="sm" className="w-full">
                          Verify Email
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Help & Support */}
              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Having trouble with your profile? We&apos;re here to help.
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <span className="mr-2">📚</span>
                      Profile Guide
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <span className="mr-2">💬</span>
                      Contact Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}