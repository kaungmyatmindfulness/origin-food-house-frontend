/**
 * Category Types
 *
 * Re-exports auto-generated types from @repo/api for categories.
 * Extends MenuItemNestedResponseDto with isOutOfStock field that the API returns
 * but is missing from the OpenAPI spec.
 *
 * TODO: Update backend OpenAPI spec to include isOutOfStock in MenuItemNestedResponseDto
 * Once the backend spec is updated and types regenerated, these extensions can be removed.
 */

import type {
  CategoryResponseDto as GeneratedCategoryResponseDto,
  MenuItemNestedResponseDto as GeneratedMenuItemNestedResponseDto,
} from '@repo/api/generated/types';

// Re-export category-related types from auto-generated schemas
export type {
  CategoryBasicResponseDto,
  CategoryDeletedResponseDto,
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
export type {
  SupportedLocale,
  TranslationMap,
} from '@/common/types/api-type-fixes';

/**
 * Extended MenuItemNestedResponseDto with isOutOfStock field.
 *
 * The generated type from OpenAPI spec is missing isOutOfStock but the API returns it.
 * This extension adds the missing field for type safety.
 *
 * TODO: Remove this extension once backend OpenAPI spec includes isOutOfStock
 * in MenuItemNestedResponseDto and types are regenerated.
 */
export interface MenuItemNestedResponseDto
  extends GeneratedMenuItemNestedResponseDto {
  /** Whether the item is out of stock (returned by API but missing from OpenAPI spec) */
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
