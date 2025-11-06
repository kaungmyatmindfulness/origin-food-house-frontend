import { Skeleton } from '@repo/ui/components/skeleton';

import { CategorySkeleton } from './category-skeleton';

export function MenuSkeleton() {
  return (
    <div className="space-y-6">
      <nav className="mb-4">
        <Skeleton className="h-5 w-48" />
      </nav>

      <div className="flex items-center space-x-2">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <CategorySkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
