import type {
  SupportedLocale,
  TranslationMap,
  BaseTranslation,
  TranslationWithDescription,
} from '../types/menu-item.types';

/**
 * Get translated name with fallback logic
 * Priority: requested locale → store primary → English → original
 */
export function getTranslatedName(
  defaultName: string,
  translations?: TranslationMap<BaseTranslation>,
  locale?: SupportedLocale,
  storePrimaryLocale: SupportedLocale = 'en'
): string {
  if (!locale || !translations) {
    return defaultName;
  }

  // Try requested locale
  if (translations[locale]?.name) {
    return translations[locale]!.name;
  }

  // Try store primary locale
  if (locale !== storePrimaryLocale && translations[storePrimaryLocale]?.name) {
    return translations[storePrimaryLocale]!.name;
  }

  // Try English
  if (locale !== 'en' && storePrimaryLocale !== 'en' && translations.en?.name) {
    return translations.en.name;
  }

  // Fall back to default
  return defaultName;
}

/**
 * Get translated description with fallback logic
 * Priority: requested locale → store primary → English → original
 */
export function getTranslatedDescription(
  defaultDescription: string | null | undefined,
  translations?: TranslationMap<TranslationWithDescription>,
  locale?: SupportedLocale,
  storePrimaryLocale: SupportedLocale = 'en'
): string | null | undefined {
  if (!locale || !translations) {
    return defaultDescription;
  }

  // Try requested locale
  const requested = translations[locale];
  if (requested && 'description' in requested) {
    return requested.description;
  }

  // Try store primary locale
  if (locale !== storePrimaryLocale) {
    const primary = translations[storePrimaryLocale];
    if (primary && 'description' in primary) {
      return primary.description;
    }
  }

  // Try English
  if (locale !== 'en' && storePrimaryLocale !== 'en') {
    const english = translations.en;
    if (english && 'description' in english) {
      return english.description;
    }
  }

  // Fall back to default
  return defaultDescription;
}

/**
 * Check if a translation exists for a specific locale
 */
export function hasTranslation(
  translations?: TranslationMap<BaseTranslation>,
  locale?: SupportedLocale
): boolean {
  if (!locale || !translations) {
    return false;
  }

  return !!translations[locale]?.name;
}

/**
 * Calculate translation completion percentage for an entity
 */
export function getTranslationCompleteness(
  translations?: TranslationMap<BaseTranslation>,
  enabledLocales: SupportedLocale[] = ['en']
): number {
  if (!translations || enabledLocales.length === 0) {
    return 0;
  }

  const completed = enabledLocales.filter((locale) =>
    hasTranslation(translations, locale)
  ).length;

  return Math.round((completed / enabledLocales.length) * 100);
}

/**
 * Get missing locales for an entity
 */
export function getMissingLocales(
  translations?: TranslationMap<BaseTranslation>,
  enabledLocales: SupportedLocale[] = ['en', 'zh', 'my', 'th']
): SupportedLocale[] {
  if (!translations) {
    return enabledLocales;
  }

  return enabledLocales.filter(
    (locale) => !hasTranslation(translations, locale)
  );
}

/**
 * Check if translation is using fallback (not native locale)
 */
export function isUsingFallback(
  translations?: TranslationMap<BaseTranslation>,
  requestedLocale?: SupportedLocale
): boolean {
  if (!requestedLocale || !translations) {
    return false;
  }

  return !hasTranslation(translations, requestedLocale);
}
