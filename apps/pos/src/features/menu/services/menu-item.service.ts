import { apiFetch } from '@/utils/apiFetch';
import {
  MenuItem,
  CreateMenuItemDto,
  UpdateMenuItemDto,
} from '../types/menu-item.types';

// GET /menu?storeId=xxx => get all items for a store
export async function getStoreMenuItems(storeId: number): Promise<MenuItem[]> {
  const res = await apiFetch<MenuItem[]>(`/menu?storeId=${storeId}`);
  if (res.status === 'error')
    throw new Error(res.error?.message || 'Get menu items failed');
  return res.data;
}

// POST /menu => create a new menu item
export async function createMenuItem(
  data: CreateMenuItemDto
): Promise<MenuItem> {
  const res = await apiFetch<MenuItem>('/menu', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (res.status === 'error')
    throw new Error(res.error?.message || 'Create menu item failed');
  return res.data;
}

// GET /menu/{id} => single item by ID
export async function getMenuItemById(id: number): Promise<MenuItem> {
  const res = await apiFetch<MenuItem>(`/menu/${id}`);
  if (res.status === 'error')
    throw new Error(res.error?.message || 'Get menu item failed');
  return res.data;
}

// PUT /menu/{id} => update an item
export async function updateMenuItem(
  id: number,
  data: UpdateMenuItemDto
): Promise<MenuItem> {
  const res = await apiFetch<MenuItem>(`/menu/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (res.status === 'error')
    throw new Error(res.error?.message || 'Update menu item failed');
  return res.data;
}

// DELETE /menu/{id} => delete an item
export async function deleteMenuItem(id: number): Promise<MenuItem> {
  const res = await apiFetch<MenuItem>(`/menu/${id}`, {
    method: 'DELETE',
  });
  if (res.status === 'error')
    throw new Error(res.error?.message || 'Delete menu item failed');
  return res.data;
}
