'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Loader2, Cloud } from 'lucide-react';

import { cn } from '@repo/ui/lib/utils';

import { useQuickSaleCartStore } from '../store/quick-sale-cart.store';

type SaveStatus = 'idle' | 'saving' | 'saved';

const DEBOUNCE_MS = 2000;
const SAVED_DISPLAY_MS = 3000;

interface SaveIndicatorProps {
  className?: string;
}

/**
 * Shows auto-save status indicator for the quick sale cart.
 * Debounces changes and shows "Saving..." then "Saved" states.
 */
export function SaveIndicator({ className }: SaveIndicatorProps) {
  const t = useTranslations('sales');

  const items = useQuickSaleCartStore((state) => state.items);
  const orderNotes = useQuickSaleCartStore((state) => state.orderNotes);
  const customerName = useQuickSaleCartStore((state) => state.customerName);
  const customerPhone = useQuickSaleCartStore((state) => state.customerPhone);
  const sessionType = useQuickSaleCartStore((state) => state.sessionType);

  const [status, setStatus] = useState<SaveStatus>('idle');
  const previousDataRef = useRef<string | null>(null);
  const savingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create a snapshot of relevant data to detect changes
  const dataSnapshot = JSON.stringify({
    items,
    orderNotes,
    customerName,
    customerPhone,
    sessionType,
  });

  useEffect(() => {
    // Skip on initial mount
    if (previousDataRef.current === null) {
      previousDataRef.current = dataSnapshot;
      return;
    }

    // No change detected
    if (previousDataRef.current === dataSnapshot) {
      return;
    }

    // Data changed - start debounced "saving" flow
    previousDataRef.current = dataSnapshot;

    // Clear any existing timeouts
    if (savingTimeoutRef.current) {
      clearTimeout(savingTimeoutRef.current);
    }
    if (savedTimeoutRef.current) {
      clearTimeout(savedTimeoutRef.current);
    }

    // Show "saving" immediately
    setStatus('saving');

    // After debounce period, show "saved"
    savingTimeoutRef.current = setTimeout(() => {
      setStatus('saved');

      // After display period, hide indicator
      savedTimeoutRef.current = setTimeout(() => {
        setStatus('idle');
      }, SAVED_DISPLAY_MS);
    }, DEBOUNCE_MS);

    return () => {
      if (savingTimeoutRef.current) {
        clearTimeout(savingTimeoutRef.current);
      }
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
    };
  }, [dataSnapshot]);

  // Don't render anything if idle
  if (status === 'idle') {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-xs transition-opacity duration-200',
        status === 'saving' && 'text-muted-foreground',
        status === 'saved' && 'text-primary',
        className
      )}
    >
      {status === 'saving' && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>{t('saveIndicator.saving')}</span>
        </>
      )}

      {status === 'saved' && (
        <>
          <Cloud className="h-3 w-3" />
          <Check className="h-3 w-3" />
          <span>{t('saveIndicator.saved')}</span>
        </>
      )}
    </div>
  );
}
