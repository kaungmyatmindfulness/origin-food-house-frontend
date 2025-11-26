'use client';

import { useProtected } from '@/features/auth/hooks/useProtected';
import { Skeleton } from '@repo/ui/components/skeleton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useProtected({
    allowedRoles: ['PLATFORM_ADMIN'],
    unauthorizedRedirectTo: '/unauthorized',
  });

  if (isLoading) {
    return (
      <div className="container space-y-4 py-8">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return <div className="container py-8">{children}</div>;
}
