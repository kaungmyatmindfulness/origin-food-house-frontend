import React, { useEffect, useMemo, useState } from 'react';

import { MenuItem } from '@/features/menu/types/menu.types';
import { formatCurrency } from '@/utils/formatting';
import { Button } from '@repo/ui/components/button';
import { Checkbox } from '@repo/ui/components/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import { Label } from '@repo/ui/components/label';
import { RadioGroup, RadioGroupItem } from '@repo/ui/components/radio-group';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import { Separator } from '@repo/ui/components/separator';

interface CustomizationDialogProps {
  item: MenuItem | null;
  currency: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomizationDialog({
  item,
  currency,
  isOpen,
  onClose,
}: CustomizationDialogProps) {
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string[]>
  >({});
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && item) {
      setSelectedOptions({});
      setValidationError(null);
    }
  }, [isOpen, item]);

  const totalPrice = useMemo(() => {
    if (!item) return 0;
    let additional = 0;
    if (item.customizationGroups) {
      for (const groupId in selectedOptions) {
        const group = item.customizationGroups.find((g) => g.id === groupId);
        if (group) {
          selectedOptions[groupId]?.forEach((optionId) => {
            const option = group.customizationOptions.find(
              (o) => o.id === optionId
            );
            if (option?.additionalPrice) {
              additional += parseFloat(option.additionalPrice);
            }
          });
        }
      }
    }
    return parseFloat(item.basePrice) + additional;
  }, [item, selectedOptions]);

  if (!item) return null;

  const handleRadioChange = (groupId: string, optionId: string) => {
    setSelectedOptions((prev) => ({ ...prev, [groupId]: [optionId] }));
    setValidationError(null);
  };

  const handleCheckboxChange = (
    groupId: string,
    optionId: string,
    checked: boolean | 'indeterminate',
    maxSelectable: number
  ) => {
    setSelectedOptions((prev) => {
      const currentSelection = prev[groupId] || [];
      let newSelection: string[];
      if (checked === true) {
        newSelection =
          currentSelection.length < maxSelectable
            ? [...currentSelection, optionId]
            : currentSelection;
        if (currentSelection.length >= maxSelectable) {
          console.warn(
            `Max selectable (${maxSelectable}) reached for group ${groupId}`
          );
        }
      } else {
        newSelection = currentSelection.filter((id) => id !== optionId);
      }
      return { ...prev, [groupId]: newSelection };
    });
    setValidationError(null);
  };

  const validateSelections = (): boolean => {
    if (!item.customizationGroups) return true;
    for (const group of item.customizationGroups) {
      const selections = selectedOptions[group.id] || [];
      if (selections.length < group.minSelectable) {
        setValidationError(
          `Please select at least ${group.minSelectable} option(s) for ${group.name}.`
        );
        return false;
      }
      if (selections.length > group.maxSelectable) {
        setValidationError(
          `Please select no more than ${group.maxSelectable} option(s) for ${group.name}.`
        );
        return false;
      }
    }
    setValidationError(null);
    return true;
  };

  const handleConfirmAddToCart = () => {
    if (!validateSelections()) return;
    // todo: cart store: optimistic add item
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Customize {item.name}</DialogTitle>
          <DialogDescription>
            Select your preferred options. Base price:{' '}
            {formatCurrency(item.basePrice, currency)}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="-mx-6 max-h-[60vh] px-6">
          <div className="space-y-6 py-4">
            {item.customizationGroups?.map((group, index, arr) => (
              <div key={group.id} className="space-y-3">
                <div>
                  <Label className="text-base font-medium">{group.name}</Label>
                  <p className="text-muted-foreground text-sm">
                    {group.minSelectable === group.maxSelectable &&
                    group.minSelectable > 0
                      ? `Select ${group.minSelectable}`
                      : group.minSelectable > 0 &&
                          group.maxSelectable > group.minSelectable
                        ? `Select ${group.minSelectable} to ${group.maxSelectable}`
                        : group.maxSelectable > 1
                          ? `Select up to ${group.maxSelectable}`
                          : 'Optional'}
                    {group.minSelectable > 0 && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </p>
                </div>

                {group.maxSelectable === 1 ? (
                  <RadioGroup
                    value={selectedOptions[group.id]?.[0] || ''}
                    onValueChange={(optionId) =>
                      handleRadioChange(group.id, optionId)
                    }
                    className="gap-2"
                  >
                    {group.customizationOptions.map((option) => (
                      <div
                        key={option.id}
                        className="border-input has-[[data-state=checked]]:border-primary flex items-center justify-between space-x-2 rounded-md border p-3"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={option.id}
                            id={`${group.id}-${option.id}`}
                          />
                          <Label
                            htmlFor={`${group.id}-${option.id}`}
                            className="cursor-pointer font-normal"
                          >
                            {option.name}
                          </Label>
                        </div>
                        {option.additionalPrice &&
                          parseFloat(option.additionalPrice) > 0 && (
                            <span className="text-muted-foreground text-sm">
                              +
                              {formatCurrency(option.additionalPrice, currency)}
                            </span>
                          )}
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="space-y-2">
                    {group.customizationOptions.map((option) => {
                      const isSelected =
                        selectedOptions[group.id]?.includes(option.id) ?? false;
                      const isDisabled =
                        !isSelected &&
                        (selectedOptions[group.id]?.length ?? 0) >=
                          group.maxSelectable;
                      return (
                        <div
                          key={option.id}
                          className={`flex items-center justify-between space-x-2 rounded-md border p-3 ${isSelected ? 'border-primary' : 'border-input'} ${isDisabled ? 'opacity-50' : ''}`}
                        >
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`${group.id}-${option.id}`}
                              checked={isSelected}
                              onCheckedChange={(checked) =>
                                handleCheckboxChange(
                                  group.id,
                                  option.id,
                                  checked,
                                  group.maxSelectable
                                )
                              }
                              disabled={isDisabled}
                            />
                            <Label
                              htmlFor={`${group.id}-${option.id}`}
                              className={`font-normal ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              {option.name}
                            </Label>
                          </div>
                          {option.additionalPrice &&
                            parseFloat(option.additionalPrice) > 0 && (
                              <span className="text-muted-foreground text-sm">
                                +
                                {formatCurrency(
                                  option.additionalPrice,
                                  currency
                                )}
                              </span>
                            )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* Add separator only if it's not the last group */}
                {index < arr.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        </ScrollArea>

        {validationError && (
          <p className="text-destructive mt-2 text-sm">{validationError}</p>
        )}

        <DialogFooter className="mt-4 gap-2 sm:justify-between">
          <span className="text-lg font-semibold">
            Total: {formatCurrency(totalPrice, currency)}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAddToCart}>Add to Cart</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
