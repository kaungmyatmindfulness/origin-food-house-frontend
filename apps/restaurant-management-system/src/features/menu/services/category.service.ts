import {
  categoryControllerFindAll,
  categoryControllerCreate,
  categoryControllerUpdate,
  categoryControllerRemove,
  categoryControllerSortCategories,
} from '@repo/api/generated';
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
 * @throws {NetworkError | ApiError} - Throws on fetch/API errors. Throws Error if data is null on success.
 */
export async function getCategories(storeId: string): Promise<Category[]> {
  const response = await categoryControllerFindAll({
    path: {
      storeId,
    },
  });

  if (!response.data?.data) {
    throw new Error('Failed to retrieve categories: No data returned by API.');
  }

  return response.data.data as Category[];
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
  const response = await categoryControllerCreate({
    path: {
      storeId,
    },
    body: data,
  });

  if (!response.data?.data) {
    throw new Error('Failed to create category: No data returned by API.');
  }

  return response.data.data as Category;
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
  const response = await categoryControllerUpdate({
    path: {
      storeId,
      id: categoryId,
    },
    body: data,
  });

  if (!response.data?.data) {
    throw new Error('Failed to update category: No data returned by API.');
  }

  return response.data.data as Category;
}

/**
 * Deletes a category.
 *
 * @param storeId - The ID of the store.
 * @param categoryId - The ID of the category to delete.
 * @returns A promise resolving to the deleted category's ID.
 * @throws {NetworkError | ApiError} - Throws on fetch/API errors.
 */
export async function deleteCategory(
  storeId: string,
  categoryId: string
): Promise<{ id: string }> {
  const response = await categoryControllerRemove({
    path: {
      storeId,
      id: categoryId,
    },
  });

  if (!response.data?.data) {
    throw new Error('Failed to delete category: No data returned by API.');
  }

  return response.data.data;
}

/**
 * Updates the sort order of categories and their contained menu items for a store.
 * Requires OWNER/ADMIN permissions.
 * Maps to: PATCH /stores/{storeId}/categories/sort
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
  await categoryControllerSortCategories({
    path: {
      storeId,
    },
    body: payload,
  });
}
