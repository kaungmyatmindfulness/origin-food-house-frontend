/**
 * Auth Types (Auth0-Only)
 *
 * Re-exports auto-generated types and defines types for Auth0 authentication flow.
 * Local authentication types have been removed as we now use Auth0 exclusively.
 */

// Re-export store selection DTO from auto-generated types
export type { ChooseStoreDto } from '@repo/api/generated/types';

/**
 * AccessTokenData
 * Response from backend after successful Auth0 authentication.
 * Contains the JWT access token and user info.
 *
 * Note: This type is not in the OpenAPI spec as it's an internal auth response.
 */
export interface AccessTokenData {
  access_token: string;
  userId: string;
  email: string;
}
