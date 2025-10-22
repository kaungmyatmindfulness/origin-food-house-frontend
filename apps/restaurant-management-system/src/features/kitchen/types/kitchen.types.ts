/**
 * Kitchen Display System (KDS) Types
 * These types mirror the backend DTOs for KDS functionality
 */

export enum OrderStatus {
  PENDING = 'PENDING', // Order placed, waiting for kitchen
  PREPARING = 'PREPARING', // Being prepared by kitchen
  READY = 'READY', // Ready for serving
  SERVED = 'SERVED', // Served to customer
  COMPLETED = 'COMPLETED', // Fully paid and closed
  CANCELLED = 'CANCELLED', // Order cancelled
}

export enum OrderType {
  DINE_IN = 'DINE_IN',
  TAKEAWAY = 'TAKEAWAY',
  DELIVERY = 'DELIVERY',
}

export interface OrderItemCustomization {
  id: string;
  customizationOptionId: string;
  finalPrice: string | null;
  customizationOption?: {
    name: string;
  } | null;
}

export interface OrderItem {
  id: string;
  menuItemId: string | null;
  price: string;
  quantity: number;
  finalPrice: string | null;
  notes: string | null;
  customizations: OrderItemCustomization[];
  menuItem?: {
    name: string;
  } | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  storeId: string;
  sessionId: string | null;
  tableName: string;
  status: OrderStatus;
  orderType: OrderType;
  paidAt: string | null;
  subTotal: string;
  vatRateSnapshot: string | null;
  serviceChargeRateSnapshot: string | null;
  vatAmount: string;
  serviceChargeAmount: string;
  grandTotal: string;
  orderItems: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface KdsQueryParams {
  storeId: string;
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

export interface PaginatedOrders {
  items: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Kitchen statistics for dashboard display
 */
export interface KitchenStats {
  pending: number;
  preparing: number;
  ready: number;
  totalActive: number;
}

/**
 * WebSocket events for real-time order updates
 */
export interface OrderCreatedEvent {
  order: Order;
}

export interface OrderUpdatedEvent {
  order: Order;
}

export interface OrderStatusChangedEvent {
  orderId: string;
  oldStatus: OrderStatus;
  newStatus: OrderStatus;
  order: Order;
}
