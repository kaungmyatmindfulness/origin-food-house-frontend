'use client';

import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { ShoppingCart } from 'lucide-react';
import { toast } from '@repo/ui/lib/toast';

import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import { Skeleton } from '@repo/ui/components/skeleton';

import { CartItem } from './CartItem';
import { CartTotals } from './CartTotals';

import { $api } from '@/utils/apiFetch';
import { salesKeys } from '@/features/sales/queries/sales.keys';

interface CartPanelProps {
  sessionId: string | null;
  onCheckout: () => void;
}

export function CartPanel({ sessionId, onCheckout }: CartPanelProps) {
  const t = useTranslations('sales');
  const queryClient = useQueryClient();

  // Fetch cart data using $api React Query hook
  const {
    data: cartResponse,
    isLoading,
    error,
  } = $api.useQuery(
    'get',
    '/cart',
    { params: { query: { sessionId: sessionId ?? '' } } },
    {
      enabled: !!sessionId,
      staleTime: 30 * 1000, // 30 seconds
    }
  );

  // Extract cart data from wrapped response
  const cart = cartResponse?.data ?? null;

  // Remove item mutation
  const removeItemMutation = $api.useMutation(
    'delete',
    '/cart/items/{cartItemId}',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: salesKeys.cart(sessionId!) });
        toast.success(t('itemRemoved'));
      },
      onError: (err: unknown) => {
        toast.error(t('failedToRemoveItem'), {
          description: err instanceof Error ? err.message : undefined,
        });
      },
    }
  );

  // Update quantity mutation
  const updateQuantityMutation = $api.useMutation(
    'patch',
    '/cart/items/{cartItemId}',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: salesKeys.cart(sessionId!) });
      },
      onError: (err: unknown) => {
        toast.error(t('failedToUpdateItem'), {
          description: err instanceof Error ? err.message : undefined,
        });
      },
    }
  );

  // Handle quantity update
  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeItemMutation.mutate({
        params: {
          path: { cartItemId: itemId },
          query: { sessionId: sessionId! },
        },
      });
    } else {
      updateQuantityMutation.mutate({
        params: {
          path: { cartItemId: itemId },
          query: { sessionId: sessionId! },
        },
        body: { quantity },
      });
    }
  };

  // Handle remove
  const handleRemove = (itemId: string) => {
    removeItemMutation.mutate({
      params: {
        path: { cartItemId: itemId },
        query: { sessionId: sessionId! },
      },
    });
  };

  // Calculate totals
  const subtotal = cart ? Number(cart.subTotal) : 0;
  const itemCount = cart?.items?.length ?? 0;

  const isMutating =
    removeItemMutation.isPending || updateQuantityMutation.isPending;

  // Empty state (no session)
  if (!sessionId) {
    return (
      <Card className="flex h-full flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShoppingCart className="h-5 w-5" />
            {t('cart')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <ShoppingCart className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground">{t('emptyCart')}</p>
            <p className="text-muted-foreground mt-2 text-sm">
              {t('addItemsToStart')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className="flex h-full flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShoppingCart className="h-5 w-5" />
            {t('cart')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="flex h-full flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShoppingCart className="h-5 w-5" />
            {t('cart')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center">
          <p className="text-destructive">{t('failedToLoadCart')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {t('cart')}
          </span>
          {itemCount > 0 && (
            <span className="text-muted-foreground text-sm font-normal">
              {itemCount} {itemCount === 1 ? t('item') : t('items')}
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
        {/* Cart items list */}
        {itemCount === 0 ? (
          <div className="flex flex-1 items-center justify-center px-6">
            <div className="text-center">
              <p className="text-muted-foreground">{t('emptyCart')}</p>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 px-6">
            <div className="py-2">
              {cart?.items?.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemove}
                  disabled={isMutating}
                />
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Footer with totals and checkout */}
        <div className="border-border space-y-4 border-t p-6">
          <CartTotals subtotal={subtotal} />

          <Button
            className="w-full"
            size="lg"
            onClick={onCheckout}
            disabled={itemCount === 0}
          >
            {t('checkout')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
