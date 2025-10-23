import { apiFetch, unwrapData } from '@/utils/apiFetch';
import type {
  OrderResponseDto,
  UpdateOrderStatusDto,
  CartResponseDto,
  AddToCartDto,
} from '@repo/api/generated/types';

/**
 * Add item to cart
 * @param sessionId - Session ID
 * @param data - Cart item details
 * @returns Updated cart
 */
export async function addToCart(
  sessionId: string,
  data: AddToCartDto
): Promise<CartResponseDto> {
  const res = await apiFetch<CartResponseDto>(`/cart/${sessionId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return unwrapData(res, 'Failed to add item to cart');
}

/**
 * Get cart for session
 * @param sessionId - Session ID
 * @returns Cart with items
 */
export async function getCart(sessionId: string): Promise<CartResponseDto> {
  const res = await apiFetch<CartResponseDto>(`/cart/${sessionId}`);
  return unwrapData(res, 'Failed to fetch cart');
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
  const res = await apiFetch<CartResponseDto>(
    `/cart/${sessionId}/items/${cartItemId}`,
    {
      method: 'DELETE',
    }
  );
  return unwrapData(res, 'Failed to remove item from cart');
}

/**
 * Checkout cart and create order
 * @param sessionId - Session ID
 * @returns Created order
 */
export async function checkoutCart(
  sessionId: string
): Promise<OrderResponseDto> {
  const res = await apiFetch<OrderResponseDto>(
    `/orders/${sessionId}/checkout`,
    {
      method: 'POST',
    }
  );
  return unwrapData(res, 'Failed to checkout cart');
}

/**
 * Get order by ID
 * @param orderId - Order ID
 * @returns Order details
 */
export async function getOrder(orderId: string): Promise<OrderResponseDto> {
  const res = await apiFetch<OrderResponseDto>(`/orders/${orderId}`);
  return unwrapData(res, 'Failed to fetch order');
}

/**
 * Update order status (e.g., to CANCELLED for void)
 * @param orderId - Order ID
 * @param data - Status update
 * @returns Updated order
 */
export async function updateOrderStatus(
  orderId: string,
  data: UpdateOrderStatusDto
): Promise<OrderResponseDto> {
  const res = await apiFetch<OrderResponseDto>(`/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return unwrapData(res, 'Failed to update order status');
}
