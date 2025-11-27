/**
 * Order Service
 *
 * Service layer for order and cart-related API operations.
 * Uses openapi-fetch for type-safe API calls.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import type {
  OrderResponseDto,
  UpdateOrderStatusDto,
  CartResponseDto,
  AddToCartDto,
  UpdateCartItemDto,
} from '@repo/api/generated/types';

/**
 * Add item to cart
 * @param sessionId - Session ID
 * @param cartData - Cart item details
 * @returns Updated cart
 */
export async function addToCart(
  sessionId: string,
  cartData: AddToCartDto
): Promise<CartResponseDto> {
  const { data, error, response } = await apiClient.POST(
    '/cart/{sessionId}/items',
    {
      params: { path: { sessionId } },
      body: cartData,
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to add item to cart',
      response.status
    );
  }

  return data.data as CartResponseDto;
}

/**
 * Get cart for session
 * @param sessionId - Session ID
 * @returns Cart with items
 */
export async function getCart(sessionId: string): Promise<CartResponseDto> {
  const { data, error, response } = await apiClient.GET('/cart/{sessionId}', {
    params: { path: { sessionId } },
  });

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to fetch cart',
      response.status
    );
  }

  return data.data as CartResponseDto;
}

/**
 * Remove item from cart
 * @param sessionId - Session ID
 * @param cartItemId - Cart item ID
 * @returns Updated cart
 */
export async function removeFromCart(
  sessionId: string,
  cartItemId: string
): Promise<CartResponseDto> {
  const { data, error, response } = await apiClient.DELETE(
    '/cart/{sessionId}/items/{cartItemId}',
    {
      params: { path: { sessionId, cartItemId } },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to remove item from cart',
      response.status
    );
  }

  return data.data as CartResponseDto;
}

/**
 * Update cart item (quantity or notes)
 * @param sessionId - Session ID
 * @param cartItemId - Cart item ID
 * @param cartData - Update data
 * @returns Updated cart
 */
export async function updateCartItem(
  sessionId: string,
  cartItemId: string,
  cartData: UpdateCartItemDto
): Promise<CartResponseDto> {
  const { data, error, response } = await apiClient.PATCH(
    '/cart/{sessionId}/items/{cartItemId}',
    {
      params: { path: { sessionId, cartItemId } },
      body: cartData,
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to update cart item',
      response.status
    );
  }

  return data.data as CartResponseDto;
}

/**
 * Checkout cart and create order
 * @param sessionId - Session ID
 * @returns Created order
 */
export async function checkoutCart(
  sessionId: string
): Promise<OrderResponseDto> {
  const { data, error, response } = await apiClient.POST(
    '/orders/{sessionId}/checkout',
    {
      params: { path: { sessionId } },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to checkout cart',
      response.status
    );
  }

  return data.data as OrderResponseDto;
}

/**
 * Get order by ID
 * @param orderId - Order ID
 * @returns Order details
 */
export async function getOrder(orderId: string): Promise<OrderResponseDto> {
  const { data, error, response } = await apiClient.GET('/orders/{orderId}', {
    params: { path: { orderId } },
  });

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to fetch order',
      response.status
    );
  }

  return data.data as OrderResponseDto;
}

/**
 * Update order status (e.g., to CANCELLED for void)
 * @param orderId - Order ID
 * @param statusData - Status update
 * @returns Updated order
 */
export async function updateOrderStatus(
  orderId: string,
  statusData: UpdateOrderStatusDto
): Promise<OrderResponseDto> {
  const { data, error, response } = await apiClient.PATCH('/orders/{orderId}', {
    params: { path: { orderId } },
    body: statusData,
  });

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to update order status',
      response.status
    );
  }

  return data.data as OrderResponseDto;
}
