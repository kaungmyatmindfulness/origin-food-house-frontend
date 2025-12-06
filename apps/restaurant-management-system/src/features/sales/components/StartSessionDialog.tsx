'use client';

import { useTranslations } from 'next-intl';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from '@repo/ui/lib/toast';

import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';

// TODO: Import from tables service when available
// NOTE FOR BE: Implement POST /stores/{storeId}/tables/{tableId}/sessions
async function startTableSession(
  storeId: string,
  tableId: string
): Promise<{ id: string; tableId: string }> {
  console.log('startTableSession called:', { storeId, tableId });
  // Mock response - BE should implement this
  return { id: `session-${Date.now()}`, tableId };
}

interface StartSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string;
  table: {
    id: string;
    tableNumber: string;
  } | null;
  onSessionStarted: (sessionId: string) => void;
}

export function StartSessionDialog({
  open,
  onOpenChange,
  storeId,
  table,
  onSessionStarted,
}: StartSessionDialogProps) {
  const t = useTranslations('sales');

  const startSessionMutation = useMutation({
    mutationFn: () => startTableSession(storeId, table!.id),
    onSuccess: (session) => {
      toast.success(t('sessionStarted'));
      onSessionStarted(session.id);
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(t('failedToStartSession'), {
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  if (!table) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{t('startSession')}</DialogTitle>
          <DialogDescription>
            {t('startSessionDesc', { tableNumber: table.tableNumber })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Table info */}
          <div className="bg-muted rounded-lg p-4 text-center">
            <p className="text-foreground text-3xl font-bold">
              {table.tableNumber}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={startSessionMutation.isPending}
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={() => startSessionMutation.mutate()}
            disabled={startSessionMutation.isPending}
          >
            {startSessionMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('starting')}
              </>
            ) : (
              t('startOrder')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
