/**
 * Main print service hook for orchestrating printing operations.
 *
 * This hook is the primary interface for printing in the RMS app.
 * It handles:
 * - Building HTML from order data
 * - Adding jobs to the queue
 * - Auto-processing the queue
 * - Toast notifications for success/failure
 */

import { useCallback, useEffect, useRef } from 'react';
import { toast } from '@repo/ui/lib/toast';
import { useTranslations } from 'next-intl';

import {
  usePrintQueueStore,
  selectPendingCount,
  selectFailedCount,
  selectIsPaused,
  selectCurrentJobId,
  selectHasPendingJobs,
} from '../store/print-queue.store';
import { getPrintAdapter } from '../adapters/adapter-factory';
import { buildCustomerReceiptHtml } from '../templates/customer-receipt';
import { buildKitchenTicketHtml } from '../templates/kitchen-ticket';
import { usePrintSettings } from './usePrintSettings';
import { DEFAULT_PRINT_SETTINGS } from '../constants';

import type {
  PrintAdapter,
  PrintJob,
  PrintPlatform,
  PrintSettings,
} from '../types';
import type { ReceiptOrderData } from '@/features/sales/utils/transform-order-to-receipt';
import type { OrderResponseDto } from '@repo/api/generated/types';

interface UsePrintServiceOptions {
  /** Store ID for fetching settings and queue filtering */
  storeId: string;
  /** Whether to automatically process pending jobs (default: true) */
  autoProcess?: boolean;
}

interface UsePrintServiceReturn {
  // Actions
  /** Print a customer receipt. Returns the job ID. */
  printReceipt: (order: ReceiptOrderData, storeName?: string) => string;
  /** Print a kitchen ticket. Returns the job ID. */
  printKitchenTicket: (order: OrderResponseDto) => string;
  /** Retry a failed job */
  retryJob: (jobId: string) => void;
  /** Cancel a pending job */
  cancelJob: (jobId: string) => void;

  // State
  /** Whether any job is currently printing */
  isPrinting: boolean;
  /** Number of pending jobs */
  pendingCount: number;
  /** Number of failed jobs */
  failedCount: number;
  /** Currently printing job (if any) */
  currentJob: PrintJob | null;

  // Platform info
  /** Current print platform (BROWSER or TAURI) */
  platform: PrintPlatform;
  /** Whether printing is supported in current environment */
  isSupported: boolean;
}

/**
 * Main hook for printing operations in the RMS app.
 *
 * @param options - Configuration options
 * @returns Print service state and actions
 *
 * @example
 * ```tsx
 * function ReceiptPanel({ order, storeId }: Props) {
 *   const { printReceipt, isPrinting, pendingCount } = usePrintService({ storeId });
 *
 *   const handlePrint = () => {
 *     const receiptData = transformOrderToReceiptData(order);
 *     printReceipt(receiptData, 'My Restaurant');
 *   };
 *
 *   return (
 *     <Button onClick={handlePrint} disabled={isPrinting}>
 *       {isPrinting ? 'Printing...' : `Print (${pendingCount} pending)`}
 *     </Button>
 *   );
 * }
 * ```
 */
export function usePrintService(
  options: UsePrintServiceOptions
): UsePrintServiceReturn {
  const { storeId, autoProcess = true } = options;
  const t = useTranslations('print');

  // Ref to store adapter instance (avoid re-creating)
  const adapterRef = useRef<PrintAdapter | null>(null);

  // Ref to track if we're currently processing
  const isProcessingRef = useRef(false);

  // Get print settings from backend
  const { settings } = usePrintSettings(storeId);

  // Store state - use primitive selectors to avoid infinite loops
  const pendingCount = usePrintQueueStore(selectPendingCount);
  const failedCount = usePrintQueueStore(selectFailedCount);
  const hasPendingJobs = usePrintQueueStore(selectHasPendingJobs);
  const isPaused = usePrintQueueStore(selectIsPaused);
  const currentJobId = usePrintQueueStore(selectCurrentJobId);
  const jobs = usePrintQueueStore((state) => state.jobs);
  const addJob = usePrintQueueStore((state) => state.addJob);
  const updateJobStatus = usePrintQueueStore((state) => state.updateJobStatus);
  const incrementRetry = usePrintQueueStore((state) => state.incrementRetry);
  const setCurrentJob = usePrintQueueStore((state) => state.setCurrentJob);
  const getJob = usePrintQueueStore((state) => state.getJob);

  // Initialize adapter on first use
  const getAdapter = useCallback((): PrintAdapter => {
    if (!adapterRef.current) {
      adapterRef.current = getPrintAdapter();
    }
    return adapterRef.current;
  }, []);

  // Get current job
  const currentJob = currentJobId
    ? (jobs.find((j) => j.id === currentJobId) ?? null)
    : null;

  // Computed values
  const isPrinting = currentJob !== null && currentJob.status === 'PRINTING';
  const adapter = getAdapter();
  const platform = adapter.platform;
  const isSupported = adapter.isSupported();

  /**
   * Process a single print job.
   */
  const processJob = useCallback(
    async (job: PrintJob): Promise<void> => {
      const printAdapter = getAdapter();

      // Update status to PRINTING
      setCurrentJob(job.id);
      updateJobStatus(job.id, 'PRINTING');

      // Execute print
      const result = await printAdapter.print(job);

      if (result.success) {
        updateJobStatus(job.id, 'COMPLETED');
        toast.success(t('printSuccess'));
      } else {
        // Check if we should retry
        const currentJobData = getJob(job.id);
        if (
          currentJobData &&
          currentJobData.retryCount < currentJobData.maxRetries
        ) {
          incrementRetry(job.id);
          updateJobStatus(job.id, 'PENDING'); // Re-queue for retry
          toast.warning(
            t('retrying', {
              current: currentJobData.retryCount + 1,
              max: currentJobData.maxRetries,
            })
          );
        } else {
          updateJobStatus(
            job.id,
            'FAILED',
            result.error?.message ?? t('errors.unknown')
          );
          toast.error(t('printFailed'), {
            description: result.error?.message,
          });
        }
      }

      // Clear current job
      setCurrentJob(null);
    },
    [getAdapter, setCurrentJob, updateJobStatus, getJob, incrementRetry, t]
  );

  /**
   * Process the next pending job in the queue.
   */
  const processNextJob = useCallback(async (): Promise<void> => {
    // Prevent concurrent processing
    if (isProcessingRef.current) return;

    // Get fresh pending jobs
    const pending = usePrintQueueStore
      .getState()
      .jobs.filter((j) => j.status === 'PENDING');
    const paused = usePrintQueueStore.getState().isPaused;

    if (pending.length === 0 || paused) return;

    const nextJob = pending[0];
    if (!nextJob) return;

    isProcessingRef.current = true;

    try {
      await processJob(nextJob);
    } finally {
      isProcessingRef.current = false;
    }
  }, [processJob]);

  /**
   * Auto-process queue when there are pending jobs.
   */
  useEffect(() => {
    if (!autoProcess) return;
    if (!hasPendingJobs || isPaused || currentJobId) return;

    // Process next job
    processNextJob();
  }, [autoProcess, hasPendingJobs, isPaused, currentJobId, processNextJob]);

  /**
   * Print a customer receipt.
   */
  const printReceipt = useCallback(
    (order: ReceiptOrderData, storeName?: string): string => {
      // Use settings or defaults
      const printSettings: PrintSettings = settings ?? DEFAULT_PRINT_SETTINGS;

      // Build HTML content
      const htmlContent = buildCustomerReceiptHtml(
        order,
        printSettings,
        storeName
      );

      // Add to queue
      const jobId = addJob({
        type: 'CUSTOMER_RECEIPT',
        orderId: order.id,
        orderNumber: order.orderNumber ?? `Order ${order.id.slice(0, 8)}`,
        storeId,
        htmlContent,
        maxRetries: 3,
      });

      toast.success(t('printQueued'));

      return jobId;
    },
    [settings, storeId, addJob, t]
  );

  /**
   * Print a kitchen ticket.
   */
  const printKitchenTicket = useCallback(
    (order: OrderResponseDto): string => {
      // Build HTML content
      const htmlContent = buildKitchenTicketHtml(order);

      // Add to queue
      const jobId = addJob({
        type: 'KITCHEN_TICKET',
        orderId: order.id,
        orderNumber: order.orderNumber ?? `Order ${order.id.slice(0, 8)}`,
        storeId,
        htmlContent,
        maxRetries: 3,
      });

      toast.success(t('printQueued'));

      return jobId;
    },
    [storeId, addJob, t]
  );

  /**
   * Retry a failed job.
   */
  const retryJob = useCallback(
    (jobId: string): void => {
      const job = getJob(jobId);
      if (!job) {
        console.warn(`[usePrintService] Job not found: ${jobId}`);
        return;
      }

      // Reset status to PENDING for retry
      updateJobStatus(jobId, 'PENDING');
    },
    [getJob, updateJobStatus]
  );

  /**
   * Cancel a pending job.
   */
  const cancelJob = useCallback(
    (jobId: string): void => {
      updateJobStatus(jobId, 'CANCELLED');
      toast.info(t('printCancelled'));
    },
    [updateJobStatus, t]
  );

  return {
    // Actions
    printReceipt,
    printKitchenTicket,
    retryJob,
    cancelJob,

    // State
    isPrinting,
    pendingCount,
    failedCount,
    currentJob,

    // Platform info
    platform,
    isSupported,
  };
}
