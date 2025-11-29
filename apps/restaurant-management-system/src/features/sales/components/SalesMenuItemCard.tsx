'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { getImageUrl } from '@repo/api/utils/s3-url';
import { Badge } from '@repo/ui/components/badge';
import { Card, CardContent } from '@repo/ui/components/card';
import { cn } from '@repo/ui/lib/utils';

import { formatCurrency } from '@/utils/formatting';

import type { MenuItemResponseDto } from '@repo/api/generated/types';

interface SalesMenuItemCardProps {
  item: MenuItemResponseDto;
  onAddToCart: (item: MenuItemResponseDto) => void;
  disabled?: boolean;
}

export function SalesMenuItemCard({
  item,
  onAddToCart,
  disabled = false,
}: SalesMenuItemCardProps) {
  const t = useTranslations('sales');

  const isOutOfStock = item.isOutOfStock ?? false;
  const isDisabled = disabled || isOutOfStock;

  const handleClick = () => {
    if (!isDisabled) {
      onAddToCart(item);
    }
  };

  return (
    <Card
      className={cn(
        'group cursor-pointer overflow-hidden transition-all hover:shadow-md',
        isDisabled && 'cursor-not-allowed opacity-60'
      )}
      onClick={handleClick}
    >
      {/* Image section */}
      <div className="relative h-32 w-full">
        {getImageUrl(item.imagePath, 'medium') ? (
          <Image
            src={getImageUrl(item.imagePath, 'medium')!}
            alt={item.name}
            fill
            className="border-b object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="bg-muted flex h-full w-full items-center justify-center border-b">
            <span className="text-muted-foreground text-sm">
              {t('noImage')}
            </span>
          </div>
        )}

        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 bg-yellow-500 text-yellow-900 hover:bg-yellow-500"
          >
            {t('outOfStock')}
          </Badge>
        )}
      </div>

      {/* Content section */}
      <CardContent className="p-3">
        <h3
          className="text-foreground truncate font-semibold"
          title={item.name}
        >
          {item.name}
        </h3>
        {item.description && (
          <p className="text-muted-foreground mt-1 line-clamp-1 text-xs">
            {item.description}
          </p>
        )}
        <p className="text-primary mt-2 text-lg font-bold">
          {formatCurrency(Number(item.basePrice))}
        </p>
      </CardContent>
    </Card>
  );
}
