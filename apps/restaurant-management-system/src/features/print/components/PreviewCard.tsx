'use client';

import { forwardRef } from 'react';
import { Printer } from 'lucide-react';

import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';

interface PreviewCardProps {
  /** Card title */
  title: string;
  /** Card description */
  description: string;
  /** Print button label */
  printLabel: string;
  /** Callback when print button is clicked */
  onPrint: () => void;
  /** Preview content to display */
  children: React.ReactNode;
}

/**
 * Reusable card component for displaying print previews.
 * Includes a header with title, description, and print button,
 * plus centered content area for the preview.
 */
export const PreviewCard = forwardRef<HTMLDivElement, PreviewCardProps>(
  function PreviewCard(
    { title, description, printLabel, onPrint, children },
    ref
  ) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onPrint}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              {printLabel}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex justify-center pb-6">
          <div ref={ref}>{children}</div>
        </CardContent>
      </Card>
    );
  }
);
