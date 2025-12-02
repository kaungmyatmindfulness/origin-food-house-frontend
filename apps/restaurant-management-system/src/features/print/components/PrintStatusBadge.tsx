'use client';

import { Printer, AlertCircle } from 'lucide-react';

import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@repo/ui/components/tooltip';

import { usePrintQueue } from '../hooks/usePrintQueue';

interface PrintStatusBadgeProps {
  /** Called when the badge is clicked to open the print queue dialog */
  onClick?: () => void;
}

/**
 * Header status indicator for print queue.
 *
 * Shows pending/failed job counts. Clicking opens the queue management dialog.
 * Only renders when there are jobs in the queue.
 *
 * @example
 * ```tsx
 * function Header() {
 *   const [queueOpen, setQueueOpen] = useState(false);
 *
 *   return (
 *     <header>
 *       <PrintStatusBadge onClick={() => setQueueOpen(true)} />
 *       <PrintQueueDialog open={queueOpen} onOpenChange={setQueueOpen} />
 *     </header>
 *   );
 * }
 * ```
 */
export function PrintStatusBadge({ onClick }: PrintStatusBadgeProps) {
  const { pendingCount, failedCount, hasJobs, isPaused } = usePrintQueue();

  // Don't render if no jobs in queue
  if (!hasJobs) return null;

  // Determine badge variant and content
  const hasFailures = failedCount > 0;
  const totalActive = pendingCount + failedCount;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-11 w-11"
            onClick={onClick}
            aria-label={`Print queue: ${totalActive} jobs`}
          >
            {hasFailures ? (
              <AlertCircle className="text-destructive h-5 w-5" />
            ) : (
              <Printer className="h-5 w-5" />
            )}

            {/* Badge overlay for count */}
            {totalActive > 0 && (
              <Badge
                variant={hasFailures ? 'destructive' : 'default'}
                className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs"
              >
                {totalActive > 99 ? '99+' : totalActive}
              </Badge>
            )}

            {/* Paused indicator */}
            {isPaused && (
              <span className="bg-warning border-background absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="text-sm">
            {hasFailures ? (
              <span className="text-destructive">
                {failedCount} failed, {pendingCount} pending
              </span>
            ) : (
              <span>{pendingCount} print jobs pending</span>
            )}
            {isPaused && <span className="block text-xs">Queue paused</span>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
