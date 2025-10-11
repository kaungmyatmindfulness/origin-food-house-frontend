/**
 * Application route constants.
 * Centralized route definitions to prevent typos and ease refactoring.
 */

export const ROUTES = {
  // Public routes
  LOGIN: '/login',
  REGISTER: '/register',

  // Store selection
  STORE_CHOOSE: '/store/choose',

  // Dashboard routes
  HUB: '/hub',
  PROFILE: '/hub/profile',
  SALE: '/hub/sale',

  // Owner/Admin routes
  MENU: '/hub/menu',
  TABLES_MANAGE: '/hub/tables/manage',
  TABLES_QR: '/hub/tables/qr-code',
  STORE_INFO: '/hub/store/information',
  STORE_SETTINGS: '/hub/store/settings',
} as const;

/**
 * User-friendly error messages for common scenarios
 */
export const ERROR_MESSAGES = {
  AUTH: {
    UNAUTHORIZED: 'Unauthorized',
    PERMISSION_DENIED: 'Permission Denied.',
    INVALID_SESSION: 'Invalid session data. Please log in again.',
    NO_PERMISSION: 'You do not have permission to access this page.',
    STORE_REQUIRED: 'Please select a store first.',
    ROLE_MISSING: 'Cannot verify permissions: User role not found.',
  },
  STORE: {
    REQUIRED_FOR_ROLE_CHECK:
      'Permission Denied: Store context required for role check.',
  },
} as const;
