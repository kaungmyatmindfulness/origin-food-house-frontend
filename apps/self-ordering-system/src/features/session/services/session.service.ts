/**
 * Session Service
 *
 * Service layer for session-related API operations in SOS.
 * Uses openapi-fetch for type-safe API calls.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import type {
  JoinSessionResponse,
  SessionContext,
} from '../types/session.types';

/**
 * Initiates joining the active session for a specific table ID.
 * The backend should set an HttpOnly session_token cookie on success.
 * Corresponds to POST /active-table-sessions/join-by-table/:tableId
 */
export async function joinTableSession(
  tableId: string
): Promise<JoinSessionResponse> {
  const { data, error, response } = await apiClient.POST(
    '/active-table-sessions/join-by-table/{tableId}',
    {
      params: { path: { tableId } },
      body: {}, // Empty body as per JoinSessionDto
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || `Failed to join session for table ${tableId}`,
      response.status
    );
  }

  return data.data as JoinSessionResponse;
}

/**
 * Fetches the current session context (primarily the sessionId) using the session cookie.
 * Corresponds to GET /sessions/my-context
 */
export async function getCurrentSessionContext(): Promise<SessionContext> {
  const { data, error, response } = await apiClient.GET(
    '/sessions/my-context',
    {}
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to get session context',
      response.status
    );
  }

  return data.data as SessionContext;
}
