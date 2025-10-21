import * as React from 'react';
import { Loader2Icon } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@repo/ui/lib/utils';

const spinnerVariants = cva('animate-spin', {
  variants: {
    size: {
      sm: 'size-3',
      default: 'size-4',
      lg: 'size-5',
      xl: 'size-6',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

type SpinnerProps = React.ComponentProps<'svg'> &
  VariantProps<typeof spinnerVariants>;

function Spinner({ className, size, ...props }: SpinnerProps) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn(spinnerVariants({ size, className }))}
      {...props}
    />
  );
}

export { Spinner, spinnerVariants };
export type { SpinnerProps };
