import { apiFetch } from '@/utils/apiFetch';
import {
  Category,
  CreateCategoryDto,
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
export async function getCategories(storeId: number): Promise<Category[]> {
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
  storeId: number,
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
  storeId: number,
  categoryId: number,
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
  storeId: number,
  categoryId: number
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
