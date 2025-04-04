// apps/pos/features/store/services/store.service.ts

import { apiFetch } from '@/utils/apiFetch';
import { ApiResponse } from '@/common/types/api.types';
import {
  CreateStoreDto,
  UpdateStoreDto,
  InviteOrAssignRoleDto,
  Store,
} from '../types/store.types';

/** POST /stores: Create a store (creator is OWNER) */
export async function createStore(data: CreateStoreDto): Promise<Store> {
  const res: ApiResponse<Store> = await apiFetch<Store>('/stores', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (res.status === 'error') {
    throw new Error(
      res.error?.message || res.message || 'Failed to create store'
    );
  }
  return res.data;
}

/** PUT /stores/{id}: Update a store (OWNER or ADMIN only) */
export async function updateStore(
  id: number,
  data: UpdateStoreDto
): Promise<Store> {
  const res: ApiResponse<Store> = await apiFetch<Store>(`/stores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (res.status === 'error') {
    throw new Error(
      res.error?.message || res.message || 'Failed to update store'
    );
  }
  return res.data;
}

/** POST /stores/{id}/invite-by-email:
 * Invite/assign role by email; OWNER can assign any role, ADMIN can assign CASHIER/CHEF.
 */
export async function inviteOrAssignRoleByEmail(
  id: number,
  data: InviteOrAssignRoleDto
): Promise<Store> {
  const res: ApiResponse<Store> = await apiFetch<Store>(
    `/stores/${id}/invite-by-email`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
  if (res.status === 'error') {
    throw new Error(
      res.error?.message ||
        res.message ||
        'Failed to invite/assign role to store'
    );
  }
  return res.data;
}
