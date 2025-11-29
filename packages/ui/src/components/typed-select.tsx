'use client';

import * as React from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import type { SelectTriggerProps } from '@repo/ui/components/select';

/**
 * Option type for TypedSelect component.
 * Supports optional icon and description.
 */
interface TypedSelectOption<T extends string> {
  value: T;
  label: React.ReactNode;
  disabled?: boolean;
}

/**
 * Props for TypedSelect component.
 * Provides type-safe value and onValueChange handlers.
 */
interface TypedSelectProps<T extends string>
  extends Omit<SelectTriggerProps, 'children'> {
  /** Current selected value */
  value: T;
  /** Callback fired when value changes - fully typed */
  onValueChange: (value: T) => void;
  /** Array of options to display */
  options: TypedSelectOption<T>[];
  /** Placeholder text when no value selected */
  placeholder?: string;
  /** Optional className for the trigger */
  triggerClassName?: string;
  /** Optional className for the content dropdown */
  contentClassName?: string;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * A type-safe wrapper around Select that eliminates the need for
 * type assertions when handling value changes.
 *
 * @example
 * ```tsx
 * type StockFilter = 'all' | 'in-stock' | 'out-of-stock';
 *
 * const STOCK_OPTIONS: TypedSelectOption<StockFilter>[] = [
 *   { value: 'all', label: 'All Items' },
 *   { value: 'in-stock', label: 'In Stock' },
 *   { value: 'out-of-stock', label: 'Out of Stock' },
 * ];
 *
 * // No type assertion needed!
 * <TypedSelect
 *   value={stockFilter}
 *   onValueChange={setStockFilter}
 *   options={STOCK_OPTIONS}
 *   placeholder="Filter by stock"
 * />
 * ```
 */
function TypedSelect<T extends string>({
  value,
  onValueChange,
  options,
  placeholder,
  triggerClassName,
  contentClassName,
  disabled,
  ...triggerProps
}: TypedSelectProps<T>) {
  // The assertion is contained within this component,
  // so consumers never need to use `as T` in their code
  const handleValueChange = React.useCallback(
    (newValue: string) => {
      onValueChange(newValue as T);
    },
    [onValueChange]
  );

  return (
    <Select value={value} onValueChange={handleValueChange} disabled={disabled}>
      <SelectTrigger className={triggerClassName} {...triggerProps}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { TypedSelect };
export type { TypedSelectProps, TypedSelectOption };
