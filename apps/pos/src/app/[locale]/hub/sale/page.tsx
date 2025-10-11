'use client';

import { useTranslations } from 'next-intl';

export default function SalesPage() {
  const t = useTranslations('pages');

  return (
    <div className="flex h-full w-full items-center justify-center">
      <h1 className="text-2xl font-bold">{t('salesPage')}</h1>
    </div>
  );
}
