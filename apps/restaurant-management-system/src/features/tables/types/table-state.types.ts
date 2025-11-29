/**
 * Table State Types
 *
 * Provides table status management types.
 * Note: TableStatus is defined as an enum here because we need runtime values
 * for Object.values() and as object keys in status-related UI logic.
 */

// Re-export table types from auto-generated schemas
export type {
  TableResponseDto,
  UpdateTableDto,
} from '@repo/api/generated/types';

/**
 * DTO for updating table status.
 * Note: This is a frontend-only type pending backend implementation.
 */
export interface UpdateTableStatusDto {
  status:
    | 'VACANT'
    | 'SEATED'
    | 'ORDERING'
    | 'SERVED'
    | 'READY_TO_PAY'
    | 'CLEANING';
}

/**
 * Table status enum for runtime usage.
 * The generated TableStatus is a union type, but we need an enum for
 * Object.values() and as object keys in status-related UI logic.
 */
export enum TableStatus {
  VACANT = 'VACANT',
  SEATED = 'SEATED',
  ORDERING = 'ORDERING',
  SERVED = 'SERVED',
  READY_TO_PAY = 'READY_TO_PAY',
  CLEANING = 'CLEANING',
}

/**
 * Extended TableResponseDto with active session information.
 * Used in the table management view to show occupied tables.
 *
 * Note: TableResponseDto includes currentStatus but not activeSession.
 * This type extends it for views that need session details.
 */
export interface TableWithStatusDto {
  id: string;
  storeId: string;
  name: string;
  currentStatus:
    | 'VACANT'
    | 'SEATED'
    | 'ORDERING'
    | 'SERVED'
    | 'READY_TO_PAY'
    | 'CLEANING';
  createdAt: string;
  updatedAt: string;
  activeSession?: {
    id: string;
    guestCount: number;
    customerName?: string;
    createdAt: string;
  };
}

/**
 * View mode for the table management UI.
 * Frontend-only type for UI state.
 */
export type ViewMode = 'grid' | 'list';
