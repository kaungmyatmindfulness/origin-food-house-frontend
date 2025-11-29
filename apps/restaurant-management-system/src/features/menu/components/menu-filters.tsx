'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import {
  TypedSelect,
  type TypedSelectOption,
} from '@repo/ui/components/typed-select';

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

  // Stock filter options - typed for StockFilter
  const stockOptions = useMemo<TypedSelectOption<StockFilter>[]>(
    () => [
      { value: 'all', label: t('allItems') },
      { value: 'in-stock', label: t('inStock') },
      { value: 'low-stock', label: t('lowStock') },
      { value: 'out-of-stock', label: t('outOfStock') },
    ],
    [t]
  );

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

      <TypedSelect
        value={stockFilter}
        onValueChange={onStockChange}
        options={stockOptions}
        placeholder={t('stockStatus')}
        triggerClassName="w-[180px]"
      />
    </>
  );
}
