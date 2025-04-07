import { apiFetch } from '@/utils/apiFetch';
import { Category } from '../types/category.types';

const CATEGORY_ENDPOINT = '/categories';

/**
 * Retrieves categories for a specific store.
 *
 * @param storeId - The ID of the store whose categories are to be fetched.
 * @returns A promise resolving to an array of Category objects.
 * @throws {NetworkError | ApiError} - Throws on fetch/API errors. Throws Error if data is null on success.
 */
export async function getCategories(storeId: number): Promise<Category[]> {
  const params = new URLSearchParams({ storeId: String(storeId) });
  const url = `${CATEGORY_ENDPOINT}?${params.toString()}`;

  const res = await apiFetch<Category[]>(url);

  if (res.data == null) {
    throw new Error('Failed to retrieve categories: No data returned by API.');
  }

  return res.data;
}
