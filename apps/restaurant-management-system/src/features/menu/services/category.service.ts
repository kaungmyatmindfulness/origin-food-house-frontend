/**
 * Category Service
 *
 * Service layer for category-related API operations.
 * Uses openapi-fetch for type-safe API calls.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import type {
  Category,
  CreateCategoryDto,
  SortCategoriesPayloadDto,
  UpdateCategoryDto,
} from '../types/category.types';

/**
 * Retrieves categories for a specific store.
 *
 * @param storeId - The ID of the store whose categories are to be fetched.
 * @returns A promise resolving to an array of Category objects.
 * @throws {ApiError} - Throws on fetch/API errors.
 */
export async function getCategories(storeId: string): Promise<Category[]> {
  const { data, error, response } = await apiClient.GET(
    '/stores/{storeId}/categories',
    {
      params: { path: { storeId } },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to retrieve categories',
      response.status
    );
  }

  return data.data as Category[];
}

/**
 * Creates a new category for a specific store.
 *
 * @param storeId - The ID of the store.
 * @param categoryData - The category data to create.
 * @returns A promise resolving to the created Category object.
 * @throws {ApiError} - Throws on fetch/API errors.
 */
export async function createCategory(
  storeId: string,
  categoryData: CreateCategoryDto
): Promise<Category> {
  const { data, error, response } = await apiClient.POST(
    '/stores/{storeId}/categories',
    {
      params: { path: { storeId } },
      body: categoryData,
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to create category',
      response.status
    );
  }

  return data.data as Category;
}

/**
 * Updates an existing category.
 *
 * @param storeId - The ID of the store.
 * @param categoryId - The ID of the category to update.
 * @param categoryData - The updated category data.
 * @returns A promise resolving to the updated Category object.
 * @throws {ApiError} - Throws on fetch/API errors.
 */
export async function updateCategory(
  storeId: string,
  categoryId: string,
  categoryData: UpdateCategoryDto
): Promise<Category> {
  const { data, error, response } = await apiClient.PATCH(
    '/stores/{storeId}/categories/{id}',
    {
      params: { path: { storeId, id: categoryId } },
      body: categoryData,
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to update category',
      response.status
    );
  }

  return data.data as Category;
}

/**
 * Deletes a category.
 *
 * @param storeId - The ID of the store.
 * @param categoryId - The ID of the category to delete.
 * @returns A promise resolving to the deleted category's ID.
 * @throws {ApiError} - Throws on fetch/API errors.
 */
export async function deleteCategory(
  storeId: string,
  categoryId: string
): Promise<{ id: string }> {
  const { data, error, response } = await apiClient.DELETE(
    '/stores/{storeId}/categories/{id}',
    {
      params: { path: { storeId, id: categoryId } },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to delete category',
      response.status
    );
  }

  return data.data as { id: string };
}

/**
 * Updates the sort order of categories and their contained menu items for a store.
 * Requires OWNER/ADMIN permissions.
 *
 * @param storeId - The ID of the store whose categories are being sorted.
 * @param payload - The sorting payload containing the ordered list of categories and items.
 * @returns A promise resolving to void upon successful reordering.
 * @throws {ApiError} - Throws on fetch/API errors (e.g., invalid payload, permissions).
 */
export async function sortCategories(
  storeId: string,
  payload: SortCategoriesPayloadDto
): Promise<void> {
  const { error, response } = await apiClient.PATCH(
    '/stores/{storeId}/categories/sort',
    {
      params: { path: { storeId } },
      body: payload,
    }
  );

  if (error) {
    throw new ApiError('Failed to sort categories', response.status);
  }
}
