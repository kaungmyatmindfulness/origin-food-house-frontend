import {
  menuControllerGetStoreMenuItems,
  menuControllerCreateMenuItem,
  menuControllerGetMenuItemById,
  menuControllerUpdateMenuItem,
  menuControllerDeleteMenuItem,
  menuControllerPatchMenuItem,
} from '@repo/api/generated';

import type {
  CreateMenuItemDto,
  MenuItemDto,
  UpdateMenuItemDto,
} from '../types/menu-item.types';

export async function getStoreMenuItems(
  storeId: string
): Promise<MenuItemDto[]> {
  const response = await menuControllerGetStoreMenuItems({
    path: {
      storeId,
    },
  });

  if (!response.data?.data) {
    throw new Error('Failed to retrieve menu items: No data returned by API.');
  }

  return response.data.data as MenuItemDto[];
}

export async function createMenuItem(
  storeId: string,
  data: CreateMenuItemDto
): Promise<string> {
  const response = await menuControllerCreateMenuItem({
    path: {
      storeId,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: data as any, // Type mismatch between frontend and backend - backend expects some fields differently
  });

  if (!response.data?.data) {
    console.error(
      'API Error: createMenuItem succeeded but returned null data.'
    );
    throw new Error('Failed to create menu item: No data returned by API.');
  }

  // API returns the created item's ID
  return response.data.data;
}

export async function getMenuItemById(
  storeId: string,
  id: string
): Promise<MenuItemDto> {
  const response = await menuControllerGetMenuItemById({
    path: {
      storeId,
      id,
    },
  });

  if (!response.data?.data) {
    console.error(
      `API Error: getMenuItemById(${id}) succeeded but returned null data.`
    );
    throw new Error(`Menu item ${id} not found or no data returned by API.`);
  }

  return response.data.data as MenuItemDto;
}

export async function updateMenuItem(
  id: string,
  storeId: string,
  data: UpdateMenuItemDto
): Promise<MenuItemDto> {
  const response = await menuControllerUpdateMenuItem({
    path: {
      storeId,
      id,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: data as any, // Type mismatch: local type has basePrice as string, API expects number
  });

  if (!response.data?.data) {
    console.error(
      `API Error: updateMenuItem(${id}) succeeded but returned null data.`
    );
    throw new Error(
      `Failed to update menu item ${id}: No data returned by API.`
    );
  }

  return response.data.data as MenuItemDto;
}

export async function deleteMenuItem(
  storeId: string,
  id: string
): Promise<unknown> {
  const response = await menuControllerDeleteMenuItem({
    path: {
      storeId,
      id,
    },
  });

  return response.data?.data;
}

/**
 * Toggle the isOutOfStock status of a menu item (quick "86" action)
 */
export async function toggleMenuItemOutOfStock(
  id: string,
  storeId: string,
  isOutOfStock: boolean
): Promise<MenuItemDto> {
  const response = await menuControllerPatchMenuItem({
    path: {
      storeId,
      id,
    },
    body: { isOutOfStock },
  });

  if (!response.data?.data) {
    throw new Error(
      `Failed to toggle out-of-stock status for item ${id}: No data returned.`
    );
  }

  return response.data.data as MenuItemDto;
}
