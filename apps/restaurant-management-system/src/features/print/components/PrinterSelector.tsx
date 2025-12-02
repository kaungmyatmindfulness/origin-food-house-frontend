'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Printer, RefreshCw, AlertCircle } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { Button } from '@repo/ui/components/button';
import { Skeleton } from '@repo/ui/components/skeleton';
import { Alert, AlertDescription } from '@repo/ui/components/alert';

import { useTauriPrinters } from '../hooks/useTauriPrinters';

interface PrinterSelectorProps {
  /** Currently selected printer name */
  value?: string;
  /** Called when printer selection changes */
  onChange: (printerName: string | undefined) => void;
  /** Label for the selector */
  label?: string;
  /** Description text */
  description?: string;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Placeholder text when no printer is selected */
  placeholder?: string;
}

/**
 * Printer selector component for Tauri environments.
 *
 * Features:
 * - Lists all available system printers
 * - Shows default printer indicator
 * - Refresh button to update printer list
 * - Falls back to disabled state in browser environment
 *
 * @example
 * ```tsx
 * function PrintSettings() {
 *   const [printer, setPrinter] = useState<string>();
 *
 *   return (
 *     <PrinterSelector
 *       value={printer}
 *       onChange={setPrinter}
 *       label="Receipt Printer"
 *       description="Select printer for customer receipts"
 *     />
 *   );
 * }
 * ```
 */
export function PrinterSelector({
  value,
  onChange,
  label,
  description,
  disabled = false,
  placeholder,
}: PrinterSelectorProps) {
  const t = useTranslations('print.printerSelector');
  const {
    printers,
    defaultPrinter,
    isLoading,
    error,
    isTauriEnvironment,
    refresh,
  } = useTauriPrinters();

  // Set default printer on first load if no value is set
  useEffect(() => {
    if (!value && defaultPrinter && !isLoading) {
      onChange(defaultPrinter.name);
    }
  }, [value, defaultPrinter, isLoading, onChange]);

  // Not in Tauri environment - show disabled state
  if (!isTauriEnvironment) {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-muted-foreground text-sm font-medium">
            {label}
          </label>
        )}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{t('browserOnly')}</AlertDescription>
        </Alert>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-2">
        {label && <label className="text-sm font-medium">{label}</label>}
        <Skeleton className="h-11 w-full" />
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-2">
        {label && <label className="text-sm font-medium">{label}</label>}
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('errorLoading')}: {error}
          </AlertDescription>
        </Alert>
        <Button variant="outline" size="sm" onClick={refresh} className="h-9">
          <RefreshCw className="mr-2 h-4 w-4" />
          {t('retry')}
        </Button>
      </div>
    );
  }

  // No printers found
  if (printers.length === 0) {
    return (
      <div className="space-y-2">
        {label && <label className="text-sm font-medium">{label}</label>}
        <Alert>
          <Printer className="h-4 w-4" />
          <AlertDescription>{t('noPrinters')}</AlertDescription>
        </Alert>
        <Button variant="outline" size="sm" onClick={refresh} className="h-9">
          <RefreshCw className="mr-2 h-4 w-4" />
          {t('refresh')}
        </Button>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="flex gap-2">
        <Select
          value={value ?? ''}
          onValueChange={(val) => onChange(val || undefined)}
          disabled={disabled}
        >
          <SelectTrigger className="h-11 flex-1">
            <div className="flex items-center gap-2">
              <Printer className="text-muted-foreground h-4 w-4" />
              <SelectValue placeholder={placeholder ?? t('selectPrinter')} />
            </div>
          </SelectTrigger>
          <SelectContent>
            {/* Option to use system default */}
            <SelectItem value="" className="min-h-11">
              <div>
                <div className="font-medium">{t('systemDefault')}</div>
                <div className="text-muted-foreground text-xs">
                  {defaultPrinter?.name ?? t('noDefault')}
                </div>
              </div>
            </SelectItem>
            {/* List all printers */}
            {printers.map((printer) => (
              <SelectItem
                key={printer.name}
                value={printer.name}
                className="min-h-11"
              >
                <div>
                  <div className="font-medium">
                    {printer.name}
                    {printer.is_default && (
                      <span className="text-primary ml-2 text-xs">
                        ({t('default')})
                      </span>
                    )}
                  </div>
                  {printer.description && (
                    <div className="text-muted-foreground text-xs">
                      {printer.description}
                    </div>
                  )}
                  {printer.status && (
                    <div className="text-muted-foreground text-xs capitalize">
                      {printer.status}
                    </div>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={refresh}
          disabled={isLoading}
          className="h-11 w-11 shrink-0"
          title={t('refresh')}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
    </div>
  );
}
