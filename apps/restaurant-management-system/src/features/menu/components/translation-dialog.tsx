'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { toast } from '@repo/ui/lib/toast';
import { ZodError } from 'zod';
import { useKeyboardShortcut } from '../hooks/use-keyboard-shortcut';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Textarea } from '@repo/ui/components/textarea';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/ui/components/tabs';

import { updateMenuItemTranslations } from '../services/translation.service';
import { menuKeys } from '../queries/menu.keys';
import type { MenuItemNestedResponseDto } from '../types/category.types';
import type { SupportedLocale } from '../types/menu-item.types';
import { LOCALE_INFO, SUPPORTED_LOCALES } from '../utils/translation.utils';

interface TranslationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MenuItemNestedResponseDto;
  storeId: string;
}

export function TranslationDialog({
  open,
  onOpenChange,
  item,
  storeId,
}: TranslationDialogProps) {
  const queryClient = useQueryClient();
  const [activeLocale, setActiveLocale] = useState<SupportedLocale>('en');

  // Form state for each locale
  const [translations, setTranslations] = useState<
    Record<SupportedLocale, { name: string; description: string }>
  >(() => {
    const initial = {} as Record<
      SupportedLocale,
      { name: string; description: string }
    >;

    SUPPORTED_LOCALES.forEach((locale) => {
      // item.translations is an array: [{locale, name, description}]
      const translation = item.translations?.find((t) => t.locale === locale);
      initial[locale] = {
        name: translation?.name || '',
        description: translation?.description || '',
      };
    });

    return initial;
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const translationsToUpdate = SUPPORTED_LOCALES.filter(
        (locale) => translations[locale].name.trim() !== ''
      ).map((locale) => ({
        locale,
        name: translations[locale].name,
        description: translations[locale].description || null,
      }));

      // Cast to service type - description is string but API types have Record<string, never>
      await updateMenuItemTranslations(
        item.id,
        storeId,
        translationsToUpdate as Parameters<typeof updateMenuItemTranslations>[2]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.items(storeId) });
      toast.success('Translations updated successfully');
      onOpenChange(false);
    },
    onError: (error) => {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        toast.error('Validation Error', {
          description: firstError?.message || 'Please check your input',
        });
      } else {
        toast.error('Failed to update translations', {
          description:
            error instanceof Error ? error.message : 'Please try again',
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const updateTranslation = (
    locale: SupportedLocale,
    field: 'name' | 'description',
    value: string
  ) => {
    setTranslations((prev) => ({
      ...prev,
      [locale]: {
        ...prev[locale],
        [field]: value,
      },
    }));
  };

  const isTranslated = (locale: SupportedLocale): boolean => {
    return translations[locale].name.trim() !== '';
  };

  const handleSaveShortcut = useCallback(() => {
    if (!mutation.isPending && translations.en.name) {
      mutation.mutate();
    }
  }, [mutation, translations.en.name]);

  // Keyboard shortcut: Ctrl+S to save
  useKeyboardShortcut('s', handleSaveShortcut, { ctrl: true, enabled: open });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Translations</DialogTitle>
          <DialogDescription>
            Add translations for &ldquo;{item.name}&rdquo; in multiple languages
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs
            value={activeLocale}
            onValueChange={(v) => setActiveLocale(v as SupportedLocale)}
          >
            <TabsList className="grid w-full grid-cols-4">
              {SUPPORTED_LOCALES.map((locale) => (
                <TabsTrigger
                  key={locale}
                  value={locale}
                  className="relative"
                  aria-label={`${LOCALE_INFO[locale].name} translation tab${isTranslated(locale) ? ' (translated)' : ' (not translated)'}`}
                >
                  <span className="mr-1">{LOCALE_INFO[locale].flag}</span>
                  <span>{LOCALE_INFO[locale].name}</span>
                  {isTranslated(locale) ? (
                    <Check
                      className="absolute top-2 right-2 size-3 text-green-600"
                      aria-hidden="true"
                    />
                  ) : (
                    <X
                      className="text-muted-foreground absolute top-2 right-2 size-3"
                      aria-hidden="true"
                    />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {SUPPORTED_LOCALES.map((locale) => (
              <TabsContent
                key={locale}
                value={locale}
                className="space-y-4 pt-4"
              >
                <div className="space-y-2">
                  <Label htmlFor={`name-${locale}`}>
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`name-${locale}`}
                    value={translations[locale].name}
                    onChange={(e) =>
                      updateTranslation(locale, 'name', e.target.value)
                    }
                    placeholder={`Enter name in ${LOCALE_INFO[locale].name}`}
                    required={locale === 'en'}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`description-${locale}`}>Description</Label>
                  <Textarea
                    id={`description-${locale}`}
                    value={translations[locale].description}
                    onChange={(e) =>
                      updateTranslation(locale, 'description', e.target.value)
                    }
                    placeholder={`Enter description in ${LOCALE_INFO[locale].name}`}
                    rows={4}
                    maxLength={500}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-muted-foreground text-xs">
              <kbd className="bg-muted rounded px-2 py-1">⌘S</kbd> to save
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending || !translations.en.name}
              >
                {mutation.isPending ? 'Saving...' : 'Save Translations'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
