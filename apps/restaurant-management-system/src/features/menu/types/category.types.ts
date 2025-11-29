/**
 * Category Types
 *
 * Re-exports auto-generated types from @repo/api for categories.
 * Provides type extensions for frontend-specific needs.
 */

import type {
  CategoryResponseDto as GeneratedCategoryResponseDto,
  MenuItemNestedResponseDto as GeneratedMenuItemNestedResponseDto,
} from '@repo/api/generated/types';

// Re-export all category-related types from auto-generated schemas
export type {
  CategoryBasicResponseDto,
  CategoryDeletedResponseDto,
  CategoryResponseDto as GeneratedCategoryResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  SortCategoryDto,
  SortCategoriesPayloadDto,
  SortMenuItemDto,
  UpsertCategoryDto,
  TranslationWithDescriptionResponseDto,
  BaseTranslationResponseDto,
} from '@repo/api/generated/types';

// Re-export helper types from centralized utilities
export type { SupportedLocale, TranslationMap } from '@/common/types/api-type-fixes';

// Re-export translation types from menu-item.types for consistency
export type { BaseTranslation } from './menu-item.types';

/**
 * Extended MenuItemNestedResponseDto with isOutOfStock field.
 * The generated type doesn't include isOutOfStock but the API returns it.
 *
 * Note: translations field remains as array format from API response.
 * Components should convert array to map format when needed using utility functions.
 */
export interface MenuItemNestedResponseDto
  extends Omit<GeneratedMenuItemNestedResponseDto, 'translations'> {
  /** Whether the item is out of stock (added by API but not in OpenAPI spec) */
  isOutOfStock?: boolean;
  /**
   * Translations for the menu item in different locales.
   * Array format from API: [{locale: 'en', name: '...', description: '...'}]
   */
  translations?: Array<{
    locale: 'en' | 'zh' | 'my' | 'th';
    name: string;
    description?: string | null;
  }>;
}

/**
 * Extended CategoryResponseDto with properly typed nested menu items.
 * Uses our extended MenuItemNestedResponseDto that includes isOutOfStock.
 */
export interface CategoryResponseDto
  extends Omit<GeneratedCategoryResponseDto, 'menuItems'> {
  menuItems: MenuItemNestedResponseDto[];
}

/**
 * Alias for CategoryResponseDto.
 * Used throughout the app for the full category object with nested menu items.
 *
 * @deprecated Prefer using CategoryResponseDto directly
 */
export type Category = CategoryResponseDto;
