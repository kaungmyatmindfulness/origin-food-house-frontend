'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@repo/ui/components/button';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@repo/ui/components/sheet';

export function MarketingHeader() {
  const t = useTranslations('marketing.header');

  const navigation = [
    { name: t('features'), href: '#features' },
    { name: t('pricing'), href: '#pricing' },
    { name: t('faq'), href: '#faq' },
  ];

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold">Origin Food House</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-6 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="hover:text-primary text-sm font-medium transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild className="hidden md:inline-flex">
            <Link href={process.env.NEXT_PUBLIC_RMS_URL || '/login'}>
              {t('signIn')}
            </Link>
          </Button>
          <Button asChild>
            <Link href="#demo">{t('requestDemo')}</Link>
          </Button>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="mt-8 flex flex-col space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="hover:text-primary text-lg font-medium transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
                <Link
                  href={process.env.NEXT_PUBLIC_RMS_URL || '/login'}
                  className="hover:text-primary text-lg font-medium transition-colors"
                >
                  {t('signIn')}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
