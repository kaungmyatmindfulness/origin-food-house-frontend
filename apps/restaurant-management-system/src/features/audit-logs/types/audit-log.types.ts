export type AuditAction =
  | 'STORE_SETTING_CHANGED'
  | 'MENU_PRICE_CHANGED'
  | 'USER_ROLE_CHANGED'
  | 'USER_SUSPENDED'
  | 'PAYMENT_REFUNDED'
  | 'CATEGORY_CREATED'
  | 'CATEGORY_UPDATED'
  | 'CATEGORY_DELETED'
  | 'MENU_ITEM_CREATED'
  | 'MENU_ITEM_UPDATED'
  | 'MENU_ITEM_DELETED'
  | 'TABLE_CREATED'
  | 'TABLE_UPDATED'
  | 'TABLE_DELETED'
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_CHANGED'
  | 'PAYMENT_RECORDED';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: AuditAction;
  details: string;
  ipAddress: string;
  storeId: string;
}

export interface AuditLogFilters {
  action?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}

export interface PaginatedAuditLogsResponse {
  items: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
