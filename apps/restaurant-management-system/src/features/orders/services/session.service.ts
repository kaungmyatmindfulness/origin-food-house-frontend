/**
 * Session Service
 *
 * Service layer for session-related API operations.
 * Note: Uses typedFetch for endpoints with response structure mismatch.
 */

import { typedFetch } from '@/utils/typed-fetch';

import type {
  SessionResponseDto,
  CreateManualSessionDto,
} from '@repo/api/generated/types';

// Re-export types for components
export type { CreateManualSessionDto };

/** Session type for RMS manual sessions */
export type SessionType = 'TABLE' | 'COUNTER' | 'PHONE' | 'TAKEOUT';

/**
 * Creates a manual session (counter, phone, or takeout order).
 * Staff-initiated orders without table association.
 *
 * @param storeId - The store ID
 * @param data - Session creation details
 * @returns Created session with cart
 * @throws {ApiError} If the request fails
 */
export async function createManualSession(
  storeId: string,
  data: CreateManualSessionDto
): Promise<SessionResponseDto> {
  return typedFetch<SessionResponseDto>(
    `/active-table-sessions/manual?storeId=${storeId}`,
    {
      method: 'POST',
      body: data,
    }
  );
}

/**
 * Gets a session by ID.
 *
 * @param sessionId - The session ID
 * @returns Session details
 * @throws {ApiError} If the request fails
 */
export async function getSession(
  sessionId: string
): Promise<SessionResponseDto> {
  return typedFetch<SessionResponseDto>(`/active-table-sessions/${sessionId}`);
}
