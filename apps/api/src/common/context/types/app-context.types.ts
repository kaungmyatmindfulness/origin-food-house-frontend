/**
 * App Context Types
 *
 * Defines the valid app contexts for API version routing.
 * Used to detect which frontend app is making the request.
 */

/**
 * Valid app contexts as a const tuple for type safety
 */
export const APP_CONTEXTS = ['rms', 'sos', 'admin', 'public'] as const;

/**
 * Union type of valid app contexts
 * - rms: Restaurant Management System (staff POS)
 * - sos: Self-Ordering System (customer ordering)
 * - admin: Admin Platform (platform administration)
 * - public: Public/unauthenticated requests
 */
export type AppContext = (typeof APP_CONTEXTS)[number];

/**
 * Type guard to validate if a string is a valid AppContext
 * @param value - String to validate
 * @returns True if value is a valid AppContext
 */
export function isValidAppContext(value: string): value is AppContext {
  return APP_CONTEXTS.includes(value as AppContext);
}
