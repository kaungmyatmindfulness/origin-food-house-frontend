'use client';

import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@repo/ui/lib/toast';
import { useTranslations } from 'next-intl';

import { $api } from '@/utils/apiFetch';
import { API_PATHS } from '@/utils/api-paths';
import {
  useTableSaleCartStore,
  selectTableSaleItems,
  selectTableSaleSessionId,
  selectTableSaleActiveOrderId,
} from '@/features/sales/store/table-sale-cart.store';
import { salesKeys } from '@/features/sales/queries/sales.keys';

import type { TableSaleCartItem } from '@/features/sales/store/table-sale-cart.store';

interface UseTableSaleCartOptions {
  storeId: string;
}

interface CreateOrderParams {
  orderType?: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
}

interface UseTableSaleCartReturn {
  /** Cart items from local store */
  items: TableSaleCartItem[];
  /** Add item to local cart */
  addItem: (item: Omit<TableSaleCartItem, 'localId' | 'addedAt'>) => void;
  /** Update quantity in local cart */
  updateQuantity: (localId: string, quantity: number) => void;
  /** Remove item from local cart */
  removeItem: (localId: string) => void;
  /** Clear local cart */
  clearCart: () => void;
  /** Set active table and session */
  setTable: (tableId: string | null, sessionId?: string | null) => void;
  /** Set active order ID (when adding to existing order) */
  setActiveOrder: (orderId: string | null) => void;
  /** Create new order from cart items */
  createOrder: (params?: CreateOrderParams) => Promise<void>;
  /** Add items to an existing order */
  addItemsToOrder: () => Promise<void>;
  /** Get cart subtotal */
  getSubtotal: () => number;
  /** Get item count */
  getItemCount: () => number;
  /** Whether we're in "add to order" mode */
  isAddingToOrder: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Active session ID */
  sessionId: string | null;
  /** Active order ID */
  activeOrderId: string | null;
}

/**
 * Custom hook for managing table sale cart operations with local storage.
 *
 * Unlike the server-synced cart (useSalesCart), this hook uses a local cart
 * for instant feedback and creates/updates orders directly on checkout.
 *
 * Flow for new order:
 * 1. Staff selects available table -> starts session
 * 2. Staff adds items to local cart (instant)
 * 3. Staff clicks "Send to Kitchen" -> creates order with all items
 *
 * Flow for adding to existing order:
 * 1. Staff selects occupied table -> loads existing order
 * 2. Staff clicks "Add More Items" -> enters add mode
 * 3. Staff adds items to local cart
 * 4. Staff clicks "Send to Kitchen" -> adds items to existing order
 */
export function useTableSaleCart({
  storeId,
}: UseTableSaleCartOptions): UseTableSaleCartReturn {
  const t = useTranslations('sales');
  const queryClient = useQueryClient();

  // Get state and actions from the store
  const items = useTableSaleCartStore(selectTableSaleItems);
  const sessionId = useTableSaleCartStore(selectTableSaleSessionId);
  const activeOrderId = useTableSaleCartStore(selectTableSaleActiveOrderId);
  const addItem = useTableSaleCartStore((state) => state.addItem);
  const updateQuantity = useTableSaleCartStore((state) => state.updateQuantity);
  const removeItem = useTableSaleCartStore((state) => state.removeItem);
  const clearCart = useTableSaleCartStore((state) => state.clearCart);
  const setTable = useTableSaleCartStore((state) => state.setTable);
  const setActiveOrder = useTableSaleCartStore((state) => state.setActiveOrder);
  const getSubtotal = useTableSaleCartStore((state) => state.getSubtotal);
  const getItemCount = useTableSaleCartStore((state) => state.getItemCount);

  const isAddingToOrder = activeOrderId !== null;

  // Create new order mutation (for table orders with session)
  // Uses the generic /api/v1/orders/checkout endpoint which handles session-based checkout
  const createOrderMutation = $api.useMutation(
    'post',
    API_PATHS.ordersCheckout,
    {
      onSuccess: (response) => {
        const order = response?.data;
        if (order) {
          clearCart();
          // Set the active order so we can view/modify it
          setActiveOrder(order.id);
          // Invalidate relevant queries
          queryClient.invalidateQueries({
            queryKey: salesKeys.session(sessionId ?? ''),
          });
          queryClient.invalidateQueries({
            queryKey: salesKeys.activeOrders(storeId),
          });
          queryClient.invalidateQueries({
            queryKey: ['get', API_PATHS.tablesStates],
          });
          toast.success(t('orderCreated'));
        }
      },
      onError: (error: unknown) => {
        toast.error(t('failedToCheckout'), {
          description: error instanceof Error ? error.message : undefined,
        });
      },
    }
  );

  // Add items to existing order mutation
  const addItemsToOrderMutation = $api.useMutation(
    'post',
    API_PATHS.rmsOrderItems,
    {
      onSuccess: (response) => {
        const order = response?.data;
        if (order) {
          clearCart();
          // Invalidate relevant queries
          if (activeOrderId) {
            queryClient.invalidateQueries({
              queryKey: salesKeys.order(activeOrderId),
            });
          }
          queryClient.invalidateQueries({
            queryKey: salesKeys.activeOrders(storeId),
          });
          toast.success(t('itemsAddedToOrder'));
        }
      },
      onError: (error: unknown) => {
        toast.error(t('failedToAddItemsToOrder'), {
          description: error instanceof Error ? error.message : undefined,
        });
      },
    }
  );

  /**
   * Create a new order from the local cart items
   */
  const createOrder = async (params: CreateOrderParams = {}): Promise<void> => {
    if (!sessionId) {
      toast.error(t('noActiveSession'));
      return;
    }

    if (items.length === 0) {
      toast.error(t('emptyCart'));
      return;
    }

    await createOrderMutation.mutateAsync({
      params: {
        query: { sessionId },
      },
      body: {
        orderType: params.orderType ?? 'DINE_IN',
      },
    });
  };

  /**
   * Add items to an existing order
   */
  const addItemsToOrder = async (): Promise<void> => {
    if (!activeOrderId) {
      toast.error(t('noActiveOrder'));
      return;
    }

    if (items.length === 0) {
      toast.error(t('emptyCart'));
      return;
    }

    // Transform local cart items to API format
    const orderItems = items.map((item) => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      notes: item.notes,
      customizationOptionIds: item.customizations.map((c) => c.optionId),
    }));

    await addItemsToOrderMutation.mutateAsync({
      params: {
        path: { orderId: activeOrderId },
      },
      body: {
        items: orderItems,
      },
    });
  };

  return {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    setTable,
    setActiveOrder,
    createOrder,
    addItemsToOrder,
    getSubtotal,
    getItemCount,
    isAddingToOrder,
    isLoading:
      createOrderMutation.isPending || addItemsToOrderMutation.isPending,
    sessionId,
    activeOrderId,
  };
}
