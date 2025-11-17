import {
  getTranslatedName,
  getTranslatedDescription,
  hasTranslation,
  getTranslationCompleteness,
  getMissingLocales,
  isUsingFallback,
} from './translation.util';
import type {
  SupportedLocale,
  TranslationMap,
  BaseTranslation,
  TranslationWithDescription,
} from '../types/menu-item.types';

describe('Translation Utilities', () => {
  describe('getTranslatedName', () => {
    const defaultName = 'Pad Thai';
    const translations: TranslationMap<BaseTranslation> = {
      en: { locale: 'en', name: 'Pad Thai' },
      th: { locale: 'th', name: 'ผัดไทย' },
      zh: { locale: 'zh', name: '泰式炒河粉' },
    };

    it('should return translated name for requested locale', () => {
      const result = getTranslatedName(defaultName, translations, 'th');
      expect(result).toBe('ผัดไทย');
    });

    it('should return default name if no locale provided', () => {
      const result = getTranslatedName(defaultName, translations);
      expect(result).toBe(defaultName);
    });

    it('should return default name if translations undefined', () => {
      const result = getTranslatedName(defaultName, undefined, 'th');
      expect(result).toBe(defaultName);
    });

    it('should fallback to store primary locale if requested not found', () => {
      const result = getTranslatedName(defaultName, translations, 'my', 'th');
      expect(result).toBe('ผัดไทย');
    });

    it('should fallback to English if requested and primary not found', () => {
      const result = getTranslatedName(defaultName, translations, 'my', 'my');
      expect(result).toBe('Pad Thai');
    });

    it('should fallback to default if all translations missing', () => {
      const emptyTranslations: TranslationMap<BaseTranslation> = {};
      const result = getTranslatedName(defaultName, emptyTranslations, 'th');
      expect(result).toBe(defaultName);
    });
  });

  describe('getTranslatedDescription', () => {
    const defaultDescription = 'Thai stir-fried noodles';
    const translations: TranslationMap<TranslationWithDescription> = {
      en: {
        locale: 'en',
        name: 'Pad Thai',
        description: 'Thai stir-fried noodles',
      },
      th: { locale: 'th', name: 'ผัดไทย', description: 'ก๋วยเตี๋ยวผัดไทย' },
    };

    it('should return translated description for requested locale', () => {
      const result = getTranslatedDescription(
        defaultDescription,
        translations,
        'th'
      );
      expect(result).toBe('ก๋วยเตี๋ยวผัดไทย');
    });

    it('should handle null descriptions', () => {
      const translationsWithNull: TranslationMap<TranslationWithDescription> = {
        en: { locale: 'en', name: 'Item', description: null },
      };
      const result = getTranslatedDescription(
        'Default',
        translationsWithNull,
        'en'
      );
      expect(result).toBeNull();
    });

    it('should return default description if no locale provided', () => {
      const result = getTranslatedDescription(defaultDescription, translations);
      expect(result).toBe(defaultDescription);
    });

    it('should fallback to English if requested locale not found', () => {
      const result = getTranslatedDescription(
        defaultDescription,
        translations,
        'my'
      );
      expect(result).toBe('Thai stir-fried noodles');
    });
  });

  describe('hasTranslation', () => {
    const translations: TranslationMap<BaseTranslation> = {
      en: { locale: 'en', name: 'Appetizers' },
      th: { locale: 'th', name: 'อาหารว่าง' },
    };

    it('should return true if translation exists', () => {
      expect(hasTranslation(translations, 'th')).toBe(true);
    });

    it('should return false if translation does not exist', () => {
      expect(hasTranslation(translations, 'my')).toBe(false);
    });

    it('should return false if translations undefined', () => {
      expect(hasTranslation(undefined, 'th')).toBe(false);
    });

    it('should return false if locale undefined', () => {
      expect(hasTranslation(translations, undefined)).toBe(false);
    });

    it('should return false if translation name is empty', () => {
      const badTranslations: TranslationMap<BaseTranslation> = {
        th: { locale: 'th', name: '' },
      };
      expect(hasTranslation(badTranslations, 'th')).toBe(false);
    });
  });

  describe('getTranslationCompleteness', () => {
    it('should return 100% for fully translated entity', () => {
      const translations: TranslationMap<BaseTranslation> = {
        en: { locale: 'en', name: 'Item' },
        zh: { locale: 'zh', name: '项目' },
        my: { locale: 'my', name: 'အရာ' },
        th: { locale: 'th', name: 'รายการ' },
      };
      const enabledLocales: SupportedLocale[] = ['en', 'zh', 'my', 'th'];

      expect(getTranslationCompleteness(translations, enabledLocales)).toBe(
        100
      );
    });

    it('should return 50% for half-translated entity', () => {
      const translations: TranslationMap<BaseTranslation> = {
        en: { locale: 'en', name: 'Item' },
        th: { locale: 'th', name: 'รายการ' },
      };
      const enabledLocales: SupportedLocale[] = ['en', 'zh', 'my', 'th'];

      expect(getTranslationCompleteness(translations, enabledLocales)).toBe(50);
    });

    it('should return 0% if no translations', () => {
      const translations: TranslationMap<BaseTranslation> = {};
      const enabledLocales: SupportedLocale[] = ['en', 'zh', 'my', 'th'];

      expect(getTranslationCompleteness(translations, enabledLocales)).toBe(0);
    });

    it('should return 0% if translations undefined', () => {
      const enabledLocales: SupportedLocale[] = ['en', 'zh', 'my', 'th'];

      expect(getTranslationCompleteness(undefined, enabledLocales)).toBe(0);
    });

    it('should handle single enabled locale', () => {
      const translations: TranslationMap<BaseTranslation> = {
        en: { locale: 'en', name: 'Item' },
      };
      const enabledLocales: SupportedLocale[] = ['en'];

      expect(getTranslationCompleteness(translations, enabledLocales)).toBe(
        100
      );
    });
  });

  describe('getMissingLocales', () => {
    it('should return locales without translations', () => {
      const translations: TranslationMap<BaseTranslation> = {
        en: { locale: 'en', name: 'Item' },
        th: { locale: 'th', name: 'รายการ' },
      };
      const enabledLocales: SupportedLocale[] = ['en', 'zh', 'my', 'th'];

      const missing = getMissingLocales(translations, enabledLocales);
      expect(missing).toEqual(['zh', 'my']);
    });

    it('should return all locales if no translations', () => {
      const enabledLocales: SupportedLocale[] = ['en', 'zh', 'my', 'th'];

      const missing = getMissingLocales(undefined, enabledLocales);
      expect(missing).toEqual(enabledLocales);
    });

    it('should return empty array if all translated', () => {
      const translations: TranslationMap<BaseTranslation> = {
        en: { locale: 'en', name: 'Item' },
        zh: { locale: 'zh', name: '项目' },
        my: { locale: 'my', name: 'အရာ' },
        th: { locale: 'th', name: 'รายการ' },
      };
      const enabledLocales: SupportedLocale[] = ['en', 'zh', 'my', 'th'];

      const missing = getMissingLocales(translations, enabledLocales);
      expect(missing).toEqual([]);
    });
  });

  describe('isUsingFallback', () => {
    const translations: TranslationMap<BaseTranslation> = {
      en: { locale: 'en', name: 'Appetizers' },
      th: { locale: 'th', name: 'อาหารว่าง' },
    };

    it('should return false if translation exists for requested locale', () => {
      expect(isUsingFallback(translations, 'th')).toBe(false);
    });

    it('should return true if translation missing for requested locale', () => {
      expect(isUsingFallback(translations, 'my')).toBe(true);
    });

    it('should return false if no locale provided', () => {
      expect(isUsingFallback(translations, undefined)).toBe(false);
    });

    it('should return false if translations undefined', () => {
      expect(isUsingFallback(undefined, 'th')).toBe(false);
    });
  });
});
