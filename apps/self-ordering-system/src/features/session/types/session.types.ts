/**
 * Session Types
 *
 * Local types that map from the generated API types.
 * These provide a stable interface for the frontend while allowing
 * backend API changes to be handled in the service layer.
 */

import type { SessionCreatedResponseDto } from '@repo/api/generated/types';

/**
 * Response received after successfully joining a table session.
 * Maps from SessionCreatedResponseDto with frontend-friendly field names.
 */
export interface JoinSessionResponse {
  sessionId: string; // Mapped from SessionCreatedResponseDto.id
  tableId: string | null;
  storeId: string;
  sessionToken: string;
  storeSlug?: string; // May be provided by backend but not in generated types
}

/**
 * Maps the generated SessionCreatedResponseDto to our local JoinSessionResponse.
 * This provides a stable interface for the frontend.
 */
export function mapSessionResponse(
  dto: SessionCreatedResponseDto & { storeSlug?: string }
): JoinSessionResponse {
  return {
    sessionId: dto.id,
    tableId: dto.tableId as string | null,
    storeId: dto.storeId,
    sessionToken: dto.sessionToken,
    storeSlug: dto.storeSlug,
  };
}
