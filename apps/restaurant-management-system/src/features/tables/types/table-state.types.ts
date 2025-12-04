/**
 * Table State Types
 *
 * Provides table status management types.
 * Note: TableStatus is defined as an enum here because we need runtime values
 * for Object.values() and as object keys in status-related UI logic.
 *
 * For API types (TableResponseDto, UpdateTableDto), import directly from '@repo/api/generated/types'.
 */

import type { TableResponseDto } from '@repo/api/generated/types';

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
 * TODO: Backend should implement an endpoint that returns tables with active session data.
 * Currently, activeSession is always undefined since the API doesn't provide this field.
 * When backend adds support, remove this extension and use the API type directly.
 */
export interface TableWithSessionDto extends TableResponseDto {
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
