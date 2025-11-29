/**
 * Menu Item Types
 *
 * Re-exports auto-generated types from @repo/api and provides
 * frontend-specific utility types for translations.
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
  TranslationWithDescriptionResponseDto,
  BaseTranslationDto,
  BaseTranslationResponseDto,
  TranslationWithDescriptionDto,
} from '@repo/api/generated/types';

// Re-export helper types from centralized utilities
export type { SupportedLocale, TranslationMap } from '@/common/types/api-type-fixes';

/**
 * Base translation structure (name only).
 * Used for frontend translation utilities.
 */
export interface BaseTranslation {
  locale: 'en' | 'zh' | 'my' | 'th';
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
 * Lightweight menu item type with categoryId instead of nested category.
 * Used for list views where the full category object isn't needed.
 */
export interface MenuItem {
  id: string;
  name: string;
  /** Item description */
  description?: string | null;
  basePrice: string;
  /** Base S3 path for image */
  imagePath?: string | null;
  categoryId: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
  isOutOfStock?: boolean;
  translations?: Record<string, TranslationWithDescription>;
}
