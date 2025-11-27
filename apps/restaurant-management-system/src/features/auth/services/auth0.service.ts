/**
 * Auth0 Service
 *
 * Service layer for Auth0 authentication operations.
 * Uses openapi-fetch for type-safe API calls with auto-generated types.
 */

import type { User } from '@auth0/auth0-spa-js';

import { getAuth0Client } from '@/lib/auth0';
import { apiClient, ApiError } from '@/utils/apiFetch';
import type { ChooseStoreDto } from '@repo/api/generated/types';

/** Access token data from backend after Auth0 validation */
interface AccessTokenData {
  accessToken: string;
  userId: string;
  email: string;
}

/** Standard API response wrapper */
interface StandardApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

/**
 * Initiates Auth0 login flow.
 * Redirects user to Auth0 login page.
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
 * Handles Auth0 callback after successful authentication.
 * Validates Auth0 token with backend and gets JWT.
 *
 * @returns Access token data from backend
 * @throws {ApiError} If callback handling or token validation fails
 */
export async function handleAuth0Callback(): Promise<AccessTokenData> {
  const auth0Client = await getAuth0Client();

  await auth0Client.handleRedirectCallback();

  const auth0Token = await auth0Client.getTokenSilently();

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

  const json = await response.json();

  // Handle both wrapped ({ status, data }) and unwrapped response formats
  if (json.status === 'success' && json.data) {
    return json.data as AccessTokenData;
  }

  // Backend returns data directly (accessToken at root level)
  if (json.accessToken) {
    return json as AccessTokenData;
  }

  throw new ApiError('Invalid response from authentication server', 500);
}

/**
 * Gets the current Auth0 user information.
 *
 * @returns User info or null if not authenticated
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
 * Checks if user is authenticated with Auth0.
 *
 * @returns True if authenticated
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
 * Logs out from both Auth0 and backend.
 * Clears all tokens and redirects to home page.
 *
 * @param returnToUrl - Optional URL to redirect after logout
 */
export async function logoutFromAuth0(returnToUrl?: string): Promise<void> {
  try {
    const auth0Client = await getAuth0Client();

    // Use raw fetch since /auth/logout is not in OpenAPI spec
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    await auth0Client.logout({
      logoutParams: {
        returnTo: returnToUrl || `${window.location.origin}/`,
      },
    });
  } catch (error) {
    console.error('Failed to logout from Auth0:', error);
    window.location.href = returnToUrl || '/';
  }
}

/**
 * Selects store after Auth0 authentication.
 * Called after successful Auth0 login to set store context.
 *
 * @param storeData - Store selection data
 * @returns Access token with store context
 * @throws {ApiError} If store login fails
 */
export async function loginWithStoreAuth0(
  storeData: ChooseStoreDto
): Promise<AccessTokenData> {
  const { data, error, response } = await apiClient.POST('/auth/login/store', {
    body: storeData,
  });

  const res = data as unknown as
    | StandardApiResponse<AccessTokenData>
    | undefined;

  if (error || !res?.data) {
    throw new ApiError(
      res?.message || 'Failed to select store',
      response.status
    );
  }

  return res.data;
}

/**
 * Gets Auth0 token silently (without user interaction).
 * Used for refreshing tokens.
 *
 * @returns Access token or null
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
