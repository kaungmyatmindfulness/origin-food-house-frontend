import type { Metadata } from 'next';
import { Providers } from '@/utils/providers';
import '@repo/ui/globals.css';

export const metadata: Metadata = {
  title: 'Self Ordering System - Origin Food House',
  description: 'TBA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
