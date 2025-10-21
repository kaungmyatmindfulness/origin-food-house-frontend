'use client';

import { Loader2, ShoppingBasket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { joinTableSession } from '@/features/session/services/session.service';
import { JoinSessionResponse } from '@/features/session/types/session.types';

interface JoinPageParams {
  id?: string;
}

export default function JoinSessionByTableIdPage({
  params,
}: {
  params: Promise<JoinPageParams>;
}) {
  const router = useRouter();
  const [tableId, setTableId] = useState<string | undefined>();

  useEffect(() => {
    params.then((resolvedParams) => {
      setTableId(resolvedParams.id);
    });
  }, [params]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tableId) {
      console.warn('Table ID not found in URL params.');
      setError('Table ID is missing.');
      setIsLoading(false);

      return;
    }

    const attemptJoinSession = async () => {
      setIsLoading(true);
      setError(null);
      console.log(`Attempting to join session for table: ${tableId}`);

      try {
        const response: JoinSessionResponse = await joinTableSession(tableId);
        console.log('Join session successful:', response);

        const storeSlug = response.storeSlug;
        if (!storeSlug) {
          throw new Error('Store slug not found in join session response.');
        }

        const menuPath = `/restaurants/${storeSlug}/menu`;
        console.log(`Redirecting to menu: ${menuPath}`);
        router.replace(menuPath);
      } catch (err) {
        console.error('Failed to join session:', err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Could not join the session. Please try scanning again.';
        setError(errorMessage);
        toast.error(errorMessage);
        setIsLoading(false);
      }
    };

    attemptJoinSession();
  }, [tableId, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
        {isLoading && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
            <h1 className="mt-4 text-2xl font-semibold text-gray-800">
              Joining Session...
            </h1>
            <p className="text-muted-foreground mt-2">
              Please wait while we connect you to the table.
            </p>
          </>
        )}
        {error && !isLoading && (
          <>
            {/* You might want a more specific error icon */}
            <ShoppingBasket className="mx-auto h-12 w-12 text-red-500" />
            <h1 className="mt-4 text-2xl font-semibold text-gray-800">
              Connection Failed
            </h1>
            <p className="text-destructive mt-2">{error}</p>
            {/* Optionally add a button to retry or go back */}
            {/* <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button> */}
          </>
        )}
        {/* Initial state before useEffect runs (or if ID is missing initially) */}
        {!isLoading && !error && !tableId && (
          <p className="text-muted-foreground">Loading table information...</p>
        )}
      </div>
    </div>
  );
}
