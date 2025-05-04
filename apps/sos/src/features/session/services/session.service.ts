import { apiFetch } from '@/utils/apiFetch';
import { JoinSessionResponse, SessionContext } from '../types/session.types';

/**
 * Initiates joining the active session for a specific table ID.
 * The backend should set an HttpOnly session_token cookie on success.
 * Corresponds to POST /tables/{tableId}/join-session
 * @param tableId - The ID (UUID) of the table to join.
 * @returns Promise<JoinSessionResponse> - Session details upon successful join.
 */
export async function joinTableSession(
  tableId: string
): Promise<JoinSessionResponse> {
  const res = await apiFetch<JoinSessionResponse>(
    { path: `/tables/${tableId}/join-session` },
    { method: 'POST' }
  );

  if (res.data == null) {
    throw new Error(
      `Failed to join session for table ${tableId}: No data returned by API.`
    );
  }

  return res.data;
}

/**
 * Fetches the current session context (primarily the sessionId) using the session cookie.
 * Corresponds to GET /sessions/my-context
 * @returns Promise<SessionContext> - The current session context.
 */
export async function getCurrentSessionContext(): Promise<SessionContext> {
  const res = await apiFetch<SessionContext>({
    path: `/sessions/my-context`,
  });

  if (res.data == null) {
    throw new Error('Failed to get session context: No data returned by API.');
  }

  return res.data;
}
