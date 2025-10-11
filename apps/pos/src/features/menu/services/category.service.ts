import { apiFetch, unwrapData } from '@/utils/apiFetch';
import {
  Category,
  CreateCategoryDto,
  SortCategoriesPayloadDto,
  UpdateCategoryDto,
} from '../types/category.types';

const CATEGORY_ENDPOINT = '/categories';

/**
 * Retrieves categories for a specific store.
 *
 * @param storeId - The ID of the store whose categories are to be fetched.
 * @returns A promise resolving to an array of Category objects.
 * @throws {NetworkError | ApiError} - Throws on fetch/API errors. Throws Error if data is null on success.
 */
export async function getCategories(storeId: string): Promise<Category[]> {
  const res = await apiFetch<Category[]>({
    path: CATEGORY_ENDPOINT,
    query: {
      storeId,
    },
  });

  return unwrapData(res, 'Failed to retrieve categories: No data returned by API.');
}

/**
 * Creates a new category for a specific store.
 *
 * @param storeId - The ID of the store.
 * @param data - The category data to create.
 * @returns A promise resolving to the created Category object.
 * @throws {NetworkError | ApiError} - Throws on fetch/API errors.
 */
export async function createCategory(
  storeId: string,
  data: CreateCategoryDto
): Promise<Category> {
  const res = await apiFetch<Category>(
    {
      path: CATEGORY_ENDPOINT,
      query: { storeId },
    },
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );

  return unwrapData(res, 'Failed to create category: No data returned by API.');
}

/**
 * Updates an existing category.
 *
 * @param storeId - The ID of the store.
 * @param categoryId - The ID of the category to update.
 * @param data - The updated category data.
 * @returns A promise resolving to the updated Category object.
 * @throws {NetworkError | ApiError} - Throws on fetch/API errors.
 */
export async function updateCategory(
  storeId: string,
  categoryId: string,
  data: UpdateCategoryDto
): Promise<Category> {
  const res = await apiFetch<Category>(
    {
      path: `${CATEGORY_ENDPOINT}/${categoryId}`,
      query: { storeId },
    },
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    }
  );

  return unwrapData(res, 'Failed to update category: No data returned by API.');
}

/**
 * Deletes a category.
 *
 * @param storeId - The ID of the store.
 * @param categoryId - The ID of the category to delete.
 * @returns A promise resolving to the deleted Category object.
 * @throws {NetworkError | ApiError} - Throws on fetch/API errors.
 */
export async function deleteCategory(
  storeId: string,
  categoryId: string
): Promise<Category> {
  const res = await apiFetch<Category>(
    {
      path: `${CATEGORY_ENDPOINT}/${categoryId}`,
      query: { storeId },
    },
    {
      method: 'DELETE',
    }
  );

  return unwrapData(res, 'Failed to delete category: No data returned by API.');
}

/**
 * Updates the sort order of categories and their contained menu items for a store.
 * Requires OWNER/ADMIN permissions.
 * Maps to: PATCH /categories/sort?storeId={storeId}
 *
 * @param storeId - The ID of the store whose categories are being sorted.
 * @param payload - The sorting payload containing the ordered list of categories and items.
 * @returns A promise resolving to void upon successful reordering.
 * @throws {NetworkError | ApiError | UnauthorizedError | ForbiddenError} - Throws on fetch/API errors (e.g., invalid payload, permissions).
 */
export async function sortCategories(
  storeId: string,
  payload: SortCategoriesPayloadDto
): Promise<void> {
  await apiFetch<unknown>(
    {
      path: `${CATEGORY_ENDPOINT}/sort`,
      query: { storeId },
    },
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  );
}
