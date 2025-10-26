'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form';
import { Textarea } from '@repo/ui/components/textarea';
import { Button } from '@repo/ui/components/button';
import { Alert, AlertDescription } from '@repo/ui/components/alert';
import { toast } from '@repo/ui/lib/toast';

import { suspendUser } from '../services/personnel.service';
import { personnelKeys } from '../queries/personnel.keys';
import type {
  SuspendUserFormValues,
  StaffMember,
} from '../types/personnel.types';

const suspendUserSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

interface SuspendUserDialogProps {
  storeId: string;
  staffMember: StaffMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SuspendUserDialog({
  storeId,
  staffMember,
  open,
  onOpenChange,
}: SuspendUserDialogProps) {
  const t = useTranslations('personnel');
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SuspendUserFormValues>({
    resolver: zodResolver(suspendUserSchema),
    defaultValues: {
      reason: '',
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (data: SuspendUserFormValues) => {
      if (!staffMember) throw new Error('No staff member selected');
      return suspendUser(storeId, staffMember.id, data.reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personnelKeys.staff(storeId) });
      toast.success(t('suspendDialog.success'));
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || t('suspendDialog.error'));
    },
  });

  const onSubmit = async (data: SuspendUserFormValues) => {
    setIsSubmitting(true);
    try {
      await suspendMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!staffMember) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('suspendDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('suspendDialog.description', {
              name: staffMember.name || staffMember.email,
            })}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{t('suspendDialog.warning')}</AlertDescription>
            </Alert>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('suspendDialog.reason')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('suspendDialog.reasonPlaceholder')}
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? t('common.submitting')
                  : t('suspendDialog.submit')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
