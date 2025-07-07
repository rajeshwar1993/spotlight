import type { Metadata } from 'next';
import { Inter, Playfair_Display, Fira_Code } from 'next/font/google';
// Temporarily disable i18n until we can test the basic functionality
// import { NextIntlClientProvider } from 'next-intl';
// import { getMessages } from 'next-intl/server';
import { AuthProvider } from '@/contexts/auth-context';
import { BreadcrumbProvider } from '@/contexts/breadcrumb-context';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { MainLayout } from '@/components/layout';
import { generateHomePageMetaTags } from '@/lib/seo';
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

export const metadata: Metadata = generateHomePageMetaTags();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Spotlight" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
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
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
