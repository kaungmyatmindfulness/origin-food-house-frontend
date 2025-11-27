/**
 * Cart Service
 *
 * Service layer for cart-related API operations in SOS.
 * Uses openapi-fetch for type-safe API calls with auto-generated types.
 *
 * Note: SOS uses session cookies for cart access, but the API requires
 * sessionId as a query parameter for cart operations.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import type {
  CartResponseDto,
  AddToCartDto,
  UpdateCartItemDto,
} from '@repo/api/generated/types';

/**
 * Fetches the current session's cart.
 *
 * @param sessionId - The active table session ID
 * @returns Cart with items
 * @throws {ApiError} If the request fails
 */
export async function getMyCart(sessionId: string): Promise<CartResponseDto> {
  const { data, error, response } = await apiClient.GET('/cart', {
    params: { query: { sessionId } },
  });

  if (error || !data) {
    throw new ApiError('Failed to get cart', response.status);
  }

  return data;
}

/**
 * Adds an item to the current session's cart.
 *
 * @param sessionId - The active table session ID
 * @param payload - Item details to add
 * @returns Updated cart
 * @throws {ApiError} If the request fails
 */
export async function addItemToCart(
  sessionId: string,
  payload: AddToCartDto
): Promise<CartResponseDto> {
  const { data, error, response } = await apiClient.POST('/cart/items', {
    params: { query: { sessionId } },
    body: payload,
  });

  if (error || !data) {
    throw new ApiError('Failed to add item to cart', response.status);
  }

  return data;
}

/**
 * Updates an item (quantity/notes) in the current session's cart.
 *
 * @param sessionId - The active table session ID
 * @param cartItemId - The cart item ID to update
 * @param payload - Update data
 * @returns Updated cart
 * @throws {ApiError} If the request fails
 */
export async function updateCartItem(
  sessionId: string,
  cartItemId: string,
  payload: UpdateCartItemDto
): Promise<CartResponseDto> {
  const { data, error, response } = await apiClient.PATCH(
    '/cart/items/{cartItemId}',
    {
      params: {
        path: { cartItemId },
        query: { sessionId },
      },
      body: payload,
    }
  );

  if (error || !data) {
    throw new ApiError(
      `Failed to update cart item ${cartItemId}`,
      response.status
    );
  }

  return data;
}

/**
 * Removes an item from the current session's cart.
 *
 * @param sessionId - The active table session ID
 * @param cartItemId - The cart item ID to remove
 * @returns Updated cart
 * @throws {ApiError} If the request fails
 */
export async function removeCartItem(
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
    throw new ApiError(
      `Failed to remove cart item ${cartItemId}`,
      response.status
    );
  }

  return data;
}

/**
 * Clears all items from the current session's cart.
 *
 * @param sessionId - The active table session ID
 * @returns Empty cart
 * @throws {ApiError} If the request fails
 */
export async function clearMyCart(sessionId: string): Promise<CartResponseDto> {
  const { data, error, response } = await apiClient.DELETE('/cart', {
    params: { query: { sessionId } },
  });

  if (error || !data) {
    throw new ApiError('Failed to clear cart', response.status);
  }

  return data;
}
