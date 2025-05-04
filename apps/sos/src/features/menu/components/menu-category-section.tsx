import { Element as ScrollElement } from 'react-scroll';

import { Category, MenuItem } from '@/features/menu/types/menu.types';

import { MenuItemCard } from './menu-item-card';

interface MenuCategorySectionProps {
  category: Category;
  currency: string;
  onCustomize: (item: MenuItem) => void;
}

export function MenuCategorySection({
  category,
  currency,
  onCustomize,
}: MenuCategorySectionProps) {
  return (
    <ScrollElement name={category.id} className="scroll-mt-40">
      <div>
        <h2 className="mb-4 text-2xl font-bold" id={`category-${category.id}`}>
          {category.name}
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {category.menuItems?.map((item) => {
            return (
              <MenuItemCard
                key={item.id}
                item={item}
                currency={currency}
                onCustomize={onCustomize}
              />
            );
          })}
        </div>
      </div>
    </ScrollElement>
  );
}
