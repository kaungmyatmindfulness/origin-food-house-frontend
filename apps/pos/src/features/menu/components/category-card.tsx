'use client';

import { isEmpty } from 'lodash-es';
import { Check, Edit, Loader2, MoreVertical, Trash2, X } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import {
  deleteCategory,
  updateCategory,
} from '@/features/menu/services/category.service';
import { ItemCard } from '@/features/menu/components/item-card';
import { zodResolver } from '@hookform/resolvers/zod';
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
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] =
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
      toast.success(`Category renamed to "${renameForm.getValues('name')}".`);
      queryClient.invalidateQueries({
        queryKey: ['categories'],
      });
      renameForm.reset({ name: category.name });
      setIsEditingName(false);
    },
    onError: () => {
      renameForm.reset({ name: category.name });
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
      toast.success(`Category "${category.name}" deleted.`);
      queryClient.invalidateQueries({
        queryKey: ['categories'],
      });
      setIsConfirmDeleteDialogOpen(false);
    },
    onError: () => {
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
      toast.error(
        'Cannot delete category: Please remove all menu items first.'
      );
    } else {
      setIsConfirmDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    deleteCategoryMutation.mutate();
  };

  function renderTitleContent() {
    if (!isEditingName) {
      return (
        <>
          <h2 className="text-lg font-semibold truncate" title={category.name}>
            {category.name}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 text-gray-500 shrink-0 hover:text-gray-800"
            onClick={handleStartEditing}
            aria-label={`Edit name for category ${category.name}`}
            disabled={
              !selectedStoreId ||
              renameCategoryMutation.isPending ||
              deleteCategoryMutation.isPending
            }
          >
            <Edit className="w-4 h-4" />
          </Button>
        </>
      );
    }

    return (
      <Form {...renameForm}>
        <form
          onSubmit={renameForm.handleSubmit(handleRenameSubmit)}
          onReset={handleCancelEdit}
          className="flex items-start flex-grow gap-2"
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
                    placeholder="Category name"
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
            className="w-8 h-8 text-green-600 shrink-0 hover:bg-green-100"
            aria-label="Confirm rename"
            disabled={renameCategoryMutation.isPending}
          >
            {renameCategoryMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
          </Button>
          <Button
            type="reset"
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-red-600 shrink-0 hover:bg-red-100"
            aria-label="Cancel rename"
            disabled={renameCategoryMutation.isPending}
          >
            <X className="w-4 h-4" />
          </Button>
        </form>
      </Form>
    );
  }

  return (
    <>
      {/* Added Fragment to contain section + dialog */}
      <section
        aria-labelledby={`category-title-${category.id}`}
        className={cn(
          'pt-4 pb-6',
          !isLastCategory && 'border-b border-gray-200 dark:border-gray-700'
        )}
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
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                aria-label="Category actions"
                disabled={
                  !selectedStoreId ||
                  deleteCategoryMutation.isPending ||
                  renameCategoryMutation.isPending
                }
              >
                {/* Show loader if either mutation is pending */}
                {deleteCategoryMutation.isPending ||
                renameCategoryMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MoreVertical className="w-4 h-4" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-1">
              {/* Delete Button */}
              <Button
                variant="ghost"
                className="flex w-full items-center justify-start px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/50"
                onClick={handleDeleteRequest}
                disabled={
                  deleteCategoryMutation.isPending ||
                  renameCategoryMutation.isPending
                }
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Category
              </Button>
              {/* Add other actions like Move Up/Down if needed */}
            </PopoverContent>
          </Popover>
        </div>

        {/* Items Grid or Empty Message */}
        {isEmpty(category.menuItems) ? (
          <div className="px-2 py-4 mt-3 text-sm italic text-center text-gray-500 dark:text-gray-400">
            No menu items in this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mt-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {category.menuItems?.map((item) => (
              <ItemCard key={item.id} item={item} onSelect={onSelectItem} />
            ))}
          </div>
        )}
      </section>
      {/* --- Confirmation Dialog (Rendered conditionally based on state) --- */}
      <ConfirmationDialog
        open={isConfirmDeleteDialogOpen}
        onOpenChange={setIsConfirmDeleteDialogOpen}
        title={`Delete Category: ${category.name}`}
        description={
          <>
            Are you sure you want to permanently delete the category
            <strong>{category.name}</strong>? This action cannot be undone.
          </>
        }
        confirmText="Delete"
        confirmVariant="destructive"
        onConfirm={handleConfirmDelete}
        isConfirming={deleteCategoryMutation.isPending}
      />
    </>
  );
}
