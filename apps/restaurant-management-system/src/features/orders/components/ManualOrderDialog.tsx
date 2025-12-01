'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Utensils, Phone, Package } from 'lucide-react';
import { toast } from '@repo/ui/lib/toast';
import { useTranslations } from 'next-intl';

import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { TypedTabs, type TypedTab } from '@repo/ui/components/typed-tabs';

import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import { $api } from '@/utils/apiFetch';

import type { CreateManualSessionDto } from '@repo/api/generated/types';

/** Session type for RMS manual sessions */
type SessionType = CreateManualSessionDto['sessionType'];

interface ManualOrderFormData {
  customerName?: string;
  customerPhone?: string;
  guestCount: number;
}

interface ManualOrderDialogProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
}

export function ManualOrderDialog({
  open,
  onOpenChange,
}: ManualOrderDialogProps) {
  const t = useTranslations('orders');
  const router = useRouter();
  const selectedStoreId = useAuthStore(selectSelectedStoreId);
  const [sessionType, setSessionType] = useState<SessionType>('COUNTER');

  const form = useForm<ManualOrderFormData>({
    defaultValues: {
      customerName: '',
      customerPhone: '',
      guestCount: 1,
    },
  });

  // Create manual session mutation using $api
  const createSessionMutation = $api.useMutation(
    'post',
    '/active-table-sessions/manual',
    {
      onSuccess: (response) => {
        const session = response.data;
        if (!session) return;

        toast.success(t('manualSessionCreated'), {
          description: t('manualSessionCreatedDescription', {
            type: sessionType.toLowerCase(),
            sessionId: session.id.slice(0, 8),
          }),
        });
        onOpenChange(false);
        form.reset();
        // Navigate to order creation page with session ID
        router.push(`/hub/(owner-admin)/orders/create?sessionId=${session.id}`);
      },
      onError: () => {
        toast.error(t('manualSessionFailed'), {
          description: t('manualSessionFailedDescription'),
        });
      },
    }
  );

  const handleSubmit = async (values: ManualOrderFormData) => {
    const sessionData: CreateManualSessionDto = {
      sessionType,
      customerName: values.customerName || undefined,
      customerPhone: values.customerPhone || undefined,
      guestCount: values.guestCount,
    };

    await createSessionMutation.mutateAsync({
      params: { query: { storeId: selectedStoreId! } },
      body: sessionData,
    });
  };

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      form.reset();
      setSessionType('COUNTER');
    }
    onOpenChange(val);
  };

  const isPhoneOrder = sessionType === 'PHONE';

  // Session type tabs configuration
  const sessionTypeTabs = useMemo<TypedTab<SessionType>[]>(
    () => [
      {
        value: 'COUNTER',
        label: t('counterOrder'),
        icon: <Utensils className="h-4 w-4" />,
      },
      {
        value: 'PHONE',
        label: t('phoneOrder'),
        icon: <Phone className="h-4 w-4" />,
      },
      {
        value: 'TAKEOUT',
        label: t('takeoutOrder'),
        icon: <Package className="h-4 w-4" />,
      },
    ],
    [t]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('createManualOrder')}</DialogTitle>
          <DialogDescription>
            {t('createManualOrderDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Session Type Tabs */}
          <TypedTabs
            value={sessionType}
            onValueChange={setSessionType}
            tabs={sessionTypeTabs}
            listClassName="grid w-full grid-cols-3"
          />

          {/* Customer Information Form */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('customerName')}
                      {!isPhoneOrder && (
                        <span className="text-muted-foreground ml-1">
                          ({t('optional')})
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('customerNamePlaceholder')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('phoneNumber')}
                      {!isPhoneOrder && (
                        <span className="text-muted-foreground ml-1">
                          ({t('optional')})
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="tel"
                        placeholder={t('phoneNumberPlaceholder')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guestCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('guestCount')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10) || 1)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={createSessionMutation.isPending}
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={createSessionMutation.isPending}
                >
                  {createSessionMutation.isPending
                    ? t('creating')
                    : t('startOrder')}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
