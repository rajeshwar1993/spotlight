import { Metadata } from 'next';
import { SignInForm } from '@/components/forms/signin-form';

export const metadata: Metadata = {
  title: 'Sign In - Spotlight',
  description: 'Sign in to your Spotlight account to manage your professional portfolio',
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <SignInForm />
      </div>
    </div>
  );
}