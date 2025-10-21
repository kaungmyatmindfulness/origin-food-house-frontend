'use client';

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@repo/ui/lib/utils';

// Context for sharing size variant across avatar components
type AvatarSize = 'sm' | 'default' | 'lg' | 'xl';

type AvatarContextValue = {
  size: AvatarSize;
};

const AvatarContext = React.createContext<AvatarContextValue>({
  size: 'default',
});

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        sm: 'size-6',
        default: 'size-8',
        lg: 'size-10',
        xl: 'size-12',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const avatarFallbackVariants = cva(
  'bg-muted flex size-full items-center justify-center rounded-full font-medium',
  {
    variants: {
      size: {
        sm: 'text-xs',
        default: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

type AvatarProps = React.ComponentProps<typeof AvatarPrimitive.Root> &
  VariantProps<typeof avatarVariants>;

function Avatar({ className, size = 'default', ...props }: AvatarProps) {
  return (
    <AvatarContext.Provider value={{ size: size ?? 'default' }}>
      <AvatarPrimitive.Root
        className={cn(avatarVariants({ size, className }))}
        {...props}
      />
    </AvatarContext.Provider>
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      className={cn('aspect-square size-full', className)}
      {...props}
    />
  );
}

type AvatarFallbackProps = React.ComponentProps<
  typeof AvatarPrimitive.Fallback
> &
  VariantProps<typeof avatarFallbackVariants>;

function AvatarFallback({
  className,
  size: sizeProp,
  ...props
}: AvatarFallbackProps) {
  const { size: contextSize } = React.useContext(AvatarContext);
  const size = sizeProp ?? contextSize;

  return (
    <AvatarPrimitive.Fallback
      className={cn(avatarFallbackVariants({ size, className }))}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback, avatarVariants };
export type { AvatarProps, AvatarFallbackProps };
