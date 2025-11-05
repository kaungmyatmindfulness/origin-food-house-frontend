'use client';

import { useAuth0 } from '@auth0/auth0-react';

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
  } = useAuth0();

  const logout = () => {
    auth0Logout({
      logoutParams: {
        returnTo: typeof window !== 'undefined' ? window.location.origin : '',
      },
    });
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  };
}
