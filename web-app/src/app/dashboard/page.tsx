'use client';

import { useUser } from '@/hooks/use-user';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome back, {user?.full_name || 'User'}!</CardTitle>
            <CardDescription>
              Here&apos;s your account information
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                <label className="text-sm font-medium text-gray-500">Email Verified</label>
                <p className="text-lg">
                  {user?.is_email_verified ? (
                    <span className="text-green-600">✓ Verified</span>
                  ) : (
                    <span className="text-orange-600">⚠ Not verified</span>
                  )}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Profile Complete</label>
                <p className="text-lg">
                  {user?.is_profile_complete ? (
                    <span className="text-green-600">✓ Complete</span>
                  ) : (
                    <span className="text-orange-600">⚠ Incomplete</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}