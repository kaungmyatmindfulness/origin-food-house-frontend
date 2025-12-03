'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@repo/ui/lib/utils';
import { Separator } from '@repo/ui/components/separator';

import type { FontSize, PaperSize, PrintSettings } from '../types/print.types';

interface KitchenTicketPreviewProps {
  settings: Partial<PrintSettings>;
}

/**
 * Visual preview of a kitchen ticket with current print settings.
 * Shows how the kitchen ticket will appear when printed.
 */
export function KitchenTicketPreview({ settings }: KitchenTicketPreviewProps) {
  const t = useTranslations('print.settings.preview');
  const tKitchen = useTranslations('print.kitchen');

  const paperSize = settings.kitchenPaperSize ?? '80mm';
  const fontSize = settings.kitchenFontSize ?? 'medium';
  const showOrderNumber = settings.showOrderNumber ?? true;
  const showTableNumber = settings.showTableNumber ?? true;
  const showTimestamp = settings.showTimestamp ?? true;

  // Calculate preview width and font size based on settings
  const widthClass = getPreviewWidthClass(paperSize);
  const fontSizeClass = getFontSizeClass(fontSize);

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-muted-foreground mb-4 text-sm font-medium">
        {t('kitchenTitle')}
      </h3>

      {/* Kitchen ticket preview container */}
      <div
        className={cn(
          'mx-auto rounded border bg-white p-4 font-mono shadow-sm',
          widthClass,
          fontSizeClass
        )}
      >
        {/* Kitchen Header */}
        <div className="mb-3 text-center font-bold uppercase">
          {tKitchen('header')}
        </div>

        <Separator className="my-2" />

        {/* Order Info Row */}
        <div className="mb-3 flex flex-wrap justify-between gap-2">
          {showOrderNumber && (
            <div className="font-bold">{t('sampleOrder')}</div>
          )}
          {showTableNumber && (
            <div className="bg-muted rounded px-2 py-0.5 font-bold">
              {t('sampleTable')}
            </div>
          )}
        </div>

        {/* Timestamp */}
        {showTimestamp && (
          <div className="text-muted-foreground mb-3 text-center text-xs">
            {t('sampleTime')}
          </div>
        )}

        {/* Order Type Badge */}
        <div className="mb-3 text-center">
          <span className="rounded bg-black px-2 py-1 text-white">
            {tKitchen('dineIn')}
          </span>
        </div>

        <Separator className="my-2" />

        {/* Sample Items - Kitchen tickets show items prominently */}
        <div className="space-y-3">
          <div className="border-l-4 border-black pl-2">
            <div className="font-bold">2x {t('sampleItem')}</div>
            <div className="text-muted-foreground text-xs italic">
              {tKitchen('notes')}: No onions
            </div>
          </div>

          <div className="border-l-4 border-black pl-2">
            <div className="font-bold">1x {t('sampleItem')}</div>
            <div className="text-muted-foreground text-xs italic">
              {tKitchen('notes')}: Extra spicy
            </div>
          </div>

          <div className="border-l-4 border-black pl-2">
            <div className="font-bold">3x {t('sampleItem')}</div>
          </div>
        </div>

        <Separator className="my-3" />

        {/* Total Items Count */}
        <div className="text-center font-bold">Total: 6 items</div>
      </div>

      {/* Paper size and font size indicators */}
      <div className="text-muted-foreground mt-2 flex gap-3 text-xs">
        <span>{paperSize}</span>
        <span>-</span>
        <span className="capitalize">{fontSize}</span>
      </div>
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

/**
 * Get font size class based on setting
 */
function getFontSizeClass(fontSize: FontSize): string {
  switch (fontSize) {
    case 'small':
      return 'text-xs';
    case 'medium':
      return 'text-sm';
    case 'large':
      return 'text-base';
    case 'xlarge':
      return 'text-lg';
    default:
      return 'text-sm';
  }
}
