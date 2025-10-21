import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@repo/ui/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

const inputVariants = cva(
  'border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex w-full min-w-0 rounded-md border bg-transparent shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:border-0 file:bg-transparent file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
  {
    variants: {
      size: {
        sm: 'h-8 px-2.5 py-1 text-xs file:h-6 file:text-xs md:text-xs',
        default: 'h-9 px-3 py-1 text-base file:h-7 file:text-sm md:text-sm',
        lg: 'h-10 px-4 py-2 text-base file:h-8 file:text-base',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

/**
 * We combine typical HTML <input> attributes with our custom props.
 *
 * - `React.ComponentPropsWithoutRef<"input">` includes:
 *   - All standard HTML attributes for an <input> element.
 *   - Excludes the ref prop (so we can forward it ourselves).
 */
type EnhancedInputProps = React.ComponentPropsWithoutRef<'input'> &
  VariantProps<typeof inputVariants> & {
    /** Optional content displayed to the left of the input (icon, label, etc.) */
    prefix?: React.ReactNode;
    /** Optional content displayed to the right of the input */
    suffix?: React.ReactNode;
    /** If true and type="password", shows a small icon button to toggle password visibility */
    showPasswordToggle?: boolean;
  };

export const Input = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  (
    {
      className,
      type = 'text',
      size,
      prefix,
      suffix,
      showPasswordToggle = true,
      ...props
    },
    ref
  ) => {
    /** State for toggling password visibility if requested. */
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

    /**
     * If showPasswordToggle is true and original type is password,
     * override the actual input type based on isPasswordVisible.
     */
    const resolvedType =
      showPasswordToggle && type === 'password'
        ? isPasswordVisible
          ? 'text'
          : 'password'
        : type;

    const iconSizeClasses = {
      sm: 'h-3 w-3',
      default: 'h-4 w-4',
      lg: 'h-5 w-5',
    };

    const iconSize = iconSizeClasses[size ?? 'default'];

    return (
      <div className="relative inline-flex items-center space-x-2">
        {/* PREFIX */}
        {prefix && (
          <div className="text-muted-foreground flex items-center text-sm">
            {prefix}
          </div>
        )}

        {/* INPUT */}
        <input
          ref={ref}
          type={resolvedType}
          className={cn(inputVariants({ size, className }))}
          {...props}
        />

        {/* PASSWORD TOGGLE (if requested and type=password) */}
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible((prev) => !prev)}
            className="text-muted-foreground flex items-center p-1 text-sm"
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
          >
            {isPasswordVisible ? (
              <EyeOff className={iconSize} />
            ) : (
              <Eye className={iconSize} />
            )}
          </button>
        )}

        {/* SUFFIX */}
        {suffix && (
          <div className="text-muted-foreground flex items-center text-sm">
            {suffix}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { inputVariants };
export type { EnhancedInputProps as InputProps };
