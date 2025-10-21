/**
 * i18n configuration for the POS application.
 * Supports 4 languages: English, Chinese, Myanmar, Thai
 */

export const locales = ['en', 'zh', 'my', 'th'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  my: 'မြန်မာ',
  th: 'ไทย',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  zh: '🇨🇳',
  my: '🇲🇲',
  th: '🇹🇭',
};
