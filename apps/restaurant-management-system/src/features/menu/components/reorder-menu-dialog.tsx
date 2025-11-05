'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Loader2 } from 'lucide-react';
import { toast } from '@repo/ui/lib/toast';
import { cloneDeep, isEmpty } from 'lodash-es';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@repo/ui/components/dialog';
import { Button } from '@repo/ui/components/button';
import { Separator } from '@repo/ui/components/separator';
import { Skeleton } from '@repo/ui/components/skeleton';
import { cn } from '@repo/ui/lib/utils';

import {
  useAuthStore,
  selectSelectedStoreId,
} from '@/features/auth/store/auth.store';
import {
  getCategories,
  sortCategories,
} from '@/features/menu/services/category.service';
import type { ApiError } from '@/utils/apiFetch';
import {
  Category,
  SortCategoriesPayloadDto,
} from '@/features/menu/types/category.types';

interface ReorderMenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type OrderableCategory = Category;

const CATEGORY_PREFIX = 'cat-';
const ITEM_PREFIX = 'item-';

interface SortableItemProps {
  id: UniqueIdentifier;
  children: React.ReactNode;
  isCategory?: boolean;
  isOverlay?: boolean;
}

function SortableItem({
  id,
  children,
  isCategory = false,
  isOverlay = false,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,

    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging || isOverlay ? 10 : undefined,
    boxShadow: isOverlay ? '0 4px 10px rgba(0,0,0,0.2)' : undefined,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isCategory ? 'mb-1' : '')}
    >
      <div
        className={cn(
          'bg-background flex items-center gap-2 rounded-md border p-2',
          isCategory
            ? 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20'
            : 'border-border',
          isOverlay && 'shadow-lg'
        )}
      >
        {/* Drag Handle */}
        <span
          {...attributes}
          {...listeners}
          className="text-muted-foreground hover:text-foreground cursor-grab touch-none p-1"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-5 w-5" />
        </span>
        {/* Content */}
        <div className="flex-grow truncate">{children}</div>
      </div>
    </div>
  );
}

export function ReorderMenuDialog({
  open,
  onOpenChange,
}: ReorderMenuDialogProps) {
  const queryClient = useQueryClient();
  const selectedStoreId = useAuthStore(selectSelectedStoreId);

  const [orderedCategories, setOrderedCategories] = useState<
    OrderableCategory[]
  >([]);

  const {
    data: initialCategories,
    isLoading: isLoadingCategories,
    isError,
    error,
  } = useQuery({
    queryKey: ['categories', { selectedStoreId }],
    queryFn: async () => {
      if (!selectedStoreId) return [];

      return getCategories(selectedStoreId);
    },
    enabled: !!selectedStoreId && open,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (initialCategories) {
      const sorted = initialCategories
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((cat) => ({
          ...cat,
          menuItems: [...(cat.menuItems || [])].sort(
            (a, b) => a.sortOrder - b.sortOrder
          ),
        }));
      setOrderedCategories(sorted);
    }
  }, [initialCategories]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const categoryIds = useMemo(
    () => orderedCategories.map((cat) => `${CATEGORY_PREFIX}${cat.id}`),
    [orderedCategories]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    setOrderedCategories((prevCategories) => {
      const tempCategories = cloneDeep(prevCategories);

      const isDraggingCategory = activeIdStr.startsWith(CATEGORY_PREFIX);
      const isDraggingItem = activeIdStr.startsWith(ITEM_PREFIX);

      if (isDraggingCategory && overIdStr.startsWith(CATEGORY_PREFIX)) {
        const oldIndex = tempCategories.findIndex(
          (cat) => `${CATEGORY_PREFIX}${cat.id}` === activeIdStr
        );
        const newIndex = tempCategories.findIndex(
          (cat) => `${CATEGORY_PREFIX}${cat.id}` === overIdStr
        );
        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(tempCategories, oldIndex, newIndex);
        }
      }

      if (isDraggingItem) {
        const activeCategoryIndex = tempCategories.findIndex((cat) =>
          cat.menuItems?.some(
            (item) => `${ITEM_PREFIX}${item.id}` === activeIdStr
          )
        );

        if (activeCategoryIndex !== -1) {
          const activeCategory = tempCategories[activeCategoryIndex];

          if (activeCategory?.menuItems === undefined) return tempCategories;

          const oldItemIndex = activeCategory.menuItems.findIndex(
            (item) => `${ITEM_PREFIX}${item.id}` === activeIdStr
          );

          const overIsItemInSameCategory =
            overIdStr.startsWith(ITEM_PREFIX) &&
            activeCategory.menuItems.some(
              (item) => `${ITEM_PREFIX}${item.id}` === overIdStr
            );
          const overIsSameCategoryContainer =
            overIdStr === `${CATEGORY_PREFIX}${activeCategory.id}`;

          if (overIsItemInSameCategory || overIsSameCategoryContainer) {
            const newItemIndex = activeCategory.menuItems.findIndex(
              (item) => `${ITEM_PREFIX}${item.id}` === overIdStr
            );

            if (newItemIndex !== -1 && oldItemIndex !== -1) {
              tempCategories[activeCategoryIndex]!.menuItems = arrayMove(
                activeCategory.menuItems,
                oldItemIndex,
                newItemIndex
              );
              return tempCategories;
            }
          }
        }
      }

      return prevCategories;
    });
  };

  const sortMutation = useMutation<
    string | unknown,
    ApiError | Error,
    SortCategoriesPayloadDto
  >({
    mutationFn: async (payload: SortCategoriesPayloadDto) => {
      if (!selectedStoreId) throw new Error('Store not selected');
      return sortCategories(selectedStoreId, payload);
    },
    onSuccess: () => {
      toast.success('Menu order saved successfully!');

      queryClient.invalidateQueries({
        queryKey: ['categories'],
      });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Failed to save menu order:', error);
      toast.error('Failed to save menu order', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedStoreId) return;

    const payload: SortCategoriesPayloadDto = {
      categories: orderedCategories.map((category, catIndex) => ({
        id: category.id,
        sortOrder: catIndex,
        menuItems:
          category.menuItems?.map((item, itemIndex) => ({
            id: item.id,
            sortOrder: itemIndex,
          })) ?? [],
      })),
    };
    sortMutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col p-0 sm:max-w-2xl">
        <DialogHeader className="border-b p-6 pb-4 dark:border-gray-700">
          <DialogTitle className="text-xl">Re-order Menu</DialogTitle>
          <DialogDescription>
            Drag and drop categories or items within a category to change their
            display order. Changes are saved only when you click &quot;Save
            Order&quot;.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto p-6">
          {isLoadingCategories ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : isError ? (
            <div className="text-destructive py-10 text-center">
              Error loading categories: {error?.message || 'Unknown error'}
            </div>
          ) : orderedCategories.length === 0 ? (
            <div className="text-muted-foreground py-10 text-center">
              No categories available to reorder.
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={categoryIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {orderedCategories.map((category) => (
                    <SortableItem
                      key={`${CATEGORY_PREFIX}${category.id}`}
                      id={`${CATEGORY_PREFIX}${category.id}`}
                      isCategory
                    >
                      {/* Category Name Display */}
                      <span className="font-medium text-blue-800 dark:text-blue-300">
                        {category.name}
                      </span>
                    </SortableItem>
                  ))}
                </div>

                {/* Render nested items - Simpler approach: Keep items visually nested but handle drag logic based on IDs */}
                {/* This setup primarily supports reordering categories and items *within* their category */}
                <Separator className="my-4" />
                <div className="space-y-4">
                  {orderedCategories.map((category) => (
                    <div
                      key={`cat-section-${category.id}`}
                      className="bg-background rounded-lg border p-3 dark:border-gray-700"
                    >
                      <h3 className="text-muted-foreground mb-2 text-sm font-semibold">
                        {category.name} Items
                      </h3>
                      {isEmpty(category.menuItems) ? (
                        <p className="text-muted-foreground text-xs italic">
                          No items in this category.
                        </p>
                      ) : (
                        <SortableContext
                          items={(category.menuItems || []).map(
                            (item) => `${ITEM_PREFIX}${item.id}`
                          )}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-1 pl-4">
                            {/* Indent items */}
                            {(category.menuItems || []).map((item) => (
                              <SortableItem
                                key={`${ITEM_PREFIX}${item.id}`}
                                id={`${ITEM_PREFIX}${item.id}`}
                              >
                                {/* Item Name Display */}
                                <span>{item.name}</span>
                              </SortableItem>
                            ))}
                          </div>
                        </SortableContext>
                      )}
                    </div>
                  ))}
                </div>
              </SortableContext>

              {/* Drag Overlay: Renders a copy of the item being dragged */}
            </DndContext>
          )}
        </div>

        <DialogFooter className="border-t p-4 dark:border-gray-700">
          <DialogClose asChild>
            <Button variant="outline" disabled={sortMutation.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={
              isLoadingCategories ||
              sortMutation.isPending ||
              orderedCategories.length === 0
            }
          >
            {sortMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
