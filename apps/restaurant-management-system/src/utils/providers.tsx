'use client';

/**
 * Application providers for the RMS application.
 * Configured for offline-first static export (SSG).
 *
 * The QueryClient configuration is centralized in apiFetch.ts to ensure
 * both the provider and $api hooks use the same settings.
 */
import { QueryClientProvider } from '@tanstack/react-query';

import { UpdateChecker } from '@/features/updates/components/UpdateChecker';

import { getQueryClient } from './apiFetch';
import { NetworkProvider } from './network-provider';

export default function Providers({ children }: { children: React.ReactNode }) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();

  return (
    <NetworkProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <UpdateChecker />
      </QueryClientProvider>
    </NetworkProvider>
  );
}
