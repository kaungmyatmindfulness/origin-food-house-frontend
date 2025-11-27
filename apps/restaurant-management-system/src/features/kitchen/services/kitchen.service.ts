/**
 * Kitchen Service
 *
 * Service layer for Kitchen Display System API operations.
 * Uses openapi-fetch for type-safe API calls.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
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
  const { data, error, response } = await apiClient.GET('/orders/kds', {
    params: {
      query: {
        storeId: params.storeId,
        status: params.status,
        page: params.page ? String(params.page) : undefined,
        limit: params.limit ? String(params.limit) : undefined,
      },
    },
  });

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to fetch KDS orders',
      response.status
    );
  }

  return data.data as PaginatedOrders;
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
  const { data, error, response } = await apiClient.PATCH(
    '/orders/{orderId}/status',
    {
      params: { path: { orderId } },
      body: dto,
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to update order status',
      response.status
    );
  }

  return data.data as Order;
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
  const { data, error, response } = await apiClient.GET('/orders/{orderId}', {
    params: {
      path: { orderId },
      query: { storeId },
    },
  });

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to fetch order',
      response.status
    );
  }

  return data.data as Order;
}
