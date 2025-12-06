'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Minus, Plus, Loader2 } from 'lucide-react';

import { getImageUrl } from '@repo/api/utils/s3-url';
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
import { ScrollArea } from '@repo/ui/components/scroll-area';
import { Textarea } from '@repo/ui/components/textarea';

import { formatCurrency } from '@/utils/formatting';

import type { MenuItemResponseDto } from '@repo/api/generated/types';

interface QuickAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MenuItemResponseDto | null;
  onAddToCart: (data: {
    menuItemId: string;
    quantity: number;
    notes?: string;
    customizations?: Array<{ customizationOptionId: string }>;
  }) => void;
  isLoading?: boolean;
}

export function QuickAddDialog({
  open,
  onOpenChange,
  item,
  onAddToCart,
  isLoading = false,
}: QuickAddDialogProps) {
  const t = useTranslations('sales');

  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selectedCustomizations, setSelectedCustomizations] = useState<
    string[]
  >([]);

  // Reset form when item changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      setQuantity(1);
      setNotes('');
      setSelectedCustomizations([]);
    }
  }, [open, item?.id]);

  if (!item) return null;

  // Cast OpenAPI-generated Record<string, never> types to proper types
  const imagePath = item.imagePath as string | null | undefined;
  const description = item.description as string | null | undefined;

  const handleIncrement = () => setQuantity((q) => q + 1);
  const handleDecrement = () => setQuantity((q) => Math.max(1, q - 1));

  const handleCustomizationToggle = (optionId: string) => {
    setSelectedCustomizations((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleSubmit = () => {
    onAddToCart({
      menuItemId: item.id,
      quantity,
      notes: notes.trim() || undefined,
      customizations:
        selectedCustomizations.length > 0
          ? selectedCustomizations.map((id) => ({ customizationOptionId: id }))
          : undefined,
    });
  };

  // Calculate total with customizations
  const customizationTotal =
    item.customizationGroups?.reduce((total, group) => {
      return (
        total +
        (group.customizationOptions?.reduce((groupTotal, option) => {
          if (selectedCustomizations.includes(option.id)) {
            return groupTotal + Number(option.additionalPrice || 0);
          }
          return groupTotal;
        }, 0) ?? 0)
      );
    }, 0) ?? 0;

  const unitPrice = Number(item.basePrice) + customizationTotal;
  const totalPrice = unitPrice * quantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addToCart')}</DialogTitle>
          <DialogDescription>{item.name}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 pr-4">
            {/* Item Image */}
            {getImageUrl(imagePath, 'medium') && (
              <div className="relative h-40 w-full overflow-hidden rounded-lg">
                <Image
                  src={getImageUrl(imagePath, 'medium')!}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
            )}

            {/* Item Info */}
            <div>
              <h3 className="text-foreground font-semibold">{item.name}</h3>
              {description && (
                <p className="text-muted-foreground mt-1 text-sm">
                  {description}
                </p>
              )}
              <p className="text-primary mt-2 text-lg font-bold">
                {formatCurrency(Number(item.basePrice))}
              </p>
            </div>

            {/* Customization Groups */}
            {item.customizationGroups &&
              item.customizationGroups.length > 0 && (
                <div className="space-y-4">
                  {item.customizationGroups.map((group) => (
                    <div key={group.id} className="space-y-2">
                      <Label className="text-sm font-medium">
                        {group.name}
                        {group.required && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </Label>
                      <div className="space-y-2">
                        {group.customizationOptions?.map((option) => (
                          <div
                            key={option.id}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={option.id}
                                checked={selectedCustomizations.includes(
                                  option.id
                                )}
                                onCheckedChange={() =>
                                  handleCustomizationToggle(option.id)
                                }
                              />
                              <Label
                                htmlFor={option.id}
                                className="cursor-pointer text-sm"
                              >
                                {option.name}
                              </Label>
                            </div>
                            {Number(option.additionalPrice) > 0 && (
                              <span className="text-muted-foreground text-sm">
                                +
                                {formatCurrency(Number(option.additionalPrice))}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {/* Quantity */}
            <div className="space-y-2">
              <Label>{t('quantity')}</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11"
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  aria-label={t('decreaseQuantity', { itemName: item.name })}
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <span className="w-12 text-center text-lg font-semibold">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11"
                  onClick={handleIncrement}
                  aria-label={t('increaseQuantity', { itemName: item.name })}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">{t('specialNotes')}</Label>
              <Textarea
                id="notes"
                placeholder={t('specialNotesPlaceholder')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {/* Total */}
          <div className="flex w-full justify-between border-t py-2">
            <span className="font-medium">{t('total')}</span>
            <span className="text-primary text-lg font-bold">
              {formatCurrency(totalPrice)}
            </span>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('adding')}
              </>
            ) : (
              t('addToCartButton')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
