'use client';

import { motion } from 'framer-motion';
import { Edit, Loader2, MoreVertical, Trash2 } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import { deleteMenuItem } from '@/features/menu/services/menu-item.service';
import { MenuItem } from '@/features/menu/types/menu-item.types';
import { Button } from '@repo/ui/components/button';
import { ConfirmationDialog } from '@repo/ui/components/confirmation-dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/ui/components/popover';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ApiError } from '@/utils/apiFetch';
import { useMenuStore } from '@/features/menu/store/menu.store';

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
        queryKey: ['categories'],
      });
      setIsConfirmDeleteDialogOpen(false);
    },
    onError: (error) => {
      console.error(`Failed to delete item ${item.id}:`, error);

      setIsConfirmDeleteDialogOpen(false);
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

  const actionsDisabled = deleteItemMutation.isPending || !selectedStoreId;

  return (
    <>
      <motion.div
        className="overflow-hidden text-left bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer dark:border-gray-700 dark:bg-gray-800"
        whileHover={{ scale: 1.02, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCardClick}
        layout
      >
        <div className="relative w-full h-32">
          <img
            src={item.imageUrl || '/placeholder-image.svg'}
            alt={item.name}
            className="object-cover w-full h-full"
            loading="lazy"
          />

          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="absolute rounded-full shadow-md top-1 right-1 h-7 w-7 opacity-80 hover:opacity-100"
                onClick={handlePopoverTriggerClick}
                aria-label={`Actions for ${item.name}`}
                disabled={actionsDisabled}
              >
                {deleteItemMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MoreVertical className="w-4 h-4" />
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
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>

                <Button
                  variant="ghost"
                  className="flex w-full items-center justify-start px-2 py-1.5 text-sm font-normal text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/50"
                  onClick={handleDeleteRequest}
                  disabled={actionsDisabled}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="p-3">
          <h3
            className="text-sm font-semibold text-gray-800 truncate dark:text-gray-100"
            title={item.name}
          >
            {item.name}
          </h3>
          {item.description && (
            <p className="mt-1 text-xs text-gray-600 line-clamp-2 dark:text-gray-400">
              {item.description}
            </p>
          )}
          <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {Number(item.basePrice).toFixed(2)} THB
          </p>
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
