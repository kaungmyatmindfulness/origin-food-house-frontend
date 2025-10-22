/**
 * Auth Types (Auth0-Only)
 *
 * This file contains types for Auth0 authentication flow.
 * Local authentication types have been removed as we now use Auth0 exclusively.
 */

/**
 * ChooseStoreDto
 * Used for store selection after Auth0 authentication
 * Sent to: POST /auth/login/store
 */
export interface ChooseStoreDto {
  storeId: string;
}

/**
 * AccessTokenData
 * Response from backend after successful authentication
 * Contains the JWT access token
 */
export interface AccessTokenData {
  access_token: string;
}
