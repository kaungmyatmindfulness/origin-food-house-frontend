/**
 * Response received after successfully joining a table session.
 * Based on JoinSessionResponseDto.
 * No changes needed here based on the service function corrections
 */
export interface JoinSessionResponse {
  message: string;
  sessionId: string; // UUID
  tableId: string; // UUID
  storeId: string; // UUID
  storeSlug: string;
}

/**
 * Context information about the current customer session.
 * Based on SessionContextDto.
 * No changes needed here based on the service function corrections
 */
export interface SessionContext {
  sessionId: string; // UUID
}
