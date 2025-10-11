'use client';

import { useTranslations } from 'next-intl';

export default function ProfilePage() {
  const t = useTranslations('pages');

  return (
    <div>
      <h1>{t('profilePage')}</h1>
    </div>
  );
}
