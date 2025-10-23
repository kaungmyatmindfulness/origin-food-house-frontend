import { apiFetch, unwrapData } from '@/utils/apiFetch';

import type {
  KdsQueryParams,
  Order,
  PaginatedOrders,
  UpdateOrderStatusDto,
} from '../types/kitchen.types';

/**
 * Fetches orders for the Kitchen Display System
 * @param params - Query parameters including storeId, status filter, and pagination
 * @returns Paginated list of orders
 * @throws {Error} If the request fails
 */
export async function getKdsOrders(
  params: KdsQueryParams
): Promise<PaginatedOrders> {
  const queryParams: Record<string, string> = {};
  if (params.storeId) queryParams.storeId = params.storeId;
  if (params.status) queryParams.status = params.status;
  if (params.page) queryParams.page = String(params.page);
  if (params.limit) queryParams.limit = String(params.limit);

  const queryString = new URLSearchParams(queryParams).toString();
  const res = await apiFetch<PaginatedOrders>(`/orders/kds?${queryString}`, {
    method: 'GET',
  });

  return unwrapData(res, 'Failed to fetch KDS orders');
}

/**
 * Updates an order's status
 * @param orderId - The order ID to update
 * @param dto - The status update payload
 * @returns Updated order
 * @throws {Error} If the update fails or status transition is invalid
 */
export async function updateOrderStatus(
  orderId: string,
  dto: UpdateOrderStatusDto
): Promise<Order> {
  const res = await apiFetch<Order>(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });

  return unwrapData(res, 'Failed to update order status');
}

/**
 * Fetches a single order by ID
 * @param orderId - The order ID to fetch
 * @param storeId - The store ID
 * @returns Order details
 * @throws {Error} If the order is not found
 */
export async function getOrderById(
  orderId: string,
  storeId: string
): Promise<Order> {
  const res = await apiFetch<Order>(`/orders/${orderId}?storeId=${storeId}`, {
    method: 'GET',
  });

  return unwrapData(res, 'Failed to fetch order');
}
