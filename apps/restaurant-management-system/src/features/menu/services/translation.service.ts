/**
 * Translation Service
 *
 * Service layer for translation-related API operations.
 * Note: Uses raw fetch for translation endpoints not in OpenAPI spec.
 */

import { z } from 'zod';

import { ApiError } from '@/utils/apiFetch';
import type {
  UpdateMenuItemTranslationsDto,
  UpdateCategoryTranslationsDto,
  UpdateCustomizationGroupTranslationsDto,
  UpdateCustomizationOptionTranslationsDto,
  BaseTranslationDto,
  TranslationWithDescriptionDto,
} from '@repo/api/generated/types';

/** Supported locale codes */
type SupportedLocale = 'en' | 'zh' | 'my' | 'th';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

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
 * Validates menu item translations before API call.
 */
function validateMenuItemTranslations(
  translations: TranslationWithDescriptionDto[]
): void {
  const schema = z.array(menuItemTranslationSchema).min(1);
  schema.parse(translations);
}

/**
 * Validates base translations before API call.
 */
function validateBaseTranslations(translations: BaseTranslationDto[]): void {
  const schema = z.array(baseTranslationSchema).min(1);
  schema.parse(translations);
}

/**
 * Updates menu item translations.
 *
 * @param itemId - The ID of the menu item
 * @param storeId - The ID of the store
 * @param translations - Array of translation objects
 * @throws {ApiError} If the request fails
 */
export async function updateMenuItemTranslations(
  itemId: string,
  storeId: string,
  translations: TranslationWithDescriptionDto[]
): Promise<void> {
  validateMenuItemTranslations(translations);

  const body: UpdateMenuItemTranslationsDto = { translations };

  const response = await fetch(
    `${baseUrl}/menu-items/${itemId}/translations?storeId=${storeId}`,
    {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throw new ApiError(
      'Failed to update menu item translations',
      response.status
    );
  }
}

/**
 * Deletes a specific menu item translation.
 *
 * @param itemId - The ID of the menu item
 * @param storeId - The ID of the store
 * @param locale - The locale to delete
 * @throws {ApiError} If the request fails
 */
export async function deleteMenuItemTranslation(
  itemId: string,
  storeId: string,
  locale: SupportedLocale
): Promise<void> {
  const response = await fetch(
    `${baseUrl}/menu-items/${itemId}/translations/${locale}?storeId=${storeId}`,
    {
      method: 'DELETE',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new ApiError(
      'Failed to delete menu item translation',
      response.status
    );
  }
}

/**
 * Updates category translations.
 *
 * @param categoryId - The ID of the category
 * @param storeId - The ID of the store
 * @param translations - Array of translation objects
 * @throws {ApiError} If the request fails
 */
export async function updateCategoryTranslations(
  categoryId: string,
  storeId: string,
  translations: BaseTranslationDto[]
): Promise<void> {
  validateBaseTranslations(translations);

  const body: UpdateCategoryTranslationsDto = { translations };

  const response = await fetch(
    `${baseUrl}/categories/${categoryId}/translations?storeId=${storeId}`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throw new ApiError(
      'Failed to update category translations',
      response.status
    );
  }
}

/**
 * Deletes a specific category translation.
 *
 * @param categoryId - The ID of the category
 * @param storeId - The ID of the store
 * @param locale - The locale to delete
 * @throws {ApiError} If the request fails
 */
export async function deleteCategoryTranslation(
  categoryId: string,
  storeId: string,
  locale: SupportedLocale
): Promise<void> {
  const response = await fetch(
    `${baseUrl}/categories/${categoryId}/translations/${locale}?storeId=${storeId}`,
    {
      method: 'DELETE',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new ApiError(
      'Failed to delete category translation',
      response.status
    );
  }
}

/**
 * Updates customization group translations.
 *
 * @param groupId - The ID of the customization group
 * @param storeId - The ID of the store
 * @param translations - Array of translation objects
 * @throws {ApiError} If the request fails
 */
export async function updateCustomizationGroupTranslations(
  groupId: string,
  storeId: string,
  translations: BaseTranslationDto[]
): Promise<void> {
  validateBaseTranslations(translations);

  const body: UpdateCustomizationGroupTranslationsDto = { translations };

  const response = await fetch(
    `${baseUrl}/customizations/groups/${groupId}/translations?storeId=${storeId}`,
    {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throw new ApiError(
      'Failed to update customization group translations',
      response.status
    );
  }
}

/**
 * Updates customization option translations.
 *
 * @param optionId - The ID of the customization option
 * @param storeId - The ID of the store
 * @param translations - Array of translation objects
 * @throws {ApiError} If the request fails
 */
export async function updateCustomizationOptionTranslations(
  optionId: string,
  storeId: string,
  translations: BaseTranslationDto[]
): Promise<void> {
  validateBaseTranslations(translations);

  const body: UpdateCustomizationOptionTranslationsDto = { translations };

  const response = await fetch(
    `${baseUrl}/customizations/options/${optionId}/translations?storeId=${storeId}`,
    {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throw new ApiError(
      'Failed to update customization option translations',
      response.status
    );
  }
}
