'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import * as Popover from '@repo/ui/components/popover';

export function NotificationPopover() {
  return (
    <Popover.PopoverContent
      className="bg-background z-50 w-64 border p-4 shadow"
      align="end"
      sideOffset={8}
    >
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
      >
        <h3 className="text-foreground mb-2 font-semibold">Notifications</h3>
        <ul className="text-muted-foreground space-y-2 text-sm">
          <li>No new notifications</li>
        </ul>
      </motion.div>
    </Popover.PopoverContent>
  );
}
