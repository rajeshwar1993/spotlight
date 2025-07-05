import Link from 'next/link';
import { Sparkles, Github, Twitter, Instagram, Linkedin } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { APP_CONFIG, ROUTES } from '@/lib/constants';

const FOOTER_LINKS = {
  product: [
    { label: 'Templates', href: '/templates' },
    { label: 'Examples', href: '/examples' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Features', href: '/features' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
  support: [
    { label: 'Help Center', href: '/help' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Community', href: '/community' },
    { label: 'Status', href: '/status' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'GDPR', href: '/gdpr' },
  ],
} as const;

const SOCIAL_LINKS = [
  {
    name: 'Twitter',
    href: 'https://twitter.com/spotlight',
    icon: Twitter,
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/spotlight',
    icon: Instagram,
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/company/spotlight',
    icon: Linkedin,
  },
  {
    name: 'GitHub',
    href: 'https://github.com/spotlight',
    icon: Github,
  },
] as const;

interface FooterSectionProps {
  title: string;
  links: readonly { label: string; href: string }[];
}

function FooterSection({ title, links }: FooterSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/95">
      <div className="container-spotlight py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-4">
            <Link href={ROUTES.home} className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-spotlight-600" />
              <span className="font-bold text-lg">{APP_CONFIG.name}</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              {APP_CONFIG.description}. Join thousands of actors and models who trust Spotlight for their professional presence.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center space-x-2">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <Button
                    key={social.name}
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0"
                    asChild
                  >
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Follow us on ${social.name}`}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Product Links */}
          <FooterSection title="Product" links={FOOTER_LINKS.product} />

          {/* Company Links */}
          <FooterSection title="Company" links={FOOTER_LINKS.company} />

          {/* Support Links */}
          <FooterSection title="Support" links={FOOTER_LINKS.support} />

          {/* Legal Links */}
          <FooterSection title="Legal" links={FOOTER_LINKS.legal} />
        </div>

        <Separator className="my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 text-sm text-muted-foreground">
            <span>© {currentYear} {APP_CONFIG.name}. All rights reserved.</span>
            <span className="hidden md:inline">•</span>
            <span>Made with ❤️ for creators</span>
          </div>

          <div className="flex items-center space-x-4 text-sm">
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/cookies"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>

      {/* Newsletter Section (Optional) */}
      <div className="border-t bg-muted/30">
        <div className="container-spotlight py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <h3 className="text-sm font-semibold">Stay updated</h3>
              <p className="text-sm text-muted-foreground">
                Get tips and updates on creating better portfolios.
              </p>
            </div>
            <div className="flex w-full md:w-auto max-w-sm space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-spotlight-500 focus:border-transparent"
              />
              <Button size="sm" variant="spotlight">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}