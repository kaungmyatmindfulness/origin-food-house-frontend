/**
 * Cart Service
 *
 * Service layer for cart-related API operations in SOS.
 * Uses openapi-fetch for type-safe API calls.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import type {
  Cart,
  AddItemPayload,
  UpdateItemPayload,
} from '../types/cart.types';

/**
 * Fetches the current session's cart. Requires session cookie.
 * Corresponds to GET /sessions/my-cart
 */
export async function getMyCart(): Promise<Cart> {
  const { data, error, response } = await apiClient.GET(
    '/sessions/my-cart',
    {}
  );

  if (error || !data?.data) {
    throw new ApiError(data?.message || 'Failed to get cart', response.status);
  }

  return data.data as Cart;
}

/**
 * Adds an item to the current session's cart. Requires session cookie.
 * Corresponds to POST /sessions/my-cart/items
 */
export async function addItemToCart(payload: AddItemPayload): Promise<Cart> {
  const { data, error, response } = await apiClient.POST(
    '/sessions/my-cart/items',
    {
      body: payload,
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to add item to cart',
      response.status
    );
  }

  return data.data as Cart;
}

/**
 * Updates an item (quantity/notes) in the current session's cart. Requires session cookie.
 * Corresponds to PATCH /sessions/my-cart/items/{cartItemId}
 */
export async function updateCartItem(
  cartItemId: string,
  payload: UpdateItemPayload
): Promise<Cart> {
  const { data, error, response } = await apiClient.PATCH(
    '/sessions/my-cart/items/{cartItemId}',
    {
      params: { path: { cartItemId } },
      body: payload,
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || `Failed to update cart item ${cartItemId}`,
      response.status
    );
  }

  return data.data as Cart;
}

/**
 * Removes an item from the current session's cart. Requires session cookie.
 * Corresponds to DELETE /sessions/my-cart/items/{cartItemId}
 */
export async function removeCartItem(cartItemId: string): Promise<Cart> {
  const { data, error, response } = await apiClient.DELETE(
    '/sessions/my-cart/items/{cartItemId}',
    {
      params: { path: { cartItemId } },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || `Failed to remove cart item ${cartItemId}`,
      response.status
    );
  }

  return data.data as Cart;
}

/**
 * Clears all items from the current session's cart. Requires session cookie.
 * Corresponds to DELETE /sessions/my-cart
 */
export async function clearMyCart(): Promise<Cart> {
  const { data, error, response } = await apiClient.DELETE(
    '/sessions/my-cart',
    {}
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to clear cart',
      response.status
    );
  }

  return data.data as Cart;
}
