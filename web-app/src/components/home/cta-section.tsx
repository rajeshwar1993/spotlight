'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { 
  ArrowRight, 
  Rocket, 
  CheckCircle, 
  Mail, 
  Sparkles,
  Clock,
  Users,
  Star
} from 'lucide-react';

interface CTASectionProps {
  className?: string;
}

export function CTASection({ className = '' }: CTASectionProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    // Simulate newsletter subscription
    setTimeout(() => {
      setIsSubscribed(true);
      setIsLoading(false);
      setEmail('');
    }, 1000);
  };

  const benefits = [
    'Professional templates designed for creatives',
    'Mobile-optimized portfolios',
    'Advanced analytics and insights',
    'Custom domain support',
    'SEO optimization',
    'Priority customer support'
  ];

  return (
    <section className={`py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-white/20">
              <Sparkles className="w-3 h-3 mr-1" />
              Ready to Get Started?
            </Badge>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Launch Your Career Today
            </h2>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Join thousands of creative professionals who&apos;ve transformed their careers with stunning portfolios. 
              Start building your success story in the next 5 minutes.
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="flex items-center gap-2 text-gray-300">
                <Clock className="w-4 h-4 text-green-400" />
                <span className="text-sm">5 min setup</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-sm">10,000+ users</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm">4.9/5 rating</span>
              </div>
            </div>
          </div>

          {/* Main CTA Card */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl mb-16">
            <CardContent className="p-8 md:p-12">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Side - CTAs */}
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-6">
                    Everything You Need to Succeed
                  </h3>
                  
                  <div className="space-y-3 mb-8">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-gray-200">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {user ? (
                      <Link href="/dashboard" className="block">
                        <Button 
                          size="lg" 
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                        >
                          <Rocket className="mr-2 w-5 h-5" />
                          Go to Dashboard
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                      </Link>
                    ) : (
                      <>
                        <Link href="/auth/register" className="block">
                          <Button 
                            size="lg" 
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                          >
                            <Rocket className="mr-2 w-5 h-5" />
                            Create Your Portfolio Now
                            <ArrowRight className="ml-2 w-5 h-5" />
                          </Button>
                        </Link>
                        
                        <Link href="/examples" className="block">
                          <Button 
                            variant="outline" 
                            size="lg" 
                            className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white py-6 text-lg font-semibold backdrop-blur-sm transition-all duration-300"
                          >
                            View Examples First
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>

                  <p className="text-sm text-gray-400 mt-4">
                    ✨ Free forever plan • No credit card required • 30-day money-back guarantee
                  </p>
                </div>

                {/* Right Side - Newsletter & Testimonial */}
                <div className="space-y-8">
                  {/* Newsletter Signup */}
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Mail className="w-5 h-5 text-blue-400" />
                        <h4 className="font-semibold">Stay Updated</h4>
                      </div>
                      
                      <p className="text-sm text-gray-300 mb-4">
                        Get portfolio tips, industry insights, and feature updates.
                      </p>

                      {isSubscribed ? (
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm">Thanks for subscribing!</span>
                        </div>
                      ) : (
                        <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                            required
                          />
                          <Button 
                            type="submit" 
                            size="sm" 
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={isLoading}
                          >
                            {isLoading ? 'Subscribing...' : 'Subscribe'}
                          </Button>
                        </form>
                      )}
                    </CardContent>
                  </Card>

                  {/* Testimonial */}
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      
                      <blockquote className="text-sm text-gray-200 mb-3">
                        &quot;Spotlight transformed my career. I got 3x more casting calls after launching my portfolio!&quot;
                      </blockquote>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">SJ</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Sarah Johnson</div>
                          <div className="text-xs text-gray-400">Professional Actor</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Stats */}
          <div className="text-center">
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="text-2xl font-bold mb-1">10K+</div>
                <div className="text-sm text-gray-400">Happy Users</div>
              </div>
              <div>
                <div className="text-2xl font-bold mb-1">5M+</div>
                <div className="text-sm text-gray-400">Portfolio Views</div>
              </div>
              <div>
                <div className="text-2xl font-bold mb-1">99.9%</div>
                <div className="text-sm text-gray-400">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}