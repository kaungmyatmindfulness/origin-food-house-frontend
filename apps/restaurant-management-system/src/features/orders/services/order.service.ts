/**
 * Order Service
 *
 * Service layer for order and cart-related API operations.
 * Uses openapi-fetch for type-safe API calls with auto-generated types.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import type {
  OrderResponseDto,
  UpdateOrderStatusDto,
  CartResponseDto,
  AddToCartDto,
  UpdateCartItemDto,
  CheckoutCartDto,
} from '@repo/api/generated/types';

/**
 * Adds an item to the cart.
 *
 * @param sessionId - The session ID
 * @param cartData - Cart item details
 * @returns Updated cart
 * @throws {ApiError} If the request fails
 */
export async function addToCart(
  sessionId: string,
  cartData: AddToCartDto
): Promise<CartResponseDto> {
  const { data, error, response } = await apiClient.POST('/cart/items', {
    params: { query: { sessionId } },
    body: cartData,
  });

  if (error || !data) {
    throw new ApiError('Failed to add item to cart', response.status);
  }

  return data;
}

/**
 * Gets the cart for a session.
 *
 * @param sessionId - The session ID
 * @returns Cart with items
 * @throws {ApiError} If the request fails
 */
export async function getCart(sessionId: string): Promise<CartResponseDto> {
  const { data, error, response } = await apiClient.GET('/cart', {
    params: { query: { sessionId } },
  });

  if (error || !data) {
    throw new ApiError('Failed to fetch cart', response.status);
  }

  return data;
}

/**
 * Removes an item from the cart.
 *
 * @param sessionId - The session ID
 * @param cartItemId - The cart item ID to remove
 * @returns Updated cart
 * @throws {ApiError} If the request fails
 */
export async function removeFromCart(
  sessionId: string,
  cartItemId: string
): Promise<CartResponseDto> {
  const { data, error, response } = await apiClient.DELETE(
    '/cart/items/{cartItemId}',
    {
      params: {
        path: { cartItemId },
        query: { sessionId },
      },
    }
  );

  if (error || !data) {
    throw new ApiError('Failed to remove item from cart', response.status);
  }

  return data;
}

/**
 * Updates a cart item (quantity or notes).
 *
 * @param sessionId - The session ID
 * @param cartItemId - The cart item ID to update
 * @param cartData - Update data
 * @returns Updated cart
 * @throws {ApiError} If the request fails
 */
export async function updateCartItem(
  sessionId: string,
  cartItemId: string,
  cartData: UpdateCartItemDto
): Promise<CartResponseDto> {
  const { data, error, response } = await apiClient.PATCH(
    '/cart/items/{cartItemId}',
    {
      params: {
        path: { cartItemId },
        query: { sessionId },
      },
      body: cartData,
    }
  );

  if (error || !data) {
    throw new ApiError('Failed to update cart item', response.status);
  }

  return data;
}

/**
 * Checks out the cart and creates an order.
 *
 * @param sessionId - The session ID
 * @param checkoutData - Checkout options (orderType defaults to DINE_IN)
 * @returns Created order
 * @throws {ApiError} If the request fails
 */
export async function checkoutCart(
  sessionId: string,
  checkoutData: Partial<CheckoutCartDto> = {}
): Promise<OrderResponseDto> {
  const body: CheckoutCartDto = {
    orderType: checkoutData.orderType ?? 'DINE_IN',
    tableName: checkoutData.tableName,
  };

  const { data, error, response } = await apiClient.POST('/orders/checkout', {
    params: { query: { sessionId } },
    body,
  });

  if (error || !data) {
    throw new ApiError('Failed to checkout cart', response?.status ?? 500);
  }

  return data;
}

/**
 * Gets an order by ID.
 *
 * @param orderId - The order ID
 * @returns Order details
 * @throws {ApiError} If the request fails
 */
export async function getOrder(orderId: string): Promise<OrderResponseDto> {
  const { data, error, response } = await apiClient.GET('/orders/{orderId}', {
    params: { path: { orderId } },
  });

  if (error || !data) {
    throw new ApiError('Failed to fetch order', response.status);
  }

  return data;
}

/**
 * Updates an order's status.
 *
 * @param orderId - The order ID
 * @param statusData - Status update data
 * @returns Updated order
 * @throws {ApiError} If the request fails
 */
export async function updateOrderStatus(
  orderId: string,
  statusData: UpdateOrderStatusDto
): Promise<OrderResponseDto> {
  const { data, error, response } = await apiClient.PATCH(
    '/orders/{orderId}/status',
    {
      params: { path: { orderId } },
      body: statusData,
    }
  );

  if (error || !data) {
    throw new ApiError('Failed to update order status', response.status);
  }

  return data;
}
