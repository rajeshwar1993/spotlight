'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  FileText, 
  Eye, 
  Clock, 
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface UserJourneyStep {
  id: string;
  name: string;
  description: string;
  users: number;
  completionRate: number;
  avgTimeSpent: number;
  exitRate: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

interface LaunchMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  target: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  description: string;
  isGood: boolean;
}

const USER_JOURNEY_STEPS: UserJourneyStep[] = [
  {
    id: 'landing',
    name: 'Landing Page View',
    description: 'User visits the homepage',
    users: 1500,
    completionRate: 100,
    avgTimeSpent: 45,
    exitRate: 15,
    trend: 'up',
    trendValue: 12
  },
  {
    id: 'signup_start',
    name: 'Signup Started',
    description: 'User clicks sign up button',
    users: 1275,
    completionRate: 85,
    avgTimeSpent: 120,
    exitRate: 8,
    trend: 'up',
    trendValue: 5
  },
  {
    id: 'signup_complete',
    name: 'Account Created',
    description: 'User completes registration',
    users: 1170,
    completionRate: 78,
    avgTimeSpent: 180,
    exitRate: 12,
    trend: 'stable',
    trendValue: 0
  },
  {
    id: 'email_verify',
    name: 'Email Verified',
    description: 'User verifies email address',
    users: 1053,
    completionRate: 70.2,
    avgTimeSpent: 300,
    exitRate: 5,
    trend: 'up',
    trendValue: 8
  },
  {
    id: 'onboarding_start',
    name: 'Onboarding Started',
    description: 'User begins onboarding flow',
    users: 950,
    completionRate: 63.3,
    avgTimeSpent: 240,
    exitRate: 15,
    trend: 'down',
    trendValue: -3
  },
  {
    id: 'template_select',
    name: 'Template Selected',
    description: 'User chooses a portfolio template',
    users: 807,
    completionRate: 53.8,
    avgTimeSpent: 180,
    exitRate: 10,
    trend: 'up',
    trendValue: 7
  },
  {
    id: 'portfolio_create',
    name: 'Portfolio Created',
    description: 'User creates their first portfolio',
    users: 650,
    completionRate: 43.3,
    avgTimeSpent: 480,
    exitRate: 8,
    trend: 'up',
    trendValue: 15
  },
  {
    id: 'portfolio_publish',
    name: 'Portfolio Published',
    description: 'User publishes their portfolio',
    users: 456,
    completionRate: 30.4,
    avgTimeSpent: 120,
    exitRate: 3,
    trend: 'up',
    trendValue: 20
  }
];

const LAUNCH_METRICS: LaunchMetric[] = [
  {
    id: 'signup_conversion',
    name: 'Signup Conversion Rate',
    value: 78,
    unit: '%',
    target: 75,
    trend: 'up',
    trendValue: 5,
    description: 'Percentage of visitors who complete signup',
    isGood: true
  },
  {
    id: 'onboarding_completion',
    name: 'Onboarding Completion',
    value: 63.3,
    unit: '%',
    target: 70,
    trend: 'down',
    trendValue: -3,
    description: 'Users who complete the full onboarding',
    isGood: false
  },
  {
    id: 'time_to_portfolio',
    name: 'Time to First Portfolio',
    value: 8.2,
    unit: 'min',
    target: 5,
    trend: 'down',
    trendValue: -15,
    description: 'Average time from signup to first portfolio',
    isGood: false
  },
  {
    id: 'portfolio_publish_rate',
    name: 'Portfolio Publish Rate',
    value: 70.2,
    unit: '%',
    target: 80,
    trend: 'up',
    trendValue: 12,
    description: 'Portfolios published vs created',
    isGood: false
  },
  {
    id: 'daily_active_users',
    name: 'Daily Active Users',
    value: 324,
    unit: '',
    target: 300,
    trend: 'up',
    trendValue: 18,
    description: 'Users active in the last 24 hours',
    isGood: true
  },
  {
    id: 'user_satisfaction',
    name: 'User Satisfaction Score',
    value: 4.7,
    unit: '/5',
    target: 4.5,
    trend: 'up',
    trendValue: 8,
    description: 'Average rating from user feedback',
    isGood: true
  }
];

function getTrendIcon(trend: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up':
      return <ArrowUp className="h-3 w-3 text-green-600" />;
    case 'down':
      return <ArrowDown className="h-3 w-3 text-red-600" />;
    case 'stable':
      return <Minus className="h-3 w-3 text-gray-600" />;
  }
}

function getTrendColor(trend: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up':
      return 'text-green-600';
    case 'down':
      return 'text-red-600';
    case 'stable':
      return 'text-gray-600';
  }
}

export function LaunchMetrics() {
  const [metrics, setMetrics] = useState(LAUNCH_METRICS);
  const [journeySteps, setJourneySteps] = useState(USER_JOURNEY_STEPS);

  return (
    <div className="space-y-6">
      {/* Key Launch Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Launch Performance Metrics</CardTitle>
          <CardDescription>
            Key performance indicators for launch success
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric) => (
              <div key={metric.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{metric.name}</h4>
                  <div className={`flex items-center space-x-1 ${getTrendColor(metric.trend)}`}>
                    {getTrendIcon(metric.trend)}
                    <span className="text-xs">{Math.abs(metric.trendValue)}%</span>
                  </div>
                </div>
                
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold">{metric.value}</span>
                  <span className="text-sm text-muted-foreground">{metric.unit}</span>
                  <span className="text-xs text-muted-foreground">
                    / {metric.target}{metric.unit} target
                  </span>
                </div>
                
                <Progress 
                  value={(metric.value / metric.target) * 100} 
                  className="h-2"
                />
                
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
                
                <Badge variant={metric.isGood ? 'default' : 'secondary'}>
                  {metric.isGood ? 'On Track' : 'Needs Attention'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Journey Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>User Journey Analysis</CardTitle>
          <CardDescription>
            Detailed breakdown of user progression through the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {journeySteps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* Connection Line */}
                {index < journeySteps.length - 1 && (
                  <div className="absolute left-4 top-12 w-0.5 h-16 bg-gray-200" />
                )}
                
                <div className="flex items-start space-x-4">
                  {/* Step Number */}
                  <div className="flex-shrink-0 w-8 h-8 bg-spotlight-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{step.name}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                      <div className={`flex items-center space-x-1 ${getTrendColor(step.trend)}`}>
                        {getTrendIcon(step.trend)}
                        <span className="text-sm">{Math.abs(step.trendValue)}%</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Users</p>
                        <p className="font-medium">{step.users.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Completion Rate</p>
                        <p className="font-medium">{step.completionRate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Time</p>
                        <p className="font-medium">{step.avgTimeSpent}s</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Exit Rate</p>
                        <p className="font-medium">{step.exitRate}%</p>
                      </div>
                    </div>
                    
                    <Progress value={step.completionRate} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Insights & Recommendations</CardTitle>
          <CardDescription>
            AI-powered analysis and optimization suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Strong Signup Performance</h4>
                <p className="text-sm text-green-700">
                  Your signup conversion rate of 78% exceeds the target by 3%. The clear value proposition and streamlined signup process are working well.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">Onboarding Drop-off Opportunity</h4>
                <p className="text-sm text-yellow-700">
                  There's a 10% drop-off at the onboarding start step. Consider simplifying the initial onboarding flow or adding progress indicators to improve completion rates.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Template Selection Optimization</h4>
                <p className="text-sm text-blue-700">
                  Users spend an average of 3 minutes on template selection. Consider adding preview videos or interactive demos to help users choose faster.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}