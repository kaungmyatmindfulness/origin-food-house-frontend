'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';

import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';

interface PrintSettingsErrorCardProps {
  /** Error object or null if no store selected */
  error: Error | null;
  /** Title text for the error card */
  title: string;
  /** Default error message when no specific error */
  defaultMessage: string;
  /** Label for the retry button */
  retryLabel: string;
  /** Callback when retry button is clicked */
  onRetry: () => void;
}

/**
 * Error card for the print settings page.
 * Shows an error state with a retry button.
 */
export function PrintSettingsErrorCard({
  error,
  title,
  defaultMessage,
  retryLabel,
  onRetry,
}: PrintSettingsErrorCardProps) {
  return (
    <div className="mx-auto max-w-6xl p-6" role="alert" aria-live="polite">
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="text-destructive h-5 w-5" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <CardDescription>
            {error instanceof Error ? error.message : defaultMessage}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {retryLabel}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
