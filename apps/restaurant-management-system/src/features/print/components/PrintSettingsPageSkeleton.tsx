'use client';

import { Skeleton } from '@repo/ui/components/skeleton';

interface PrintSettingsPageSkeletonProps {
  /** Accessible label for the loading state */
  loadingLabel: string;
}

/**
 * Loading skeleton for the print settings page.
 * Shows placeholder UI while settings are being fetched.
 */
export function PrintSettingsPageSkeleton({
  loadingLabel,
}: PrintSettingsPageSkeletonProps) {
  return (
    <div
      className="mx-auto max-w-6xl space-y-6 p-6"
      role="status"
      aria-label={loadingLabel}
    >
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-72" />
      </div>

      {/* Tabs skeleton */}
      <div className="space-y-6">
        <div className="hidden gap-1 md:grid md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
        <Skeleton className="h-10 w-full rounded-md md:hidden" />

        {/* Content skeleton */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="border-border rounded-lg border p-6">
            <Skeleton className="mb-2 h-6 w-40" />
            <Skeleton className="mb-6 h-4 w-64" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-2/3" />
            </div>
          </div>
          <div className="border-border flex items-center justify-center rounded-lg border p-6">
            <Skeleton className="h-64 w-48" />
          </div>
        </div>
      </div>

      <span className="sr-only">{loadingLabel}</span>
    </div>
  );
}
