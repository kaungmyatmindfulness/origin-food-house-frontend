'use client';

import { isEmpty } from 'lodash-es';
import {
  Check,
  Edit,
  Loader2,
  MoreVertical,
  Trash2,
  X,
  Globe,
} from 'lucide-react';
import { motion } from 'framer-motion';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { toast } from '@repo/ui/lib/toast';
import { z } from 'zod';

import { CategoryTranslationDialog } from './category-translation-dialog';

import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import {
  deleteCategory,
  updateCategory,
} from '@/features/menu/services/category.service';
import { menuKeys } from '@/features/menu/queries/menu.keys';
import { ItemCard } from '@/features/menu/components/item-card';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  getTranslationCompletionCount,
  hasIncompleteTranslations,
} from '@/features/menu/utils/translation.utils';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { ConfirmationDialog } from '@repo/ui/components/confirmation-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/ui/components/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@repo/ui/components/tooltip';
import { cn } from '@repo/ui/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  Category,
  UpdateCategoryDto,
} from '@/features/menu/types/category.types';
import type { MenuItem } from '@/features/menu/types/menu-item.types';

import type { ApiError } from '@/utils/apiFetch';

interface CategoryCardProps {
  category: Category;
  onSelectItem: (item: MenuItem) => void;
  isLastCategory?: boolean;
}

const renameSchema = z.object({
  name: z
    .string()
    .min(1, 'Category name cannot be empty.')
    .max(70, 'Max 70 chars'),
});
type RenameFormData = z.infer<typeof renameSchema>;

export function CategoryCard({
  category,
  onSelectItem,
  isLastCategory = false,
}: CategoryCardProps) {
  const t = useTranslations('menu');
  const tCommon = useTranslations('common');
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] =
    React.useState(false);
  const [isTranslationDialogOpen, setIsTranslationDialogOpen] =
    React.useState(false);

  const queryClient = useQueryClient();
  const selectedStoreId = useAuthStore(selectSelectedStoreId);

  const renameForm = useForm<RenameFormData>({
    resolver: zodResolver(renameSchema),
    defaultValues: { name: category.name },
  });

  const renameCategoryMutation = useMutation<
    void,
    ApiError | Error,
    UpdateCategoryDto
  >({
    mutationFn: async (data: UpdateCategoryDto) => {
      if (!selectedStoreId) throw new Error('Store not selected');
      await updateCategory(selectedStoreId, category.id, data);
    },
    onSuccess: () => {
      toast.success(
        t('categoryRenamed', { name: renameForm.getValues('name') })
      );
      queryClient.invalidateQueries({
        queryKey: menuKeys.all,
      });
      renameForm.reset({ name: category.name });
      setIsEditingName(false);
    },
    onError: (error) => {
      toast.error(t('failedToRename'), {
        description: error instanceof Error ? error.message : tCommon('error'),
      });
      renameForm.reset({ name: category.name });
      setIsEditingName(false);
    },
  });

  const deleteCategoryMutation = useMutation<void, ApiError | Error, void>({
    mutationFn: async () => {
      if (!selectedStoreId) throw new Error('Store not selected');

      if (!isEmpty(category.menuItems)) {
        throw new Error('Category not empty');
      }
      await deleteCategory(selectedStoreId, category.id);
    },
    onSuccess: () => {
      toast.success(t('categoryDeleted', { name: category.name }));
      queryClient.invalidateQueries({
        queryKey: menuKeys.all,
      });
      setIsConfirmDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(t('failedToDelete'), {
        description: error instanceof Error ? error.message : tCommon('error'),
      });
      setIsConfirmDeleteDialogOpen(false);
    },
  });

  function handleStartEditing() {
    renameForm.reset({ name: category.name });
    setIsEditingName(true);
  }

  function handleRenameSubmit(values: RenameFormData) {
    renameCategoryMutation.mutate({ name: values.name });
  }

  function handleCancelEdit() {
    renameForm.reset({ name: category.name });
    setIsEditingName(false);
  }

  const handleDeleteRequest = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPopoverOpen(false);

    if (!isEmpty(category.menuItems)) {
      toast.error(t('cannotDeleteWithItems'));
    } else {
      setIsConfirmDeleteDialogOpen(true);
    }
  };

  const handleTranslateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPopoverOpen(false);
    setIsTranslationDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteCategoryMutation.mutate();
  };

  const translationCount = getTranslationCompletionCount(category.translations);
  const showTranslationBadge = hasIncompleteTranslations(category.translations);

  function renderTitleContent() {
    if (!isEditingName) {
      return (
        <>
          <div className="flex items-center gap-2">
            <h2
              className="truncate text-lg font-semibold"
              title={category.name}
            >
              {category.name}
            </h2>
            {showTranslationBadge && (
              <Badge
                variant="secondary"
                className="shrink-0"
                aria-label={`${translationCount} out of 4 languages translated`}
              >
                🌐 {translationCount}/4
              </Badge>
            )}
          </div>
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground h-11 w-11 shrink-0 sm:h-10 sm:w-10"
                    onClick={handleStartEditing}
                    aria-label={`Edit name for category ${category.name}`}
                    disabled={
                      !selectedStoreId ||
                      renameCategoryMutation.isPending ||
                      deleteCategoryMutation.isPending
                    }
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('editCategoryName')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground h-11 w-11 shrink-0 sm:h-10 sm:w-10"
                    onClick={handleTranslateClick}
                    aria-label={`Translate category ${category.name}`}
                    disabled={
                      !selectedStoreId ||
                      renameCategoryMutation.isPending ||
                      deleteCategoryMutation.isPending
                    }
                  >
                    <Globe className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('manageTranslations')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </>
      );
    }

    return (
      <Form {...renameForm}>
        <form
          onSubmit={renameForm.handleSubmit(handleRenameSubmit)}
          onReset={handleCancelEdit}
          className="flex flex-grow items-start gap-2"
        >
          <FormField
            control={renameForm.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormControl>
                  <Input
                    {...field}
                    autoFocus
                    className="h-8 text-base"
                    placeholder={t('categoryNamePlaceholder')}
                    disabled={renameCategoryMutation.isPending}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="text-primary hover:bg-primary/10 h-8 w-8 shrink-0"
            aria-label="Confirm rename"
            disabled={renameCategoryMutation.isPending}
          >
            {renameCategoryMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
          <Button
            type="reset"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-muted h-8 w-8 shrink-0"
            aria-label="Cancel rename"
            disabled={renameCategoryMutation.isPending}
          >
            <X className="h-4 w-4" />
          </Button>
        </form>
      </Form>
    );
  }

  return (
    <>
      <motion.section
        aria-labelledby={`category-title-${category.id}`}
        className={cn('pt-4 pb-6', !isLastCategory && 'border-b')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header Row */}
        <div className="flex items-center justify-between gap-2">
          {/* Title / Edit Form */}
          <div
            className={cn(
              'flex flex-grow items-center gap-2',
              isEditingName && 'flex-grow-[2]'
            )}
          >
            {renderTitleContent()}
          </div>

          {/* Actions Popover */}
          <TooltipProvider>
            <Tooltip>
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground h-11 w-11 shrink-0 sm:h-10 sm:w-10"
                      aria-label="Category actions"
                      disabled={
                        !selectedStoreId ||
                        deleteCategoryMutation.isPending ||
                        renameCategoryMutation.isPending
                      }
                    >
                      {deleteCategoryMutation.isPending ||
                      renameCategoryMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreVertical className="h-4 w-4" />
                      )}
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <PopoverContent className="w-auto p-1">
                  <div className="flex flex-col">
                    <Button
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10 flex w-full items-center justify-start px-2 py-1.5 text-sm"
                      onClick={handleDeleteRequest}
                      disabled={
                        deleteCategoryMutation.isPending ||
                        renameCategoryMutation.isPending
                      }
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('deleteCategory')}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <TooltipContent>
                <p>{t('categoryActions')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Items Grid or Empty Message */}
        {isEmpty(category.menuItems) ? (
          <div className="mt-3 px-2 py-4 text-center text-sm text-gray-500 italic dark:text-gray-400">
            {t('noCategoryItems')}
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {category.menuItems?.map((item) => (
              <ItemCard key={item.id} item={item} onSelect={onSelectItem} />
            ))}
          </div>
        )}
      </motion.section>
      {/* --- Confirmation Dialog (Rendered conditionally based on state) --- */}
      <ConfirmationDialog
        open={isConfirmDeleteDialogOpen}
        onOpenChange={setIsConfirmDeleteDialogOpen}
        title={t('deleteCategoryTitle', { name: category.name })}
        description={
          <>
            {t('deleteCategoryConfirm')} <strong>{category.name}</strong>?{' '}
            {t('actionCannotBeUndone')}
          </>
        }
        confirmText={tCommon('delete')}
        confirmVariant="destructive"
        onConfirm={handleConfirmDelete}
        isConfirming={deleteCategoryMutation.isPending}
      />

      {selectedStoreId && (
        <CategoryTranslationDialog
          open={isTranslationDialogOpen}
          onOpenChange={setIsTranslationDialogOpen}
          category={category}
          storeId={selectedStoreId}
        />
      )}
    </>
  );
}
