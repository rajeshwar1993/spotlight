import { Metadata } from 'next';
import { SignUpForm } from '@/components/forms/signup-form';

export const metadata: Metadata = {
  title: 'Sign Up - Spotlight',
  description: 'Create your Spotlight account to start building your professional portfolio',
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <SignUpForm />
      </div>
    </div>
  );
}