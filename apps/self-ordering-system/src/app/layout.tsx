import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { Providers } from '@/utils/providers';
import '@repo/ui/globals.css';

export const metadata: Metadata = {
  title: 'Self Ordering System - Origin Food House',
  description: 'TBA',
};

/**
 * Root layout for the Self-Ordering System.
 * Uses dynamic locale from next-intl middleware.
 */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
