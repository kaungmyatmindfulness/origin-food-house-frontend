/**
 * Auth Service (Auth0-Only)
 *
 * This service has been migrated to use Auth0 exclusively.
 * All local authentication methods (login, register, password reset) have been removed.
 *
 * For Auth0-specific functionality, see: auth0.service.ts
 *
 * @deprecated This file is kept for backward compatibility but contains no active methods.
 * All authentication is now handled through Auth0.
 */

/**
 * NOTE: All authentication methods have been migrated to auth0.service.ts
 *
 * Available Auth0 methods:
 * - loginWithAuth0() - Initiates Auth0 login flow
 * - handleAuth0Callback() - Handles Auth0 callback and token exchange
 * - loginWithStoreAuth0(data) - Selects store after Auth0 authentication
 * - logoutFromAuth0() - Logs out from Auth0 and backend
 * - getAuth0User() - Gets current Auth0 user
 * - isAuth0Authenticated() - Checks Auth0 authentication status
 */
