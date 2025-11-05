'use client';

import { Auth0Provider as Auth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

interface Auth0ProviderProps {
  children: ReactNode;
}

export function Auth0Provider({ children }: Auth0ProviderProps) {
  const router = useRouter();

  const onRedirectCallback = (appState?: { returnTo?: string }) => {
    router.push(appState?.returnTo || '/dashboard');
  };

  return (
    <Auth0
      domain={process.env.NEXT_PUBLIC_ADMIN_AUTH0_DOMAIN!}
      clientId={process.env.NEXT_PUBLIC_ADMIN_AUTH0_CLIENT_ID!}
      authorizationParams={{
        redirect_uri: process.env.NEXT_PUBLIC_ADMIN_AUTH0_REDIRECT_URI!,
        audience: process.env.NEXT_PUBLIC_ADMIN_AUTH0_AUDIENCE,
      }}
      cacheLocation="localstorage"
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0>
  );
}
