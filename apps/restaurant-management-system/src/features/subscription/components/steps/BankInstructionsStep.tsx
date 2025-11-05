'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Copy, Check, Building2 } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import { Card, CardContent } from '@repo/ui/components/card';
import { toast } from '@repo/ui/lib/toast';
import type { SubscriptionTier } from '../../types/subscription.types';

interface BankInstructionsStepProps {
  referenceNumber: string;
  tier: SubscriptionTier;
  onNext: () => void;
}

export function BankInstructionsStep({
  referenceNumber,
  tier,
  onNext,
}: BankInstructionsStepProps) {
  const t = useTranslations('subscription.upgrade');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const amount = tier === 'STANDARD' ? '$240.00' : '$1,200.00';

  const bankDetails = [
    { label: t('bankDetails.bankName'), value: 'Bangkok Bank' },
    { label: t('bankDetails.accountNumber'), value: '1234567890' },
    { label: t('bankDetails.accountName'), value: 'Origin Food House Ltd.' },
    { label: t('bankDetails.amount'), value: amount },
    { label: t('bankDetails.referenceNumber'), value: referenceNumber },
  ];

  const handleCopy = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    toast.success(t('copied'));
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted rounded-lg p-4">
        <div className="mb-2 flex items-center gap-2">
          <Building2 className="text-primary h-5 w-5" />
          <h3 className="font-semibold">{t('bankTransferTitle')}</h3>
        </div>
        <p className="text-muted-foreground text-sm">
          {t('bankTransferDescription')}
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          {bankDetails.map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex-1">
                <p className="text-muted-foreground text-sm font-medium">
                  {label}
                </p>
                <p className="mt-1 font-mono text-sm font-semibold">{value}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(value, label)}
              >
                {copiedField === label ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="rounded-lg bg-amber-50 p-4 text-sm">
        <p className="font-medium text-amber-900">{t('importantNote')}</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-amber-800">
          <li>{t('note1')}</li>
          <li>{t('note2')}</li>
          <li>{t('note3')}</li>
        </ul>
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext}>{t('continue')}</Button>
      </div>
    </div>
  );
}
