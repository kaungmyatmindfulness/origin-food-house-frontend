'use client';

import {
  AlertCircle,
  FolderPlus,
  GripVertical,
  Plus,
  Search as SearchIcon,
  UtensilsCrossed,
} from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import { getCategories } from '@/features/menu/services/category.service';
import {
  selectCategoryFilter,
  selectEditMenuItemId,
  selectSearchQuery,
  selectStockFilter,
  useMenuStore,
  type StockFilter,
} from '@/features/menu/store/menu.store';
import { menuKeys } from '@/features/menu/queries/menu.keys';
import { CategoryCard } from '@/features/menu/components/category-card';
import { CategoryFormDialog } from '@/features/menu/components/category-form-dialog';
import { ItemModal } from '@/features/menu/components/item-modal';
import { MenuItemFormDialog } from '@/features/menu/components/menu-item-form-dialog';
import { MenuFilters } from '@/features/menu/components/menu-filters';
import { MenuSearchBar } from '@/features/menu/components/menu-search-bar';
import { MenuSkeleton } from '@/features/menu/components/menu-skeleton';
import { ReorderMenuDialog } from '@/features/menu/components/reorder-menu-dialog';
import { useDialog } from '@/common/hooks/useDialogState';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import type { MenuItem } from '@/features/menu/types/menu-item.types';
import type { Category } from '@/features/menu/types/category.types';

export default function MenuPage() {
  const t = useTranslations('menu');
  const queryClient = useQueryClient();

  // Dialog states using custom hook
  const [itemFormOpen, setItemFormOpen] = useDialog();
  const [categoryFormOpen, setCategoryFormOpen] = useDialog();
  const [reorderMenuOpen, setReorderMenuOpen] = useDialog();

  // Store state
  const selectedStoreId = useAuthStore(selectSelectedStoreId);
  const editMenuItemId = useMenuStore(selectEditMenuItemId);
  const setEditMenuItemId = useMenuStore((state) => state.setEditMenuItemId);
  const searchQuery: string = useMenuStore(selectSearchQuery);
  const categoryFilter: string | null = useMenuStore(selectCategoryFilter);
  const stockFilter: StockFilter = useMenuStore(selectStockFilter);
  const setSearchQuery = useMenuStore((state) => state.setSearchQuery);
  const setCategoryFilter = useMenuStore((state) => state.setCategoryFilter);
  const setStockFilter = useMenuStore((state) => state.setStockFilter);

  // Local state
  const [viewItemId, setViewItemId] = useState<string | null>(null);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Fetch categories with query key factory
  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: menuKeys.categories(selectedStoreId!),
    queryFn: () => getCategories(selectedStoreId!),
    enabled: !!selectedStoreId,
  });

  // Filtered categories based on search and filters
  const filteredCategories = useMemo(() => {
    let filtered: Category[] = categories;

    // Filter by category
    if (categoryFilter) {
      filtered = filtered.filter((cat) => cat.id === categoryFilter);
    }

    // Filter by search query and stock status
    if (searchQuery || stockFilter !== 'all') {
      filtered = filtered
        .map((cat) => {
          const filteredItems = (cat.menuItems ?? []).filter((item) => {
            // Search filter
            const matchesSearch =
              !searchQuery ||
              item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.description
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase());

            // Stock filter
            const isOutOfStock = item.isOutOfStock;
            const matchesStock =
              stockFilter === 'all' ||
              (stockFilter === 'in-stock' && !isOutOfStock) ||
              (stockFilter === 'out-of-stock' && isOutOfStock);

            return matchesSearch && matchesStock;
          });

          return { ...cat, menuItems: filteredItems };
        })
        .filter((cat) => cat.menuItems.length > 0); // Remove empty categories
    }

    return filtered;
  }, [categories, searchQuery, categoryFilter, stockFilter]);

  // Calculate total items count
  const totalItemsCount = useMemo(() => {
    return filteredCategories.reduce(
      (sum, cat) => sum + (cat.menuItems?.length ?? 0),
      0
    );
  }, [filteredCategories]);

  // Event handlers
  const handleSelectItem = useCallback((item: MenuItem) => {
    setViewItemId(item.id);
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setEditMenuItemId(null);
  }, [setEditMenuItemId]);

  const handleCloseViewModal = useCallback(() => {
    setViewItemId(null);
  }, []);

  const scrollToCategory = useCallback((categoryId: string) => {
    const element = categoryRefs.current[categoryId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  if (isLoading) {
    return <MenuSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <AlertCircle className="text-destructive h-12 w-12" />
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-semibold">Failed to Load Menu</h2>
          <p className="text-muted-foreground">
            {error instanceof Error
              ? error.message
              : 'An error occurred while loading menu items.'}
          </p>
        </div>
        <Button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: menuKeys.all })
          }
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <nav className="text-muted-foreground mb-4 text-sm">
          {t('breadcrumbHome')} &gt;{' '}
          <span className="text-foreground">{t('breadcrumbMenu')}</span>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="default"
            size="default"
            className="flex items-center"
            onClick={() => setItemFormOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> {t('createItem')}
          </Button>

          <Button
            variant="outline"
            size="default"
            className="flex items-center"
            onClick={() => setCategoryFormOpen(true)}
          >
            <FolderPlus className="mr-2 h-4 w-4" /> {t('createCategory')}
          </Button>

          <Button
            variant="outline"
            size="default"
            className="flex items-center"
            onClick={() => setReorderMenuOpen(true)}
          >
            <GripVertical className="mr-2 h-4 w-4" /> {t('reorderMenu')}
          </Button>
        </div>

        {categories.length > 0 && (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-2">
              <MenuSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search menu items..."
              />
              <MenuFilters
                categories={categories}
                categoryFilter={categoryFilter}
                stockFilter={stockFilter}
                onCategoryChange={setCategoryFilter}
                onStockChange={setStockFilter}
              />
            </div>

            {(searchQuery || categoryFilter || stockFilter !== 'all') && (
              <div className="bg-muted/50 flex items-center justify-between rounded-lg border px-4 py-2">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <SearchIcon className="h-4 w-4" />
                  <span>
                    {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}{' '}
                    found
                  </span>
                </div>
                {(searchQuery || categoryFilter || stockFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter(null);
                      setStockFilter('all');
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}

            {!searchQuery &&
              !categoryFilter &&
              stockFilter === 'all' &&
              filteredCategories.length > 1 && (
                <div className="bg-background sticky top-0 z-10 -mx-6 border-b px-6 py-3">
                  <ScrollArea>
                    <div className="flex gap-2">
                      {filteredCategories.map((cat) => (
                        <Button
                          key={cat.id}
                          variant="outline"
                          size="sm"
                          className="flex-shrink-0"
                          onClick={() => scrollToCategory(cat.id)}
                        >
                          {cat.name}
                          <Badge variant="secondary" className="ml-2">
                            {cat.menuItems?.length ?? 0}
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
          </>
        )}

        {categories.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
            <UtensilsCrossed className="text-muted-foreground h-16 w-16" />
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">No Menu Items Yet</h2>
              <p className="text-muted-foreground max-w-md">
                Get started by creating your first menu item. You can organize
                items into categories later.
              </p>
            </div>
            <Button size="lg" onClick={() => setItemFormOpen(true)}>
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Item
            </Button>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
            <SearchIcon className="text-muted-foreground h-16 w-16" />
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">No items found</h2>
              <p className="text-muted-foreground max-w-md">
                Try adjusting your search or filters to find what you&apos;re
                looking for.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter(null);
                setStockFilter('all');
              }}
            >
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCategories.map((cat) => (
              <div
                key={cat.id}
                ref={(el) => {
                  categoryRefs.current[cat.id] = el;
                }}
              >
                <CategoryCard category={cat} onSelectItem={handleSelectItem} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <MenuItemFormDialog
        mode="create"
        open={itemFormOpen}
        onOpenChange={setItemFormOpen}
        editItemId={null}
      />

      <MenuItemFormDialog
        mode="edit"
        open={editMenuItemId !== null}
        onOpenChange={handleCloseEditDialog}
        editItemId={editMenuItemId}
      />

      <CategoryFormDialog
        open={categoryFormOpen}
        onOpenChange={setCategoryFormOpen}
      />

      <ReorderMenuDialog
        open={reorderMenuOpen}
        onOpenChange={setReorderMenuOpen}
      />

      <ItemModal
        id={viewItemId}
        open={viewItemId !== null}
        onClose={handleCloseViewModal}
      />
    </>
  );
}
