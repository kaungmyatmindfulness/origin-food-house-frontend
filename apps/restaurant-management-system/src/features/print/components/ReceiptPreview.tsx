'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@repo/ui/lib/utils';
import { Separator } from '@repo/ui/components/separator';

import type { PaperSize, PrintSettings } from '../types/print.types';

interface ReceiptPreviewProps {
  settings: Partial<PrintSettings>;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
}

/**
 * Visual preview of a receipt with current print settings.
 * Shows how the receipt will appear when printed.
 */
export function ReceiptPreview({
  settings,
  storeName,
  storeAddress,
  storePhone,
}: ReceiptPreviewProps) {
  const t = useTranslations('print.settings.preview');
  const tReceipt = useTranslations('print.receipt');

  const paperWidth = settings.paperSize ?? '80mm';
  const showLogo = settings.showLogo ?? true;
  const headerText = settings.headerText ?? [];
  const footerText = settings.footerText ?? [];

  // Calculate preview width based on paper size
  const widthClass = getPreviewWidthClass(paperWidth);

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-muted-foreground mb-4 text-sm font-medium">
        {t('receiptTitle')}
      </h3>

      {/* Receipt preview container - styled to look like thermal paper */}
      <div
        className={cn(
          'mx-auto rounded border bg-white p-4 font-mono text-xs shadow-sm',
          widthClass
        )}
      >
        {/* Store Logo Placeholder */}
        {showLogo && (
          <div className="mb-3 flex justify-center">
            <div className="bg-muted flex h-12 w-24 items-center justify-center rounded text-[10px]">
              LOGO
            </div>
          </div>
        )}

        {/* Store Name & Info */}
        <div className="mb-3 text-center">
          <div className="font-bold">{storeName ?? t('sampleStoreName')}</div>
          <div className="text-muted-foreground text-[10px]">
            {storeAddress ?? t('sampleAddress')}
          </div>
          <div className="text-muted-foreground text-[10px]">
            {storePhone ?? t('samplePhone')}
          </div>
        </div>

        {/* Custom Header Text */}
        {headerText.length > 0 && (
          <div className="text-muted-foreground mb-2 text-center text-[10px]">
            {headerText.map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        )}

        <Separator className="my-2" />

        {/* Order Info */}
        <div className="mb-2 flex justify-between text-[10px]">
          <span>{tReceipt('orderNumber')}</span>
          <span>1234</span>
        </div>
        <div className="mb-2 flex justify-between text-[10px]">
          <span>{tReceipt('date')}</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>

        <Separator className="my-2" />

        {/* Sample Items */}
        <div className="mb-2 space-y-1">
          <div className="flex justify-between text-[10px]">
            <span>2x {t('sampleItem')}</span>
            <span>$24.00</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span>1x {t('sampleItem')}</span>
            <span>$15.00</span>
          </div>
        </div>

        <Separator className="my-2" />

        {/* Totals */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px]">
            <span>{tReceipt('subtotal')}</span>
            <span>$39.00</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span>{tReceipt('tax')} (10%)</span>
            <span>$3.90</span>
          </div>
          <div className="mt-2 flex justify-between font-bold">
            <span>{tReceipt('total')}</span>
            <span>$42.90</span>
          </div>
        </div>

        <Separator className="my-2" />

        {/* Payment Info */}
        <div className="space-y-1 text-[10px]">
          <div className="flex justify-between">
            <span>{tReceipt('paymentMethod')}</span>
            <span>Cash</span>
          </div>
          <div className="flex justify-between">
            <span>{tReceipt('amountTendered')}</span>
            <span>$50.00</span>
          </div>
          <div className="flex justify-between">
            <span>{tReceipt('change')}</span>
            <span>$7.10</span>
          </div>
        </div>

        <Separator className="my-2" />

        {/* Custom Footer Text */}
        {footerText.length > 0 && (
          <div className="text-muted-foreground mb-2 text-center text-[10px]">
            {footerText.map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        )}

        {/* Thank You Message */}
        <div className="mt-3 text-center text-[10px]">
          {tReceipt('thankYou')}
        </div>
      </div>

      {/* Paper size indicator */}
      <div className="text-muted-foreground mt-2 text-xs">{paperWidth}</div>
    </div>
  );
}

/**
 * Get preview width class based on paper size
 */
function getPreviewWidthClass(paperSize: PaperSize): string {
  switch (paperSize) {
    case '58mm':
      return 'w-48'; // ~192px - compact
    case '80mm':
    default:
      return 'w-64'; // ~256px - standard
  }
}
