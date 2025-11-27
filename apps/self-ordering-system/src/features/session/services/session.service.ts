/**
 * Session Service
 *
 * Service layer for session-related API operations in SOS.
 * Uses openapi-fetch for type-safe API calls with auto-generated types.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import {
  mapSessionResponse,
  type JoinSessionResponse,
} from '../types/session.types';

/**
 * Initiates joining the active session for a specific table ID.
 * The backend sets an HttpOnly session_token cookie on success.
 * Returns session data including the sessionId and sessionToken.
 *
 * @param tableId - The table ID to join
 * @returns Session data with sessionId and sessionToken
 * @throws {ApiError} If the request fails
 */
export async function joinTableSession(
  tableId: string
): Promise<JoinSessionResponse> {
  const { data, error, response } = await apiClient.POST(
    '/active-table-sessions/join-by-table/{tableId}',
    {
      params: { path: { tableId } },
      body: {},
    }
  );

  if (error || !data) {
    throw new ApiError(
      `Failed to join session for table ${tableId}`,
      response.status
    );
  }

  return mapSessionResponse(data as typeof data & { storeSlug?: string });
}
