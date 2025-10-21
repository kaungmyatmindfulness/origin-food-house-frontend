import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@repo/ui/lib/utils';

const textareaVariants = cva(
  'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content w-full rounded-md border bg-transparent shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'min-h-12 px-2.5 py-1.5 text-xs md:text-xs',
        default: 'min-h-16 px-3 py-2 text-base md:text-sm',
        lg: 'min-h-20 px-4 py-2.5 text-base',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

type TextareaProps = React.ComponentProps<'textarea'> &
  VariantProps<typeof textareaVariants>;

function Textarea({ className, size, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(textareaVariants({ size, className }))}
      {...props}
    />
  );
}

export { Textarea, textareaVariants };
export type { TextareaProps };
