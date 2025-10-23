import { apiFetch, unwrapData } from '@/utils/apiFetch';
import type { SessionResponseDto } from '@repo/api/generated/types.gen';

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
  const res = await apiFetch<SessionResponseDto>(
    {
      path: '/active-table-sessions/manual',
      query: { storeId },
    },
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
  return unwrapData(res, 'Failed to create manual session');
}

/**
 * Get session by ID
 * @param sessionId - Session ID
 * @returns Session details
 */
export async function getSession(
  sessionId: string
): Promise<SessionResponseDto> {
  const res = await apiFetch<SessionResponseDto>({
    path: `/active-table-sessions/${sessionId}`,
  });
  return unwrapData(res, 'Failed to fetch session');
}
