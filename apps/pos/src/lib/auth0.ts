import { Auth0Client } from '@auth0/auth0-spa-js';

/**
 * Auth0 Configuration
 */
const AUTH0_CONFIG = {
  domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN!,
  clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!,
  authorizationParams: {
    redirect_uri:
      process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI ||
      `${window.location.origin}/auth/callback`,
    audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
  },
  cacheLocation: 'localstorage' as const,
  useRefreshTokens: true,
};

let auth0ClientInstance: Auth0Client | null = null;

/**
 * Get or create the Auth0 client instance
 *
 * @returns {Promise<Auth0Client>} The Auth0 client instance
 */
export async function getAuth0Client(): Promise<Auth0Client> {
  if (!auth0ClientInstance) {
    auth0ClientInstance = new Auth0Client(AUTH0_CONFIG);
  }
  return auth0ClientInstance;
}

/**
 * Check if Auth0 configuration is valid
 *
 * @returns {boolean} True if Auth0 is properly configured
 */
export function isAuth0Configured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_AUTH0_DOMAIN &&
    process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID &&
    !process.env.NEXT_PUBLIC_AUTH0_DOMAIN.includes('your-tenant') &&
    !process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID.includes('your-client-id')
  );
}
