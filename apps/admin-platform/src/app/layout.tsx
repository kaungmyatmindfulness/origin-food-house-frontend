import type { Metadata } from 'next';
import { Providers } from '@/utils/providers';
import '@repo/ui/globals.css';

export const metadata: Metadata = {
  title: 'Admin Platform - Origin Food House',
  description: 'Platform administration and management',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
