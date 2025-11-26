'use client';

import { useTranslations } from 'next-intl';
import { User, Phone, ChevronDown } from 'lucide-react';

import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@repo/ui/components/collapsible';
import { cn } from '@repo/ui/lib/utils';

import { useQuickSaleCartStore } from '../store/quick-sale-cart.store';

interface CustomerInfoInputProps {
  className?: string;
  disabled?: boolean;
}

/**
 * Collapsible customer info input for quick sale orders.
 * Shows name and phone fields, which are more relevant for PHONE and TAKEOUT orders.
 */
export function CustomerInfoInput({
  className,
  disabled,
}: CustomerInfoInputProps) {
  const t = useTranslations('sales');

  const sessionType = useQuickSaleCartStore((state) => state.sessionType);
  const customerName = useQuickSaleCartStore((state) => state.customerName);
  const customerPhone = useQuickSaleCartStore((state) => state.customerPhone);
  const setCustomerInfo = useQuickSaleCartStore(
    (state) => state.setCustomerInfo
  );

  // Determine if fields should be required based on session type
  const isPhoneOrder = sessionType === 'PHONE';
  const isTakeoutOrder = sessionType === 'TAKEOUT';
  const showByDefault = isPhoneOrder || isTakeoutOrder;

  // Check if customer info has been filled
  const hasCustomerInfo = !!customerName || !!customerPhone;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerInfo(e.target.value, customerPhone);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerInfo(customerName, e.target.value);
  };

  return (
    <Collapsible
      defaultOpen={showByDefault}
      className={cn('border-border rounded-lg border', className)}
    >
      <CollapsibleTrigger className="hover:bg-accent/50 flex w-full items-center justify-between p-3 text-sm font-medium">
        <span className="flex items-center gap-2">
          <User className="h-4 w-4" />
          {t('customerInfo.title')}
          {hasCustomerInfo && (
            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">
              {t('customerInfo.filled')}
            </span>
          )}
        </span>
        <ChevronDown className="h-4 w-4 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="space-y-4 px-3 pb-3">
          {/* Customer Name */}
          <div className="space-y-1.5">
            <Label
              htmlFor="customer-name"
              className="text-muted-foreground text-xs"
            >
              {t('customerInfo.name')}
              {isPhoneOrder && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="relative">
              <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                id="customer-name"
                value={customerName ?? ''}
                onChange={handleNameChange}
                placeholder={t('customerInfo.namePlaceholder')}
                className="pl-9"
                disabled={disabled}
                required={isPhoneOrder}
              />
            </div>
          </div>

          {/* Customer Phone */}
          <div className="space-y-1.5">
            <Label
              htmlFor="customer-phone"
              className="text-muted-foreground text-xs"
            >
              {t('customerInfo.phone')}
              {isPhoneOrder && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="relative">
              <Phone className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                id="customer-phone"
                type="tel"
                value={customerPhone ?? ''}
                onChange={handlePhoneChange}
                placeholder={t('customerInfo.phonePlaceholder')}
                className="pl-9"
                disabled={disabled}
                required={isPhoneOrder}
              />
            </div>
          </div>

          {/* Helper text for phone orders */}
          {isPhoneOrder && (
            <p className="text-muted-foreground text-xs">
              {t('customerInfo.phoneOrderNote')}
            </p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
