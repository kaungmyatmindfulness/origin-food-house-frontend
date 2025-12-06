'use client';

import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
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

import { $api } from '@/utils/apiFetch';
import { API_PATHS } from '@/utils/api-paths';

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
  const queryClient = useQueryClient();

  const startSessionMutation = $api.useMutation(
    'post',
    API_PATHS.tableSession,
    {
      onSuccess: (response) => {
        const session = response.data;
        if (session) {
          toast.success(t('sessionStarted'));
          // Invalidate tables query to refresh the table status
          queryClient.invalidateQueries({
            queryKey: ['get', API_PATHS.tables],
          });
          onSessionStarted(session.id);
          onOpenChange(false);
        }
      },
      onError: (error: unknown) => {
        toast.error(t('failedToStartSession'), {
          description: error instanceof Error ? error.message : undefined,
        });
      },
    }
  );

  const handleStartSession = () => {
    if (!table) return;

    startSessionMutation.mutate({
      params: {
        path: {
          storeId,
          tableId: table.id,
        },
      },
    });
  };

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
            onClick={handleStartSession}
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
