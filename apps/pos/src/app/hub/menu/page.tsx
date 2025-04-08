'use client';

import React from 'react';
import { MenuItem } from '@/features/menu/types/menu-item.types';
import { CategoryCard } from '@/features/menu/ui/category-card';
import { ItemModal } from '@/features/menu/ui/item-modal';
import { MenuItemFormDialog } from '@/features/menu/ui/menu-item-form-dialog';
import { CategoryFormDialog } from '@/features/menu/ui/category-form-dialog';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/features/menu/services/category.service';
import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';

export default function MenuPage() {
  const [itemFormOpen, setItemFormOpen] = React.useState(false);
  const selectedStoreId = useAuthStore(selectSelectedStoreId);
  const [categoryFormOpen, setCategoryFormOpen] = React.useState(false);

  const [viewItem, setViewItem] = React.useState<MenuItem | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: [
      'categories',
      {
        storeId: selectedStoreId,
      },
    ],
    queryFn: () => getCategories(selectedStoreId!),
    enabled: !!selectedStoreId,
  });

  function handleCreateCategory(data: { name: string }) {
    console.log('Creating category with data:', data);

    setCategoryFormOpen(false);
  }

  function handleEditCategory(categoryId: number) {
    console.log('Editing category:', categoryId);
  }

  function handleDeleteCategory(categoryId: number) {
    console.log('Deleting category:', categoryId);
  }

  function handleSelectItem(item: MenuItem) {
    setViewItem(item);
  }

  return (
    <div className="space-y-6 p-4">
      {/* Simple breadcrumb */}
      <nav className="mb-4 text-sm text-gray-500">
        Home &gt; <span className="text-gray-800">Menu</span>
      </nav>

      {/* Create item & create category buttons */}
      <div className="flex items-center space-x-2">
        <MenuItemFormDialog
          mode="create"
          open={itemFormOpen}
          onOpenChange={setItemFormOpen}
        />
        <CategoryFormDialog
          open={categoryFormOpen}
          onOpenChange={setCategoryFormOpen}
          onSubmit={handleCreateCategory}
        />
      </div>

      {/* Render categories with their items */}
      <div className="space-y-4">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onSelectItem={handleSelectItem}
          />
        ))}
      </div>

      {/* If an item is selected, show the view modal */}
      {viewItem && (
        <ItemModal item={viewItem} onClose={() => setViewItem(null)} />
      )}
    </div>
  );
}
