/**
 * Menu Item Types
 *
 * Re-exports auto-generated types from @repo/api and provides
 * frontend-specific utility types for translations.
 *
 * NOTE: The BaseTranslation and TranslationWithDescription interfaces below
 * are NOT duplicates of the generated types. They serve a different purpose:
 *
 * - Generated types (BaseTranslationResponseDto, TranslationWithDescriptionResponseDto)
 *   are for API array format: [{locale: 'en', name: '...'}, {locale: 'zh', name: '...'}]
 *
 * - Frontend types (BaseTranslation, TranslationWithDescription) are value types
 *   for TranslationMap, where locale is the key: {en: {name: '...'}, zh: {name: '...'}}
 */

// Re-export all menu item types from auto-generated schemas
export type {
  MenuItemResponseDto,
  MenuCategoryDto,
  MenuCustomizationGroupDto,
  MenuCustomizationOptionDto,
  MenuItemNestedResponseDto,
  MenuItemDeletedResponseDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,
  PatchMenuItemDto,
  SortMenuItemDto,
  CustomizationGroupResponseDto,
  CustomizationOptionResponseDto,
  UpsertCustomizationGroupDto,
  UpsertCustomizationOptionDto,
  UpdateMenuItemTranslationsDto,
  UpdateCustomizationGroupTranslationsDto,
  UpdateCustomizationOptionTranslationsDto,
  // API array-format translation types (includes locale in value)
  TranslationWithDescriptionResponseDto,
  BaseTranslationDto,
  BaseTranslationResponseDto,
  TranslationWithDescriptionDto,
} from '@repo/api/generated/types';

// Re-export helper types from centralized utilities
export type {
  SupportedLocale,
  TranslationMap,
} from '@/common/types/api-type-fixes';

/**
 * Base translation value type for TranslationMap (name only).
 *
 * Used as the value type in TranslationMap<BaseTranslation>:
 *   { en: { name: 'English Name' }, zh: { name: 'Chinese Name' } }
 *
 * Different from BaseTranslationResponseDto which includes locale in the value
 * for API array format: [{ locale: 'en', name: '...' }]
 */
export interface BaseTranslation {
  name: string;
}

/**
 * Translation value type with description for TranslationMap.
 *
 * Used as the value type in TranslationMap<TranslationWithDescription>:
 *   { en: { name: '...', description: '...' }, zh: { name: '...', description: '...' } }
 *
 * Different from TranslationWithDescriptionResponseDto which includes locale
 * in the value for API array format.
 */
export interface TranslationWithDescription extends BaseTranslation {
  description?: string | null;
}
