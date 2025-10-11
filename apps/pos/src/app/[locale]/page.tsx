'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@repo/ui/components/button';
import { Card, CardContent } from '@repo/ui/components/card';

export default function HomePage() {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="max-w-3xl space-y-6 text-center">
        <h1 className="text-5xl font-extrabold text-indigo-900">
          {t('welcomeTitle')}
        </h1>
        <p className="text-lg text-indigo-700">{t('welcomeDescription')}</p>
        <Button size="lg">{tCommon('getStarted')}</Button>
      </div>

      <section className="mt-16 w-full max-w-md">
        <Card className="shadow-xl">
          <CardContent className="space-y-4">
            <h2 className="text-2xl font-semibold">{t('keyFeatures')}</h2>
            <ul className="list-inside list-disc space-y-2 text-indigo-600">
              <li>{t('feature1')}</li>
              <li>{t('feature2')}</li>
              <li>{t('feature3')}</li>
              <li>{t('feature4')}</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <footer className="mt-20 text-sm">
        {t('copyright', { year: new Date().getFullYear() })}
      </footer>
    </main>
  );
}
