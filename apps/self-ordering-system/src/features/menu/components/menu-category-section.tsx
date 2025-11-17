import { Element as ScrollElement } from 'react-scroll';
import { useParams } from 'next/navigation';

import {
  Category,
  MenuItem,
  SupportedLocale,
} from '@/features/menu/types/menu.types';
import { getTranslatedName } from '@/features/menu/utils/translation.util';

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
  const params = useParams();
  const locale = params.locale as SupportedLocale;

  // Get localized category name
  const displayName = getTranslatedName(
    category.name,
    category.translations,
    locale
  );

  return (
    <ScrollElement name={category.id} className="scroll-mt-40">
      <div>
        <h2 className="mb-4 text-2xl font-bold" id={`category-${category.id}`}>
          {displayName}
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
