'use client';

import * as React from 'react';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@repo/ui/components/tabs';
import { cn } from '@repo/ui/lib/utils';

/**
 * Tab definition for TypedTabs component.
 */
interface TypedTab<T extends string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  content?: React.ReactNode;
  disabled?: boolean;
}

/**
 * Props for TypedTabs component.
 * Provides type-safe value and onValueChange handlers.
 */
interface TypedTabsProps<T extends string> {
  /** Current selected tab value */
  value: T;
  /** Callback fired when tab changes - fully typed */
  onValueChange: (value: T) => void;
  /** Array of tabs to display */
  tabs: TypedTab<T>[];
  /** Optional className for the Tabs container */
  className?: string;
  /** Optional className for the TabsList */
  listClassName?: string;
  /** Optional className for each TabsTrigger */
  triggerClassName?: string;
  /** Optional className for each TabsContent */
  contentClassName?: string;
  /** Default value for uncontrolled mode (optional) */
  defaultValue?: T;
  /** Children to render (alternative to using tabs.content) */
  children?: React.ReactNode;
}

/**
 * A type-safe wrapper around Tabs that eliminates the need for
 * type assertions when handling value changes.
 *
 * Can be used in two modes:
 * 1. With `tabs[].content` - renders tab content automatically
 * 2. With `children` - renders custom TabsContent components
 *
 * @example
 * ```tsx
 * type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'MOBILE_PAYMENT';
 *
 * const PAYMENT_TABS: TypedTab<PaymentMethod>[] = [
 *   { value: 'CASH', label: 'Cash', icon: <DollarSign /> },
 *   { value: 'CREDIT_CARD', label: 'Card', icon: <CreditCard /> },
 *   { value: 'MOBILE_PAYMENT', label: 'Mobile', icon: <Phone /> },
 * ];
 *
 * // Mode 1: With content in tabs definition
 * <TypedTabs
 *   value={paymentMethod}
 *   onValueChange={setPaymentMethod}
 *   tabs={PAYMENT_TABS.map(tab => ({ ...tab, content: <PaymentForm type={tab.value} /> }))}
 * />
 *
 * // Mode 2: With children (for more complex content)
 * <TypedTabs
 *   value={paymentMethod}
 *   onValueChange={setPaymentMethod}
 *   tabs={PAYMENT_TABS}
 * >
 *   <TabsContent value="CASH">...</TabsContent>
 *   <TabsContent value="CREDIT_CARD">...</TabsContent>
 * </TypedTabs>
 * ```
 */
function TypedTabs<T extends string>({
  value,
  onValueChange,
  tabs,
  className,
  listClassName,
  triggerClassName,
  contentClassName,
  defaultValue,
  children,
}: TypedTabsProps<T>) {
  // The assertion is contained within this component,
  // so consumers never need to use `as T` in their code
  const handleValueChange = React.useCallback(
    (newValue: string) => {
      onValueChange(newValue as T);
    },
    [onValueChange]
  );

  const hasTabContent = tabs.some((tab) => tab.content !== undefined);

  return (
    <Tabs
      value={value}
      onValueChange={handleValueChange}
      defaultValue={defaultValue}
      className={className}
    >
      <TabsList className={listClassName}>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className={cn(tab.icon && 'gap-2', triggerClassName)}
          >
            {tab.icon}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* If children are provided, use them; otherwise render tab content */}
      {children
        ? children
        : hasTabContent &&
          tabs.map(
            (tab) =>
              tab.content && (
                <TabsContent
                  key={tab.value}
                  value={tab.value}
                  className={contentClassName}
                >
                  {tab.content}
                </TabsContent>
              )
          )}
    </Tabs>
  );
}

// Re-export TabsContent for use with children mode
export { TypedTabs, TabsContent };
export type { TypedTabsProps, TypedTab };
