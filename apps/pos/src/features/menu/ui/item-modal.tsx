'use client';

import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@repo/ui/components/dialog';
import { Button } from '@repo/ui/components/button';
import { ScrollArea } from '@repo/ui/components/scroll-area';

import { getMenuItemById } from '@/features/menu/services/menu-item.service';
import { formatCurrency } from '@/utils/formatting';

interface ItemModalProps {
  id: string | null;

  open: boolean;

  onClose: () => void;
}

export function ItemModal({ id, open, onClose }: ItemModalProps) {
  const {
    data: item,
    isLoading,
    isError,
    error,
    isSuccess,
  } = useQuery({
    queryKey: ['menuItem', id],
    queryFn: async () => {
      return getMenuItemById(id!);
    },

    enabled: open && typeof id === 'number' && id > 0,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const renderModalContent = () => {
    if (isLoading) {
      return (
        <div className="flex min-h-[200px] items-center justify-center text-gray-500">
          <Loader2 className="mr-2 h-8 w-8 animate-spin" />
          <span>Loading item details...</span>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center px-4 text-center text-red-600">
          <AlertCircle className="mb-2 h-8 w-8" />
          <p className="font-semibold">Error Loading Item</p>
          <p className="text-sm">
            {error?.message || 'Could not load item details. Please try again.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="mt-4"
          >
            Close
          </Button>
        </div>
      );
    }

    if (isSuccess && !item) {
      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center px-4 text-center text-gray-500">
          <AlertCircle className="mb-2 h-8 w-8" />
          <p className="font-semibold">Item Not Found</p>
          <p className="text-sm">The requested item could not be found.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="mt-4"
          >
            Close
          </Button>
        </div>
      );
    }

    if (isSuccess && item) {
      return (
        <>
          {item.imageUrl && (
            <div className="-mx-6 -mt-6 mb-4">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-48 w-full rounded-t-lg object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/placeholder-image.svg';
                }}
              />
            </div>
          )}

          <DialogHeader className="mb-3 text-left">
            <DialogTitle id="item-modal-title" className="mb-1 text-xl">
              {item.name}
            </DialogTitle>
            <p className="text-primary dark:text-primary-light text-lg font-medium">
              {formatCurrency(item.basePrice)}
              {item.customizationGroups?.length > 0 && (
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  (base price)
                </span>
              )}
            </p>
          </DialogHeader>

          {item.description && (
            <DialogDescription
              id="item-modal-description"
              className="mb-4 text-left text-sm text-gray-700 dark:text-gray-300"
            >
              {item.description}
            </DialogDescription>
          )}

          {item.customizationGroups && item.customizationGroups.length > 0 && (
            <div className="mt-3 space-y-4 border-t pt-3 dark:border-gray-600">
              <h3 className="text-sm font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                Available Options
              </h3>
              {item.customizationGroups.map((group) => (
                <div key={group.id}>
                  <p className="mb-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                    {group.name}
                  </p>
                  <ul className="list-none space-y-0.5 pl-1">
                    {group.customizationOptions.map((option) => (
                      <li
                        key={option.id}
                        className="flex justify-between text-sm text-gray-600 dark:text-gray-300"
                      >
                        <span>{option.name}</span>

                        {parseFloat(option.additionalPrice) > 0 ? (
                          <span className="ml-2 text-gray-500 dark:text-gray-400">
                            + {formatCurrency(option.additionalPrice)}
                          </span>
                        ) : (
                          <span className="ml-2 text-gray-500 dark:text-gray-400">
                            (Free)
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-md">
        <ScrollArea className="max-h-[80vh] p-6">
          {renderModalContent()}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
