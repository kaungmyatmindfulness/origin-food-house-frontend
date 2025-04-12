import { apiFetch } from '@/utils/apiFetch';
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

  if (res.data == null) {
    throw new Error('Failed to retrieve categories: No data returned by API.');
  }

  return res.data;
}

export async function createCategory(
  storeId: string,
  data: CreateCategoryDto
): Promise<unknown> {
  const res = await apiFetch<unknown>(
    {
      path: CATEGORY_ENDPOINT,
      query: { storeId },
    },
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );

  return res.data;
}

export async function updateCategory(
  storeId: string,
  categoryId: string,
  data: UpdateCategoryDto
): Promise<unknown> {
  const res = await apiFetch<unknown>(
    {
      path: `${CATEGORY_ENDPOINT}/${categoryId}`,
      query: { storeId },
    },
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    }
  );

  if (res.data == null) {
    throw new Error('Failed to update category: No data returned by API.');
  }

  return res.data;
}

export async function deleteCategory(
  storeId: string,
  categoryId: string
): Promise<unknown> {
  const res = await apiFetch<unknown>(
    {
      path: `${CATEGORY_ENDPOINT}/${categoryId}`,
      query: { storeId },
    },
    {
      method: 'DELETE',
    }
  );

  if (res.data == null) {
    throw new Error('Failed to delete category: No data returned by API.');
  }

  return res.data;
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
