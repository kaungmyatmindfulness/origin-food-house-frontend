/**
 * apps/pos/src/services/menu-item.service.ts
 *
 * Service functions for interacting with the /menu API endpoints.
 * Uses the shared apiFetch utility for making requests.
 */

import { apiFetch } from '@/utils/apiFetch';

import type {
  CreateMenuItemDto,
  MenuItemDto,
  UpdateMenuItemDto,
} from '../types/menu-item.types';

const MENU_ENDPOINT = '/menu';

/**
 * Get all menu items for a specific store.
 * Maps to: GET /menu?storeId={storeId}
 *
 * @param storeId - The ID of the store whose menu items are to be fetched.
 * @returns A promise resolving to an array of MenuItemDto.
 * @throws {NetworkError | ApiError} - Throws if the fetch fails, response is not ok,
 * or the API returns status: 'error'. Throws Error if data is null on success.
 */
export async function getStoreMenuItems(
  storeId: number
): Promise<MenuItemDto[]> {
  const res = await apiFetch<MenuItemDto[]>(
    `${MENU_ENDPOINT}?storeId=${storeId}`
  );

  if (!res.data) {
    console.error(
      'API Error: getStoreMenuItems succeeded but returned null data.'
    );
    throw new Error('Failed to retrieve menu items: No data returned by API.');
  }
  return res.data;
}

/**
 * Create a new menu item (requires OWNER or ADMIN role).
 * Maps to: POST /menu
 *
 * @param data - The data required to create the new menu item.
 * @returns A promise resolving to the newly created MenuItemDto.
 * @throws {NetworkError | ApiError | UnauthorizedError} - Throws on fetch/API errors.
 * Throws Error if data is null on success.
 */
export async function createMenuItem(
  data: CreateMenuItemDto
): Promise<MenuItemDto> {
  const res = await apiFetch<MenuItemDto>(MENU_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!res.data) {
    console.error(
      'API Error: createMenuItem succeeded but returned null data.'
    );
    throw new Error('Failed to create menu item: No data returned by API.');
  }
  return res.data;
}

/**
 * Get a single menu item by its ID.
 * Maps to: GET /menu/{id}
 *
 * @param id - The numeric ID of the menu item to retrieve.
 * @returns A promise resolving to the requested MenuItemDto.
 * @throws {NetworkError | ApiError} - Throws on fetch/API errors, including 404 if not found.
 * Throws Error if data is null on success.
 */
export async function getMenuItemById(id: number): Promise<MenuItemDto> {
  const res = await apiFetch<MenuItemDto>(`${MENU_ENDPOINT}/${id}`);

  if (!res.data) {
    console.error(
      `API Error: getMenuItemById(${id}) succeeded but returned null data.`
    );
    throw new Error(`Menu item ${id} not found or no data returned by API.`);
  }
  return res.data;
}

/**
 * Update an existing menu item (requires OWNER or ADMIN role).
 * Maps to: PUT /menu/{id}
 *
 * @param id - The numeric ID of the menu item to update.
 * @param data - The update data for the menu item.
 * @returns A promise resolving to the updated MenuItemDto.
 * @throws {NetworkError | ApiError | UnauthorizedError} - Throws on fetch/API errors.
 * Throws Error if data is null on success.
 */
export async function updateMenuItem(
  id: number,
  data: UpdateMenuItemDto
): Promise<MenuItemDto> {
  const res = await apiFetch<MenuItemDto>(`${MENU_ENDPOINT}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!res.data) {
    console.error(
      `API Error: updateMenuItem(${id}) succeeded but returned null data.`
    );
    throw new Error(
      `Failed to update menu item ${id}: No data returned by API.`
    );
  }
  return res.data;
}

/**
 * Delete a menu item by its ID (requires OWNER or ADMIN role).
 * Maps to: DELETE /menu/{id}
 *
 * @param id - The numeric ID of the menu item to delete.
 * @returns A promise resolving to void upon successful deletion.
 * @throws {NetworkError | ApiError | UnauthorizedError} - Throws on fetch/API errors.
 */
export async function deleteMenuItem(id: number): Promise<void> {
  await apiFetch<null>(`${MENU_ENDPOINT}/${id}`, {
    method: 'DELETE',
  });
}
