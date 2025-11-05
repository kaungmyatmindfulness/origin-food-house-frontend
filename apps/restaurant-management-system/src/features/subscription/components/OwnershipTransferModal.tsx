'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle, Mail, ShieldCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@repo/ui/components/dialog';
import { Button } from '@repo/ui/components/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@repo/ui/components/input-otp';
import { Checkbox } from '@repo/ui/components/checkbox';
import { toast } from '@repo/ui/lib/toast';
import {
  useInitiateOwnershipTransfer,
  useVerifyOwnershipTransferOTP,
} from '../hooks/useSubscription';

interface OwnershipTransferModalProps {
  storeId: string;
  open: boolean;
  onClose: () => void;
}

const emailSchema = z.object({
  newOwnerEmail: z.string().email('Invalid email address'),
  confirmTransfer: z.boolean().refine((val) => val === true, {
    message: 'You must acknowledge that this action is irreversible',
  }),
});

type EmailFormValues = z.infer<typeof emailSchema>;

export function OwnershipTransferModal({
  storeId,
  open,
  onClose,
}: OwnershipTransferModalProps) {
  const t = useTranslations('subscription.transfer');
  const [step, setStep] = useState(1);
  const [transferId, setTransferId] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [attempts, setAttempts] = useState(3);
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);

  const initiateTransfer = useInitiateOwnershipTransfer();
  const verifyOTP = useVerifyOwnershipTransferOTP();

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      newOwnerEmail: '',
      confirmTransfer: false,
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && !canResend && resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, canResend, resendCountdown]);

  const calculateTimeRemaining = () => {
    if (!otpExpiresAt) return '0:00';
    const remaining = new Date(otpExpiresAt).getTime() - Date.now();
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleEmailSubmit = async (data: EmailFormValues) => {
    try {
      const response = await initiateTransfer.mutateAsync({
        storeId,
        newOwnerEmail: data.newOwnerEmail,
      });
      setTransferId(response.transferId);
      setOtpExpiresAt(response.otpExpiresAt);
      setStep(2);
      toast.success(t('otpSent'));
    } catch {
      toast.error(t('errors.initiateFailed'));
    }
  };

  const handleVerifyOTP = async () => {
    if (!transferId || otp.length !== 6) return;

    try {
      await verifyOTP.mutateAsync({ transferId, otpCode: otp });
      toast.success(t('success'));
      handleClose();
    } catch {
      setAttempts((prev) => prev - 1);
      if (attempts <= 1) {
        toast.error(t('errors.tooManyAttempts'));
        handleClose();
      } else {
        toast.error(t('errors.invalidOTP', { remaining: attempts - 1 }));
        setOtp('');
      }
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    const email = emailForm.getValues('newOwnerEmail');
    try {
      const response = await initiateTransfer.mutateAsync({
        storeId,
        newOwnerEmail: email,
      });
      setTransferId(response.transferId);
      setOtpExpiresAt(response.otpExpiresAt);
      setCanResend(false);
      setResendCountdown(60);
      toast.success(t('otpResent'));
    } catch {
      toast.error(t('errors.resendFailed'));
    }
  };

  const handleClose = () => {
    setStep(1);
    setTransferId(null);
    setOtp('');
    setAttempts(3);
    setOtpExpiresAt(null);
    setCanResend(false);
    setResendCountdown(60);
    emailForm.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <Form {...emailForm}>
            <form
              onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
              className="space-y-6"
            >
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mail className="text-primary h-5 w-5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">{t('step1Title')}</p>
                    <p className="text-muted-foreground mt-1">
                      {t('step1Description')}
                    </p>
                  </div>
                </div>
              </div>

              <FormField
                control={emailForm.control}
                name="newOwnerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('newOwnerEmailLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="newowner@example.com"
                      />
                    </FormControl>
                    <FormDescription>
                      {t('newOwnerEmailDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="rounded-lg bg-amber-50 p-4">
                <div className="mb-3 flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      {t('warning')}
                    </p>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-800">
                      <li>{t('warningPoint1')}</li>
                      <li>{t('warningPoint2')}</li>
                      <li>{t('warningPoint3')}</li>
                    </ul>
                  </div>
                </div>

                <FormField
                  control={emailForm.control}
                  name="confirmTransfer"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal text-amber-900">
                          {t('confirmLabel')}
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleClose}>
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={initiateTransfer.isPending}>
                  {initiateTransfer.isPending ? t('sending') : t('sendOTP')}
                </Button>
              </div>
            </form>
          </Form>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="text-primary h-5 w-5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">{t('step2Title')}</p>
                  <p className="text-muted-foreground mt-1">
                    {t('step2Description')}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t('otpLabel')}
                </label>
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="text-muted-foreground">
                  {t('attemptsRemaining', { count: attempts })}
                </div>
                {otpExpiresAt && (
                  <div className="font-medium">
                    {t('expiresIn', { time: calculateTimeRemaining() })}
                  </div>
                )}
              </div>

              <div>
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleResendOTP}
                  disabled={!canResend || initiateTransfer.isPending}
                  className="p-0 text-sm"
                >
                  {canResend
                    ? t('resendOTP')
                    : t('resendIn', { seconds: resendCountdown })}
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleClose}>
                {t('cancel')}
              </Button>
              <Button
                onClick={handleVerifyOTP}
                disabled={otp.length !== 6 || verifyOTP.isPending}
              >
                {verifyOTP.isPending ? t('verifying') : t('verify')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
