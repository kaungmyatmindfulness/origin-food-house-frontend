'use client';

import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { CircleIcon } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@repo/ui/lib/utils';

// Context for sharing size variant across radio group components
type RadioGroupSize = 'sm' | 'default' | 'lg';

type RadioGroupContextValue = {
  size: RadioGroupSize;
};

const RadioGroupContext = React.createContext<RadioGroupContextValue>({
  size: 'default',
});

const radioGroupItemVariants = cva(
  'border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive aspect-square shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'size-3.5',
        default: 'size-4',
        lg: 'size-5',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const radioGroupIndicatorVariants = cva(
  'fill-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  {
    variants: {
      size: {
        sm: 'size-1.5',
        default: 'size-2',
        lg: 'size-2.5',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

type RadioGroupProps = React.ComponentProps<typeof RadioGroupPrimitive.Root> &
  VariantProps<typeof radioGroupItemVariants>;

function RadioGroup({
  className,
  size = 'default',
  ...props
}: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ size: size ?? 'default' }}>
      <RadioGroupPrimitive.Root
        className={cn('grid gap-3', className)}
        {...props}
      />
    </RadioGroupContext.Provider>
  );
}

type RadioGroupItemProps = React.ComponentProps<
  typeof RadioGroupPrimitive.Item
> &
  VariantProps<typeof radioGroupItemVariants>;

function RadioGroupItem({
  className,
  size: sizeProp,
  ...props
}: RadioGroupItemProps) {
  const { size: contextSize } = React.useContext(RadioGroupContext);
  const size = sizeProp ?? contextSize;

  return (
    <RadioGroupPrimitive.Item
      className={cn(radioGroupItemVariants({ size, className }))}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="relative flex items-center justify-center">
        <CircleIcon className={cn(radioGroupIndicatorVariants({ size }))} />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem, radioGroupItemVariants };
export type { RadioGroupProps, RadioGroupItemProps };
