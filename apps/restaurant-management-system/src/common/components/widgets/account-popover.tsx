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
      className="z-50 w-40 border bg-white p-2 shadow"
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
          className="block min-h-11 rounded px-3 py-3 text-base text-gray-700 hover:bg-gray-100 active:bg-gray-200"
        >
          {t('profile')}
        </Link>
        <button
          onClick={onLogout}
          className="block min-h-11 w-full rounded px-3 py-3 text-left text-base text-red-600 hover:bg-gray-100 active:bg-gray-200"
        >
          {t('logout')}
        </button>
      </motion.div>
    </Popover.PopoverContent>
  );
}
