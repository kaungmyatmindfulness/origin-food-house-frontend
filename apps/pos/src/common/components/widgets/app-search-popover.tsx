'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import * as Popover from '@repo/ui/components/popover'; // Shadcn popover

/**
 * A simple, uncontrolled popover for search results.
 * Parent can just place <AppSearchPopover> inside a Popover.Trigger.
 */
export function AppSearchPopover() {
  return (
    <Popover.PopoverContent
      className="z-50 w-72 border bg-white p-4 shadow"
      align="center"
      sideOffset={8}
    >
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
      >
        <p className="mb-2 text-sm text-gray-500">Search Results</p>
        <ul className="space-y-1 text-sm">
          <li className="text-gray-700">Store #1</li>
          <li className="text-gray-700">Store #2</li>
          <li className="text-gray-700">Menu Item: Pizza</li>
        </ul>
      </motion.div>
    </Popover.PopoverContent>
  );
}
