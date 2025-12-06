'use client';

/**
 * Application providers for the Self-Ordering System.
 * Configured for SSR with React Query for server state management.
 *
 * Uses the centralized QueryClient configuration from apiFetch.ts
 * to ensure consistent settings between the provider and $api hooks.
 */
import { QueryClientProvider } from '@tanstack/react-query';

import { getQueryClient } from '@/utils/apiFetch';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
