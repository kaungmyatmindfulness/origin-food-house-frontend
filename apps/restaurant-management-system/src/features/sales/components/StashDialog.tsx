'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Archive, ShoppingCart } from 'lucide-react';

import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';

import { MAX_STASH_NOTE_LENGTH } from '../constants/stash.constants';
import { formatCurrency } from '@/utils/formatting';

interface StashDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemCount: number;
  total: number;
  onStash: (note: string | null) => void;
}

/**
 * Dialog for stashing the current cart order
 * Shows order summary and allows adding an optional note
 */
export function StashDialog({
  open,
  onOpenChange,
  itemCount,
  total,
  onStash,
}: StashDialogProps) {
  const t = useTranslations('sales.stash');
  const tSales = useTranslations('sales');

  const [note, setNote] = useState('');

  const handleStash = () => {
    onStash(note.trim() || null);
    setNote('');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setNote('');
    onOpenChange(false);
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_STASH_NOTE_LENGTH) {
      setNote(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            {t('dialogTitle')}
          </DialogTitle>
          <DialogDescription>{t('dialogDescription')}</DialogDescription>
        </DialogHeader>

        {/* Order summary */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-2 text-sm">
              <ShoppingCart className="h-4 w-4" />
              {itemCount} {itemCount === 1 ? tSales('item') : tSales('items')}
            </span>
            <span className="text-lg font-semibold">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        {/* Note input */}
        <div className="space-y-2">
          <Label htmlFor="stash-note">{t('noteLabel')}</Label>
          <Input
            id="stash-note"
            value={note}
            onChange={handleNoteChange}
            placeholder={t('notePlaceholder')}
            className="h-12"
            maxLength={MAX_STASH_NOTE_LENGTH}
          />
          <p className="text-muted-foreground text-xs">
            {note.length}/{MAX_STASH_NOTE_LENGTH} {t('characters')}
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="h-12 w-full sm:w-auto"
          >
            {t('cancel')}
          </Button>
          <Button onClick={handleStash} className="h-12 w-full sm:w-auto">
            <Archive className="mr-2 h-4 w-4" />
            {t('stashButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
