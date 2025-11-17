import type {
  SupportedLocale,
  TranslationMap,
  BaseTranslation,
  TranslationWithDescription,
} from '../types/menu-item.types';

/**
 * Supported locales array
 */
export const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'zh', 'my', 'th'];

/**
 * Locale information for display
 */
export const LOCALE_INFO: Record<
  SupportedLocale,
  { name: string; flag: string }
> = {
  en: { name: 'English', flag: '🇬🇧' },
  zh: { name: '中文', flag: '🇨🇳' },
  my: { name: 'မြန်မာ', flag: '🇲🇲' },
  th: { name: 'ไทย', flag: '🇹🇭' },
};

/**
 * Get the count of completed translations
 * A translation is considered complete if it has a non-empty name
 */
export function getTranslationCompletionCount(
  translations?:
    | TranslationMap<BaseTranslation>
    | TranslationMap<TranslationWithDescription>
): number {
  if (!translations) return 0;

  return SUPPORTED_LOCALES.filter((locale) => {
    const translation = translations[locale];
    return translation?.name?.trim();
  }).length;
}

/**
 * Check if translations are incomplete (not all 4 languages have translations)
 */
export function hasIncompleteTranslations(
  translations?:
    | TranslationMap<BaseTranslation>
    | TranslationMap<TranslationWithDescription>
): boolean {
  const completedCount = getTranslationCompletionCount(translations);
  return completedCount > 0 && completedCount < SUPPORTED_LOCALES.length;
}

/**
 * Get translation completion percentage (0-100)
 */
export function getTranslationCompletionPercentage(
  translations?:
    | TranslationMap<BaseTranslation>
    | TranslationMap<TranslationWithDescription>
): number {
  const completedCount = getTranslationCompletionCount(translations);
  return Math.round((completedCount / SUPPORTED_LOCALES.length) * 100);
}

/**
 * Check if a specific locale has a translation
 */
export function hasTranslationForLocale(
  locale: SupportedLocale,
  translations?:
    | TranslationMap<BaseTranslation>
    | TranslationMap<TranslationWithDescription>
): boolean {
  if (!translations) return false;
  return Boolean(translations[locale]?.name?.trim());
}
