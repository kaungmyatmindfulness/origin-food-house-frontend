'use client';

import { useTranslations } from 'next-intl';
import { RefreshCw, Merge, Archive, AlertTriangle } from 'lucide-react';

import { Button } from '@repo/ui/components/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@repo/ui/components/alert-dialog';

export type RestoreConflictAction = 'replace' | 'merge' | 'stash-first';

interface RestoreConflictDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (action: RestoreConflictAction) => void;
  currentItemCount: number;
  stashedItemCount: number;
}

/**
 * AlertDialog shown when restoring a stashed order but cart already has items
 * Provides three options: Replace, Merge, or Stash Current First
 */
export function RestoreConflictDialog({
  open,
  onOpenChange,
  onAction,
  currentItemCount,
  stashedItemCount,
}: RestoreConflictDialogProps) {
  const t = useTranslations('sales.restoreConflict');
  const tSales = useTranslations('sales');

  const handleAction = (action: RestoreConflictAction) => {
    onAction(action);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="text-warning h-5 w-5" />
            {t('title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('description', {
              currentCount: currentItemCount,
              currentItems:
                currentItemCount === 1 ? tSales('item') : tSales('items'),
              stashedCount: stashedItemCount,
              stashedItems:
                stashedItemCount === 1 ? tSales('item') : tSales('items'),
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 py-4">
          {/* Replace option */}
          <Button
            variant="outline"
            className="h-auto w-full flex-col items-start gap-1 p-4 text-left"
            onClick={() => handleAction('replace')}
          >
            <div className="flex w-full items-center gap-2">
              <RefreshCw className="h-5 w-5 shrink-0" />
              <span className="font-medium">{t('replaceTitle')}</span>
            </div>
            <span className="text-muted-foreground ml-7 text-sm">
              {t('replaceDescription')}
            </span>
          </Button>

          {/* Merge option */}
          <Button
            variant="outline"
            className="h-auto w-full flex-col items-start gap-1 p-4 text-left"
            onClick={() => handleAction('merge')}
          >
            <div className="flex w-full items-center gap-2">
              <Merge className="h-5 w-5 shrink-0" />
              <span className="font-medium">{t('mergeTitle')}</span>
            </div>
            <span className="text-muted-foreground ml-7 text-sm">
              {t('mergeDescription')}
            </span>
          </Button>

          {/* Stash first option */}
          <Button
            variant="outline"
            className="h-auto w-full flex-col items-start gap-1 p-4 text-left"
            onClick={() => handleAction('stash-first')}
          >
            <div className="flex w-full items-center gap-2">
              <Archive className="h-5 w-5 shrink-0" />
              <span className="font-medium">{t('stashFirstTitle')}</span>
            </div>
            <span className="text-muted-foreground ml-7 text-sm">
              {t('stashFirstDescription')}
            </span>
          </Button>
        </div>

        <AlertDialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-12 w-full"
          >
            {t('cancel')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
