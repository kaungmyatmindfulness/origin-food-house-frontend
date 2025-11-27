import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  CartResponseDto,
  AddToCartDto,
  UpdateCartItemDto,
} from '@repo/api/generated/types';
import {
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearMyCart,
} from '@/features/cart/services/cart.service';
import { useSessionInfoStore } from '@/features/session/store/session.store';
import { debug } from '@/utils/debug';

/** Cart item type from generated API types */
export type CartItemDto = CartResponseDto['items'][number];

interface CartState {
  cart: CartResponseDto | null;
  error: string | null;
}

/** Type for adding an item optimistically */
export interface OptimisticAddCartItem {
  menuItemId: string;
  menuItemName: string;
  basePrice: string;
  quantity: number;
  notes?: string | null;
  customizations: Array<{
    customizationOptionId: string;
    optionName: string;
    additionalPrice: string;
  }>;
}

interface CartActions {
  /** Directly sets the cart state (e.g., from initial fetch or WebSocket 'cart:updated' event) */
  setCart: (cart: CartResponseDto | null) => void;
  /** Sets cart error state (e.g., from WebSocket error events) */
  setError: (error: string | null) => void;
  /** Clears the cart state (e.g., on session end) */
  clearCartState: () => void;

  /** Adds an item optimistically, then calls the API. Final state update via WebSocket -> setCart. */
  optimisticAddItem: (cartItem: OptimisticAddCartItem) => Promise<void>;

  /** Updates an item optimistically, then calls the API. Final state update via WebSocket -> setCart. */
  optimisticUpdateItem: (
    cartItemId: string,
    updates: { quantity?: number; notes?: string | null }
  ) => Promise<void>;

  /** Removes an item optimistically, then calls the API. Final state update via WebSocket -> setCart. */
  optimisticRemoveItem: (cartItemId: string) => Promise<void>;

  /** Clears the cart optimistically, then calls the API. Final state update via WebSocket -> setCart. */
  optimisticClearCart: () => Promise<void>;
}

/**
 * Gets the current session ID from the session store.
 * Throws if no session is active.
 */
function getSessionIdOrThrow(): string {
  const sessionId = useSessionInfoStore.getState().sessionId;
  if (!sessionId) {
    throw new Error(
      'No active session. Please scan a QR code to start ordering.'
    );
  }
  return sessionId;
}

export const useCartStore = create<CartState & CartActions>()(
  immer((set, get) => ({
    cart: null,
    error: null,

    setCart: (cart) => {
      debug.log('Setting cart state:', cart);
      set((state) => {
        state.cart = cart;
        state.error = null; // Clear error on successful update
      });
    },

    setError: (error) => {
      set((state) => {
        state.error = error;
      });
    },

    clearCartState: () => {
      set((state) => {
        state.cart = null;
        state.error = null;
      });
    },

    optimisticAddItem: async (cartItem) => {
      const sessionId = getSessionIdOrThrow();
      const originalCart = get().cart;

      if (!originalCart) {
        debug.error('Cannot add item: Cart state is null.');
        throw new Error('Cart is not initialized.');
      }

      const tempItemId = `temp-${Date.now()}`;
      set((state) => {
        if (!state.cart) return;

        const optimisticItem: CartItemDto = {
          id: tempItemId,
          menuItemId: {} as Record<string, never>, // Placeholder UUID
          menuItemName: cartItem.menuItemName,
          basePrice: cartItem.basePrice,
          quantity: cartItem.quantity,
          notes: (cartItem.notes ?? null) as Record<string, never> | null,
          customizations: cartItem.customizations.map((opt, idx) => ({
            id: `temp-cust-${idx}`,
            customizationOptionId: opt.customizationOptionId,
            optionName: opt.optionName,
            additionalPrice: opt.additionalPrice,
          })),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        state.cart.items.push(optimisticItem);
        debug.log('Optimistically added item:', optimisticItem);
      });

      try {
        const servicePayload: AddToCartDto = {
          menuItemId: cartItem.menuItemId,
          quantity: cartItem.quantity,
          notes: cartItem.notes ?? undefined,
          customizations: cartItem.customizations.map((opt) => ({
            customizationOptionId: opt.customizationOptionId,
          })),
        };
        await addItemToCart(sessionId, servicePayload);

        debug.log(
          'Successfully called addItemToCart API for temp ID:',
          tempItemId
        );
      } catch (error) {
        debug.error('Failed to add item via API:', error);

        set((state) => {
          debug.log('Rolling back optimistic add for temp ID:', tempItemId);
          state.cart = originalCart;
        });
        throw error;
      }
    },

    optimisticUpdateItem: async (cartItemId, updates) => {
      const sessionId = getSessionIdOrThrow();
      const originalCart = get().cart;

      if (!originalCart) {
        debug.error('Cannot update item: Cart state is null.');
        throw new Error('Cart is not initialized.');
      }

      set((state) => {
        if (!state.cart) return;
        const itemIndex = state.cart.items.findIndex(
          (item) => item.id === cartItemId
        );
        if (itemIndex > -1) {
          const item = state.cart.items[itemIndex]!;
          if (updates.quantity !== undefined) {
            item.quantity = updates.quantity;
          }
          if (updates.notes !== undefined) {
            item.notes = (updates.notes ?? null) as Record<
              string,
              never
            > | null;
          }
          item.updatedAt = new Date().toISOString();
          debug.log('Optimistically updated item:', item);
        } else {
          debug.warn(
            `OptimisticUpdateItem: Item with ID ${cartItemId} not found in cart.`
          );
        }
      });

      try {
        const servicePayload: UpdateCartItemDto = {
          quantity: updates.quantity,
          notes: updates.notes ?? undefined,
        };
        await updateCartItem(sessionId, cartItemId, servicePayload);

        debug.log(
          'Successfully called updateCartItem API for item ID:',
          cartItemId
        );
      } catch (error) {
        debug.error('Failed to update item via API:', error);

        set((state) => {
          debug.log('Rolling back optimistic update for item ID:', cartItemId);
          state.cart = originalCart;
        });
        throw error;
      }
    },

    optimisticRemoveItem: async (cartItemId) => {
      const sessionId = getSessionIdOrThrow();
      const originalCart = get().cart;

      if (!originalCart) {
        debug.error('Cannot remove item: Cart state is null.');
        throw new Error('Cart is not initialized.');
      }

      let itemRemoved = false;
      set((state) => {
        if (!state.cart) return;
        const initialLength = state.cart.items.length;
        state.cart.items = state.cart.items.filter(
          (item) => item.id !== cartItemId
        );
        itemRemoved = state.cart.items.length < initialLength;
        if (itemRemoved) {
          debug.log('Optimistically removed item ID:', cartItemId);
        } else {
          debug.warn(
            `OptimisticRemoveItem: Item with ID ${cartItemId} not found.`
          );
        }
      });

      if (!itemRemoved) return;

      try {
        await removeCartItem(sessionId, cartItemId);

        debug.log(
          'Successfully called removeCartItem API for item ID:',
          cartItemId
        );
      } catch (error) {
        debug.error('Failed to remove item via API:', error);

        set((state) => {
          debug.log('Rolling back optimistic remove for item ID:', cartItemId);
          state.cart = originalCart;
        });
        throw error;
      }
    },

    optimisticClearCart: async () => {
      const sessionId = getSessionIdOrThrow();
      const originalCart = get().cart;

      if (!originalCart || originalCart.items.length === 0) {
        debug.log('Cart is already empty or null, skipping clear.');
        return;
      }

      set((state) => {
        if (state.cart) {
          state.cart.items = [];
          debug.log('Optimistically cleared cart items.');
        }
      });

      try {
        await clearMyCart(sessionId);

        debug.log('Successfully called clearMyCart API.');
      } catch (error) {
        debug.error('Failed to clear cart via API:', error);

        set((state) => {
          debug.log('Rolling back optimistic clear cart.');
          state.cart = originalCart;
        });
        throw error;
      }
    },
  }))
);

// Selectors
export const selectCart = (state: CartState) => state.cart;
export const selectCartError = (state: CartState) => state.error;
export const selectCartItems = (state: CartState) => state.cart?.items ?? [];
export const selectCartItemCount = (state: CartState) =>
  state.cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
