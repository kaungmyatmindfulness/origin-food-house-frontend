'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth0 } from '@auth0/auth0-react';

export default function CallbackPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, error } = useAuth0();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else if (error) {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, error, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Authentication failed</p>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2" />
        <p className="text-muted-foreground">Authenticating...</p>
      </div>
    </div>
  );
}
