'use client';

import { useTranslations } from 'next-intl';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';

import type { Category } from '@/features/menu/types/category.types';
import type { StockFilter } from '@/features/menu/store/menu.store';

interface MenuFiltersProps {
  categories: Category[];
  categoryFilter: string | null;
  stockFilter: StockFilter;
  onCategoryChange: (value: string) => void;
  onStockChange: (value: StockFilter) => void;
}

export function MenuFilters({
  categories,
  categoryFilter,
  stockFilter,
  onCategoryChange,
  onStockChange,
}: MenuFiltersProps) {
  const t = useTranslations('menu');

  return (
    <>
      <Select
        value={categoryFilter ?? 'all'}
        onValueChange={(value) =>
          onCategoryChange(value === 'all' ? '' : value)
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t('allCategories')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('allCategories')}</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={stockFilter}
        onValueChange={(value) => onStockChange(value as StockFilter)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t('stockStatus')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('allItems')}</SelectItem>
          <SelectItem value="in-stock">{t('inStock')}</SelectItem>
          <SelectItem value="low-stock">{t('lowStock')}</SelectItem>
          <SelectItem value="out-of-stock">{t('outOfStock')}</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
}
