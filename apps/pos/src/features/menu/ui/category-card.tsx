'use client';

import { isEmpty } from 'lodash-es';
import { Check, Edit, MoreVertical, Trash2, X, Loader2 } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';

import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';

import {
  updateCategory,
  deleteCategory,
} from '@/features/menu/services/category.service';
import type {
  Category,
  UpdateCategoryDto,
} from '@/features/menu/types/category.types';
import type { MenuItem } from '@/features/menu/types/menu-item.types';

import { ItemCard } from '@/features/menu/ui/item-card';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/ui/components/button';
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
import type { ApiError } from '@/utils/apiFetch';

interface CategoryCardProps {
  category: Category;
  onSelectItem: (item: MenuItem) => void;
  onEditItem: (item: MenuItem) => void;
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
  onEditItem,
  isLastCategory = false,
}: CategoryCardProps) {
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  const queryClient = useQueryClient();
  const selectedStoreId = useAuthStore(selectSelectedStoreId);

  const renameForm = useForm<RenameFormData>({
    resolver: zodResolver(renameSchema),
    defaultValues: { name: category.name },
  });

  const renameCategoryMutation = useMutation({
    mutationFn: async (data: UpdateCategoryDto) => {
      return updateCategory(selectedStoreId!, category.id, data);
    },
    onSuccess: () => {
      toast.success(`Category renamed to "${renameForm.getValues('name')}".`);

      queryClient.invalidateQueries({
        queryKey: ['categories'],
      });

      setIsEditingName(false);
    },
    onError: (error) => {
      toast.error(
        (error as ApiError).responseJson?.message ||
          'Failed to rename category.'
      );
      renameForm.reset({ name: category.name });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async () => {
      return deleteCategory(selectedStoreId!, category.id);
    },
    onSuccess: () => {
      toast.success(`Category "${category.name}" deleted.`);

      queryClient.invalidateQueries({
        queryKey: ['categories'],
      });
    },
    onError: (error) => {
      toast.error(
        (error as ApiError).responseJson?.message ||
          'Failed to delete category.'
      );
      setIsPopoverOpen(false);
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

  function handleDelete() {
    if (
      window.confirm(
        `Are you sure you want to delete the category "${category.name}"? This cannot be undone.`
      )
    ) {
      deleteCategoryMutation.mutate();
    } else {
      setIsPopoverOpen(false);
    }
  }

  function renderTitleContent() {
    if (!isEditingName) {
      return (
        <>
          <h2 className="truncate text-lg font-semibold" title={category.name}>
            {category.name}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 text-gray-500 hover:text-gray-800"
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
            className="h-8 w-8 shrink-0 text-green-600 hover:bg-green-100"
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
            className="h-8 w-8 shrink-0 text-red-600 hover:bg-red-100"
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
    <section
      aria-labelledby={`category-title-${category.id}`}
      className={cn(
        'pt-4 pb-6',
        !isLastCategory && 'border-b border-gray-200 dark:border-gray-700'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div
          className={cn(
            'flex flex-grow items-center gap-2',
            isEditingName && 'flex-grow-[2]'
          )}
        >
          {renderTitleContent()}
        </div>

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
              {deleteCategoryMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MoreVertical className="h-4 w-4" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-1">
            <Button
              variant="ghost"
              className="flex w-full items-center justify-start px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/50"
              onClick={handleDelete}
              disabled={deleteCategoryMutation.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Category
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      {isEmpty(category.menuItems) ? (
        <div className="mt-3 px-2 py-4 text-center text-sm text-gray-500 italic dark:text-gray-400">
          No menu items in this category yet.
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {category.menuItems?.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onSelect={onSelectItem}
              onEdit={onEditItem}
            />
          ))}
        </div>
      )}
    </section>
  );
}
