import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@repo/ui/lib/utils';

// Context for sharing size variant across alert components
type AlertSize = 'sm' | 'default' | 'lg';

type AlertContextValue = {
  size: AlertSize;
};

const AlertContext = React.createContext<AlertContextValue>({
  size: 'default',
});

const alertVariants = cva(
  'relative w-full rounded-lg border grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] items-start [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'text-destructive-foreground [&>svg]:text-current *:data-[slot=alert-description]:text-destructive-foreground/80',
      },
      size: {
        sm: 'px-3 py-2 text-xs has-[>svg]:gap-x-2 gap-y-0.5 [&>svg]:size-3.5 [&>svg]:translate-y-0.5',
        default:
          'px-4 py-3 text-sm has-[>svg]:gap-x-3 gap-y-0.5 [&>svg]:size-4 [&>svg]:translate-y-0.5',
        lg: 'px-5 py-4 text-base has-[>svg]:gap-x-4 gap-y-1 [&>svg]:size-5 [&>svg]:translate-y-0.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const alertTitleVariants = cva(
  'col-start-2 line-clamp-1 font-medium tracking-tight',
  {
    variants: {
      size: {
        sm: 'min-h-3.5 text-xs',
        default: 'min-h-4 text-sm',
        lg: 'min-h-5 text-base',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const alertDescriptionVariants = cva(
  'text-muted-foreground col-start-2 grid justify-items-start gap-1 [&_p]:leading-relaxed',
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

type AlertProps = React.ComponentProps<'div'> &
  VariantProps<typeof alertVariants>;

function Alert({ className, variant, size = 'default', ...props }: AlertProps) {
  return (
    <AlertContext.Provider value={{ size: size ?? 'default' }}>
      <div
        role="alert"
        className={cn(alertVariants({ variant, size, className }))}
        {...props}
      />
    </AlertContext.Provider>
  );
}

type AlertTitleProps = React.ComponentProps<'div'> &
  VariantProps<typeof alertTitleVariants>;

function AlertTitle({ className, size: sizeProp, ...props }: AlertTitleProps) {
  const { size: contextSize } = React.useContext(AlertContext);
  const size = sizeProp ?? contextSize;

  return (
    <div className={cn(alertTitleVariants({ size, className }))} {...props} />
  );
}

type AlertDescriptionProps = React.ComponentProps<'div'> &
  VariantProps<typeof alertDescriptionVariants>;

function AlertDescription({
  className,
  size: sizeProp,
  ...props
}: AlertDescriptionProps) {
  const { size: contextSize } = React.useContext(AlertContext);
  const size = sizeProp ?? contextSize;

  return (
    <div
      className={cn(alertDescriptionVariants({ size, className }))}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, alertVariants };
export type { AlertProps, AlertTitleProps, AlertDescriptionProps };
