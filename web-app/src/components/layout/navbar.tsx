'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Settings, LogOut, Sparkles, User as UserIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useUser } from '@/hooks/use-user';
import { useAuth } from '@/hooks/use-auth';
import { ROUTES, APP_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { User } from '@/types';

// Navigation items for authenticated users
const AUTHENTICATED_NAV_ITEMS = [
  { label: 'Dashboard', href: ROUTES.dashboard },
  { label: 'Create Portfolio', href: ROUTES.createPortfolio },
  { label: 'Profile', href: ROUTES.profile },
] as const;

// Navigation items for unauthenticated users
const PUBLIC_NAV_ITEMS = [
  { label: 'Examples', href: ROUTES.examples },
  { label: 'Templates', href: ROUTES.templates },
  { label: 'Pricing', href: ROUTES.pricing },
] as const;

interface NavItemProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

function NavItem({ href, children, isActive, onClick, className }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'transition-colors hover:text-foreground/80',
        isActive ? 'text-foreground font-medium' : 'text-foreground/60',
        className
      )}
    >
      {children}
    </Link>
  );
}

interface UserMenuProps {
  user: User | null;
  onSignOut: () => void;
}

function UserMenu({ user, onSignOut }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 rounded-full p-0"
          aria-label="User menu"
        >
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name || 'User avatar'}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <UserIcon className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-sm">
          <div className="font-medium">{user?.full_name || 'User'}</div>
          <div className="text-muted-foreground text-xs">{user?.email}</div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={ROUTES.profile} className="cursor-pointer">
            <UserIcon className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut} className="cursor-pointer text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface MobileNavProps {
  isAuthenticated: boolean;
  user: User | null;
  onSignOut: () => void;
  pathname: string;
}

function MobileNav({ isAuthenticated, user, onSignOut, pathname }: MobileNavProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = isAuthenticated ? AUTHENTICATED_NAV_ITEMS : PUBLIC_NAV_ITEMS;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 px-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <Link href={ROUTES.home} className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-spotlight-600" />
              <span className="font-bold text-lg">{APP_CONFIG.name}</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-6 py-6">
            {isAuthenticated && user && (
              <div className="mb-6 p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name || 'User avatar'}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-spotlight-100 dark:bg-spotlight-800 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-spotlight-600" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-sm">{user?.full_name || 'User'}</div>
                    <div className="text-muted-foreground text-xs">{user?.email}</div>
                  </div>
                </div>
              </div>
            )}

            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  isActive={pathname === item.href}
                  onClick={() => setIsOpen(false)}
                  className="block py-2 px-3 rounded-md hover:bg-muted"
                >
                  {item.label}
                </NavItem>
              ))}
            </nav>

            {!isAuthenticated && (
              <div className="mt-6 space-y-2">
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link href={ROUTES.signin} onClick={() => setIsOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button asChild variant="spotlight" className="w-full">
                  <Link href={ROUTES.signup} onClick={() => setIsOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4">
            <div className="flex items-center justify-between">
              <ThemeToggle />
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onSignOut();
                    setIsOpen(false);
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function Navbar() {
  const { user, loading, isAuthenticated } = useUser();
  const { signOut } = useAuth();
  const pathname = usePathname();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect will be handled by the auth context
    } catch (error) {
      console.error('Error signing out:', error);
      // Fallback redirect
      window.location.href = ROUTES.signin;
    }
  };

  // Show loading skeleton during auth state resolution
  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container-spotlight flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-spotlight-600" />
            <span className="font-bold text-lg">{APP_CONFIG.name}</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-6">
              <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-4 w-14 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-9 w-9 bg-muted animate-pulse rounded-full" />
            <ThemeToggle />
          </div>
        </div>
      </header>
    );
  }

  const navItems = isAuthenticated ? AUTHENTICATED_NAV_ITEMS : PUBLIC_NAV_ITEMS;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-spotlight flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-8">
          <Link href={ROUTES.home} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Sparkles className="h-6 w-6 text-spotlight-600" />
            <span className="font-bold text-lg">{APP_CONFIG.name}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                isActive={pathname === item.href}
              >
                {item.label}
              </NavItem>
            ))}
          </nav>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Desktop Auth Actions */}
          {!isAuthenticated ? (
            <div className="hidden md:flex items-center space-x-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href={ROUTES.signin}>Sign In</Link>
              </Button>
              <Button variant="spotlight" size="sm" asChild>
                <Link href={ROUTES.signup}>Get Started</Link>
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-3">
              <UserMenu user={user} onSignOut={handleSignOut} />
            </div>
          )}

          {/* Theme Toggle */}
          <div className="hidden md:flex">
            <ThemeToggle />
          </div>

          {/* Mobile Navigation */}
          <MobileNav
            isAuthenticated={isAuthenticated}
            user={user}
            onSignOut={handleSignOut}
            pathname={pathname}
          />
        </div>
      </div>
    </header>
  );
}