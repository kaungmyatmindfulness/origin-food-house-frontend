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
  CreateCategoryDto,
  UpdateCategoryDto,
  SortCategoryDto,
  SortCategoriesPayloadDto,
  SortMenuItemDto,
  UpsertCategoryDto,
} from '@repo/api/generated/types';

// Re-export translation types from menu-item.types for consistency
export type {
  SupportedLocale,
  BaseTranslation,
  TranslationMap,
} from './menu-item.types';

/**
 * Extended MenuItemNestedResponseDto with isOutOfStock field.
 * The generated type doesn't include isOutOfStock but the API returns it.
 * Also fixes the description type from Record<string, never> to string.
 */
export interface MenuItemNestedResponseDto
  extends Omit<GeneratedMenuItemNestedResponseDto, 'description' | 'imagePath'> {
  description?: string | null;
  imagePath?: string | null;
  isOutOfStock?: boolean;
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
