import { apiFetch } from '@/utils/apiFetch';

import type {
  CreateMenuItemDto,
  MenuItemDto,
  UpdateMenuItemDto,
} from '../types/menu-item.types';

const MENU_ENDPOINT = '/menu-items';

export async function getStoreMenuItems(
  storeId: string
): Promise<MenuItemDto[]> {
  const res = await apiFetch<MenuItemDto[]>(
    `${MENU_ENDPOINT}?storeId=${storeId}`
  );

  if (!res.data) {
    throw new Error('Failed to retrieve menu items: No data returned by API.');
  }
  return res.data;
}

export async function createMenuItem(
  storeId: string,
  data: CreateMenuItemDto
): Promise<MenuItemDto> {
  const res = await apiFetch<MenuItemDto>(
    {
      path: MENU_ENDPOINT,
      query: {
        storeId,
      },
    },
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );

  if (!res.data) {
    console.error(
      'API Error: createMenuItem succeeded but returned null data.'
    );
    throw new Error('Failed to create menu item: No data returned by API.');
  }
  return res.data;
}

export async function getMenuItemById(id: string): Promise<MenuItemDto> {
  const res = await apiFetch<MenuItemDto>(`${MENU_ENDPOINT}/${id}`);

  if (!res.data) {
    console.error(
      `API Error: getMenuItemById(${id}) succeeded but returned null data.`
    );
    throw new Error(`Menu item ${id} not found or no data returned by API.`);
  }
  return res.data;
}

export async function updateMenuItem(
  id: string,
  storeId: string,
  data: UpdateMenuItemDto
): Promise<MenuItemDto> {
  const res = await apiFetch<MenuItemDto>(
    { path: `${MENU_ENDPOINT}/${id}`, query: { storeId } },
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );

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

export async function deleteMenuItem(
  storeId: string,
  id: string
): Promise<unknown> {
  const res = await apiFetch<unknown>(
    { path: `${MENU_ENDPOINT}/${id}`, query: { storeId } },
    {
      method: 'DELETE',
    }
  );
  return res.data;
}
