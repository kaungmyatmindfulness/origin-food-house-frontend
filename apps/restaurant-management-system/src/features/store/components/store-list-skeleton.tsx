'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Skeleton } from '@repo/ui/components/skeleton';
import { StoreCardSkeleton } from './store-card-skeleton';

/** Renders a full page skeleton matching the ChooseStorePage structure. */
export function StoreListSkeleton() {
  return (
    <motion.section
      className="bg-card mx-auto mt-10 max-w-2xl rounded-xl border p-6 shadow-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Skeleton */}
      <header className="mb-6 space-y-2 text-center">
        <Skeleton className="mx-auto h-8 w-64" />
        <Skeleton className="mx-auto h-4 w-96" />
      </header>

      {/* Store List Grid Skeleton */}
      <motion.ul
        role="list"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {Array.from({ length: 4 }).map((_, idx) => (
          <StoreCardSkeleton key={idx} />
        ))}
      </motion.ul>

      {/* Footer Skeleton */}
      <footer className="mt-6 space-y-4">
        <Skeleton className="mx-auto h-4 w-48" />
      </footer>
    </motion.section>
  );
}
