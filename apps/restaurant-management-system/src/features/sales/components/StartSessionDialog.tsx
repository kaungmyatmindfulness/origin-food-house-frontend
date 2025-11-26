'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Users } from 'lucide-react';
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
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';

// TODO: Import from tables service when available
// NOTE FOR BE: Implement POST /stores/{storeId}/tables/{tableId}/sessions
async function startTableSession(
  storeId: string,
  tableId: string,
  guestCount: number
): Promise<{ id: string; tableId: string; guestCount: number }> {
  console.log('startTableSession called:', { storeId, tableId, guestCount });
  // Mock response - BE should implement this
  return { id: `session-${Date.now()}`, tableId, guestCount };
}

interface StartSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string;
  table: {
    id: string;
    tableNumber: string;
    capacity: number;
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
  const [guestCount, setGuestCount] = useState(1);

  const startSessionMutation = useMutation({
    mutationFn: () => startTableSession(storeId, table!.id, guestCount),
    onSuccess: (session) => {
      toast.success(t('sessionStarted'));
      onSessionStarted(session.id);
      onOpenChange(false);
      setGuestCount(1);
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
            <div className="text-muted-foreground mt-1 flex items-center justify-center gap-1">
              <Users className="h-4 w-4" />
              <span>
                {t('capacity')}: {table.capacity}
              </span>
            </div>
          </div>

          {/* Guest count */}
          <div className="space-y-2">
            <Label htmlFor="guestCount">{t('guestCount')}</Label>
            <Input
              id="guestCount"
              type="number"
              min={1}
              max={table.capacity}
              value={guestCount}
              onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
            />
            <p className="text-muted-foreground text-xs">
              {t('maxGuests', { max: table.capacity })}
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
            disabled={startSessionMutation.isPending || guestCount < 1}
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
