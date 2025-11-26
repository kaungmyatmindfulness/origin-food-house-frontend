'use client';

/**
 * Application providers for the RMS application.
 * Configured for offline-first static export (SSG).
 */
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { client } from '@repo/api';

import { NetworkProvider } from './network-provider';

// Configure API client with base URL and credentials
// This must be done at module level (before components render) to ensure
// all API calls use the correct configuration
const baseUrl = process.env.NEXT_PUBLIC_API_URL;
if (baseUrl) {
  client.setConfig({
    baseUrl,
    credentials: 'include', // Send cookies with cross-origin requests
    headers: {
      'Content-Type': 'application/json',
    },
  });
} else {
  console.error('NEXT_PUBLIC_API_URL is not defined in environment variables');
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 30 * 60 * 1000, // 30 minutes - keep cached data longer for offline
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: true,
        // Offline-first: Only retry if online
        retry: (failureCount) => {
          return (
            typeof navigator !== 'undefined' &&
            navigator.onLine &&
            failureCount < 2
          );
        },
        // Offline-first network mode
        networkMode: 'offlineFirst',
      },
      mutations: {
        retry: 0,
        // Offline-first network mode for mutations
        networkMode: 'offlineFirst',
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export default function Providers({ children }: { children: React.ReactNode }) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();

  return (
    <NetworkProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </NetworkProvider>
  );
}
