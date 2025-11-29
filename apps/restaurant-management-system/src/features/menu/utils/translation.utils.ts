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
 * Translation input type that can be either:
 * - Array format from API: [{locale: 'en', name: '...'}]
 * - Map format: {en: {name: '...'}}
 */
type TranslationInput =
  | TranslationMap<BaseTranslation>
  | TranslationMap<TranslationWithDescription>
  | Array<{ locale: string; name: string; description?: string | null }>;

/**
 * Helper to get translation for a locale from either array or map format
 */
function getTranslationForLocale(
  translations: TranslationInput | undefined,
  locale: SupportedLocale
): { name?: string; description?: string | null } | undefined {
  if (!translations) return undefined;

  if (Array.isArray(translations)) {
    return translations.find((t) => t.locale === locale);
  }

  return translations[locale];
}

/**
 * Get the count of completed translations
 * A translation is considered complete if it has a non-empty name
 * Supports both array and map formats from API
 */
export function getTranslationCompletionCount(
  translations?: TranslationInput
): number {
  if (!translations) return 0;

  return SUPPORTED_LOCALES.filter((locale) => {
    const translation = getTranslationForLocale(translations, locale);
    return translation?.name?.trim();
  }).length;
}

/**
 * Check if translations are incomplete (not all 4 languages have translations)
 * Supports both array and map formats from API
 */
export function hasIncompleteTranslations(
  translations?: TranslationInput
): boolean {
  const completedCount = getTranslationCompletionCount(translations);
  return completedCount > 0 && completedCount < SUPPORTED_LOCALES.length;
}

/**
 * Get translation completion percentage (0-100)
 * Supports both array and map formats from API
 */
export function getTranslationCompletionPercentage(
  translations?: TranslationInput
): number {
  const completedCount = getTranslationCompletionCount(translations);
  return Math.round((completedCount / SUPPORTED_LOCALES.length) * 100);
}

/**
 * Check if a specific locale has a translation
 * Supports both array and map formats from API
 */
export function hasTranslationForLocale(
  locale: SupportedLocale,
  translations?: TranslationInput
): boolean {
  if (!translations) return false;
  const translation = getTranslationForLocale(translations, locale);
  return Boolean(translation?.name?.trim());
}
