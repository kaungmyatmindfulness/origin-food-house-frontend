'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { Skeleton } from '@repo/ui/components/skeleton';
import { cn } from '@repo/ui/lib/utils';

export const StoreCardSkeleton: React.FC = () => {
  return (
    <motion.li
      className="list-none"
      // Optionally you can define initial/animate/exit for each item
    >
      <div
        className={cn(
          'flex w-full flex-col rounded-lg border bg-white p-4 shadow-sm'
        )}
        aria-hidden="true"
      >
        {/* Mimic store name */}
        <Skeleton className="mb-2 h-6 w-3/4" />
        {/* Mimic store address */}
        <Skeleton className="mb-1 h-4 w-5/6" />
        {/* Mimic store phone */}
        <Skeleton className="h-4 w-1/2" />
        {/* Mimic role badge */}
        <div className="mt-4">
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
    </motion.li>
  );
};

StoreCardSkeleton.displayName = 'StoreCardSkeleton';
