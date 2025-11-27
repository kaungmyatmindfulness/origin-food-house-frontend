/**
 * Translation Service
 *
 * Service layer for translation-related API operations.
 * Uses openapi-fetch for type-safe API calls.
 */

import { z } from 'zod';

import { apiClient, ApiError } from '@/utils/apiFetch';
import type { SupportedLocale } from '../types/menu-item.types';

/**
 * Zod schema for menu item translation validation
 */
const menuItemTranslationSchema = z.object({
  locale: z.enum(['en', 'zh', 'my', 'th']),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .trim()
    .optional()
    .nullable(),
});

/**
 * Zod schema for base translation validation (name only)
 */
const baseTranslationSchema = z.object({
  locale: z.enum(['en', 'zh', 'my', 'th']),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .trim(),
});

/**
 * Translation data for menu items
 */
export interface MenuItemTranslation {
  locale: SupportedLocale;
  name: string;
  description?: string | null;
}

/**
 * Translation data for categories, groups, and options (name only)
 */
export interface BaseTranslationData {
  locale: SupportedLocale;
  name: string;
}

/**
 * Validate menu item translations
 */
function validateMenuItemTranslations(
  translations: MenuItemTranslation[]
): void {
  const schema = z.array(menuItemTranslationSchema).min(1);
  schema.parse(translations);
}

/**
 * Validate base translations
 */
function validateBaseTranslations(translations: BaseTranslationData[]): void {
  const schema = z.array(baseTranslationSchema).min(1);
  schema.parse(translations);
}

/**
 * Update menu item translations
 */
export async function updateMenuItemTranslations(
  itemId: string,
  storeId: string,
  translations: MenuItemTranslation[]
): Promise<void> {
  // Validate translations before sending to API
  validateMenuItemTranslations(translations);

  const { error, response } = await apiClient.PUT(
    '/menu-items/{itemId}/translations',
    {
      params: {
        path: { itemId },
        query: { storeId },
      },
      body: { translations },
    }
  );

  if (error) {
    throw new ApiError(
      'Failed to update menu item translations',
      response.status
    );
  }
}

/**
 * Delete a specific menu item translation
 */
export async function deleteMenuItemTranslation(
  itemId: string,
  storeId: string,
  locale: SupportedLocale
): Promise<void> {
  const { error, response } = await apiClient.DELETE(
    '/menu-items/{itemId}/translations/{locale}',
    {
      params: {
        path: { itemId, locale },
        query: { storeId },
      },
    }
  );

  if (error) {
    throw new ApiError(
      'Failed to delete menu item translation',
      response.status
    );
  }
}

/**
 * Update category translations
 */
export async function updateCategoryTranslations(
  categoryId: string,
  storeId: string,
  translations: BaseTranslationData[]
): Promise<void> {
  // Validate translations before sending to API
  validateBaseTranslations(translations);

  const { error, response } = await apiClient.PATCH(
    '/categories/{categoryId}/translations',
    {
      params: {
        path: { categoryId },
        query: { storeId },
      },
      body: { translations },
    }
  );

  if (error) {
    throw new ApiError(
      'Failed to update category translations',
      response.status
    );
  }
}

/**
 * Delete a specific category translation
 */
export async function deleteCategoryTranslation(
  categoryId: string,
  storeId: string,
  locale: SupportedLocale
): Promise<void> {
  const { error, response } = await apiClient.DELETE(
    '/categories/{categoryId}/translations/{locale}',
    {
      params: {
        path: { categoryId, locale },
        query: { storeId },
      },
    }
  );

  if (error) {
    throw new ApiError(
      'Failed to delete category translation',
      response.status
    );
  }
}

/**
 * Update customization group translations
 */
export async function updateCustomizationGroupTranslations(
  groupId: string,
  storeId: string,
  translations: BaseTranslationData[]
): Promise<void> {
  // Validate translations before sending to API
  validateBaseTranslations(translations);

  const { error, response } = await apiClient.PUT(
    '/customizations/groups/{groupId}/translations',
    {
      params: {
        path: { groupId },
        query: { storeId },
      },
      body: { translations },
    }
  );

  if (error) {
    throw new ApiError(
      'Failed to update customization group translations',
      response.status
    );
  }
}

/**
 * Update customization option translations
 */
export async function updateCustomizationOptionTranslations(
  optionId: string,
  storeId: string,
  translations: BaseTranslationData[]
): Promise<void> {
  // Validate translations before sending to API
  validateBaseTranslations(translations);

  const { error, response } = await apiClient.PUT(
    '/customizations/options/{optionId}/translations',
    {
      params: {
        path: { optionId },
        query: { storeId },
      },
      body: { translations },
    }
  );

  if (error) {
    throw new ApiError(
      'Failed to update customization option translations',
      response.status
    );
  }
}
