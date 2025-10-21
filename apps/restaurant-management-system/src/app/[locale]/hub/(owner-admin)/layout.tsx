'use client';

import { useProtected } from '@/features/auth/hooks/useProtected';

export default function OwnerAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isFinished, isLoading } = useProtected({
    allowedRoles: ['OWNER', 'ADMIN'],
  });

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isFinished) {
    return null;
  }

  return <div>{children}</div>;
}
