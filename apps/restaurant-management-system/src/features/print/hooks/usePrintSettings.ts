/**
 * Hook for managing print settings with backend sync.
 *
 * Uses $api from @/utils/apiFetch to sync settings with the backend.
 * Settings are stored per-store in the database.
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { toast } from '@repo/ui/lib/toast';
import { useTranslations } from 'next-intl';

import { $api } from '@/utils/apiFetch';
import { printKeys } from '../queries/print.keys';
import { DEFAULT_PRINT_SETTINGS } from '../constants';

import type {
  AutoPrintMode,
  FontSize,
  PaperSize,
  PrintSettings,
} from '../types';

// =============================================================================
// Enum Transformation Helpers
// Backend uses uppercase enums (MANUAL, STANDARD_80MM, MEDIUM)
// Frontend uses lowercase values (manual, 80mm, medium)
// =============================================================================

type ApiAutoPrintMode = 'MANUAL' | 'AUTO' | 'NEVER';
type ApiPaperSize = 'COMPACT_58MM' | 'STANDARD_80MM';
type ApiFontSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'XLARGE';

/** Transform API auto-print mode to frontend value */
function fromApiAutoPrintMode(
  apiValue: ApiAutoPrintMode | undefined
): AutoPrintMode {
  switch (apiValue) {
    case 'MANUAL':
      return 'manual';
    case 'AUTO':
      return 'auto';
    case 'NEVER':
      return 'never';
    default:
      return DEFAULT_PRINT_SETTINGS.autoPrintReceipt;
  }
}

/** Transform frontend auto-print mode to API value */
function toApiAutoPrintMode(
  value: AutoPrintMode | undefined
): ApiAutoPrintMode | undefined {
  if (!value) return undefined;
  return value.toUpperCase() as ApiAutoPrintMode;
}

/** Transform API paper size to frontend value */
function fromApiPaperSize(apiValue: ApiPaperSize | undefined): PaperSize {
  switch (apiValue) {
    case 'COMPACT_58MM':
      return '58mm';
    case 'STANDARD_80MM':
      return '80mm';
    default:
      return DEFAULT_PRINT_SETTINGS.paperSize;
  }
}

/** Transform frontend paper size to API value */
function toApiPaperSize(
  value: PaperSize | undefined
): ApiPaperSize | undefined {
  if (!value) return undefined;
  return value === '58mm' ? 'COMPACT_58MM' : 'STANDARD_80MM';
}

/** Transform API font size to frontend value */
function fromApiFontSize(apiValue: ApiFontSize | undefined): FontSize {
  switch (apiValue) {
    case 'SMALL':
      return 'small';
    case 'MEDIUM':
      return 'medium';
    case 'LARGE':
      return 'large';
    case 'XLARGE':
      return 'xlarge';
    default:
      return DEFAULT_PRINT_SETTINGS.kitchenFontSize;
  }
}

/** Transform frontend font size to API value */
function toApiFontSize(value: FontSize | undefined): ApiFontSize | undefined {
  if (!value) return undefined;
  return value.toUpperCase() as ApiFontSize;
}

interface UsePrintSettingsReturn {
  /** Current print settings (with defaults if not loaded) */
  settings: PrintSettings;
  /** Whether settings are being loaded */
  isLoading: boolean;
  /** Error loading settings */
  error: Error | null;
  /** Update settings (partial updates supported) */
  updateSettings: (updates: Partial<PrintSettings>) => void;
  /** Whether settings are currently being saved */
  isUpdating: boolean;
  /** Refetch settings from backend */
  refetch: () => void;
}

/**
 * Hook for managing print settings with backend synchronization.
 *
 * @param storeId - The store ID to fetch/update settings for
 * @returns Print settings state and actions
 *
 * @example
 * ```tsx
 * function PrintSettingsPanel({ storeId }: { storeId: string }) {
 *   const { settings, isLoading, updateSettings, isUpdating } = usePrintSettings(storeId);
 *
 *   if (isLoading) return <Skeleton />;
 *
 *   return (
 *     <Switch
 *       checked={settings.autoPrintKitchenTicket}
 *       onCheckedChange={(checked) =>
 *         updateSettings({ autoPrintKitchenTicket: checked })
 *       }
 *       disabled={isUpdating}
 *     />
 *   );
 * }
 * ```
 */
export function usePrintSettings(
  storeId: string | null
): UsePrintSettingsReturn {
  const t = useTranslations('print');
  const queryClient = useQueryClient();

  // Fetch print settings from backend
  // Note: API uses {id} parameter, not {storeId}
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = $api.useQuery(
    'get',
    '/api/v1/stores/{id}/settings/print-settings',
    {
      params: { path: { id: storeId ?? '' } },
    },
    {
      enabled: !!storeId,
      staleTime: 5 * 60 * 1000, // 5 minutes - settings don't change often
    }
  );

  // Update print settings mutation
  // Note: API uses {id} parameter, not {storeId}
  const updateMutation = $api.useMutation(
    'patch',
    '/api/v1/stores/{id}/settings/print-settings',
    {
      onSuccess: () => {
        toast.success(t('settings.saved'));
        // Invalidate settings query to refetch
        queryClient.invalidateQueries({
          queryKey: printKeys.settings(storeId ?? ''),
        });
      },
      onError: (err: unknown) => {
        toast.error(t('settings.saveFailed'), {
          description: err instanceof Error ? err.message : t('errors.unknown'),
        });
      },
    }
  );

  // Transform API response to local PrintSettings type
  // Maps API fields (uppercase enums) to frontend PrintSettings interface (lowercase)
  const settings = useMemo((): PrintSettings => {
    const apiData = response?.data;
    if (!apiData) {
      return DEFAULT_PRINT_SETTINGS;
    }

    return {
      // Receipt settings - transform enums from API format
      autoPrintReceipt: fromApiAutoPrintMode(
        apiData.autoPrintReceipt as ApiAutoPrintMode | undefined
      ),
      receiptCopies:
        apiData.receiptCopies ?? DEFAULT_PRINT_SETTINGS.receiptCopies,
      showLogo: apiData.showLogo ?? DEFAULT_PRINT_SETTINGS.showLogo,
      headerText: apiData.headerText ?? DEFAULT_PRINT_SETTINGS.headerText,
      footerText: apiData.footerText ?? DEFAULT_PRINT_SETTINGS.footerText,
      paperSize: fromApiPaperSize(
        apiData.paperSize as ApiPaperSize | undefined
      ),
      defaultReceiptPrinter: apiData.defaultReceiptPrinter ?? undefined,

      // Kitchen ticket settings - transform enums from API format
      autoPrintKitchenTicket:
        apiData.autoPrintKitchenTicket ??
        DEFAULT_PRINT_SETTINGS.autoPrintKitchenTicket,
      kitchenTicketCopies:
        apiData.kitchenTicketCopies ??
        DEFAULT_PRINT_SETTINGS.kitchenTicketCopies,
      kitchenPaperSize: fromApiPaperSize(
        apiData.kitchenPaperSize as ApiPaperSize | undefined
      ),
      kitchenFontSize: fromApiFontSize(
        apiData.kitchenFontSize as ApiFontSize | undefined
      ),
      showOrderNumber:
        apiData.showOrderNumber ?? DEFAULT_PRINT_SETTINGS.showOrderNumber,
      showTableNumber:
        apiData.showTableNumber ?? DEFAULT_PRINT_SETTINGS.showTableNumber,
      showTimestamp:
        apiData.showTimestamp ?? DEFAULT_PRINT_SETTINGS.showTimestamp,
      defaultKitchenPrinter: apiData.defaultKitchenPrinter ?? undefined,
    };
  }, [response?.data]);

  // Memoized update function
  // Transforms frontend lowercase values to API uppercase format before sending
  const updateSettings = useCallback(
    (updates: Partial<PrintSettings>) => {
      if (!storeId) {
        console.warn(
          '[usePrintSettings] Cannot update settings without storeId'
        );
        return;
      }

      // Transform frontend values to API format (uppercase enums)
      const apiBody: Record<string, unknown> = {};

      // Copy non-enum fields directly (using bracket notation for Record<string, unknown>)
      if (updates.receiptCopies !== undefined) {
        apiBody['receiptCopies'] = updates.receiptCopies;
      }
      if (updates.showLogo !== undefined) {
        apiBody['showLogo'] = updates.showLogo;
      }
      if (updates.headerText !== undefined) {
        apiBody['headerText'] = updates.headerText;
      }
      if (updates.footerText !== undefined) {
        apiBody['footerText'] = updates.footerText;
      }
      if (updates.defaultReceiptPrinter !== undefined) {
        apiBody['defaultReceiptPrinter'] = updates.defaultReceiptPrinter;
      }
      if (updates.autoPrintKitchenTicket !== undefined) {
        apiBody['autoPrintKitchenTicket'] = updates.autoPrintKitchenTicket;
      }
      if (updates.kitchenTicketCopies !== undefined) {
        apiBody['kitchenTicketCopies'] = updates.kitchenTicketCopies;
      }
      if (updates.showOrderNumber !== undefined) {
        apiBody['showOrderNumber'] = updates.showOrderNumber;
      }
      if (updates.showTableNumber !== undefined) {
        apiBody['showTableNumber'] = updates.showTableNumber;
      }
      if (updates.showTimestamp !== undefined) {
        apiBody['showTimestamp'] = updates.showTimestamp;
      }
      if (updates.defaultKitchenPrinter !== undefined) {
        apiBody['defaultKitchenPrinter'] = updates.defaultKitchenPrinter;
      }

      // Transform enum fields to API uppercase format
      if (updates.autoPrintReceipt !== undefined) {
        apiBody['autoPrintReceipt'] = toApiAutoPrintMode(
          updates.autoPrintReceipt
        );
      }
      if (updates.paperSize !== undefined) {
        apiBody['paperSize'] = toApiPaperSize(updates.paperSize);
      }
      if (updates.kitchenPaperSize !== undefined) {
        apiBody['kitchenPaperSize'] = toApiPaperSize(updates.kitchenPaperSize);
      }
      if (updates.kitchenFontSize !== undefined) {
        apiBody['kitchenFontSize'] = toApiFontSize(updates.kitchenFontSize);
      }

      updateMutation.mutate({
        params: { path: { id: storeId } },
        body: apiBody,
      });
    },
    [storeId, updateMutation]
  );

  // Memoized refetch function
  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  // Convert error to Error type or null
  // Note: openapi-react-query may return various error types
  const normalizedError = useMemo((): Error | null => {
    if (!error) return null;
    // Cast to unknown first to handle strict type checking
    const unknownError = error as unknown;
    if (unknownError instanceof Error) return unknownError;
    if (
      typeof unknownError === 'object' &&
      unknownError !== null &&
      'message' in unknownError
    ) {
      return new Error(String((unknownError as { message: unknown }).message));
    }
    return new Error('Unknown error');
  }, [error]);

  return {
    settings,
    isLoading,
    error: normalizedError,
    updateSettings,
    isUpdating: updateMutation.isPending,
    refetch: handleRefetch,
  };
}
