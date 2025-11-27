/**
 * Menu Item Types
 *
 * Re-exports auto-generated types from @repo/api and provides
 * frontend-specific utility types for translations.
 */

// Re-export all menu item-related types from auto-generated schemas
export type {
  MenuItemResponseDto,
  MenuItemNestedResponseDto,
  MenuItemDeletedResponseDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,
  PatchMenuItemDto,
  SortMenuItemDto,
  MenuCategoryDto,
  MenuCustomizationGroupDto,
  MenuCustomizationOptionDto,
  CustomizationGroupResponseDto,
  CustomizationOptionResponseDto,
  UpsertCustomizationGroupDto,
  UpsertCustomizationOptionDto,
  UpdateMenuItemTranslationsDto,
  UpdateCustomizationGroupTranslationsDto,
  UpdateCustomizationOptionTranslationsDto,
} from '@repo/api/generated/types';

// Re-export translation DTOs from auto-generated schemas
export type {
  BaseTranslationDto,
  BaseTranslationResponseDto,
  TranslationWithDescriptionDto,
  TranslationWithDescriptionResponseDto,
} from '@repo/api/generated/types';

/**
 * Supported locales in the application.
 * Matches the backend's supported locales enum.
 */
export type SupportedLocale = 'en' | 'zh' | 'my' | 'th';

/**
 * Base translation structure (name only).
 * Used for frontend translation utilities.
 */
export interface BaseTranslation {
  locale: SupportedLocale;
  name: string;
}

/**
 * Translation with description (for menu items).
 * Used for frontend translation utilities.
 */
export interface TranslationWithDescription extends BaseTranslation {
  description?: string | null;
}

/**
 * Translation map type for client-side locale lookup.
 * Converts backend's array format to a map for easier access.
 *
 * @example
 * // Convert API array to map
 * const map = translations.reduce((acc, t) => ({ ...acc, [t.locale]: t }), {});
 * // Access by locale
 * const thaiName = map.th?.name;
 */
export type TranslationMap<T = BaseTranslation> = Partial<
  Record<SupportedLocale, T>
>;

/**
 * Alias for MenuItemResponseDto.
 * Used for backward compatibility in existing code.
 *
 * @deprecated Prefer using MenuItemResponseDto directly from @repo/api/generated/types
 */
export type MenuItemDto = import('@repo/api/generated/types').MenuItemResponseDto;

/**
 * Lightweight menu item type with categoryId instead of nested category.
 * Used for list views where the full category object isn't needed.
 *
 * @deprecated Consider using MenuItemResponseDto and accessing category.id
 */
export interface MenuItem {
  id: string;
  name: string;
  description?: string | null;
  basePrice: string;
  imagePath?: string | null;
  categoryId: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
  isOutOfStock?: boolean;
  translations?: TranslationMap<TranslationWithDescription>;
}
