'use client';

import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDownIcon } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@repo/ui/lib/utils';

// Context for sharing size variant across accordion components
type AccordionSize = 'sm' | 'default' | 'lg';

type AccordionContextValue = {
  size: AccordionSize;
};

const AccordionContext = React.createContext<AccordionContextValue>({
  size: 'default',
});

const accordionTriggerVariants = cva(
  'focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between rounded-md text-left font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180',
  {
    variants: {
      size: {
        sm: 'gap-2 py-2.5 text-xs',
        default: 'gap-4 py-4 text-sm',
        lg: 'gap-4 py-5 text-base',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const accordionContentVariants = cva(
  'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden',
  {
    variants: {
      size: {
        sm: 'text-xs',
        default: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const accordionIconVariants = cva(
  'text-muted-foreground pointer-events-none shrink-0 translate-y-0.5 transition-transform duration-200',
  {
    variants: {
      size: {
        sm: 'size-3',
        default: 'size-4',
        lg: 'size-5',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

type AccordionProps = React.ComponentProps<typeof AccordionPrimitive.Root> &
  VariantProps<typeof accordionTriggerVariants>;

function Accordion({ size = 'default', ...props }: AccordionProps) {
  return (
    <AccordionContext.Provider value={{ size: size ?? 'default' }}>
      <AccordionPrimitive.Root {...props} />
    </AccordionContext.Provider>
  );
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('border-b last:border-b-0', className)}
      {...props}
    />
  );
}

type AccordionTriggerProps = React.ComponentProps<
  typeof AccordionPrimitive.Trigger
> &
  VariantProps<typeof accordionTriggerVariants>;

function AccordionTrigger({
  className,
  children,
  size: sizeProp,
  ...props
}: AccordionTriggerProps) {
  const { size: contextSize } = React.useContext(AccordionContext);
  const size = sizeProp ?? contextSize;

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(accordionTriggerVariants({ size, className }))}
        {...props}
      >
        {children}
        <ChevronDownIcon className={cn(accordionIconVariants({ size }))} />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

type AccordionContentProps = React.ComponentProps<
  typeof AccordionPrimitive.Content
> &
  VariantProps<typeof accordionContentVariants>;

function AccordionContent({
  className,
  children,
  size: sizeProp,
  ...props
}: AccordionContentProps) {
  const { size: contextSize } = React.useContext(AccordionContext);
  const size = sizeProp ?? contextSize;

  const paddingClasses: Record<AccordionSize, string> = {
    sm: 'pt-0 pb-2.5',
    default: 'pt-0 pb-4',
    lg: 'pt-0 pb-5',
  };

  return (
    <AccordionPrimitive.Content
      className={cn(accordionContentVariants({ size }))}
      {...props}
    >
      <div className={cn(paddingClasses[size], className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  accordionTriggerVariants,
  accordionContentVariants,
  accordionIconVariants,
};
export type { AccordionProps, AccordionTriggerProps, AccordionContentProps };
