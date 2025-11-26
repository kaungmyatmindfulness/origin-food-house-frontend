'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@repo/ui/lib/toast';
import { useTranslations } from 'next-intl';

import { createManualSession } from '@/features/orders/services/session.service';
import { addToCart } from '@/features/orders/services/order.service';
import { useSalesStore } from '@/features/sales/store/sales.store';
import { salesKeys } from '@/features/sales/queries/sales.keys';

import type { SessionType } from '@/features/sales/types/sales.types';
import type {
  AddToCartDto,
  CartItemCustomizationDto,
} from '@repo/api/generated/types';

interface UseSalesCartOptions {
  storeId: string;
}

interface AddItemParams {
  menuItemId: string;
  quantity: number;
  notes?: string;
  customizations?: CartItemCustomizationDto[];
}

interface UseSalesCartReturn {
  addItem: (params: AddItemParams) => Promise<void>;
  isLoading: boolean;
  activeSessionId: string | null;
}

/**
 * Custom hook for managing cart operations with automatic session creation.
 *
 * When the first item is added and no session exists, a new session is
 * automatically created based on the current session type from the sales store.
 *
 * @param options - Configuration options including storeId
 * @returns Cart operations and state
 */
export function useSalesCart({
  storeId,
}: UseSalesCartOptions): UseSalesCartReturn {
  const t = useTranslations('sales');
  const queryClient = useQueryClient();

  // Get state from sales store
  const activeSessionId = useSalesStore((state) => state.activeSessionId);
  const sessionType = useSalesStore((state) => state.sessionType);
  const setActiveSession = useSalesStore((state) => state.setActiveSession);

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: (type: SessionType) =>
      createManualSession(storeId, { sessionType: type }),
    onSuccess: (session) => {
      setActiveSession(session.id, sessionType);
    },
    onError: (error) => {
      toast.error(t('failedToCreateSession'), {
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({
      sessionId,
      data,
    }: {
      sessionId: string;
      data: AddToCartDto;
    }) => {
      return addToCart(sessionId, data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: salesKeys.cart(variables.sessionId),
      });
      toast.success(t('itemAddedToCart'));
    },
    onError: (error) => {
      toast.error(t('failedToAddItem'), {
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  /**
   * Add item to cart with automatic session creation.
   *
   * If no active session exists, creates a new session first using the
   * current session type from the sales store, then adds the item to cart.
   *
   * @param params - Item details including menuItemId, quantity, notes, and customizations
   */
  const addItem = async (params: AddItemParams): Promise<void> => {
    let sessionId = activeSessionId;

    // Create session if needed
    if (!sessionId) {
      const session = await createSessionMutation.mutateAsync(sessionType);
      sessionId = session.id;
    }

    // Prepare cart data
    const cartData: AddToCartDto = {
      menuItemId: params.menuItemId,
      quantity: params.quantity,
      notes: params.notes,
      customizations: params.customizations,
    };

    // Add to cart
    await addToCartMutation.mutateAsync({ sessionId, data: cartData });
  };

  return {
    addItem,
    isLoading: createSessionMutation.isPending || addToCartMutation.isPending,
    activeSessionId,
  };
}
