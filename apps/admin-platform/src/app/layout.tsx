import type { Metadata } from 'next';
import { Providers } from '@/utils/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Admin Platform - Origin Food House',
  description: 'Platform administration and management',
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
