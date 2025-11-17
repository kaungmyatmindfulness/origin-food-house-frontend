import { apiFetch, unwrapData } from '@/utils/apiFetch';
import { z } from 'zod';

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

  const res = await apiFetch<void>(
    {
      path: `/menu-items/${itemId}/translations`,
      query: { storeId },
    },
    {
      method: 'PUT',
      body: JSON.stringify({ translations }),
    }
  );

  unwrapData(res, 'Failed to update menu item translations');
}

/**
 * Delete a specific menu item translation
 */
export async function deleteMenuItemTranslation(
  itemId: string,
  storeId: string,
  locale: SupportedLocale
): Promise<void> {
  const res = await apiFetch<void>(
    {
      path: `/menu-items/${itemId}/translations/${locale}`,
      query: { storeId },
    },
    {
      method: 'DELETE',
    }
  );

  unwrapData(res, 'Failed to delete menu item translation');
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

  const res = await apiFetch<void>(
    {
      path: `/categories/${categoryId}/translations`,
      query: { storeId },
    },
    {
      method: 'PATCH',
      body: JSON.stringify({ translations }),
    }
  );

  unwrapData(res, 'Failed to update category translations');
}

/**
 * Delete a specific category translation
 */
export async function deleteCategoryTranslation(
  categoryId: string,
  storeId: string,
  locale: SupportedLocale
): Promise<void> {
  const res = await apiFetch<void>(
    {
      path: `/categories/${categoryId}/translations/${locale}`,
      query: { storeId },
    },
    {
      method: 'DELETE',
    }
  );

  unwrapData(res, 'Failed to delete category translation');
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

  const res = await apiFetch<void>(
    {
      path: `/customizations/groups/${groupId}/translations`,
      query: { storeId },
    },
    {
      method: 'PUT',
      body: JSON.stringify({ translations }),
    }
  );

  unwrapData(res, 'Failed to update customization group translations');
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

  const res = await apiFetch<void>(
    {
      path: `/customizations/options/${optionId}/translations`,
      query: { storeId },
    },
    {
      method: 'PUT',
      body: JSON.stringify({ translations }),
    }
  );

  unwrapData(res, 'Failed to update customization option translations');
}
