/**
 * API Paths Constants
 *
 * Centralized API path definitions for use with openapi-react-query.
 * These paths match the OpenAPI spec exactly and are used for:
 * - $api.useQuery() and $api.useMutation() calls
 * - Query cache invalidation with queryClient.invalidateQueries()
 *
 * @example
 * ```ts
 * // In a component
 * const { data } = $api.useQuery('get', API_PATHS.categories(storeId), {
 *   params: { path: { storeId } }
 * });
 *
 * // Cache invalidation
 * queryClient.invalidateQueries({ queryKey: ['get', API_PATHS.categories(storeId)] });
 * ```
 */

// ============================================================================
// Store Paths
// ============================================================================
export const API_PATHS = {
  // Stores
  stores: '/stores' as const,
  store: (id: string) => `/stores/${id}` as const,
  storeInformation: (id: string) => `/stores/${id}/information` as const,
  storeSettings: (id: string) => `/stores/${id}/settings` as const,

  // Categories (nested under stores)
  categories: '/stores/{storeId}/categories' as const,
  category: '/stores/{storeId}/categories/{id}' as const,
  categoriesSort: '/stores/{storeId}/categories/sort' as const,

  // Menu Items (nested under stores)
  menuItems: '/stores/{storeId}/menu-items' as const,
  menuItem: '/stores/{storeId}/menu-items/{id}' as const,

  // Translations
  translations: '/translations' as const,

  // Tables (nested under stores)
  tables: '/stores/{storeId}/tables' as const,
  tablesBatchSync: '/stores/{storeId}/tables/batch-sync' as const,
  tablesStates: '/stores/{storeId}/tables/states' as const,

  // Cart (uses query param sessionId)
  cart: '/cart' as const,
  cartItems: '/cart/items' as const,
  cartItem: '/cart/items/{cartItemId}' as const,

  // Active Table Sessions (manual sessions for POS)
  activeTableSessions: '/active-table-sessions' as const,
  activeTableSession: '/active-table-sessions/{sessionId}' as const,
  activeTableSessionManual: '/active-table-sessions/manual' as const,

  // Orders
  orders: '/orders' as const,
  ordersCheckout: '/orders/checkout' as const,
  ordersQuickCheckout: '/orders/quick-checkout' as const,
  order: '/orders/{orderId}' as const,
  orderStatus: '/orders/{orderId}/status' as const,
  storeOrders: '/stores/{storeId}/orders' as const,

  // Sessions
  sessions: '/sessions' as const,
  session: '/sessions/{sessionId}' as const,
  storeActiveSessions: '/stores/{storeId}/sessions/active' as const,

  // Auth
  auth0Login: '/auth/auth0/login' as const,
  auth0Callback: '/auth/auth0/callback' as const,
  auth0Logout: '/auth/auth0/logout' as const,
  chooseStore: '/auth/choose-store' as const,
  currentUser: '/auth/me' as const,

  // Reports
  storeReports: '/stores/{storeId}/reports' as const,
  storeDailyReport: '/stores/{storeId}/reports/daily' as const,

  // Personnel
  storePersonnel: '/stores/{storeId}/personnel' as const,
  personnel: '/stores/{storeId}/personnel/{userId}' as const,

  // Audit Logs
  auditLogs: '/stores/{storeId}/audit-logs' as const,

  // Payments (Note: Some payment endpoints use raw fetch - not in OpenAPI spec)
  payments: '/payments' as const,
  orderPayments: (orderId: string) =>
    `/payments/orders/${orderId}/payments` as const,
  orderRefunds: (orderId: string) =>
    `/payments/orders/${orderId}/refunds` as const,

  // User
  userProfile: '/users/profile' as const,
  userStores: '/users/stores' as const,
} as const;

/**
 * Type helper for API paths
 */
export type ApiPath = (typeof API_PATHS)[keyof typeof API_PATHS];
