import { apiFetch, unwrapData } from '@/utils/apiFetch';
import type { InviteOrAssignRoleDto } from '@repo/api/generated/types';
import type { Role } from '../types/personnel.types';

/**
 * Invite a new staff member or assign role to existing user
 *
 * @param storeId - Store ID
 * @param data - Email and role assignment data
 * @returns Success message
 */
export async function inviteOrAssignRole(
  storeId: string,
  data: InviteOrAssignRoleDto
): Promise<unknown> {
  const res = await apiFetch(
    {
      path: `/stores/${storeId}/invite-assign-role`,
      query: { storeId },
    },
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
  return unwrapData(res, 'Failed to invite staff member');
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
  const res = await apiFetch(`/stores/${storeId}/users/${userId}/suspend`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
  return unwrapData(res, 'Failed to suspend user');
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
  const res = await apiFetch(`/stores/${storeId}/users/${userId}/reactivate`, {
    method: 'PATCH',
  });
  return unwrapData(res, 'Failed to reactivate user');
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
  const res = await apiFetch(`/stores/${storeId}/users`);
  return unwrapData(res, 'Failed to fetch staff members') as unknown[];
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
  const res = await apiFetch(`/stores/${storeId}/invitations`);
  return unwrapData(res, 'Failed to fetch invitations') as unknown[];
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
  const res = await apiFetch(
    `/stores/${storeId}/invitations/${invitationId}/resend`,
    {
      method: 'POST',
    }
  );
  return unwrapData(res, 'Failed to resend invitation');
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
  const res = await apiFetch(`/stores/${storeId}/invitations/${invitationId}`, {
    method: 'DELETE',
  });
  return unwrapData(res, 'Failed to cancel invitation');
}
