/**
 * Menu Item Service
 *
 * Service layer for menu item-related API operations.
 * Uses openapi-fetch for type-safe API calls with auto-generated types.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import type {
  MenuItemResponseDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,
  PatchMenuItemDto,
  MenuItemDeletedResponseDto,
} from '@repo/api/generated/types';

/**
 * Retrieves all menu items for a specific store.
 *
 * @param storeId - The ID of the store
 * @returns Array of menu items
 * @throws {ApiError} If the request fails
 */
export async function getStoreMenuItems(
  storeId: string
): Promise<MenuItemResponseDto[]> {
  const { data, error, response } = await apiClient.GET(
    '/stores/{storeId}/menu-items',
    {
      params: { path: { storeId } },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to retrieve menu items',
      response.status
    );
  }

  return data.data;
}

/**
 * Creates a new menu item for a specific store.
 *
 * @param storeId - The ID of the store
 * @param itemData - The menu item data to create
 * @returns The created menu item ID
 * @throws {ApiError} If the request fails
 */
export async function createMenuItem(
  storeId: string,
  itemData: CreateMenuItemDto
): Promise<string> {
  const { data, error, response } = await apiClient.POST(
    '/stores/{storeId}/menu-items',
    {
      params: { path: { storeId } },
      body: itemData,
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to create menu item',
      response.status
    );
  }

  return data.data as string;
}

/**
 * Retrieves a specific menu item by ID.
 *
 * @param storeId - The ID of the store
 * @param id - The ID of the menu item
 * @returns The menu item details
 * @throws {ApiError} If the request fails
 */
export async function getMenuItemById(
  storeId: string,
  id: string
): Promise<MenuItemResponseDto> {
  const { data, error, response } = await apiClient.GET(
    '/stores/{storeId}/menu-items/{id}',
    {
      params: { path: { storeId, id } },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || `Menu item ${id} not found`,
      response.status
    );
  }

  return data.data;
}

/**
 * Updates an existing menu item.
 *
 * @param storeId - The ID of the store
 * @param id - The ID of the menu item to update
 * @param itemData - The updated menu item data
 * @returns The updated menu item
 * @throws {ApiError} If the request fails
 */
export async function updateMenuItem(
  storeId: string,
  id: string,
  itemData: UpdateMenuItemDto
): Promise<MenuItemResponseDto> {
  const { data, error, response } = await apiClient.PUT(
    '/stores/{storeId}/menu-items/{id}',
    {
      params: { path: { storeId, id } },
      body: itemData,
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || `Failed to update menu item ${id}`,
      response.status
    );
  }

  return data.data;
}

/**
 * Deletes a menu item.
 *
 * @param storeId - The ID of the store
 * @param id - The ID of the menu item to delete
 * @returns The deleted menu item response
 * @throws {ApiError} If the request fails
 */
export async function deleteMenuItem(
  storeId: string,
  id: string
): Promise<MenuItemDeletedResponseDto> {
  const { data, error, response } = await apiClient.DELETE(
    '/stores/{storeId}/menu-items/{id}',
    {
      params: { path: { storeId, id } },
    }
  );

  if (error) {
    throw new ApiError(
      `Failed to delete menu item ${id}`,
      response?.status ?? 500
    );
  }

  return data?.data as MenuItemDeletedResponseDto;
}

/**
 * Toggles the out-of-stock status of a menu item.
 *
 * @param storeId - The ID of the store
 * @param id - The ID of the menu item
 * @param isOutOfStock - The new out-of-stock status
 * @returns The updated menu item
 * @throws {ApiError} If the request fails
 */
export async function toggleMenuItemOutOfStock(
  storeId: string,
  id: string,
  isOutOfStock: boolean
): Promise<MenuItemResponseDto> {
  const patchData: PatchMenuItemDto = { isOutOfStock };

  const { data, error, response } = await apiClient.PATCH(
    '/stores/{storeId}/menu-items/{id}',
    {
      params: { path: { storeId, id } },
      body: patchData,
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || `Failed to toggle out-of-stock status for item ${id}`,
      response.status
    );
  }

  return data.data;
}
