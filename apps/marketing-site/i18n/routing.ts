import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'zh', 'my', 'th'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});
