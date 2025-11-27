/**
 * Menu Item Service
 *
 * Service layer for menu item-related API operations.
 * Uses openapi-fetch for type-safe API calls.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import type {
  CreateMenuItemDto,
  MenuItemDto,
  UpdateMenuItemDto,
} from '../types/menu-item.types';

/**
 * Retrieves all menu items for a specific store.
 */
export async function getStoreMenuItems(
  storeId: string
): Promise<MenuItemDto[]> {
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

  return data.data as MenuItemDto[];
}

/**
 * Creates a new menu item for a specific store.
 * Returns the created item's ID.
 */
export async function createMenuItem(
  storeId: string,
  itemData: CreateMenuItemDto
): Promise<string> {
  const { data, error, response } = await apiClient.POST(
    '/stores/{storeId}/menu-items',
    {
      params: { path: { storeId } },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: itemData as any, // Type mismatch between frontend and backend
    }
  );

  if (error || !data?.data) {
    console.error(
      'API Error: createMenuItem succeeded but returned null data.'
    );
    throw new ApiError(
      data?.message || 'Failed to create menu item',
      response.status
    );
  }

  return data.data as string;
}

/**
 * Retrieves a specific menu item by ID.
 */
export async function getMenuItemById(
  storeId: string,
  id: string
): Promise<MenuItemDto> {
  const { data, error, response } = await apiClient.GET(
    '/stores/{storeId}/menu-items/{id}',
    {
      params: { path: { storeId, id } },
    }
  );

  if (error || !data?.data) {
    console.error(
      `API Error: getMenuItemById(${id}) succeeded but returned null data.`
    );
    throw new ApiError(
      data?.message || `Menu item ${id} not found`,
      response.status
    );
  }

  return data.data as MenuItemDto;
}

/**
 * Updates an existing menu item.
 */
export async function updateMenuItem(
  id: string,
  storeId: string,
  itemData: UpdateMenuItemDto
): Promise<MenuItemDto> {
  const { data, error, response } = await apiClient.PUT(
    '/stores/{storeId}/menu-items/{id}',
    {
      params: { path: { storeId, id } },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: itemData as any, // Type mismatch: local type has basePrice as string, API expects number
    }
  );

  if (error || !data?.data) {
    console.error(
      `API Error: updateMenuItem(${id}) succeeded but returned null data.`
    );
    throw new ApiError(
      data?.message || `Failed to update menu item ${id}`,
      response.status
    );
  }

  return data.data as MenuItemDto;
}

/**
 * Deletes a menu item.
 */
export async function deleteMenuItem(
  storeId: string,
  id: string
): Promise<unknown> {
  const { data, error, response } = await apiClient.DELETE(
    '/stores/{storeId}/menu-items/{id}',
    {
      params: { path: { storeId, id } },
    }
  );

  if (error) {
    throw new ApiError(
      data?.message || `Failed to delete menu item ${id}`,
      response.status
    );
  }

  return data?.data;
}

/**
 * Toggle the isOutOfStock status of a menu item (quick "86" action)
 */
export async function toggleMenuItemOutOfStock(
  id: string,
  storeId: string,
  isOutOfStock: boolean
): Promise<MenuItemDto> {
  const { data, error, response } = await apiClient.PATCH(
    '/stores/{storeId}/menu-items/{id}',
    {
      params: { path: { storeId, id } },
      body: { isOutOfStock },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || `Failed to toggle out-of-stock status for item ${id}`,
      response.status
    );
  }

  return data.data as MenuItemDto;
}
