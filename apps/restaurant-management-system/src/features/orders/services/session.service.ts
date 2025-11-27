/**
 * Session Service
 *
 * Service layer for session-related API operations.
 * Note: Uses raw fetch for endpoints with response structure mismatch.
 */

import { ApiError } from '@/utils/apiFetch';
import type {
  SessionResponseDto,
  CreateManualSessionDto,
} from '@repo/api/generated/types';

// Re-export types for components
export type { CreateManualSessionDto };

/** Session type for RMS manual sessions */
export type SessionType = 'TABLE' | 'COUNTER' | 'PHONE' | 'TAKEOUT';

/** Standard API response wrapper */
interface StandardApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

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
  const response = await fetch(
    `${baseUrl}/active-table-sessions/manual?storeId=${storeId}`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new ApiError('Failed to create manual session', response.status);
  }

  const json = (await response.json()) as StandardApiResponse<SessionResponseDto>;

  if (!json.data) {
    throw new ApiError(json.message || 'Failed to create manual session', response.status);
  }

  return json.data;
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
  const response = await fetch(
    `${baseUrl}/active-table-sessions/${sessionId}`,
    {
      method: 'GET',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new ApiError('Failed to fetch session', response.status);
  }

  const json = (await response.json()) as StandardApiResponse<SessionResponseDto>;

  if (!json.data) {
    throw new ApiError(json.message || 'Failed to fetch session', response.status);
  }

  return json.data;
}
