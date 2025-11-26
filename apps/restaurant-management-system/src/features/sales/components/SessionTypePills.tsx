'use client';

import { useTranslations } from 'next-intl';
import { Phone, ShoppingBag, Store } from 'lucide-react';

import { cn } from '@repo/ui/lib/utils';

import { useQuickSaleCartStore } from '../store/quick-sale-cart.store';

import type { SessionType } from '../types/sales.types';

type QuickSaleSessionType = Exclude<SessionType, 'TABLE'>;

interface SessionTypeOption {
  value: QuickSaleSessionType;
  labelKey: string;
  icon: React.ReactNode;
}

const sessionTypes: SessionTypeOption[] = [
  {
    value: 'COUNTER',
    labelKey: 'counter',
    icon: <Store className="h-4 w-4" />,
  },
  {
    value: 'PHONE',
    labelKey: 'phone',
    icon: <Phone className="h-4 w-4" />,
  },
  {
    value: 'TAKEOUT',
    labelKey: 'takeout',
    icon: <ShoppingBag className="h-4 w-4" />,
  },
];

interface SessionTypePillsProps {
  className?: string;
}

/**
 * Session type selector pills for quick sale mode
 *
 * Allows staff to select the order type:
 * - Counter: Walk-in customer at the counter
 * - Phone: Phone order for pickup
 * - Takeout: Takeout/to-go order
 */
export function SessionTypePills({ className }: SessionTypePillsProps) {
  const t = useTranslations('sales');

  const sessionType = useQuickSaleCartStore((state) => state.sessionType);
  const setSessionType = useQuickSaleCartStore((state) => state.setSessionType);

  return (
    <div className={cn('flex gap-2', className)}>
      {sessionTypes.map((type) => (
        <button
          key={type.value}
          type="button"
          onClick={() => setSessionType(type.value)}
          className={cn(
            'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
            sessionType === type.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          {type.icon}
          {t(type.labelKey)}
        </button>
      ))}
    </div>
  );
}
