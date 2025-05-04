import { apiFetch } from '@/utils/apiFetch';

import { Category } from '../types/menu.types';

const CATEGORY_ENDPOINT = '/categories';

export async function getCategories(storeSlug: string): Promise<Category[]> {
  const res = await apiFetch<Category[]>({
    path: CATEGORY_ENDPOINT,

    query: {
      storeSlug,
    },
  });

  if (res.data == null) {
    throw new Error('Failed to retrieve categories: No data returned by API.');
  }

  return res.data;
}
