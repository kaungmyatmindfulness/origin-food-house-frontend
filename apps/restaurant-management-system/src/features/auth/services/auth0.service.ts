/**
 * Auth0 Service
 *
 * Service layer for Auth0 authentication operations.
 * Uses openapi-fetch for type-safe API calls.
 */

import type { User } from '@auth0/auth0-spa-js';
import { getAuth0Client } from '@/lib/auth0';
import { apiClient, ApiError } from '@/utils/apiFetch';
import type { StandardApiResponse } from '@/common/types/api.types';
import type { AccessTokenData, ChooseStoreDto } from '../types/auth.types';

/**
 * Auth0 Token Exchange Response
 * Contains the Auth0 token that will be exchanged for a backend JWT
 */
export interface Auth0TokenResponse {
  auth0Token: string;
  idToken?: string;
}

/**
 * Initiates Auth0 login flow
 * Redirects user to Auth0 login page
 *
 * @throws {Error} If Auth0 client initialization fails
 */
export async function loginWithAuth0(): Promise<void> {
  const auth0Client = await getAuth0Client();

  await auth0Client.loginWithRedirect({
    authorizationParams: {
      redirect_uri:
        process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI ||
        `${window.location.origin}/auth/callback`,
    },
  });
}

/**
 * Handles Auth0 callback after successful authentication
 * Validates Auth0 token with backend and gets JWT
 *
 * @returns {Promise<StandardApiResponse<AccessTokenData>>} Backend access token
 * @throws {Error} If callback handling or token validation fails
 */
export async function handleAuth0Callback(): Promise<
  StandardApiResponse<AccessTokenData>
> {
  const auth0Client = await getAuth0Client();

  // Handle the Auth0 redirect callback
  await auth0Client.handleRedirectCallback();

  // Get the Auth0 access token
  const auth0Token = await auth0Client.getTokenSilently();

  // Validate Auth0 token with backend and get backend JWT (Step 1)
  // Note: We need to use raw fetch here because we need to pass a custom Authorization header
  // that is different from the cookie-based auth used by apiClient
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetch(`${baseUrl}/auth/auth0/validate`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth0Token}`,
    },
  });

  if (!response.ok) {
    throw new ApiError('Failed to validate Auth0 token', response.status);
  }

  return response.json() as Promise<StandardApiResponse<AccessTokenData>>;
}

/**
 * Gets the current Auth0 user information
 *
 * @returns {Promise<User | null>} User info or null if not authenticated
 */
export async function getAuth0User(): Promise<User | null> {
  try {
    const auth0Client = await getAuth0Client();
    const isAuthenticated = await auth0Client.isAuthenticated();

    if (!isAuthenticated) {
      return null;
    }

    const user = await auth0Client.getUser();
    return user ?? null;
  } catch (error) {
    console.error('Failed to get Auth0 user:', error);
    return null;
  }
}

/**
 * Checks if user is authenticated with Auth0
 *
 * @returns {Promise<boolean>} True if authenticated
 */
export async function isAuth0Authenticated(): Promise<boolean> {
  try {
    const auth0Client = await getAuth0Client();
    return await auth0Client.isAuthenticated();
  } catch (error) {
    console.error('Failed to check Auth0 authentication:', error);
    return false;
  }
}

/**
 * Logs out from both Auth0 and backend
 * Clears all tokens and redirects to home page
 *
 * @param returnToUrl - Optional URL to redirect after logout
 */
export async function logoutFromAuth0(returnToUrl?: string): Promise<void> {
  try {
    const auth0Client = await getAuth0Client();

    // Call backend logout endpoint to clear httpOnly cookie
    await apiClient.POST('/auth/logout', {});

    // Logout from Auth0
    await auth0Client.logout({
      logoutParams: {
        returnTo: returnToUrl || `${window.location.origin}/`,
      },
    });
  } catch (error) {
    console.error('Failed to logout from Auth0:', error);
    // Force redirect to home page even if logout fails
    window.location.href = returnToUrl || '/';
  }
}

/**
 * POST /auth/login/store (Step 2) - Store selection after Auth0 login
 * This is called after successful Auth0 authentication and token exchange
 *
 * @param storeData - Store selection data
 * @returns {Promise<AccessTokenData>} Access token with store context
 * @throws {Error} If store login fails
 */
export async function loginWithStoreAuth0(
  storeData: ChooseStoreDto
): Promise<AccessTokenData> {
  const { data, error, response } = await apiClient.POST('/auth/login/store', {
    body: storeData,
  });

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to select store',
      response.status
    );
  }

  return data.data as AccessTokenData;
}

/**
 * Gets Auth0 token silently (without user interaction)
 * Used for refreshing tokens
 *
 * @returns {Promise<string | null>} Access token or null
 */
export async function getAuth0TokenSilently(): Promise<string | null> {
  try {
    const auth0Client = await getAuth0Client();
    return await auth0Client.getTokenSilently();
  } catch (error) {
    console.error('Failed to get Auth0 token silently:', error);
    return null;
  }
}
