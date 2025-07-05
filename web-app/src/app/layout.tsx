import type { Metadata } from 'next';
import { Inter, Playfair_Display, Fira_Code } from 'next/font/google';
// Temporarily disable i18n until we can test the basic functionality
// import { NextIntlClientProvider } from 'next-intl';
// import { getMessages } from 'next-intl/server';
import { AuthProvider } from '@/contexts/auth-context';
import { BreadcrumbProvider } from '@/contexts/breadcrumb-context';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { MainLayout } from '@/components/layout';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

const playfair = Playfair_Display({
  variable: '--font-serif',
  subsets: ['latin'],
});

const firaCode = Fira_Code({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Spotlight - Professional Portfolio Platform',
  description: 'Create your professional portfolio in under 5 minutes. Showcase your talent to the world.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} ${firaCode.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <BreadcrumbProvider>
              <MainLayout>
                {children}
              </MainLayout>
            </BreadcrumbProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
