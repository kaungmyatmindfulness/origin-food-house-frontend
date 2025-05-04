// src/features/menu/components/menu-skeleton.tsx
import React from 'react';
import { Skeleton } from '@repo/ui/components/skeleton';
import { Card, CardHeader, CardFooter } from '@repo/ui/components/card'; // Keep Card for skeleton structure

interface MenuSkeletonProps {
  storeName?: string; // Optional prop for potential future use
}

export function MenuSkeleton({ storeName }: MenuSkeletonProps) {
  return (
    <div className="container mx-auto animate-pulse px-4 py-8">
      {/* Header Skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-32 sm:w-40" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>
      {/* Controls Skeleton */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <Skeleton className="h-10 w-full rounded-md sm:w-64" />
        <Skeleton className="h-10 flex-grow rounded-md" />
      </div>
      {/* Menu Item Skeletons */}
      <div className="space-y-8">
        {[1, 2].map((cat) => (
          <div key={cat}>
            <Skeleton className="mb-4 h-8 w-1/3 rounded-md" />
            {/* Updated skeleton structure to match new MenuItemCard layout */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex gap-4 border-b border-gray-200 pb-4 last:border-b-0"
                >
                  <Skeleton className="h-24 w-24 flex-shrink-0 rounded-md sm:h-28 sm:w-28" />
                  <div className="flex flex-grow flex-col justify-between gap-1">
                    <div>
                      <Skeleton className="mb-2 h-6 w-3/4 rounded" />
                      <Skeleton className="mb-1 h-4 w-full rounded" />
                      <Skeleton className="h-4 w-5/6 rounded" />
                    </div>
                    <div className="mt-2 flex items-end justify-between">
                      <Skeleton className="h-6 w-1/4 rounded" />
                      <Skeleton className="h-9 w-9 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
