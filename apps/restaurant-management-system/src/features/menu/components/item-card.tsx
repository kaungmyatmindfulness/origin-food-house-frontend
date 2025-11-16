'use client';

import { motion } from 'framer-motion';
import { Edit, Loader2, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { toast } from '@repo/ui/lib/toast';

import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import {
  deleteMenuItem,
  toggleMenuItemOutOfStock,
} from '@/features/menu/services/menu-item.service';
import { menuKeys } from '@/features/menu/queries/menu.keys';
import { MenuItem } from '@/features/menu/types/menu-item.types';
import type { Category } from '@/features/menu/types/category.types';
import { formatCurrency } from '@/utils/formatting';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { ConfirmationDialog } from '@repo/ui/components/confirmation-dialog';
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
import { Switch } from '@repo/ui/components/switch';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ApiError } from '@/utils/apiFetch';
import { useMenuStore } from '@/features/menu/store/menu.store';
import { getImageUrl } from '@repo/api/utils/s3-url';

interface ItemCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export function ItemCard({ item, onSelect }: ItemCardProps) {
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  const setEditMenuItemId = useMenuStore((state) => state.setEditMenuItemId);

  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] =
    React.useState(false);

  const queryClient = useQueryClient();
  const selectedStoreId = useAuthStore(selectSelectedStoreId);

  const deleteItemMutation = useMutation<void, ApiError | Error, void>({
    mutationFn: async () => {
      if (!selectedStoreId) {
        throw new Error('Store is not selected.');
      }
      await deleteMenuItem(selectedStoreId, item.id);
    },
    onSuccess: () => {
      toast.success(`Item "${item.name}" deleted successfully.`);
      queryClient.invalidateQueries({
        queryKey: menuKeys.all,
      });
      setIsConfirmDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to delete item', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
      setIsConfirmDeleteDialogOpen(false);
    },
  });

  const toggleOutOfStockMutation = useMutation<
    void,
    ApiError | Error,
    boolean,
    { previousData?: unknown }
  >({
    mutationFn: async (isOutOfStock: boolean) => {
      if (!selectedStoreId) {
        throw new Error('Store is not selected.');
      }
      await toggleMenuItemOutOfStock(item.id, selectedStoreId, isOutOfStock);
    },
    onMutate: async (isOutOfStock) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: menuKeys.all });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(
        menuKeys.categories(selectedStoreId!)
      );

      // Optimistically update
      queryClient.setQueryData(
        menuKeys.categories(selectedStoreId!),
        (old: Category[] | undefined) => {
          if (!old) return old;
          return old.map((cat) => ({
            ...cat,
            menuItems: (cat.menuItems ?? []).map((i) =>
              i.id === item.id ? { ...i, isOutOfStock } : i
            ),
          }));
        }
      );

      return { previousData };
    },
    onSuccess: (_, isOutOfStock) => {
      toast.success(
        isOutOfStock
          ? `"${item.name}" marked as out of stock`
          : `"${item.name}" is back in stock`
      );
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          menuKeys.categories(selectedStoreId!),
          context.previousData
        );
      }
      toast.error('Failed to update stock status', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: menuKeys.all });
    },
  });

  const handleCardClick = () => {
    if (deleteItemMutation.isPending) return;
    onSelect(item);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPopoverOpen(false);
    setEditMenuItemId(item.id);
  };

  const handleDeleteRequest = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPopoverOpen(false);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteItemMutation.mutate();
  };

  const handlePopoverTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleToggleOutOfStock = (checked: boolean) => {
    toggleOutOfStockMutation.mutate(checked);
  };

  const actionsDisabled = deleteItemMutation.isPending || !selectedStoreId;

  const isOutOfStock = item.isOutOfStock;

  return (
    <>
      <motion.div
        className="group bg-card cursor-pointer overflow-hidden rounded-lg border text-left shadow-sm transition-shadow hover:shadow-md"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCardClick}
        layout
      >
        <div className="relative h-32 w-full">
          {getImageUrl(item.imagePath, 'medium') ? (
            <Image
              src={getImageUrl(item.imagePath, 'medium')!}
              alt={item.name}
              fill
              className="border-b object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="bg-muted flex h-full w-full items-center justify-center border-b">
              <span className="text-muted-foreground text-sm">No image</span>
            </div>
          )}

          {/* Out of Stock Badge */}
          {isOutOfStock && (
            <Badge
              variant="secondary"
              className="absolute top-2 left-2 bg-yellow-500 text-yellow-900 hover:bg-yellow-500"
            >
              Out of Stock
            </Badge>
          )}

          {/* Quick Edit Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-1 right-10 h-8 w-8 rounded-full opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(e);
                  }}
                  aria-label={`Quick edit ${item.name}`}
                  disabled={actionsDisabled}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Quick edit</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* More Actions Menu */}
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-1 right-1 h-8 w-8 rounded-full opacity-80 shadow-md hover:opacity-100"
                onClick={handlePopoverTriggerClick}
                aria-label={`Actions for ${item.name}`}
                disabled={actionsDisabled}
              >
                {deleteItemMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MoreVertical className="h-4 w-4" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-32 p-1"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col text-sm">
                <Button
                  variant="ghost"
                  className="flex w-full items-center justify-start px-2 py-1.5 text-sm font-normal"
                  onClick={handleEditClick}
                  disabled={actionsDisabled}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>

                <Button
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 flex w-full items-center justify-start px-2 py-1.5 text-sm font-normal"
                  onClick={handleDeleteRequest}
                  disabled={actionsDisabled}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2 p-3">
          <h3
            className="text-foreground truncate text-base font-semibold"
            title={item.name}
          >
            {item.name}
          </h3>
          {item.description && (
            <p className="text-muted-foreground line-clamp-2 text-xs">
              {item.description}
            </p>
          )}
          <p className="text-foreground text-lg font-bold">
            {formatCurrency(Number(item.basePrice))}
          </p>

          <div
            className="flex items-center justify-between border-t pt-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-1 flex-col">
              <span className="text-foreground text-xs font-medium">
                {isOutOfStock ? 'Out of Stock' : 'In Stock'}
              </span>
              <span className="text-muted-foreground text-xs">
                {isOutOfStock
                  ? 'Hidden from customers'
                  : 'Visible to customers'}
              </span>
            </div>
            <Switch
              id={`out-of-stock-${item.id}`}
              checked={isOutOfStock ?? false}
              onCheckedChange={handleToggleOutOfStock}
              disabled={toggleOutOfStockMutation.isPending || !selectedStoreId}
              aria-label={`Mark ${item.name} as ${isOutOfStock ? 'in stock' : 'out of stock'}`}
            />
          </div>
        </div>
      </motion.div>
      <ConfirmationDialog
        open={isConfirmDeleteDialogOpen}
        onOpenChange={setIsConfirmDeleteDialogOpen}
        title={`Delete Item: ${item.name}`}
        description={
          <>
            Are you sure you want to permanently delete the item{' '}
            <strong>{item.name}</strong>? This action cannot be undone.
          </>
        }
        confirmText="Delete"
        confirmVariant="destructive"
        onConfirm={handleConfirmDelete}
        isConfirming={deleteItemMutation.isPending}
      />
    </>
  );
}
