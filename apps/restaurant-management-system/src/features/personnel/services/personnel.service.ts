/**
 * Personnel Service
 *
 * Service layer for personnel management API operations.
 * Uses openapi-fetch for type-safe API calls.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import type { InviteOrAssignRoleDto } from '@repo/api/generated/types';
import type { Role } from '../types/personnel.types';

/**
 * Invite a new staff member or assign role to existing user
 *
 * @param storeId - Store ID
 * @param roleData - Email and role assignment data
 * @returns Success message
 */
export async function inviteOrAssignRole(
  storeId: string,
  roleData: InviteOrAssignRoleDto
): Promise<unknown> {
  const { data, error, response } = await apiClient.POST(
    '/stores/{storeId}/invite-assign-role',
    {
      params: {
        path: { storeId },
        query: { storeId },
      },
      body: roleData,
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to invite staff member',
      response.status
    );
  }

  return data.data;
}

/**
 * Change role for an existing staff member
 * Note: This uses the same endpoint as inviteOrAssignRole
 *
 * @param storeId - Store ID
 * @param email - User email
 * @param role - New role
 * @returns Success message
 */
export async function changeUserRole(
  storeId: string,
  email: string,
  role: Role
): Promise<unknown> {
  return inviteOrAssignRole(storeId, { email, role });
}

/**
 * Suspend a user (soft delete from store)
 * Note: Backend implementation pending - using placeholder
 *
 * @param storeId - Store ID
 * @param userId - User ID to suspend
 * @param reason - Suspension reason
 * @returns Success message
 */
export async function suspendUser(
  storeId: string,
  userId: string,
  reason: string
): Promise<unknown> {
  // TODO: Update when backend endpoint is available
  // Expected: PATCH /stores/:storeId/users/:userId/suspend
  const { data, error, response } = await apiClient.PATCH(
    '/stores/{storeId}/users/{userId}/suspend',
    {
      params: { path: { storeId, userId } },
      body: { reason },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to suspend user',
      response.status
    );
  }

  return data.data;
}

/**
 * Reactivate a suspended user
 * Note: Backend implementation pending - using placeholder
 *
 * @param storeId - Store ID
 * @param userId - User ID to reactivate
 * @returns Success message
 */
export async function reactivateUser(
  storeId: string,
  userId: string
): Promise<unknown> {
  // TODO: Update when backend endpoint is available
  // Expected: PATCH /stores/:storeId/users/:userId/reactivate
  const { data, error, response } = await apiClient.PATCH(
    '/stores/{storeId}/users/{userId}/reactivate',
    {
      params: { path: { storeId, userId } },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to reactivate user',
      response.status
    );
  }

  return data.data;
}

/**
 * Get all staff members for a store
 * Note: Backend implementation pending - using placeholder
 *
 * @param storeId - Store ID
 * @returns Array of staff members with roles
 */
export async function getStaffMembers(storeId: string): Promise<unknown[]> {
  // TODO: Update when backend endpoint is available
  // Expected: GET /stores/:storeId/users
  const { data, error, response } = await apiClient.GET(
    '/stores/{storeId}/users',
    {
      params: { path: { storeId } },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to fetch staff members',
      response.status
    );
  }

  return data.data as unknown[];
}

/**
 * Get pending invitations for a store
 * Note: Backend implementation pending - using placeholder
 *
 * @param storeId - Store ID
 * @returns Array of pending invitations
 */
export async function getPendingInvitations(
  storeId: string
): Promise<unknown[]> {
  // TODO: Update when backend endpoint is available
  // Expected: GET /stores/:storeId/invitations
  const { data, error, response } = await apiClient.GET(
    '/stores/{storeId}/invitations',
    {
      params: { path: { storeId } },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to fetch invitations',
      response.status
    );
  }

  return data.data as unknown[];
}

/**
 * Resend invitation email
 * Note: Backend implementation pending - using placeholder
 *
 * @param storeId - Store ID
 * @param invitationId - Invitation ID
 * @returns Success message
 */
export async function resendInvitation(
  storeId: string,
  invitationId: string
): Promise<unknown> {
  // TODO: Update when backend endpoint is available
  // Expected: POST /stores/:storeId/invitations/:invitationId/resend
  const { data, error, response } = await apiClient.POST(
    '/stores/{storeId}/invitations/{invitationId}/resend',
    {
      params: { path: { storeId, invitationId } },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to resend invitation',
      response.status
    );
  }

  return data.data;
}

/**
 * Cancel pending invitation
 * Note: Backend implementation pending - using placeholder
 *
 * @param storeId - Store ID
 * @param invitationId - Invitation ID
 * @returns Success message
 */
export async function cancelInvitation(
  storeId: string,
  invitationId: string
): Promise<unknown> {
  // TODO: Update when backend endpoint is available
  // Expected: DELETE /stores/:storeId/invitations/:invitationId
  const { data, error, response } = await apiClient.DELETE(
    '/stores/{storeId}/invitations/{invitationId}',
    {
      params: { path: { storeId, invitationId } },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to cancel invitation',
      response.status
    );
  }

  return data.data;
}
