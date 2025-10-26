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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { Button } from '@repo/ui/components/button';
import { Alert, AlertDescription } from '@repo/ui/components/alert';
import { toast } from '@repo/ui/lib/toast';

import { changeUserRole } from '../services/personnel.service';
import { personnelKeys } from '../queries/personnel.keys';
import type {
  Role,
  ChangeRoleFormValues,
  StaffMember,
} from '../types/personnel.types';

const changeRoleSchema = z.object({
  role: z.enum(['OWNER', 'ADMIN', 'CHEF', 'CASHIER', 'SERVER']),
});

interface ChangeRoleDialogProps {
  storeId: string;
  staffMember: StaffMember | null;
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

export function ChangeRoleDialog({
  storeId,
  staffMember,
  open,
  onOpenChange,
}: ChangeRoleDialogProps) {
  const t = useTranslations('personnel');
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ChangeRoleFormValues>({
    resolver: zodResolver(changeRoleSchema),
    defaultValues: {
      role: staffMember?.role || 'SERVER',
    },
  });

  const changeRoleMutation = useMutation({
    mutationFn: (data: ChangeRoleFormValues) => {
      if (!staffMember) throw new Error('No staff member selected');
      return changeUserRole(storeId, staffMember.email, data.role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personnelKeys.staff(storeId) });
      toast.success(t('changeRoleDialog.success'));
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || t('changeRoleDialog.error'));
    },
  });

  const onSubmit = async (data: ChangeRoleFormValues) => {
    setIsSubmitting(true);
    try {
      await changeRoleMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!staffMember) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('changeRoleDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('changeRoleDialog.description', {
              name: staffMember.name || staffMember.email,
            })}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="bg-muted/50 rounded-md border p-3">
              <p className="text-muted-foreground mb-1 text-sm">
                {t('changeRoleDialog.currentRole')}
              </p>
              <p className="text-sm font-medium">
                {t(`roles.${staffMember.role}`)}
              </p>
            </div>

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('changeRoleDialog.newRole')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem
                          key={role.value}
                          value={role.value}
                          disabled={role.value === staffMember.role}
                        >
                          {t(`roles.${role.value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('role') === 'OWNER' && (
              <Alert>
                <AlertDescription>
                  {t('changeRoleDialog.ownerWarning')}
                </AlertDescription>
              </Alert>
            )}

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
                  : t('changeRoleDialog.submit')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
