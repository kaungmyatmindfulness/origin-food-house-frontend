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
import { DEFAULT_PRINT_SETTINGS } from '../types/print.types';

import type { PrintSettings } from '../types/print.types';
import type { PrintSettingsDto } from '@repo/api/generated/types';

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
    '/stores/{id}/settings/print-settings',
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
    '/stores/{id}/settings/print-settings',
    {
      onSuccess: () => {
        toast.success(t('settings.saved'));
        // Invalidate settings query to refetch
        queryClient.invalidateQueries({
          queryKey: printKeys.settings(storeId ?? ''),
        });
      },
      onError: (err: unknown) => {
        toast.error(t('printFailed'), {
          description: err instanceof Error ? err.message : t('errors.unknown'),
        });
      },
    }
  );

  // Transform API response to local PrintSettings type
  // The API has slightly different types (null vs undefined) and frontend has extra fields
  const settings = useMemo((): PrintSettings => {
    const apiData = response?.data as PrintSettingsDto | undefined;
    if (!apiData) {
      return DEFAULT_PRINT_SETTINGS;
    }

    return {
      autoPrintReceipt:
        apiData.autoPrintReceipt ?? DEFAULT_PRINT_SETTINGS.autoPrintReceipt,
      autoPrintKitchenTicket:
        apiData.autoPrintKitchenTicket ??
        DEFAULT_PRINT_SETTINGS.autoPrintKitchenTicket,
      defaultReceiptPrinter: apiData.defaultReceiptPrinter ?? undefined,
      defaultKitchenPrinter: apiData.defaultKitchenPrinter ?? undefined,
      receiptCopies:
        apiData.receiptCopies ?? DEFAULT_PRINT_SETTINGS.receiptCopies,
      kitchenTicketCopies:
        apiData.kitchenTicketCopies ??
        DEFAULT_PRINT_SETTINGS.kitchenTicketCopies,
      // Frontend-only settings (not in API yet)
      showLogo: DEFAULT_PRINT_SETTINGS.showLogo,
      headerText: DEFAULT_PRINT_SETTINGS.headerText,
      footerText: DEFAULT_PRINT_SETTINGS.footerText,
    };
  }, [response?.data]);

  // Memoized update function
  const updateSettings = useCallback(
    (updates: Partial<PrintSettings>) => {
      if (!storeId) {
        console.warn(
          '[usePrintSettings] Cannot update settings without storeId'
        );
        return;
      }

      updateMutation.mutate({
        params: { path: { id: storeId } },
        body: updates,
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
