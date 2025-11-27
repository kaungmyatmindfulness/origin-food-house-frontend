'use client';

import { motion } from 'framer-motion';
import { Loader2, MoreVertical, Pencil, Trash2, Globe } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { toast } from '@repo/ui/lib/toast';

import { TranslationDialog } from './translation-dialog';

import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import { $api } from '@/utils/apiFetch';
import { API_PATHS } from '@/utils/api-paths';
import { MenuItem } from '@/features/menu/types/menu-item.types';
import type { Category } from '@/features/menu/types/category.types';
import { formatCurrency } from '@/utils/formatting';
import {
  getTranslationCompletionCount,
  hasIncompleteTranslations,
} from '@/features/menu/utils/translation.utils';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { ConfirmationDialog } from '@repo/ui/components/confirmation-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import { Switch } from '@repo/ui/components/switch';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useMenuStore } from '@/features/menu/store/menu.store';
import { getImageUrl } from '@repo/api/utils/s3-url';

interface ItemCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export function ItemCard({ item, onSelect }: ItemCardProps) {
  const [isTranslationDialogOpen, setIsTranslationDialogOpen] =
    React.useState(false);

  const setEditMenuItemId = useMenuStore((state) => state.setEditMenuItemId);

  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] =
    React.useState(false);

  const queryClient = useQueryClient();
  const selectedStoreId = useAuthStore(selectSelectedStoreId);

  // Use $api.useMutation for type-safe API calls
  const deleteMenuItemApiMutation = $api.useMutation(
    'delete',
    API_PATHS.menuItem
  );
  const patchMenuItemApiMutation = $api.useMutation(
    'patch',
    API_PATHS.menuItem
  );

  // Query key for cache operations
  const categoriesQueryKey = ['get', API_PATHS.categories] as const;

  const deleteItemMutation = useMutation({
    mutationFn: async () => {
      if (!selectedStoreId) {
        throw new Error('Store is not selected.');
      }
      await deleteMenuItemApiMutation.mutateAsync({
        params: { path: { storeId: selectedStoreId, id: item.id } },
      });
    },
    onSuccess: () => {
      toast.success(`Item "${item.name}" deleted successfully.`);
      queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
      setIsConfirmDeleteDialogOpen(false);
    },
    onError: (error) => {
      const apiError = error as unknown as { message?: string } | null;
      toast.error('Failed to delete item', {
        description: apiError?.message ?? 'Unknown error',
      });
      setIsConfirmDeleteDialogOpen(false);
    },
  });

  const toggleOutOfStockMutation = useMutation<
    void,
    Error,
    boolean,
    { previousData?: unknown }
  >({
    mutationFn: async (isOutOfStock: boolean) => {
      if (!selectedStoreId) {
        throw new Error('Store is not selected.');
      }
      await patchMenuItemApiMutation.mutateAsync({
        params: { path: { storeId: selectedStoreId, id: item.id } },
        body: { isOutOfStock },
      });
    },
    onMutate: async (isOutOfStock) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: categoriesQueryKey });

      // Snapshot previous value - use full query key with params
      const fullQueryKey = [
        'get',
        API_PATHS.categories,
        { params: { path: { storeId: selectedStoreId } } },
      ];
      const previousData = queryClient.getQueryData(fullQueryKey);

      // Optimistically update
      queryClient.setQueryData(
        fullQueryKey,
        (old: { data?: Category[] } | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((cat) => ({
              ...cat,
              menuItems: (cat.menuItems ?? []).map((i) =>
                i.id === item.id ? { ...i, isOutOfStock } : i
              ),
            })),
          };
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
        const fullQueryKey = [
          'get',
          API_PATHS.categories,
          { params: { path: { storeId: selectedStoreId } } },
        ];
        queryClient.setQueryData(fullQueryKey, context.previousData);
      }
      const apiError = error as unknown as { message?: string } | null;
      toast.error('Failed to update stock status', {
        description: apiError?.message ?? 'Unknown error',
      });
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
    },
  });

  const handleCardClick = () => {
    if (deleteItemMutation.isPending) return;
    onSelect(item);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditMenuItemId(item.id);
  };

  const handleDeleteRequest = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleTranslateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTranslationDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteItemMutation.mutate();
  };

  const handleToggleOutOfStock = (checked: boolean) => {
    toggleOutOfStockMutation.mutate(checked);
  };

  const actionsDisabled = deleteItemMutation.isPending || !selectedStoreId;

  const isOutOfStock = item.isOutOfStock;

  const translationCount = getTranslationCompletionCount(item.translations);
  const showTranslationBadge = hasIncompleteTranslations(item.translations);

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

          {/* Translation Status Badge */}
          {showTranslationBadge && (
            <Badge
              variant="secondary"
              className="absolute bottom-2 left-2"
              aria-label={`${translationCount} out of 4 languages translated`}
            >
              🌐 {translationCount}/4
            </Badge>
          )}

          {/* Actions Menu - Always visible, touch-friendly */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 h-11 w-11 rounded-full shadow-md active:scale-95"
                onClick={(e) => e.stopPropagation()}
                aria-label={`Actions for ${item.name}`}
                disabled={actionsDisabled}
              >
                {deleteItemMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <MoreVertical className="h-5 w-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem
                onClick={handleEditClick}
                disabled={actionsDisabled}
                className="min-h-11"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleTranslateClick}
                disabled={actionsDisabled}
                className="min-h-11"
              >
                <Globe className="mr-2 h-4 w-4" />
                Translate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDeleteRequest}
                disabled={actionsDisabled}
                className="text-destructive focus:text-destructive min-h-11"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

      {selectedStoreId && (
        <TranslationDialog
          open={isTranslationDialogOpen}
          onOpenChange={setIsTranslationDialogOpen}
          item={item}
          storeId={selectedStoreId}
        />
      )}
    </>
  );
}
