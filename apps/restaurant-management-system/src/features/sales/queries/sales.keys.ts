/**
 * Query key factory for sales-related queries.
 * Centralizes all sales query keys to prevent typos and ensure consistency.
 *
 * Note: Some queries may reference existing keys from other features
 * (e.g., menuKeys, tableKeys) but are aliased here for sales context.
 *
 * @see https://tkdodo.eu/blog/effective-react-query-keys
 */

export const salesKeys = {
  all: ['sales'] as const,

  /**
   * Cart queries - keyed by session ID
   */
  cart: (sessionId: string) => [...salesKeys.all, 'cart', sessionId] as const,

  /**
   * Active orders for a store (pending, in-progress)
   */
  activeOrders: (storeId: string) =>
    [...salesKeys.all, 'activeOrders', { storeId }] as const,

  /**
   * Single order detail
   */
  order: (orderId: string) => [...salesKeys.all, 'order', orderId] as const,

  /**
   * Tables with status for a store
   */
  tables: (storeId: string) =>
    [...salesKeys.all, 'tables', { storeId }] as const,

  /**
   * Single table detail with current session/order info
   */
  tableDetail: (tableId: string) =>
    [...salesKeys.all, 'table', tableId] as const,

  /**
   * Menu items for quick sale display
   * Note: Can also use menuKeys.items() from menu feature
   */
  menuItems: (storeId: string) =>
    [...salesKeys.all, 'menuItems', { storeId }] as const,

  /**
   * Categories for menu filtering
   * Note: Can also use menuKeys.categories() from menu feature
   */
  categories: (storeId: string) =>
    [...salesKeys.all, 'categories', { storeId }] as const,

  /**
   * Session queries - for managing ordering sessions
   */
  sessions: (storeId: string) =>
    [...salesKeys.all, 'sessions', { storeId }] as const,

  /**
   * Single session detail
   */
  session: (sessionId: string) =>
    [...salesKeys.all, 'session', sessionId] as const,

  /**
   * Payment history for an order
   */
  payments: (orderId: string) =>
    [...salesKeys.all, 'payments', orderId] as const,
};
