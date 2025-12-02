'use client';

import { useTranslations } from 'next-intl';
import {
  Printer,
  Pause,
  Play,
  Trash2,
  RotateCcw,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import { Button } from '@repo/ui/components/button';
import { Badge } from '@repo/ui/components/badge';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import { Separator } from '@repo/ui/components/separator';

import { usePrintQueue } from '../hooks/usePrintQueue';
import type {
  PrintJob,
  PrintJobStatus,
  PrintJobType,
} from '../types/print.types';

interface PrintQueueDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Called when the dialog open state changes */
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog for viewing and managing the print queue.
 *
 * Features:
 * - View all print jobs grouped by status
 * - Retry failed jobs
 * - Cancel pending jobs
 * - Remove completed jobs
 * - Pause/resume queue processing
 * - Clear all jobs
 *
 * @example
 * ```tsx
 * function PrintManager() {
 *   const [open, setOpen] = useState(false);
 *
 *   return (
 *     <>
 *       <Button onClick={() => setOpen(true)}>Manage Print Queue</Button>
 *       <PrintQueueDialog open={open} onOpenChange={setOpen} />
 *     </>
 *   );
 * }
 * ```
 */
export function PrintQueueDialog({
  open,
  onOpenChange,
}: PrintQueueDialogProps) {
  const t = useTranslations('print.queue');

  const {
    jobs,
    pendingJobs,
    failedJobs,
    completedJobs,
    isPaused,
    pendingCount,
    failedCount,
    retryJob,
    cancelJob,
    removeJob,
    clearCompleted,
    clearAll,
    togglePause,
  } = usePrintQueue();

  // Get jobs currently printing
  const printingJobs = jobs.filter((j) => j.status === 'PRINTING');

  const hasCompletedJobs = completedJobs.length > 0;
  const hasAnyJobs = jobs.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {pendingCount > 0 && (
              <span>
                {pendingCount} {t('pending')}
              </span>
            )}
            {failedCount > 0 && (
              <span className="text-destructive">
                {pendingCount > 0 && ', '}
                {failedCount} {t('failed')}
              </span>
            )}
            {pendingCount === 0 && failedCount === 0 && (
              <span>{t('empty')}</span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Header Actions */}
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-10 gap-2"
            onClick={togglePause}
            disabled={!hasAnyJobs}
          >
            {isPaused ? (
              <>
                <Play className="h-4 w-4" />
                {t('resume')}
              </>
            ) : (
              <>
                <Pause className="h-4 w-4" />
                {t('pause')}
              </>
            )}
          </Button>

          <div className="flex gap-2">
            {hasCompletedJobs && (
              <Button
                variant="outline"
                size="sm"
                className="h-10"
                onClick={clearCompleted}
              >
                {t('clearCompleted')}
              </Button>
            )}
            {hasAnyJobs && (
              <Button
                variant="destructive"
                size="sm"
                className="h-10"
                onClick={clearAll}
              >
                {t('clearAll')}
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Job List */}
        <ScrollArea className="flex-1 pr-4">
          {!hasAnyJobs ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Printer className="text-muted-foreground mb-4 h-12 w-12" />
              <p className="text-muted-foreground">{t('empty')}</p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {/* Printing Jobs */}
              {printingJobs.length > 0 && (
                <JobSection
                  title={t('printing')}
                  jobs={printingJobs}
                  onRetry={retryJob}
                  onCancel={cancelJob}
                  onRemove={removeJob}
                />
              )}

              {/* Pending Jobs */}
              {pendingJobs.length > 0 && (
                <JobSection
                  title={t('pending')}
                  jobs={pendingJobs}
                  onRetry={retryJob}
                  onCancel={cancelJob}
                  onRemove={removeJob}
                />
              )}

              {/* Failed Jobs */}
              {failedJobs.length > 0 && (
                <JobSection
                  title={t('failed')}
                  jobs={failedJobs}
                  onRetry={retryJob}
                  onCancel={cancelJob}
                  onRemove={removeJob}
                />
              )}

              {/* Completed Jobs */}
              {completedJobs.length > 0 && (
                <JobSection
                  title={t('completed')}
                  jobs={completedJobs}
                  onRetry={retryJob}
                  onCancel={cancelJob}
                  onRemove={removeJob}
                />
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// --- Helper Components ---

interface JobSectionProps {
  title: string;
  jobs: PrintJob[];
  onRetry: (jobId: string) => void;
  onCancel: (jobId: string) => void;
  onRemove: (jobId: string) => void;
}

function JobSection({
  title,
  jobs,
  onRetry,
  onCancel,
  onRemove,
}: JobSectionProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-muted-foreground text-sm font-medium">{title}</h4>
      <div className="space-y-2">
        {jobs.map((job) => (
          <PrintJobItem
            key={job.id}
            job={job}
            onRetry={() => onRetry(job.id)}
            onCancel={() => onCancel(job.id)}
            onRemove={() => onRemove(job.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface PrintJobItemProps {
  job: PrintJob;
  onRetry: () => void;
  onCancel: () => void;
  onRemove: () => void;
}

function PrintJobItem({ job, onRetry, onCancel, onRemove }: PrintJobItemProps) {
  const t = useTranslations('print.queue');

  return (
    <div className="bg-muted/50 flex min-h-14 items-center justify-between gap-3 rounded-lg border p-3">
      <div className="flex items-center gap-3">
        {/* Status Icon */}
        <StatusIcon status={job.status} />

        {/* Job Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">#{job.orderNumber}</span>
            <TypeBadge type={job.type} />
          </div>
          <div className="text-muted-foreground text-xs">
            {job.status === 'FAILED' && job.errorMessage && (
              <span className="text-destructive">{job.errorMessage}</span>
            )}
            {job.retryCount > 0 && (
              <span>
                {t('retryCount', {
                  count: job.retryCount,
                  max: job.maxRetries,
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {job.status === 'FAILED' && (
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={onRetry}
            disabled={job.retryCount >= job.maxRetries}
            title={t('retry')}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
        {(job.status === 'PENDING' || job.status === 'PRINTING') && (
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={onCancel}
            title={t('cancel')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {(job.status === 'COMPLETED' || job.status === 'CANCELLED') && (
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive h-10 w-10"
            onClick={onRemove}
            title={t('remove')}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: PrintJobStatus }) {
  switch (status) {
    case 'PENDING':
      return <Clock className="text-muted-foreground h-5 w-5" />;
    case 'PRINTING':
      return <Loader2 className="text-primary h-5 w-5 animate-spin" />;
    case 'COMPLETED':
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case 'FAILED':
      return <AlertCircle className="text-destructive h-5 w-5" />;
    case 'CANCELLED':
      return <X className="text-muted-foreground h-5 w-5" />;
    default:
      return <Printer className="text-muted-foreground h-5 w-5" />;
  }
}

function TypeBadge({ type }: { type: PrintJobType }) {
  const t = useTranslations('print');

  const label =
    type === 'CUSTOMER_RECEIPT'
      ? t('receipt.orderNumber').replace('#', '').trim()
      : t('kitchen.header');

  return (
    <Badge variant="outline" className="text-xs">
      {label}
    </Badge>
  );
}
