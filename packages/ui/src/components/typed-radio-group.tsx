'use client';

import * as React from 'react';

import { RadioGroup, RadioGroupItem } from '@repo/ui/components/radio-group';
import { Label } from '@repo/ui/components/label';
import { cn } from '@repo/ui/lib/utils';
import type { RadioGroupProps } from '@repo/ui/components/radio-group';

/**
 * Option type for TypedRadioGroup component.
 */
interface TypedRadioGroupOption<T extends string> {
  value: T;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
}

/**
 * Props for TypedRadioGroup component.
 * Provides type-safe value and onValueChange handlers.
 */
interface TypedRadioGroupProps<T extends string>
  extends Omit<RadioGroupProps, 'value' | 'onValueChange' | 'children'> {
  /** Current selected value */
  value: T;
  /** Callback fired when value changes - fully typed */
  onValueChange: (value: T) => void;
  /** Array of options to display */
  options: TypedRadioGroupOption<T>[];
  /** Layout direction */
  orientation?: 'horizontal' | 'vertical';
  /** Optional className for each option wrapper */
  optionClassName?: string;
  /** Optional className for the label */
  labelClassName?: string;
}

/**
 * A type-safe wrapper around RadioGroup that eliminates the need for
 * type assertions when handling value changes.
 *
 * @example
 * ```tsx
 * type SplitMethod = 'EQUAL' | 'CUSTOM' | 'BY_ITEM';
 *
 * const SPLIT_OPTIONS: TypedRadioGroupOption<SplitMethod>[] = [
 *   { value: 'EQUAL', label: 'Equal Split' },
 *   { value: 'CUSTOM', label: 'Custom Amounts' },
 *   { value: 'BY_ITEM', label: 'By Item', disabled: true },
 * ];
 *
 * // No type assertion needed!
 * <TypedRadioGroup
 *   value={splitMethod}
 *   onValueChange={setSplitMethod}
 *   options={SPLIT_OPTIONS}
 * />
 * ```
 */
function TypedRadioGroup<T extends string>({
  value,
  onValueChange,
  options,
  orientation = 'vertical',
  className,
  optionClassName,
  labelClassName,
  ...radioGroupProps
}: TypedRadioGroupProps<T>) {
  // The assertion is contained within this component,
  // so consumers never need to use `as T` in their code
  const handleValueChange = React.useCallback(
    (newValue: string) => {
      onValueChange(newValue as T);
    },
    [onValueChange]
  );

  return (
    <RadioGroup
      value={value}
      onValueChange={handleValueChange}
      className={cn(
        orientation === 'horizontal' ? 'flex flex-row space-x-4' : 'flex flex-col space-y-2',
        className
      )}
      {...radioGroupProps}
    >
      {options.map((option) => (
        <div
          key={option.value}
          className={cn('flex items-center space-x-2', optionClassName)}
        >
          <RadioGroupItem
            value={option.value}
            id={option.value}
            disabled={option.disabled}
          />
          <Label
            htmlFor={option.value}
            className={cn(
              'cursor-pointer text-sm',
              option.disabled && 'cursor-not-allowed opacity-50',
              labelClassName
            )}
          >
            {option.label}
            {option.description && (
              <span className="text-muted-foreground ml-1 text-xs">
                {option.description}
              </span>
            )}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}

export { TypedRadioGroup };
export type { TypedRadioGroupProps, TypedRadioGroupOption };
