'use client';

/**
 * Root layout for the RMS application.
 * Configured for static export (SSG) - no server-side rendering.
 * Supports Tauri desktop app integration.
 */
import localFont from 'next/font/local';
import { Toaster } from '@repo/ui/components/sonner';

import '@repo/ui/globals.css';
import Providers from '@/utils/providers';
import { IntlProvider } from '@/i18n/IntlProvider';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});

/**
 * FOUC prevention script - runs before React hydration.
 * Synchronously reads locale from localStorage to set lang attribute
 * before the page renders, preventing a flash of wrong language.
 */
const localeScript = `
(function() {
  try {
    var s = localStorage.getItem('rms-locale');
    if (s) {
      var p = JSON.parse(s);
      if (p.state && p.state.locale) {
        document.documentElement.lang = p.state.locale;
      }
    }
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Origin Food House POS</title>
        <meta
          name="description"
          content="A modern and efficient restaurant POS solution."
        />
        <script dangerouslySetInnerHTML={{ __html: localeScript }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <IntlProvider>{children}</IntlProvider>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
