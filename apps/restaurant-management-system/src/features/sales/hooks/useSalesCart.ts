'use client';

import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@repo/ui/lib/toast';
import { useTranslations } from 'next-intl';

import { $api } from '@/utils/apiFetch';
import { API_PATHS } from '@/utils/api-paths';
import { useSalesStore } from '@/features/sales/store/sales.store';
import { salesKeys } from '@/features/sales/queries/sales.keys';

import type {
  AddToCartDto,
  CartItemCustomizationDto,
  CreateManualSessionDto,
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

  // Create session mutation using RMS-specific endpoint
  // POST /api/v1/rms/sessions creates manual sessions for walk-ins/counter orders
  const createSessionMutation = $api.useMutation(
    'post',
    API_PATHS.rmsSessions,
    {
      onSuccess: (response) => {
        const session = response.data;
        if (session) {
          setActiveSession(session.id, sessionType);
        }
      },
      onError: () => {
        toast.error(t('failedToCreateSession'));
      },
    }
  );

  // Add to cart mutation using RMS-specific endpoint (JWT authenticated)
  const addToCartMutation = $api.useMutation('post', API_PATHS.cartItems, {
    onSuccess: (_data, variables) => {
      const sessionId = variables.params?.query?.sessionId;
      if (sessionId) {
        queryClient.invalidateQueries({
          queryKey: salesKeys.cart(sessionId),
        });
      }
      toast.success(t('itemAddedToCart'));
    },
    onError: () => {
      toast.error(t('failedToAddItem'));
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
      const sessionData: CreateManualSessionDto = { sessionType };
      const response = await createSessionMutation.mutateAsync({
        params: { query: { storeId } },
        body: sessionData,
      });
      sessionId = response.data?.id ?? null;
    }

    if (!sessionId) {
      throw new Error('Failed to create session');
    }

    // Prepare cart data
    const cartData: AddToCartDto = {
      menuItemId: params.menuItemId,
      quantity: params.quantity,
      notes: params.notes,
      customizations: params.customizations,
    };

    // Add to cart
    await addToCartMutation.mutateAsync({
      params: { query: { sessionId } },
      body: cartData,
    });
  };

  return {
    addItem,
    isLoading: createSessionMutation.isPending || addToCartMutation.isPending,
    activeSessionId,
  };
}
