/**
 * Hook for managing the print queue.
 *
 * Wraps the print-queue store for component use, providing:
 * - Filtered job lists (pending, failed, completed)
 * - Computed values (counts, hasJobs)
 * - Wrapped actions for queue management
 */

import { useCallback, useMemo } from 'react';

import {
  usePrintQueueStore,
  selectAllJobs,
  selectCurrentJobId,
  selectIsPaused,
} from '../store/print-queue.store';

import type { PrintJob } from '../types/print.types';

interface UsePrintQueueReturn {
  // State
  /** All jobs in the queue */
  jobs: PrintJob[];
  /** Jobs waiting to be printed */
  pendingJobs: PrintJob[];
  /** Jobs that failed to print */
  failedJobs: PrintJob[];
  /** Successfully printed jobs */
  completedJobs: PrintJob[];
  /** Currently printing job (if any) */
  currentJob: PrintJob | null;
  /** Whether queue processing is paused */
  isPaused: boolean;

  // Computed values
  /** Number of pending jobs */
  pendingCount: number;
  /** Number of failed jobs */
  failedCount: number;
  /** Total number of jobs in queue */
  totalCount: number;
  /** Whether there are any jobs in the queue */
  hasJobs: boolean;
  /** Whether there are any pending jobs */
  hasPendingJobs: boolean;

  // Actions
  /** Cancel a specific job */
  cancelJob: (jobId: string) => void;
  /** Retry a failed job (resets status to PENDING) */
  retryJob: (jobId: string) => void;
  /** Remove a job from the queue */
  removeJob: (jobId: string) => void;
  /** Clear all completed jobs */
  clearCompleted: () => void;
  /** Clear all jobs from the queue */
  clearAll: () => void;
  /** Toggle pause state of the queue */
  togglePause: () => void;
  /** Get a specific job by ID */
  getJob: (jobId: string) => PrintJob | undefined;
}

/**
 * Hook for managing the print queue.
 *
 * Provides read access to queue state and actions for queue management.
 *
 * @returns Print queue state and actions
 *
 * @example
 * ```tsx
 * function PrintQueuePanel() {
 *   const {
 *     pendingJobs,
 *     failedJobs,
 *     pendingCount,
 *     retryJob,
 *     clearCompleted,
 *   } = usePrintQueue();
 *
 *   return (
 *     <div>
 *       <h2>Pending: {pendingCount}</h2>
 *       {failedJobs.map(job => (
 *         <Button key={job.id} onClick={() => retryJob(job.id)}>
 *           Retry
 *         </Button>
 *       ))}
 *       <Button onClick={clearCompleted}>Clear Completed</Button>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePrintQueue(): UsePrintQueueReturn {
  // Get stable state from store using primitive selectors
  const jobs = usePrintQueueStore(selectAllJobs);
  const currentJobId = usePrintQueueStore(selectCurrentJobId);
  const isPaused = usePrintQueueStore(selectIsPaused);

  // Get actions from store
  const updateJobStatus = usePrintQueueStore((state) => state.updateJobStatus);
  const removeJobFromStore = usePrintQueueStore((state) => state.removeJob);
  const clearCompletedFromStore = usePrintQueueStore(
    (state) => state.clearCompleted
  );
  const togglePauseFromStore = usePrintQueueStore((state) => state.togglePause);
  const getJobFromStore = usePrintQueueStore((state) => state.getJob);

  // Derive filtered arrays using useMemo to avoid infinite loops
  // useMemo caches the result and only recalculates when jobs changes
  const pendingJobs = useMemo(
    () => jobs.filter((j) => j.status === 'PENDING'),
    [jobs]
  );

  const failedJobs = useMemo(
    () => jobs.filter((j) => j.status === 'FAILED'),
    [jobs]
  );

  const completedJobs = useMemo(
    () => jobs.filter((j) => j.status === 'COMPLETED'),
    [jobs]
  );

  // Get current job
  const currentJob = useMemo(() => {
    if (!currentJobId) return null;
    return jobs.find((job) => job.id === currentJobId) ?? null;
  }, [currentJobId, jobs]);

  // Computed values
  const pendingCount = pendingJobs.length;
  const failedCount = failedJobs.length;
  const totalCount = jobs.length;
  const hasJobs = totalCount > 0;
  const hasPendingJobs = pendingCount > 0;

  // Wrapped actions
  const cancelJob = useCallback(
    (jobId: string) => {
      updateJobStatus(jobId, 'CANCELLED');
    },
    [updateJobStatus]
  );

  const retryJob = useCallback(
    (jobId: string) => {
      // Reset status to PENDING for retry
      updateJobStatus(jobId, 'PENDING');
    },
    [updateJobStatus]
  );

  const removeJob = useCallback(
    (jobId: string) => {
      removeJobFromStore(jobId);
    },
    [removeJobFromStore]
  );

  const clearCompleted = useCallback(() => {
    clearCompletedFromStore();
  }, [clearCompletedFromStore]);

  const clearAll = useCallback(() => {
    // Remove all jobs by iterating (no clearAll in store)
    jobs.forEach((job) => {
      removeJobFromStore(job.id);
    });
  }, [jobs, removeJobFromStore]);

  const togglePause = useCallback(() => {
    togglePauseFromStore();
  }, [togglePauseFromStore]);

  const getJob = useCallback(
    (jobId: string) => {
      return getJobFromStore(jobId);
    },
    [getJobFromStore]
  );

  return {
    // State
    jobs,
    pendingJobs,
    failedJobs,
    completedJobs,
    currentJob,
    isPaused,

    // Computed values
    pendingCount,
    failedCount,
    totalCount,
    hasJobs,
    hasPendingJobs,

    // Actions
    cancelJob,
    retryJob,
    removeJob,
    clearCompleted,
    clearAll,
    togglePause,
    getJob,
  };
}
