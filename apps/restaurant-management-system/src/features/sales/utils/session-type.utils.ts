/**
 * Shared utility functions for session type handling.
 * Used by OrderCard (kitchen) and ReceiptPanel (sales) for consistent behavior.
 *
 * Note: This utility uses string literals instead of importing SessionType
 * to remain compatible with both the kitchen module (which uses an enum)
 * and the sales module (which uses a type union).
 */

/**
 * Valid session type values as string literals
 * Compatible with both enum and type union definitions
 */
export type SessionTypeValue = 'TABLE' | 'COUNTER' | 'PHONE' | 'TAKEOUT';

/**
 * Session information that may be attached to an order
 */
export interface OrderSessionInfo {
  sessionType?: SessionTypeValue | null;
  customerName?: string | null;
  customerPhone?: string | null;
}

/**
 * Result of session type detection
 */
export interface SessionTypeInfo {
  /** The detected session type */
  sessionType: SessionTypeValue | null;
  /** Whether this is a quick sale order (non-table) */
  isQuickSale: boolean;
}

/**
 * Extended result including display name for receipt/order display
 */
export interface SessionTypeDisplayInfo extends SessionTypeInfo {
  /** The display name (table name or session type label) */
  displayName: string | null;
}

/**
 * Determines the session type from order data.
 * Checks session object first, then falls back to tableName pattern matching
 * for backward compatibility with orders created before session types were added.
 *
 * @param session - Optional session object from the order
 * @param tableName - Optional table name string for fallback detection
 * @returns Session type information
 */
export function getSessionTypeInfo(
  session?: OrderSessionInfo | null,
  tableName?: string | null
): SessionTypeInfo {
  // Check session object first (preferred method)
  if (session?.sessionType) {
    const type = session.sessionType;
    return {
      sessionType: type,
      isQuickSale: type !== 'TABLE',
    };
  }

  // Fallback: infer from tableName for backward compatibility
  const tableNameLower = tableName?.toLowerCase() ?? '';

  if (tableNameLower.includes('counter')) {
    return { sessionType: 'COUNTER' as SessionTypeValue, isQuickSale: true };
  }
  if (tableNameLower.includes('phone')) {
    return { sessionType: 'PHONE' as SessionTypeValue, isQuickSale: true };
  }
  if (tableNameLower.includes('takeout') || tableNameLower.includes('take')) {
    return { sessionType: 'TAKEOUT' as SessionTypeValue, isQuickSale: true };
  }

  // Default: assume table order if no match
  return { sessionType: null, isQuickSale: false };
}

/**
 * Extended version that also provides display name for UI purposes.
 *
 * @param session - Optional session object from the order
 * @param tableName - Optional table name string
 * @returns Session type info with display name
 */
export function getSessionTypeDisplayInfo(
  session?: OrderSessionInfo | null,
  tableName?: string | null
): SessionTypeDisplayInfo {
  const baseInfo = getSessionTypeInfo(session, tableName);

  return {
    ...baseInfo,
    displayName: tableName ?? null,
  };
}
