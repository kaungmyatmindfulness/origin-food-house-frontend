'use client';

import { Check } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';

interface StepIndicatorProps {
  step: number;
  currentStep: number;
  label: string;
}

export function StepIndicator({
  step,
  currentStep,
  label,
}: StepIndicatorProps) {
  const isCompleted = step < currentStep;
  const isActive = step === currentStep;

  return (
    <div className="flex flex-1 items-center gap-2">
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
          isCompleted && 'bg-primary text-primary-foreground',
          isActive && 'bg-primary text-primary-foreground',
          !isCompleted && !isActive && 'bg-secondary text-muted-foreground'
        )}
      >
        {isCompleted ? <Check className="h-4 w-4" /> : step}
      </div>
      <span
        className={cn(
          'text-sm',
          (isActive || isCompleted) && 'font-medium',
          !isActive && !isCompleted && 'text-muted-foreground'
        )}
      >
        {label}
      </span>
      {step < 3 && <div className="bg-border h-px flex-1" />}
    </div>
  );
}
