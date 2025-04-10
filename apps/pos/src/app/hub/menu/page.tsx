'use client';

import { Plus } from 'lucide-react';
import React from 'react';

import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import { getCategories } from '@/features/menu/services/category.service';
import {
  selectEditMenuItemId,
  useMenuStore,
} from '@/features/menu/store/menu.store';
import { MenuItem } from '@/features/menu/types/menu-item.types';
import { CategoryCard } from '@/features/menu/ui/category-card';
import { CategoryFormDialog } from '@/features/menu/ui/category-form-dialog';
import { ItemModal } from '@/features/menu/ui/item-modal';
import { MenuItemFormDialog } from '@/features/menu/ui/menu-item-form-dialog';
import { Button } from '@repo/ui/components/button';
import { useQuery } from '@tanstack/react-query';

export default function MenuPage() {
  const [itemFormOpen, setItemFormOpen] = React.useState(false);
  const [categoryFormOpen, setCategoryFormOpen] = React.useState(false);

  const selectedStoreId = useAuthStore(selectSelectedStoreId);
  const editMenuItemId = useMenuStore(selectEditMenuItemId);
  const setEditMenuItemId = useMenuStore((state) => state.setEditMenuItemId);

  const [viewItem, setViewItem] = React.useState<MenuItem | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: [
      'categories',
      {
        selectedStoreId,
      },
    ],
    queryFn: () => getCategories(selectedStoreId!),
    enabled: !!selectedStoreId,
  });

  function handleSelectItem(item: MenuItem) {
    setViewItem(item);
  }

  function closeEditMenuItemDialog() {
    setEditMenuItemId(null);
  }

  return (
    <>
      <div className="p-4 space-y-6">
        <nav className="mb-4 text-sm text-gray-500">
          Home &gt; <span className="text-gray-800">Menu</span>
        </nav>

        <div className="flex items-center space-x-2">
          <Button
            variant="default"
            className="flex items-center"
            onClick={() => setItemFormOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" /> Create Menu Item
          </Button>
          <MenuItemFormDialog
            mode="create"
            open={itemFormOpen}
            onOpenChange={setItemFormOpen}
            editItemId={null}
          />

          <CategoryFormDialog
            open={categoryFormOpen}
            onOpenChange={setCategoryFormOpen}
          />
        </div>

        <div className="space-y-4">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onSelectItem={handleSelectItem}
            />
          ))}
        </div>

        {viewItem && (
          <ItemModal item={viewItem} onClose={() => setViewItem(null)} />
        )}
      </div>
      <MenuItemFormDialog
        mode="edit"
        open={editMenuItemId !== null}
        onOpenChange={closeEditMenuItemDialog}
        editItemId={editMenuItemId}
      />
    </>
  );
}
