'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import * as Popover from '@repo/ui/components/popover';

interface AccountPopoverProps {
  onLogout: () => void;
}

export function AccountPopover({ onLogout }: AccountPopoverProps) {
  const t = useTranslations('common');

  return (
    <Popover.PopoverContent
      className="bg-background z-50 w-40 border p-2 shadow"
      align="end"
      sideOffset={8}
    >
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        className="space-y-1"
      >
        <Link
          href="/profile"
          className="text-foreground hover:bg-accent active:bg-accent/80 block min-h-11 rounded px-3 py-3 text-base"
        >
          {t('profile')}
        </Link>
        <button
          onClick={onLogout}
          className="text-destructive hover:bg-accent active:bg-accent/80 block min-h-11 w-full rounded px-3 py-3 text-left text-base"
        >
          {t('logout')}
        </button>
      </motion.div>
    </Popover.PopoverContent>
  );
}
