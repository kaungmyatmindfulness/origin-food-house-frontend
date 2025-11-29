/**
 * Category Service
 *
 * Service layer for category-related API operations.
 * Uses openapi-fetch for type-safe API calls with auto-generated types.
 */

import { apiClient, ApiError, unwrapApiResponse } from '@/utils/apiFetch';
import type {
  CategoryResponseDto,
  CategoryBasicResponseDto,
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
  const result = await apiClient.GET('/stores/{storeId}/categories', {
    params: { path: { storeId } },
  });

  return unwrapApiResponse(result, 'Failed to retrieve categories');
}

/**
 * Creates a new category for a specific store.
 *
 * @param storeId - The ID of the store
 * @param categoryData - The category data to create
 * @returns The created category (basic response without menuItems)
 * @throws {ApiError} If the request fails
 */
export async function createCategory(
  storeId: string,
  categoryData: CreateCategoryDto
): Promise<CategoryBasicResponseDto> {
  const result = await apiClient.POST('/stores/{storeId}/categories', {
    params: { path: { storeId } },
    body: categoryData,
  });

  return unwrapApiResponse(result, 'Failed to create category');
}

/**
 * Updates an existing category.
 *
 * @param storeId - The ID of the store
 * @param categoryId - The ID of the category to update
 * @param categoryData - The updated category data
 * @returns The updated category (basic response without menuItems)
 * @throws {ApiError} If the request fails
 */
export async function updateCategory(
  storeId: string,
  categoryId: string,
  categoryData: UpdateCategoryDto
): Promise<CategoryBasicResponseDto> {
  const result = await apiClient.PATCH('/stores/{storeId}/categories/{id}', {
    params: { path: { storeId, id: categoryId } },
    body: categoryData,
  });

  return unwrapApiResponse(result, 'Failed to update category');
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

  if (error) {
    throw new ApiError('Failed to delete category', response.status);
  }

  // API returns 204 No Content on success, but backend may return data
  // Return the categoryId as the deleted ID
  const responseData = data as { data?: { id: string } } | undefined;
  return responseData?.data ?? { id: categoryId };
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
