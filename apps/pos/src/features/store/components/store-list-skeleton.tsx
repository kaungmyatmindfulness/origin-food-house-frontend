'use client';

import React from 'react';
import { motion } from 'motion/react';
import { StoreCardSkeleton } from './store-card-skeleton';

/** Renders a list of 4 skeleton items. */
export function StoreListSkeleton() {
  return (
    <motion.ul
      role="list"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2"
      // Framer Motion props
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.3 } }}
      transition={{ duration: 0.3 }}
    >
      {Array.from({ length: 4 }).map((_, idx) => (
        <StoreCardSkeleton key={idx} />
      ))}
    </motion.ul>
  );
}
