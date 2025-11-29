'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';

import { Input } from '@repo/ui/components/input';
import { Skeleton } from '@repo/ui/components/skeleton';

import { CategoryBar } from './CategoryBar';
import { SalesMenuItemCard } from './SalesMenuItemCard';

import { $api } from '@/utils/apiFetch';
import { API_PATHS } from '@/utils/api-paths';
import { useSalesStore } from '@/features/sales/store/sales.store';

import type { MenuItemResponseDto } from '@repo/api/generated/types';

interface MenuPanelProps {
  storeId: string;
  onAddToCart: (item: MenuItemResponseDto) => void;
}

function ItemsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function MenuPanel({ storeId, onAddToCart }: MenuPanelProps) {
  const t = useTranslations('sales');

  // Sales store state
  const selectedCategoryId = useSalesStore((state) => state.selectedCategoryId);
  const setSelectedCategory = useSalesStore(
    (state) => state.setSelectedCategory
  );
  const searchQuery = useSalesStore((state) => state.searchQuery);
  const setSearchQuery = useSalesStore((state) => state.setSearchQuery);

  // Fetch categories using $api.useQuery
  const { data: categoriesResponse, isLoading: categoriesLoading } =
    $api.useQuery(
      'get',
      API_PATHS.categories,
      { params: { path: { storeId } } },
      { staleTime: 5 * 60 * 1000 } // 5 minutes
    );
  const categories = categoriesResponse?.data ?? [];

  // Fetch menu items using $api.useQuery
  const { data: menuItemsResponse, isLoading: itemsLoading } = $api.useQuery(
    'get',
    API_PATHS.menuItems,
    { params: { path: { storeId } } },
    { staleTime: 2 * 60 * 1000 } // 2 minutes
  );

  // Filter items by category and search
  // MenuItemResponseDto from our corrected types has proper nullable string types
  const filteredItems = useMemo(() => {
    const menuItems = menuItemsResponse?.data ?? [];
    if (!menuItems.length) return [];

    return menuItems.filter((item) => {
      // Don't show hidden items
      if (item.isHidden) {
        return false;
      }

      // Category filter - MenuItemResponseDto has category.id
      if (selectedCategoryId && item.category?.id !== selectedCategoryId) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = item.name.toLowerCase().includes(query);
        const descMatch =
          item.description?.toLowerCase().includes(query) ?? false;
        if (!nameMatch && !descMatch) {
          return false;
        }
      }

      return true;
    });
  }, [menuItemsResponse?.data, selectedCategoryId, searchQuery]);

  return (
    <div className="flex h-full flex-col space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category filter bar */}
      <CategoryBar
        categories={categories ?? []}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategory}
        isLoading={categoriesLoading}
      />

      {/* Menu items grid */}
      <div className="flex-1 overflow-y-auto">
        {itemsLoading ? (
          <ItemsLoadingSkeleton />
        ) : filteredItems.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <p className="text-muted-foreground text-lg">
              {searchQuery ? t('noSearchResults') : t('noItemsInCategory')}
            </p>
            {searchQuery && (
              <p className="text-muted-foreground mt-2 text-sm">
                {t('tryDifferentSearch')}
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredItems.map((item) => (
              <SalesMenuItemCard
                key={item.id}
                item={item}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
