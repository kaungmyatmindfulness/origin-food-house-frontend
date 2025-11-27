/**
 * Category Service
 *
 * Service layer for category-related API operations.
 * Uses openapi-fetch for type-safe API calls with auto-generated types.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import type {
  CategoryResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  SortCategoriesPayloadDto,
  CategoryDeletedResponseDto,
} from '@repo/api/generated/types';

/**
 * Retrieves categories for a specific store.
 *
 * @param storeId - The ID of the store
 * @returns Array of categories
 * @throws {ApiError} If the request fails
 */
export async function getCategories(
  storeId: string
): Promise<CategoryResponseDto[]> {
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

  return data.data;
}

/**
 * Creates a new category for a specific store.
 *
 * @param storeId - The ID of the store
 * @param categoryData - The category data to create
 * @returns The created category
 * @throws {ApiError} If the request fails
 */
export async function createCategory(
  storeId: string,
  categoryData: CreateCategoryDto
): Promise<CategoryResponseDto> {
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

  return data.data;
}

/**
 * Updates an existing category.
 *
 * @param storeId - The ID of the store
 * @param categoryId - The ID of the category to update
 * @param categoryData - The updated category data
 * @returns The updated category
 * @throws {ApiError} If the request fails
 */
export async function updateCategory(
  storeId: string,
  categoryId: string,
  categoryData: UpdateCategoryDto
): Promise<CategoryResponseDto> {
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

  return data.data;
}

/**
 * Deletes a category.
 *
 * @param storeId - The ID of the store
 * @param categoryId - The ID of the category to delete
 * @returns The deleted category ID
 * @throws {ApiError} If the request fails
 */
export async function deleteCategory(
  storeId: string,
  categoryId: string
): Promise<CategoryDeletedResponseDto> {
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

  return data.data;
}

/**
 * Updates the sort order of categories and their menu items.
 *
 * @param storeId - The ID of the store
 * @param payload - The sorting payload with ordered categories
 * @throws {ApiError} If the request fails
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
    throw new ApiError('Failed to sort categories', response?.status ?? 500);
  }
}
