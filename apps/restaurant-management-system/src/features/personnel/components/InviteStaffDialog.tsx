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
import { Input } from '@repo/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { Button } from '@repo/ui/components/button';
import { toast } from '@repo/ui/lib/toast';

import { inviteOrAssignRole } from '../services/personnel.service';
import { personnelKeys } from '../queries/personnel.keys';
import type { Role, InviteStaffFormValues } from '../types/personnel.types';

const inviteStaffSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['OWNER', 'ADMIN', 'CHEF', 'CASHIER', 'SERVER']),
});

interface InviteStaffDialogProps {
  storeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROLES: Array<{ value: Role; label: string }> = [
  { value: 'OWNER', label: 'Owner' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'CHEF', label: 'Chef' },
  { value: 'CASHIER', label: 'Cashier' },
  { value: 'SERVER', label: 'Server' },
];

export function InviteStaffDialog({
  storeId,
  open,
  onOpenChange,
}: InviteStaffDialogProps) {
  const t = useTranslations('personnel');
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InviteStaffFormValues>({
    resolver: zodResolver(inviteStaffSchema),
    defaultValues: {
      email: '',
      role: 'SERVER',
    },
  });

  const inviteMutation = useMutation({
    mutationFn: (data: InviteStaffFormValues) =>
      inviteOrAssignRole(storeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personnelKeys.staff(storeId) });
      queryClient.invalidateQueries({
        queryKey: personnelKeys.invitations(storeId),
      });
      toast.success(t('inviteDialog.success'));
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      // Check for tier limit error
      if (
        error.message.includes('tier limit') ||
        error.message.includes('upgrade')
      ) {
        toast.error(t('tierLimit.message'), {
          description: t('tierLimit.description'),
          action: {
            label: t('tierLimit.upgrade'),
            onClick: () => {
              // TODO: Open tier upgrade dialog
              console.error('Tier upgrade functionality not yet implemented');
            },
          },
        });
      } else {
        toast.error(error.message || t('inviteDialog.error'));
      }
    },
  });

  const onSubmit = async (data: InviteStaffFormValues) => {
    setIsSubmitting(true);
    try {
      await inviteMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('inviteDialog.title')}</DialogTitle>
          <DialogDescription>{t('inviteDialog.description')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('inviteDialog.email')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('inviteDialog.role')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('inviteDialog.selectRole')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {t(`roles.${role.value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? t('common.submitting')
                  : t('inviteDialog.submit')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
