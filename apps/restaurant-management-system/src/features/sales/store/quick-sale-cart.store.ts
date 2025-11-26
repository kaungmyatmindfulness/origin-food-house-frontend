import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import type { SessionType } from '../types/sales.types';

/**
 * Customization option for a draft cart item
 */
export interface DraftCartCustomization {
  optionId: string;
  optionName: string;
  groupName: string;
  additionalPrice: number;
}

/**
 * Cart item stored in localStorage for quick sale
 */
export interface DraftCartItem {
  /** Local UUID for tracking (not server ID) */
  localId: string;
  /** Menu item ID from server */
  menuItemId: string;
  /** Menu item name for display */
  menuItemName: string;
  /** Menu item image path */
  menuItemImage?: string;
  /** Base price of the item */
  basePrice: number;
  /** Quantity of items */
  quantity: number;
  /** Selected customizations */
  customizations: DraftCartCustomization[];
  /** Special notes for this item */
  notes?: string;
  /** Timestamp when item was added */
  addedAt: string;
}

/**
 * Quick sale cart state
 */
interface QuickSaleCartState {
  /** Cart items stored locally */
  items: DraftCartItem[];
  /** Session type for this order */
  sessionType: Exclude<SessionType, 'TABLE'>;
  /** Customer name (optional, useful for phone orders) */
  customerName?: string;
  /** Customer phone (optional, useful for phone orders) */
  customerPhone?: string;
  /** Order-level notes */
  orderNotes?: string;
  /** When the cart was first created */
  createdAt?: string;
}

/**
 * Quick sale cart actions
 */
interface QuickSaleCartActions {
  /** Add item to cart (merges if same item with same customizations) */
  addItem: (item: Omit<DraftCartItem, 'localId' | 'addedAt'>) => void;
  /** Update quantity for a specific item */
  updateQuantity: (localId: string, quantity: number) => void;
  /** Update notes for a specific item */
  updateNotes: (localId: string, notes: string) => void;
  /** Remove item from cart */
  removeItem: (localId: string) => void;
  /** Set session type */
  setSessionType: (type: Exclude<SessionType, 'TABLE'>) => void;
  /** Set customer information */
  setCustomerInfo: (name?: string, phone?: string) => void;
  /** Set order-level notes */
  setOrderNotes: (notes: string) => void;
  /** Clear the entire cart */
  clearCart: () => void;
  /** Get subtotal (computed) */
  getSubtotal: () => number;
  /** Get total item count (computed) */
  getItemCount: () => number;
}

const initialState: QuickSaleCartState = {
  items: [],
  sessionType: 'COUNTER',
  customerName: undefined,
  customerPhone: undefined,
  orderNotes: undefined,
  createdAt: undefined,
};

/**
 * Compare customizations to check if two items are identical
 */
function customizationsMatch(
  a: DraftCartCustomization[],
  b: DraftCartCustomization[]
): boolean {
  if (a.length !== b.length) return false;
  const aIds = a.map((c) => c.optionId).sort();
  const bIds = b.map((c) => c.optionId).sort();
  return aIds.every((id, i) => id === bIds[i]);
}

export const useQuickSaleCartStore = create<
  QuickSaleCartState & QuickSaleCartActions
>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        addItem: (item) => {
          // Input validation - defensive programming
          if (!item.menuItemId) {
            console.warn('[QuickSaleCart] addItem: missing menuItemId');
            return;
          }
          if (item.quantity < 1) {
            console.warn(
              '[QuickSaleCart] addItem: invalid quantity',
              item.quantity
            );
            return;
          }
          if (item.basePrice < 0) {
            console.warn(
              '[QuickSaleCart] addItem: invalid basePrice',
              item.basePrice
            );
            return;
          }

          // Check if same item with same customizations and notes exists
          const existingItem = get().items.find(
            (i) =>
              i.menuItemId === item.menuItemId &&
              i.notes === item.notes &&
              customizationsMatch(i.customizations, item.customizations)
          );

          if (existingItem) {
            // Increment quantity of existing item
            set((draft) => {
              const existingDraftItem = draft.items.find(
                (i) => i.localId === existingItem.localId
              );
              if (existingDraftItem) {
                existingDraftItem.quantity += item.quantity;
              }
            });
          } else {
            // Add as new item
            set((draft) => {
              draft.items.push({
                ...item,
                localId: crypto.randomUUID(),
                addedAt: new Date().toISOString(),
              });
              // Set createdAt if this is the first item
              if (!draft.createdAt) {
                draft.createdAt = new Date().toISOString();
              }
            });
          }
        },

        updateQuantity: (localId, quantity) => {
          if (quantity <= 0) {
            get().removeItem(localId);
            return;
          }
          set((draft) => {
            const item = draft.items.find((i) => i.localId === localId);
            if (item) {
              item.quantity = quantity;
            }
          });
        },

        updateNotes: (localId, notes) => {
          set((draft) => {
            const item = draft.items.find((i) => i.localId === localId);
            if (item) {
              item.notes = notes;
            }
          });
        },

        removeItem: (localId) => {
          set((draft) => {
            draft.items = draft.items.filter((i) => i.localId !== localId);
          });
        },

        setSessionType: (sessionType) => {
          set((draft) => {
            draft.sessionType = sessionType;
          });
        },

        setCustomerInfo: (name, phone) => {
          set((draft) => {
            draft.customerName = name;
            draft.customerPhone = phone;
          });
        },

        setOrderNotes: (notes) => {
          set((draft) => {
            draft.orderNotes = notes;
          });
        },

        clearCart: () => {
          set(() => initialState);
        },

        getSubtotal: () => {
          return get().items.reduce((total, item) => {
            const customizationTotal = item.customizations.reduce(
              (sum, c) => sum + c.additionalPrice,
              0
            );
            return (
              total + (item.basePrice + customizationTotal) * item.quantity
            );
          }, 0);
        },

        getItemCount: () => {
          return get().items.reduce((count, item) => count + item.quantity, 0);
        },
      })),
      {
        name: 'quick-sale-cart',
        partialize: (state) => ({
          items: state.items,
          sessionType: state.sessionType,
          customerName: state.customerName,
          customerPhone: state.customerPhone,
          orderNotes: state.orderNotes,
          createdAt: state.createdAt,
        }),
      }
    ),
    {
      name: 'quick-sale-cart-store',
    }
  )
);

// Selectors for convenience
export const selectQuickSaleItems = (
  state: QuickSaleCartState & QuickSaleCartActions
) => state.items;

export const selectQuickSaleSessionType = (
  state: QuickSaleCartState & QuickSaleCartActions
) => state.sessionType;

export const selectQuickSaleCustomerInfo = (
  state: QuickSaleCartState & QuickSaleCartActions
) => ({
  name: state.customerName,
  phone: state.customerPhone,
});

export const selectQuickSaleOrderNotes = (
  state: QuickSaleCartState & QuickSaleCartActions
) => state.orderNotes;

export const selectQuickSaleIsEmpty = (
  state: QuickSaleCartState & QuickSaleCartActions
) => state.items.length === 0;
