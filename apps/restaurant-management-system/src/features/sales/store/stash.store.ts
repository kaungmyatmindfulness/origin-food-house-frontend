import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { MAX_STASHED_ORDERS } from '../constants/stash.constants';

import type { DraftCartItem } from './quick-sale-cart.store';

/**
 * A stashed order containing cart items and metadata
 */
export interface StashedOrder {
  /** Unique identifier for this stashed order */
  id: string;
  /** Cart items that were stashed */
  items: DraftCartItem[];
  /** Optional note describing the stashed order */
  note: string | null;
  /** ISO timestamp when the order was stashed */
  stashedAt: string;
  /** Pre-calculated total for display */
  total: number;
  /** Pre-calculated item count for display */
  itemCount: number;
}

/**
 * Stash store state
 */
interface StashState {
  /** Array of stashed orders */
  stashedOrders: StashedOrder[];
}

/**
 * Stash store actions
 */
interface StashActions {
  /** Stash the current order with optional note */
  stashOrder: (items: DraftCartItem[], note: string | null) => void;
  /** Restore a stashed order by ID, returns the items */
  restoreOrder: (id: string) => DraftCartItem[] | null;
  /** Delete a stashed order by ID */
  deleteStashedOrder: (id: string) => void;
  /** Clear all stashed orders */
  clearAllStashedOrders: () => void;
}

/**
 * Calculate the total price for cart items
 */
function calculateTotal(items: DraftCartItem[]): number {
  return items.reduce((total, item) => {
    const customizationTotal = item.customizations.reduce(
      (sum, c) => sum + c.additionalPrice,
      0
    );
    return total + (item.basePrice + customizationTotal) * item.quantity;
  }, 0);
}

/**
 * Calculate the total item count
 */
function calculateItemCount(items: DraftCartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}

const initialState: StashState = {
  stashedOrders: [],
};

/**
 * Creates the stash store with store-specific persistence
 */
export function createStashStore(storeId: string) {
  return create<StashState & StashActions>()(
    devtools(
      persist(
        immer((set, get) => ({
          ...initialState,

          stashOrder: (items, note) => {
            if (items.length === 0) {
              console.warn('[StashStore] stashOrder: no items to stash');
              return;
            }

            set((draft) => {
              const newStashedOrder: StashedOrder = {
                id: crypto.randomUUID(),
                items: JSON.parse(JSON.stringify(items)), // Deep clone
                note,
                stashedAt: new Date().toISOString(),
                total: calculateTotal(items),
                itemCount: calculateItemCount(items),
              };

              // Add to beginning of array (most recent first)
              draft.stashedOrders.unshift(newStashedOrder);

              // Enforce maximum limit
              if (draft.stashedOrders.length > MAX_STASHED_ORDERS) {
                draft.stashedOrders = draft.stashedOrders.slice(
                  0,
                  MAX_STASHED_ORDERS
                );
              }
            });
          },

          restoreOrder: (id) => {
            const stashedOrder = get().stashedOrders.find(
              (order) => order.id === id
            );

            if (!stashedOrder) {
              console.warn(`[StashStore] restoreOrder: order ${id} not found`);
              return null;
            }

            // Remove from stash
            set((draft) => {
              draft.stashedOrders = draft.stashedOrders.filter(
                (order) => order.id !== id
              );
            });

            // Return deep cloned items
            return JSON.parse(JSON.stringify(stashedOrder.items));
          },

          deleteStashedOrder: (id) => {
            set((draft) => {
              draft.stashedOrders = draft.stashedOrders.filter(
                (order) => order.id !== id
              );
            });
          },

          clearAllStashedOrders: () => {
            set(() => initialState);
          },
        })),
        {
          name: `quick-sale-stash-${storeId}`,
          partialize: (state) => ({
            stashedOrders: state.stashedOrders,
          }),
        }
      ),
      {
        name: `stash-store-${storeId}`,
      }
    )
  );
}

/**
 * Type for the stash store hook
 */
export type StashStore = ReturnType<typeof createStashStore>;

// Selectors
export const selectStashedOrders = (state: StashState & StashActions) =>
  state.stashedOrders;

export const selectStashCount = (state: StashState & StashActions) =>
  state.stashedOrders.length;

export const selectHasStashedOrders = (state: StashState & StashActions) =>
  state.stashedOrders.length > 0;
