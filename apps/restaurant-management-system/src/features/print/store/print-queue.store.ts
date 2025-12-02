import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import type {
  PrintJob,
  PrintJobStatus,
  PrintJobType,
} from '../types/print.types';

/**
 * Input for creating a new print job
 */
export interface CreatePrintJobInput {
  type: PrintJobType;
  orderId: string;
  orderNumber: string;
  storeId: string;
  htmlContent: string;
  maxRetries?: number;
}

/**
 * Print queue state
 */
interface PrintQueueState {
  /** All print jobs in the queue */
  jobs: PrintJob[];
  /** Currently printing job ID */
  currentJobId: string | null;
  /** Whether the queue processing is paused */
  isPaused: boolean;
}

/**
 * Print queue actions
 */
interface PrintQueueActions {
  /** Add a new job to the queue */
  addJob: (input: CreatePrintJobInput) => string;
  /** Update the status of a job */
  updateJobStatus: (
    jobId: string,
    status: PrintJobStatus,
    errorMessage?: string
  ) => void;
  /** Increment retry count for a job */
  incrementRetry: (jobId: string) => void;
  /** Remove a job from the queue */
  removeJob: (jobId: string) => void;
  /** Clear all completed jobs */
  clearCompleted: () => void;
  /** Set the current job being processed */
  setCurrentJob: (jobId: string | null) => void;
  /** Toggle pause state of the queue */
  togglePause: () => void;
  /** Get a job by ID */
  getJob: (jobId: string) => PrintJob | undefined;
}

const initialState: PrintQueueState = {
  jobs: [],
  currentJobId: null,
  isPaused: false,
};

export const usePrintQueueStore = create<PrintQueueState & PrintQueueActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        addJob: (input) => {
          const jobId = crypto.randomUUID();
          const now = new Date().toISOString();

          set((draft) => {
            draft.jobs.push({
              id: jobId,
              type: input.type,
              orderId: input.orderId,
              orderNumber: input.orderNumber,
              storeId: input.storeId,
              status: 'PENDING',
              htmlContent: input.htmlContent,
              retryCount: 0,
              maxRetries: input.maxRetries ?? 3,
              createdAt: now,
              updatedAt: now,
            });
          });

          return jobId;
        },

        updateJobStatus: (jobId, status, errorMessage) => {
          set((draft) => {
            const job = draft.jobs.find((j) => j.id === jobId);
            if (job) {
              job.status = status;
              job.updatedAt = new Date().toISOString();
              if (errorMessage) {
                job.errorMessage = errorMessage;
              }
            }
          });
        },

        incrementRetry: (jobId) => {
          set((draft) => {
            const job = draft.jobs.find((j) => j.id === jobId);
            if (job) {
              job.retryCount += 1;
              job.updatedAt = new Date().toISOString();
            }
          });
        },

        removeJob: (jobId) => {
          set((draft) => {
            draft.jobs = draft.jobs.filter((j) => j.id !== jobId);
            if (draft.currentJobId === jobId) {
              draft.currentJobId = null;
            }
          });
        },

        clearCompleted: () => {
          set((draft) => {
            draft.jobs = draft.jobs.filter((j) => j.status !== 'COMPLETED');
          });
        },

        setCurrentJob: (jobId) => {
          set((draft) => {
            draft.currentJobId = jobId;
          });
        },

        togglePause: () => {
          set((draft) => {
            draft.isPaused = !draft.isPaused;
          });
        },

        getJob: (jobId) => {
          return get().jobs.find((j) => j.id === jobId);
        },
      })),
      {
        name: 'print-queue',
        partialize: (state) => ({
          jobs: state.jobs,
          isPaused: state.isPaused,
        }),
      }
    ),
    {
      name: 'print-queue-store',
    }
  )
);

// ============================================================================
// PRIMITIVE SELECTORS (return stable values - safe for direct use)
// ============================================================================

export const selectAllJobs = (state: PrintQueueState & PrintQueueActions) =>
  state.jobs;

export const selectCurrentJobId = (
  state: PrintQueueState & PrintQueueActions
) => state.currentJobId;

export const selectIsPaused = (state: PrintQueueState & PrintQueueActions) =>
  state.isPaused;

// Count selectors - return numbers (stable, no infinite loop)
export const selectPendingCount = (
  state: PrintQueueState & PrintQueueActions
) => state.jobs.filter((j) => j.status === 'PENDING').length;

export const selectFailedCount = (state: PrintQueueState & PrintQueueActions) =>
  state.jobs.filter((j) => j.status === 'FAILED').length;

export const selectCompletedCount = (
  state: PrintQueueState & PrintQueueActions
) => state.jobs.filter((j) => j.status === 'COMPLETED').length;

export const selectHasPendingJobs = (
  state: PrintQueueState & PrintQueueActions
) => state.jobs.some((j) => j.status === 'PENDING');

// ============================================================================
// ARRAY SELECTORS (return new arrays - use with useShallow or in callbacks)
// ============================================================================
// NOTE: These selectors return new array references on each call.
// Do NOT use directly with usePrintQueueStore(selectPendingJobs) - it causes
// infinite re-renders. Instead, use the count selectors above for reactive UI,
// or call these via usePrintQueueStore.getState() in callbacks/effects.

export const selectPendingJobs = (state: PrintQueueState & PrintQueueActions) =>
  state.jobs.filter((j) => j.status === 'PENDING');

export const selectFailedJobs = (state: PrintQueueState & PrintQueueActions) =>
  state.jobs.filter((j) => j.status === 'FAILED');

export const selectCompletedJobs = (
  state: PrintQueueState & PrintQueueActions
) => state.jobs.filter((j) => j.status === 'COMPLETED');

export const selectJobsByOrderId =
  (orderId: string) => (state: PrintQueueState & PrintQueueActions) =>
    state.jobs.filter((j) => j.orderId === orderId);

export const selectJobsByStoreId =
  (storeId: string) => (state: PrintQueueState & PrintQueueActions) =>
    state.jobs.filter((j) => j.storeId === storeId);
