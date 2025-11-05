'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import { SelectTierStep } from './steps/SelectTierStep';
import { BankInstructionsStep } from './steps/BankInstructionsStep';
import { UploadProofStep } from './steps/UploadProofStep';
import { StepIndicator } from './StepIndicator';
import { useCreatePaymentRequest } from '../hooks/useSubscription';
import { toast } from '@repo/ui/lib/toast';
import type { SubscriptionTier } from '../types/subscription.types';

interface UpgradeModalProps {
  storeId: string;
  open: boolean;
  onClose: () => void;
}

export function UpgradeModal({ storeId, open, onClose }: UpgradeModalProps) {
  const t = useTranslations('subscription.upgrade');
  const [step, setStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(
    null
  );
  const [paymentRequestId, setPaymentRequestId] = useState<string | null>(null);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);

  const createPaymentRequest = useCreatePaymentRequest();

  const handleClose = () => {
    setStep(1);
    setSelectedTier(null);
    setPaymentRequestId(null);
    setReferenceNumber(null);
    onClose();
  };

  const handleTierSelect = async (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    try {
      const response = await createPaymentRequest.mutateAsync({
        storeId,
        requestedTier: tier,
      });
      setPaymentRequestId(response.id);
      setReferenceNumber(response.bankTransferDetails?.referenceNumber || null);
      setStep(2);
    } catch {
      toast.error(t('errors.createPaymentRequest'));
    }
  };

  const handlePaymentProofUploaded = () => {
    toast.success(t('success.proofUploaded'));
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <div className="mt-4 flex items-center gap-2">
            <StepIndicator step={1} currentStep={step} label={t('step1')} />
            <StepIndicator step={2} currentStep={step} label={t('step2')} />
            <StepIndicator step={3} currentStep={step} label={t('step3')} />
          </div>
        </DialogHeader>

        <div className="mt-6">
          {step === 1 && (
            <SelectTierStep
              onSelectTier={handleTierSelect}
              isLoading={createPaymentRequest.isPending}
            />
          )}

          {step === 2 && paymentRequestId && referenceNumber && (
            <BankInstructionsStep
              referenceNumber={referenceNumber}
              tier={selectedTier!}
              onNext={() => setStep(3)}
            />
          )}

          {step === 3 && paymentRequestId && (
            <UploadProofStep
              paymentRequestId={paymentRequestId}
              onSuccess={handlePaymentProofUploaded}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
