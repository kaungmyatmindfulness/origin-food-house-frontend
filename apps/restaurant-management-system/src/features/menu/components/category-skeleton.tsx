import { Skeleton } from '@repo/ui/components/skeleton';

import { ItemCardSkeleton } from './item-card-skeleton';

export function CategorySkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded" />
          <Skeleton className="h-10 w-10 rounded" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <ItemCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
