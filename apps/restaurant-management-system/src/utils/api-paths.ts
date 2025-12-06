/**
 * API Paths Constants
 *
 * Centralized API path definitions for use with openapi-react-query.
 * These paths match the OpenAPI spec exactly and are used for:
 * - $api.useQuery() and $api.useMutation() calls
 * - Query cache invalidation with queryClient.invalidateQueries()
 *
 * Note: All paths include the /api/v1 prefix to match the backend routes.
 * The baseUrl should be just the host (e.g., http://localhost:3000).
 *
 * @example
 * ```ts
 * // In a component
 * const { data } = $api.useQuery('get', API_PATHS.categories, {
 *   params: { path: { storeId } }
 * });
 *
 * // Cache invalidation
 * queryClient.invalidateQueries({ queryKey: ['get', API_PATHS.categories] });
 * ```
 */

// ============================================================================
// Store Paths
// ============================================================================
export const API_PATHS = {
  // Stores
  stores: '/api/v1/stores' as const,
  store: '/api/v1/stores/{id}' as const,
  storeInformation: '/api/v1/stores/{id}/information' as const,
  storeSettings: '/api/v1/stores/{id}/settings' as const,
  storeSettingsLoyaltyRules:
    '/api/v1/stores/{id}/settings/loyalty-rules' as const,
  storeSettingsBusinessHours:
    '/api/v1/stores/{id}/settings/business-hours' as const,
  storeSettingsPrintSettings:
    '/api/v1/stores/{id}/settings/print-settings' as const,

  // Categories (nested under stores)
  categories: '/api/v1/stores/{storeId}/categories' as const,
  category: '/api/v1/stores/{storeId}/categories/{id}' as const,
  categoriesSort: '/api/v1/stores/{storeId}/categories/sort' as const,

  // Menu Items (nested under stores)
  menuItems: '/api/v1/stores/{storeId}/menu-items' as const,
  menuItem: '/api/v1/stores/{storeId}/menu-items/{id}' as const,

  // Translations
  translations: '/api/v1/translations' as const,

  // Tables (nested under stores)
  tables: '/api/v1/stores/{storeId}/tables' as const,
  tablesBatchSync: '/api/v1/stores/{storeId}/tables/batch-sync' as const,
  tablesStates: '/api/v1/stores/{storeId}/tables/states' as const,
  table: '/api/v1/stores/{storeId}/tables/{tableId}' as const,
  tableStatus: '/api/v1/stores/{storeId}/tables/{tableId}/status' as const,
  tableSession: '/api/v1/stores/{storeId}/tables/{tableId}/sessions' as const,

  // Cart (RMS-specific routes)
  cart: '/api/v1/rms/cart' as const,
  cartItems: '/api/v1/rms/cart/items' as const,
  cartItem: '/api/v1/rms/cart/items/{cartItemId}' as const,

  // Active Table Sessions (RMS-specific routes)
  // POST /rms/sessions creates manual sessions (walk-ins/counter orders)
  // GET /rms/sessions lists active sessions
  rmsSessions: '/api/v1/rms/sessions' as const,
  rmsSession: '/api/v1/rms/sessions/{sessionId}' as const,
  rmsSessionClose: '/api/v1/rms/sessions/{sessionId}/close' as const,

  // Orders (RMS-specific routes)
  rmsOrders: '/api/v1/rms/orders' as const,
  rmsOrdersCheckout: '/api/v1/rms/orders/checkout' as const,
  rmsOrdersQuickCheckout: '/api/v1/rms/orders/quick-checkout' as const,
  rmsOrder: '/api/v1/rms/orders/{orderId}' as const,
  rmsOrderStatus: '/api/v1/rms/orders/{orderId}/status' as const,
  rmsOrderItems: '/api/v1/rms/orders/{orderId}/items' as const,

  // Orders (shared store routes)
  storeOrders: '/api/v1/stores/{storeId}/orders' as const,
  storeOrder: '/api/v1/stores/{storeId}/orders/{orderId}' as const,

  // Orders (generic routes - for backward compatibility)
  order: '/api/v1/orders/{orderId}' as const,
  orderStatus: '/api/v1/orders/{orderId}/status' as const,
  ordersCheckout: '/api/v1/orders/checkout' as const,

  // Payments (record payment for order)
  recordPayment: '/api/v1/payments/orders/{orderId}' as const,

  // Sessions - shared paths
  sessions: '/api/v1/active-table-sessions' as const,
  session: '/api/v1/active-table-sessions/{sessionId}' as const,
  sessionManual: '/api/v1/active-table-sessions/manual' as const,
  sessionClose: '/api/v1/active-table-sessions/{sessionId}/close' as const,
  sessionOrders: '/api/v1/active-table-sessions/{sessionId}/orders' as const,
  sessionByToken: '/api/v1/active-table-sessions/token/{token}' as const,
  sessionJoinByTable:
    '/api/v1/active-table-sessions/join-by-table/{tableId}' as const,

  // Auth
  auth0Validate: '/api/v1/auth/auth0/validate' as const,
  auth0Profile: '/api/v1/auth/auth0/profile' as const,
  auth0Config: '/api/v1/auth/auth0/config' as const,
  loginWithStore: '/api/v1/auth/login/store' as const,

  // Reports
  storeReports: '/api/v1/stores/{storeId}/reports' as const,
  storeDailyReport: '/api/v1/stores/{storeId}/reports/daily' as const,

  // Personnel
  storePersonnel: '/api/v1/stores/{storeId}/personnel' as const,
  personnel: '/api/v1/stores/{storeId}/personnel/{userId}' as const,

  // Audit Logs
  auditLogs: '/api/v1/stores/{storeId}/audit-logs' as const,

  // Payments
  payments: '/api/v1/payments' as const,
  orderPayments: '/api/v1/payments/orders/{orderId}/payments' as const,
  orderRefunds: '/api/v1/payments/orders/{orderId}/refunds' as const,
  storeOrderPayments:
    '/api/v1/stores/{storeId}/orders/{orderId}/payments' as const,
  storeOrderRefunds:
    '/api/v1/stores/{storeId}/orders/{orderId}/refunds' as const,

  // User
  userProfile: '/api/v1/users/me' as const,
  userStores: '/api/v1/users/{id}/stores' as const,

  // Kitchen
  kitchenOrders: '/api/v1/stores/{storeId}/kitchen/orders' as const,
  kitchenOrderStatus:
    '/api/v1/stores/{storeId}/kitchen/orders/{orderId}/status' as const,

  // Print Settings
  printSettings: '/api/v1/stores/{storeId}/print-settings' as const,

  // Uploads
  upload: '/api/v1/upload' as const,
} as const;

/**
 * Type helper for API paths
 */
export type ApiPath = (typeof API_PATHS)[keyof typeof API_PATHS];
