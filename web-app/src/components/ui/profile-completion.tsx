'use client';

import { useUser } from '@/hooks/use-user';
import { getProfileCompletionDetails } from '@/lib/services/user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ProfileCompletionProps {
  showDetails?: boolean;
  showCTA?: boolean;
  className?: string;
}

export function ProfileCompletion({ 
  showDetails = false, 
  showCTA = false,
  className = ''
}: ProfileCompletionProps) {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const completionDetails = getProfileCompletionDetails(user);
  const { percentage, checks, isComplete } = completionDetails;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressTextColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-700';
    if (percentage >= 50) return 'text-yellow-700';
    return 'text-red-700';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Profile Completion</span>
          <span className={`text-lg font-bold ${getProgressTextColor(percentage)}`}>
            {percentage}%
          </span>
        </CardTitle>
        <CardDescription>
          {isComplete 
            ? 'Your profile is complete! 🎉' 
            : `Complete your profile to attract more opportunities`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(percentage)}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Completion Details */}
        {showDetails && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Profile Checklist:</h4>
            <div className="space-y-1">
              {checks.map((check) => (
                <div
                  key={check.field}
                  className="flex items-center space-x-2 text-sm"
                >
                  <div className="flex-shrink-0">
                    {check.completed ? (
                      <svg
                        className="w-4 h-4 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={
                      check.completed 
                        ? 'text-green-700' 
                        : 'text-gray-500'
                    }
                  >
                    {check.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        {showCTA && !isComplete && (
          <div className="pt-2">
            <Link href="/profile">
              <Button className="w-full">
                Complete Your Profile
              </Button>
            </Link>
          </div>
        )}

        {/* Completion Benefits */}
        {!isComplete && (
          <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="font-medium text-blue-800 mb-1">
              Why complete your profile?
            </p>
            <ul className="space-y-1 text-blue-700">
              <li>• Appear in more search results</li>
              <li>• Build trust with potential clients</li>
              <li>• Unlock advanced portfolio features</li>
              <li>• Get priority in featured listings</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ProfileCompletionBadgeProps {
  className?: string;
}

export function ProfileCompletionBadge({ className = '' }: ProfileCompletionBadgeProps) {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const completionDetails = getProfileCompletionDetails(user);
  const { percentage, isComplete } = completionDetails;

  const getBadgeColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (percentage >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeColor(percentage)} ${className}`}
    >
      {isComplete ? '✓ Complete' : `${percentage}% Complete`}
    </span>
  );
}

interface ProfileCompletionBarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProfileCompletionBar({ 
  className = '', 
  size = 'md' 
}: ProfileCompletionBarProps) {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const completionDetails = getProfileCompletionDetails(user);
  const { percentage } = completionDetails;

  const getBarHeight = (size: string) => {
    switch (size) {
      case 'sm': return 'h-1';
      case 'lg': return 'h-4';
      default: return 'h-2';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`w-full bg-gray-200 rounded-full ${getBarHeight(size)} ${className}`}>
      <div
        className={`${getBarHeight(size)} rounded-full transition-all duration-300 ${getProgressColor(percentage)}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}