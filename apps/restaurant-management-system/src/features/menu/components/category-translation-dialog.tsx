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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/ui/components/tabs';

import { updateCategoryTranslations } from '../services/translation.service';
import { menuKeys } from '../queries/menu.keys';
import type { Category } from '../types/category.types';
import type { SupportedLocale } from '../types/menu-item.types';
import { LOCALE_INFO, SUPPORTED_LOCALES } from '../utils/translation.utils';

interface CategoryTranslationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category;
  storeId: string;
}

export function CategoryTranslationDialog({
  open,
  onOpenChange,
  category,
  storeId,
}: CategoryTranslationDialogProps) {
  const queryClient = useQueryClient();
  const [activeLocale, setActiveLocale] = useState<SupportedLocale>('en');

  // Form state for each locale
  const [translations, setTranslations] = useState<
    Record<SupportedLocale, string>
  >(() => {
    const initial = {} as Record<SupportedLocale, string>;

    SUPPORTED_LOCALES.forEach((locale) => {
      // Handle both array and object translation formats from API
      // The API can return translations as either an array of {locale, name} objects
      // or as an object keyed by locale
      let translation: { name?: string } | undefined;

      if (Array.isArray(category.translations)) {
        translation = category.translations.find((t) => t.locale === locale);
      } else if (
        category.translations &&
        typeof category.translations === 'object'
      ) {
        // translations is an object keyed by locale
        const translationsMap = category.translations as Record<
          string,
          { name?: string }
        >;
        translation = translationsMap[locale];
      }

      initial[locale] = translation?.name || '';
    });

    return initial;
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const translationsToUpdate = SUPPORTED_LOCALES.filter(
        (locale) => translations[locale].trim() !== ''
      ).map((locale) => ({
        locale,
        name: translations[locale],
      }));

      await updateCategoryTranslations(
        category.id,
        storeId,
        translationsToUpdate
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.categories(storeId) });
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

  const updateTranslation = (locale: SupportedLocale, value: string) => {
    setTranslations((prev) => ({
      ...prev,
      [locale]: value,
    }));
  };

  const isTranslated = (locale: SupportedLocale): boolean => {
    return translations[locale].trim() !== '';
  };

  const handleSaveShortcut = useCallback(() => {
    if (!mutation.isPending && translations.en) {
      mutation.mutate();
    }
  }, [mutation, translations.en]);

  // Keyboard shortcut: Ctrl+S to save
  useKeyboardShortcut('s', handleSaveShortcut, { ctrl: true, enabled: open });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Translations</DialogTitle>
          <DialogDescription>
            Add translations for category &ldquo;{category.name}&rdquo; in
            multiple languages
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
                    value={translations[locale]}
                    onChange={(e) => updateTranslation(locale, e.target.value)}
                    placeholder={`Enter name in ${LOCALE_INFO[locale].name}`}
                    required={locale === 'en'}
                    maxLength={100}
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
                disabled={mutation.isPending || !translations.en}
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
