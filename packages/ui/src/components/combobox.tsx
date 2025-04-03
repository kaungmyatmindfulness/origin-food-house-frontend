'use client';

import * as React from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@repo/ui/components/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
  CommandGroup,
} from '@repo/ui/components/command';
import { Button } from '@repo/ui/components/button';
import { Check } from 'lucide-react';

export interface ComboboxItem {
  label: string;
  value: string;
}

interface ComboboxProps {
  /** The current selected value (controlled). */
  value?: string;
  /** Called whenever the user selects a new value. */
  onValueChange: (val: string) => void;
  /** List of items to display in the combobox. */
  items: ComboboxItem[];
  /** Placeholder text for the search input. */
  placeholder?: string;
  /** If true, shows CommandInput for searching; otherwise hides it. */
  searchable?: boolean;
  /** If true, disable the combobox. */
  disabled?: boolean;
  /** Optional label or button text when no item is selected. */
  triggerLabel?: string;
}

export function Combobox({
  value,
  onValueChange,
  items,
  placeholder = 'Search...',
  searchable = true,
  disabled = false,
  triggerLabel,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  // Find the selected item’s label to display on the trigger.
  const selectedItem = React.useMemo(
    () => items.find((i) => i.value === value),
    [items, value]
  );

  // When user picks a new value from the list:
  function handleSelect(newVal: string) {
    onValueChange(newVal);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="min-w-[10rem] justify-between"
          title={selectedItem?.label ?? triggerLabel ?? 'Select an option'}
        >
          <span className="truncate">
            {selectedItem ? selectedItem.label : (triggerLabel ?? 'Select...')}
          </span>
          {/* A small chevron or similar icon could go here */}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          {/* Show search input if searchable */}
          {searchable && (
            <CommandInput placeholder={placeholder} autoFocus={!disabled} />
          )}
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => {
                const isSelected = item.value === value;
                return (
                  <CommandItem
                    key={item.value}
                    onSelect={() => handleSelect(item.value)}
                  >
                    {item.label}
                    {/* Show checkmark if selected */}
                    {isSelected && (
                      <Check className="text-primary ml-auto h-4 w-4" />
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
