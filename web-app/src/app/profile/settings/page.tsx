'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/hooks/use-auth';
import { useUser } from '@/hooks/use-user';
import Link from 'next/link';

export default function ProfileSettingsPage() {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const { user, isAuthenticated } = useUser();
  const { updatePassword, resendConfirmation, signOut } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    return <ProtectedRoute>Loading...</ProtectedRoute>;
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Passwords do not match',
      });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 8 characters long',
      });
      return;
    }

    setIsChangingPassword(true);
    setMessage(null);

    try {
      const { error } = await updatePassword(newPassword);

      if (error) {
        setMessage({
          type: 'error',
          text: error.message || 'Failed to update password',
        });
      } else {
        setMessage({
          type: 'success',
          text: 'Password updated successfully!',
        });
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;

    setIsResendingVerification(true);
    setMessage(null);

    try {
      const { error } = await resendConfirmation(user.email);

      if (error) {
        setMessage({
          type: 'error',
          text: error.message || 'Failed to send verification email',
        });
      } else {
        setMessage({
          type: 'success',
          text: 'Verification email sent! Please check your inbox.',
        });
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsResendingVerification(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Account Settings
                </h1>
                <p className="mt-2 text-gray-600">
                  Manage your account security and preferences
                </p>
              </div>
              <div className="flex space-x-3">
                <Link href="/profile">
                  <Button variant="outline">
                    Back to Profile
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline">
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Status Message */}
          {message && (
            <div className="mb-6">
              <div
                className={`p-4 rounded-md border ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {message.text}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Your basic account details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email Address</label>
                    <p className="text-lg font-medium">{user?.email}</p>
                    <p className="text-sm text-gray-500">
                      Your email address is used for sign in and notifications
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Account Status</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user?.is_email_verified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user?.is_email_verified ? '✓ Email Verified' : '⚠ Email Not Verified'}
                      </span>
                    </div>
                    {!user?.is_email_verified && (
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleResendVerification}
                          disabled={isResendingVerification}
                        >
                          {isResendingVerification ? 'Sending...' : 'Resend Verification Email'}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Member Since</label>
                    <p className="text-lg font-medium">
                      {user?.created_at 
                        ? new Date(user.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Unknown'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Change Password */}
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="new_password" className="text-sm font-medium">
                        New Password
                      </label>
                      <Input
                        id="new_password"
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isChangingPassword}
                        required
                        minLength={8}
                      />
                      <p className="text-xs text-gray-500">
                        Password must be at least 8 characters long
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="confirm_password" className="text-sm font-medium">
                        Confirm New Password
                      </label>
                      <Input
                        id="confirm_password"
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isChangingPassword}
                        required
                        minLength={8}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isChangingPassword || !newPassword || !confirmPassword}
                    >
                      {isChangingPassword ? 'Updating...' : 'Update Password'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Privacy & Security */}
              <Card>
                <CardHeader>
                  <CardTitle>Privacy & Security</CardTitle>
                  <CardDescription>
                    Control how your information is used and displayed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Profile Visibility</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Your profile information is used to create your public portfolio. 
                      You can control what information is displayed by editing your profile.
                    </p>
                    <Link href="/profile">
                      <Button variant="outline" size="sm">
                        Manage Profile Visibility
                      </Button>
                    </Link>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Data Export</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Download a copy of your personal data and portfolio information.
                    </p>
                    <Button variant="outline" size="sm" disabled>
                      Export My Data (Coming Soon)
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-700">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible and destructive actions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-700 mb-2">Sign Out</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Sign out of your account on this device.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSignOut}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Sign Out
                    </Button>
                  </div>

                  <div className="border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-700 mb-2">Delete Account</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="text-red-600 border-red-300"
                    >
                      Delete Account (Coming Soon)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Account Security */}
              <Card>
                <CardHeader>
                  <CardTitle>Security Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Verified</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        user?.is_email_verified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user?.is_email_verified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Profile Complete</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        user?.is_profile_complete
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {user?.is_profile_complete ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Strong Password</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                      Yes
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/profile" className="block">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <span className="mr-2">👤</span>
                      Edit Profile
                    </Button>
                  </Link>
                  <Link href="/auth/reset-password" className="block">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <span className="mr-2">🔒</span>
                      Reset Password
                    </Button>
                  </Link>
                  {!user?.is_email_verified && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={handleResendVerification}
                      disabled={isResendingVerification}
                    >
                      <span className="mr-2">📧</span>
                      Verify Email
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Help */}
              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Having trouble with your account settings?
                  </p>
                  <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                    <span className="mr-2">💬</span>
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}