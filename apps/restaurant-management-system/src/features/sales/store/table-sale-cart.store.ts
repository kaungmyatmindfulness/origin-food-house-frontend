import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

/**
 * Customization option for a table sale cart item
 */
export interface TableSaleCartCustomization {
  optionId: string;
  optionName: string;
  groupName: string;
  additionalPrice: number;
}

/**
 * Cart item stored in localStorage for table sale
 */
export interface TableSaleCartItem {
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
  customizations: TableSaleCartCustomization[];
  /** Special notes for this item */
  notes?: string;
  /** Timestamp when item was added */
  addedAt: string;
}

/**
 * Table sale cart state
 */
interface TableSaleCartState {
  /** Cart items stored locally */
  items: TableSaleCartItem[];
  /** Currently selected table ID */
  tableId: string | null;
  /** Active session ID for this table */
  sessionId: string | null;
  /** Active order ID if we're adding to an existing order */
  activeOrderId: string | null;
  /** When the cart was first created */
  createdAt?: string;
}

/**
 * Table sale cart actions
 */
interface TableSaleCartActions {
  /** Add item to cart (merges if same item with same customizations) */
  addItem: (item: Omit<TableSaleCartItem, 'localId' | 'addedAt'>) => void;
  /** Update quantity for a specific item */
  updateQuantity: (localId: string, quantity: number) => void;
  /** Update notes for a specific item */
  updateNotes: (localId: string, notes: string) => void;
  /** Remove item from cart */
  removeItem: (localId: string) => void;
  /** Set the active table */
  setTable: (tableId: string | null, sessionId?: string | null) => void;
  /** Set active order (for adding items to existing order) */
  setActiveOrder: (orderId: string | null) => void;
  /** Clear the entire cart */
  clearCart: () => void;
  /** Get subtotal (computed) */
  getSubtotal: () => number;
  /** Get total item count (computed) */
  getItemCount: () => number;
  /** Check if cart has expired (4 hours) */
  isExpired: () => boolean;
}

const initialState: TableSaleCartState = {
  items: [],
  tableId: null,
  sessionId: null,
  activeOrderId: null,
  createdAt: undefined,
};

/**
 * Cart expiry time in milliseconds (4 hours)
 */
const CART_EXPIRY_MS = 4 * 60 * 60 * 1000;

/**
 * Compare customizations to check if two items are identical
 */
function customizationsMatch(
  a: TableSaleCartCustomization[],
  b: TableSaleCartCustomization[]
): boolean {
  if (a.length !== b.length) return false;
  const aIds = a.map((c) => c.optionId).sort();
  const bIds = b.map((c) => c.optionId).sort();
  return aIds.every((id, i) => id === bIds[i]);
}

export const useTableSaleCartStore = create<
  TableSaleCartState & TableSaleCartActions
>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        addItem: (item) => {
          // Input validation - defensive programming
          if (!item.menuItemId) {
            console.warn('[TableSaleCart] addItem: missing menuItemId');
            return;
          }
          if (item.quantity < 1) {
            console.warn(
              '[TableSaleCart] addItem: invalid quantity',
              item.quantity
            );
            return;
          }
          if (item.basePrice < 0) {
            console.warn(
              '[TableSaleCart] addItem: invalid basePrice',
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

        setTable: (tableId, sessionId = null) => {
          set((draft) => {
            draft.tableId = tableId;
            draft.sessionId = sessionId;
            // Clear cart when changing tables
            if (tableId !== get().tableId) {
              draft.items = [];
              draft.activeOrderId = null;
              draft.createdAt = undefined;
            }
          });
        },

        setActiveOrder: (orderId) => {
          set((draft) => {
            draft.activeOrderId = orderId;
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

        isExpired: () => {
          const { createdAt } = get();
          if (!createdAt) return false;
          const createdTime = new Date(createdAt).getTime();
          return Date.now() - createdTime > CART_EXPIRY_MS;
        },
      })),
      {
        name: 'table-sale-cart',
        partialize: (state) => ({
          items: state.items,
          tableId: state.tableId,
          sessionId: state.sessionId,
          activeOrderId: state.activeOrderId,
          createdAt: state.createdAt,
        }),
      }
    ),
    {
      name: 'table-sale-cart-store',
    }
  )
);

// Selectors for convenience
export const selectTableSaleItems = (
  state: TableSaleCartState & TableSaleCartActions
) => state.items;

export const selectTableSaleTableId = (
  state: TableSaleCartState & TableSaleCartActions
) => state.tableId;

export const selectTableSaleSessionId = (
  state: TableSaleCartState & TableSaleCartActions
) => state.sessionId;

export const selectTableSaleActiveOrderId = (
  state: TableSaleCartState & TableSaleCartActions
) => state.activeOrderId;

export const selectTableSaleIsEmpty = (
  state: TableSaleCartState & TableSaleCartActions
) => state.items.length === 0;

export const selectTableSaleIsAddingToOrder = (
  state: TableSaleCartState & TableSaleCartActions
) => state.activeOrderId !== null;
