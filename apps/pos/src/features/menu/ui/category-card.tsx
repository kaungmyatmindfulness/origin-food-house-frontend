'use client';

import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MoreVertical, Trash2, Check, X, Edit } from 'lucide-react';

import { Category } from '@/features/menu/types/category.types';
import { MenuItem } from '@/features/menu/types/menu-item.types';
import { ItemCard } from '@/features/menu/ui/item-card';
import { Button } from '@repo/ui/components/button';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@repo/ui/components/popover';
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import { cn } from '@repo/ui/lib/utils';

interface CategoryCardProps {
  category: Category;
  onEditCategory: (catId: number, newName: string) => void;
  onDeleteCategory: (catId: number) => void;
  onSelectItem: (item: MenuItem) => void;
  isLastCategory?: boolean;
}

const renameSchema = z.object({
  name: z.string().min(1, 'Category name cannot be empty.'),
});

type RenameSchema = z.infer<typeof renameSchema>;

export function CategoryCard({
  category,
  onEditCategory,
  onDeleteCategory,
  onSelectItem,
  isLastCategory = false,
}: CategoryCardProps) {
  const [editingName, setEditingName] = React.useState(false);

  // Set up RHF form with Zod
  const renameForm = useForm<RenameSchema>({
    resolver: zodResolver(renameSchema),
    defaultValues: { name: category.name },
  });

  function handleStartEditing() {
    setEditingName(true);
    // Reset form to current category name
    renameForm.reset({ name: category.name });
  }

  function handleSubmit(values: RenameSchema) {
    // If valid, call parent
    onEditCategory(category.id, values.name);
    setEditingName(false);
  }

  function handleCancel() {
    renameForm.reset({ name: category.name });
    setEditingName(false);
  }

  // Renders the category title row (non-editing or editing)
  function renderTitleRow() {
    if (!editingName) {
      // Not editing
      return (
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{category.name}</h2>
          <button
            className="p-1 text-gray-600 rounded hover:bg-gray-100"
            onClick={handleStartEditing}
            aria-label="Edit category name"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      );
    }

    // Editing
    return (
      <Form {...renameForm}>
        <form
          onSubmit={renameForm.handleSubmit(handleSubmit)}
          onReset={handleCancel}
          className="flex flex-col gap-1"
        >
          <div className="flex items-center gap-2">
            <FormField
              control={renameForm.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      {...field}
                      autoFocus
                      className="text-sm"
                      placeholder="Category name"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />

            <button
              type="submit"
              className="p-1 text-green-600 rounded hover:bg-gray-100"
              aria-label="Confirm rename"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              type="reset"
              className="p-1 text-red-600 rounded hover:bg-gray-100"
              aria-label="Cancel rename"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>
      </Form>
    );
  }

  return (
    <div className={cn('pt-4 pb-6', !isLastCategory && 'border-b')}>
      <div className="flex items-center justify-between">
        {renderTitleRow()}

        <div className="flex-1" />

        {/* Popover for delete only */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="p-1"
              aria-label="Category actions"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-32 p-1">
            <div className="flex flex-col text-sm">
              <button
                className="flex items-center px-2 py-1 text-red-600 hover:bg-gray-100"
                onClick={() => onDeleteCategory(category.id)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-2 gap-4 mt-2 sm:grid-cols-3 md:grid-cols-4">
        {category.menuItems?.map((item) => (
          <ItemCard key={item.id} item={item} onSelect={onSelectItem} />
        ))}
      </div>
    </div>
  );
}
