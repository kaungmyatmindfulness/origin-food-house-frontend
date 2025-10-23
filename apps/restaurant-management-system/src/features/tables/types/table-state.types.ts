/**
 * Table state types
 */

export enum TableStatus {
  VACANT = 'VACANT',
  SEATED = 'SEATED',
  ORDERING = 'ORDERING',
  SERVED = 'SERVED',
  READY_TO_PAY = 'READY_TO_PAY',
  CLEANING = 'CLEANING',
}

export interface TableWithStatusDto {
  id: string;
  storeId: string;
  name: string;
  currentStatus: TableStatus;
  createdAt: string;
  updatedAt: string;
  activeSession?: {
    id: string;
    guestCount: number;
    customerName?: string;
    createdAt: string;
  };
}

export interface UpdateTableStatusDto {
  status: TableStatus;
}

export type ViewMode = 'grid' | 'list';
