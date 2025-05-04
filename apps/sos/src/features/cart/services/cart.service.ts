import { apiFetch } from '@/utils/apiFetch';
import { Cart, AddItemPayload, UpdateItemPayload } from '../types/cart.types';

const CART_ENDPOINT = '/sessions/my-cart';

/**
 * Fetches the current session's cart. Requires session cookie.
 * Corresponds to GET /sessions/my-cart
 * @returns Promise<Cart> - The current cart details.
 */
export async function getMyCart(): Promise<Cart> {
  const res = await apiFetch<Cart>({ path: CART_ENDPOINT });

  if (res.data == null) {
    throw new Error('Failed to get cart: No data returned by API.');
  }
  return res.data;
}

/**
 * Adds an item to the current session's cart. Requires session cookie.
 * Corresponds to POST /sessions/my-cart/items
 * @param payload - The details of the item to add.
 * @returns Promise<Cart> - The updated cart.
 */
export async function addItemToCart(payload: AddItemPayload): Promise<Cart> {
  const res = await apiFetch<Cart>(
    { path: `${CART_ENDPOINT}/items` },
    { method: 'POST', body: JSON.stringify(payload) }
  );

  if (res.data == null) {
    throw new Error('Failed to add item to cart: No data returned by API.');
  }
  return res.data;
}

/**
 * Updates an item (quantity/notes) in the current session's cart. Requires session cookie.
 * Corresponds to PATCH /sessions/my-cart/items/{cartItemId}
 * @param cartItemId - The ID (UUID) of the cart item to update.
 * @param payload - The update data (quantity and/or notes).
 * @returns Promise<Cart> - The updated cart.
 */
export async function updateCartItem(
  cartItemId: string,
  payload: UpdateItemPayload
): Promise<Cart> {
  const res = await apiFetch<Cart>(
    { path: `${CART_ENDPOINT}/items/${cartItemId}` },
    { method: 'PATCH', body: JSON.stringify(payload) }
  );

  if (res.data == null) {
    throw new Error(
      `Failed to update cart item ${cartItemId}: No data returned by API.`
    );
  }
  return res.data;
}

/**
 * Removes an item from the current session's cart. Requires session cookie.
 * Corresponds to DELETE /sessions/my-cart/items/{cartItemId}
 * @param cartItemId - The ID (UUID) of the cart item to remove.
 * @returns Promise<Cart> - The updated cart (usually without the removed item).
 */
export async function removeCartItem(cartItemId: string): Promise<Cart> {
  const res = await apiFetch<Cart>(
    {
      path: `${CART_ENDPOINT}/items/${cartItemId}`,
    },
    { method: 'DELETE' }
  );

  if (res.data == null) {
    throw new Error(
      `Failed to remove cart item ${cartItemId}: No data returned by API.`
    );
  }
  return res.data;
}

/**
 * Clears all items from the current session's cart. Requires session cookie.
 * Corresponds to DELETE /sessions/my-cart
 * @returns Promise<Cart> - The empty cart.
 */
export async function clearMyCart(): Promise<Cart> {
  const res = await apiFetch<Cart>(
    { path: CART_ENDPOINT },
    { method: 'DELETE' }
  );

  if (res.data == null) {
    throw new Error('Failed to clear cart: No data returned by API.');
  }

  return res.data;
}
