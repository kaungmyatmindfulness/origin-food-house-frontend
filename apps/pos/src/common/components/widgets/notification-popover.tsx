'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import * as Popover from '@repo/ui/components/popover';

export function NotificationPopover() {
  return (
    <Popover.PopoverContent
      className="z-50 w-64 border bg-white p-4 shadow"
      align="end"
      sideOffset={8}
    >
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
      >
        <h3 className="mb-2 font-semibold text-gray-800">Notifications</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>No new notifications</li>
        </ul>
      </motion.div>
    </Popover.PopoverContent>
  );
}
