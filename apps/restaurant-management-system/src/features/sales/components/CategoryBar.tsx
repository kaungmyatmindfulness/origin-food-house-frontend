'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@repo/ui/components/button';
import { ScrollArea, ScrollBar } from '@repo/ui/components/scroll-area';
import { Skeleton } from '@repo/ui/components/skeleton';

interface CategoryBarProps {
  categories: Array<{ id: string; name: string }>;
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  isLoading?: boolean;
}

export function CategoryBar({
  categories,
  selectedCategoryId,
  onSelectCategory,
  isLoading = false,
}: CategoryBarProps) {
  const t = useTranslations('menu');

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 flex-shrink-0 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        {/* "All" button */}
        <Button
          variant={selectedCategoryId === null ? 'default' : 'outline'}
          size="sm"
          className="flex-shrink-0 rounded-full"
          onClick={() => onSelectCategory(null)}
        >
          {t('allCategories')}
        </Button>

        {/* Category buttons */}
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategoryId === category.id ? 'default' : 'outline'}
            size="sm"
            className="flex-shrink-0 rounded-full"
            onClick={() => onSelectCategory(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
