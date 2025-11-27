/**
 * Session Service
 *
 * Service layer for session-related API operations.
 * Uses openapi-fetch for type-safe API calls.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import type { SessionResponseDto } from '@repo/api/generated/types';

export type SessionType = 'COUNTER' | 'PHONE' | 'TAKEOUT' | 'TABLE';

export interface CreateManualSessionDto {
  sessionType: SessionType;
  customerName?: string;
  customerPhone?: string;
  guestCount?: number;
}

/**
 * Create a manual session (counter, phone, or takeout order)
 * Staff-initiated orders without table association
 * @param storeId - Store ID
 * @param data - Session details
 * @returns Created session with cart
 */
export async function createManualSession(
  storeId: string,
  data: CreateManualSessionDto
): Promise<SessionResponseDto> {
  const { data: res, error, response } = await apiClient.POST(
    '/active-table-sessions/manual',
    {
      params: { query: { storeId } },
      body: data,
    }
  );

  if (error || !res?.data) {
    throw new ApiError(
      res?.message || 'Failed to create manual session',
      response.status
    );
  }

  return res.data as SessionResponseDto;
}

/**
 * Get session by ID
 * @param sessionId - Session ID
 * @returns Session details
 */
export async function getSession(
  sessionId: string
): Promise<SessionResponseDto> {
  const { data, error, response } = await apiClient.GET(
    '/active-table-sessions/{sessionId}',
    {
      params: { path: { sessionId } },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to fetch session',
      response.status
    );
  }

  return data.data as SessionResponseDto;
}
