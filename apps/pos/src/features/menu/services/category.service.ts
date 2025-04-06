import { apiFetch } from '@/utils/apiFetch'; // or your custom fetch wrapper
import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../types/category.types';

// POST /category
export async function createCategory(
  data: CreateCategoryDto
): Promise<Category> {
  const res = await apiFetch<Category>('/category', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (res.status === 'error')
    throw new Error(res.errors?.[0]?.message || 'Create category failed');
  return res.data;
}

// GET /category => returns categories for the current store
export async function getCategories(): Promise<Category[]> {
  const res = await apiFetch<Category[]>('/category');
  if (res.status === 'error')
    throw new Error(res.errors?.[0]?.message || 'Get categories failed');
  return res.data;
}

// GET /category/{id}
export async function getCategoryById(id: number): Promise<Category> {
  const res = await apiFetch<Category>(`/category/${id}`);
  if (res.status === 'error')
    throw new Error(res.errors?.[0]?.message || 'Get category failed');
  return res.data;
}

// PATCH /category/{id}
export async function updateCategory(
  id: number,
  data: UpdateCategoryDto
): Promise<Category> {
  const res = await apiFetch<Category>(`/category/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (res.status === 'error')
    throw new Error(res.errors?.[0]?.message || 'Update category failed');
  return res.data;
}

// DELETE /category/{id}
export async function deleteCategory(id: number): Promise<Category> {
  const res = await apiFetch<Category>(`/category/${id}`, {
    method: 'DELETE',
  });
  if (res.status === 'error')
    throw new Error(res.errors?.[0]?.message || 'Delete category failed');
  return res.data;
}
