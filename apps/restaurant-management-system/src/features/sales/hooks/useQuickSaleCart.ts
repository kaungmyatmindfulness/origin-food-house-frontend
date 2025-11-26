'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from '@repo/ui/lib/toast';
import { useTranslations } from 'next-intl';

import {
  useQuickSaleCartStore,
  type DraftCartItem,
  type DraftCartCustomization,
} from '../store/quick-sale-cart.store';
import { useSalesStore } from '../store/sales.store';
import { quickSaleCheckout } from '../services/quick-sale-checkout.service';

import type { SessionType } from '../types/sales.types';

interface UseQuickSaleCartOptions {
  storeId: string;
  onCheckoutSuccess?: (orderId: string, orderNumber: string) => void;
  onCheckoutError?: (error: Error) => void;
}

interface AddItemParams {
  menuItemId: string;
  menuItemName: string;
  menuItemImage?: string;
  basePrice: number;
  quantity: number;
  customizations?: DraftCartCustomization[];
  notes?: string;
}

/**
 * Hook for managing quick sale cart operations with localStorage
 *
 * This hook provides:
 * - Local cart state management (instant UI updates)
 * - Session type selection
 * - Customer info capture
 * - Checkout that syncs to backend and creates order
 */
export function useQuickSaleCart(options: UseQuickSaleCartOptions) {
  const { storeId, onCheckoutSuccess, onCheckoutError } = options;
  const t = useTranslations('sales');

  // Local cart state
  const items = useQuickSaleCartStore((state) => state.items);
  const sessionType = useQuickSaleCartStore((state) => state.sessionType);
  const customerName = useQuickSaleCartStore((state) => state.customerName);
  const customerPhone = useQuickSaleCartStore((state) => state.customerPhone);
  const orderNotes = useQuickSaleCartStore((state) => state.orderNotes);
  const addItem = useQuickSaleCartStore((state) => state.addItem);
  const updateQuantity = useQuickSaleCartStore((state) => state.updateQuantity);
  const updateNotes = useQuickSaleCartStore((state) => state.updateNotes);
  const removeItem = useQuickSaleCartStore((state) => state.removeItem);
  const setSessionType = useQuickSaleCartStore((state) => state.setSessionType);
  const setCustomerInfo = useQuickSaleCartStore(
    (state) => state.setCustomerInfo
  );
  const setOrderNotes = useQuickSaleCartStore((state) => state.setOrderNotes);
  const clearCart = useQuickSaleCartStore((state) => state.clearCart);
  const getSubtotal = useQuickSaleCartStore((state) => state.getSubtotal);
  const getItemCount = useQuickSaleCartStore((state) => state.getItemCount);

  // Sales store for panel management
  const setActivePanel = useSalesStore((state) => state.setActivePanel);
  const setCurrentOrder = useSalesStore((state) => state.setCurrentOrder);
  const setActiveSession = useSalesStore((state) => state.setActiveSession);

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (items.length === 0) {
        throw new Error('Cart is empty');
      }

      return quickSaleCheckout({
        storeId,
        sessionType,
        items,
        customerName,
        customerPhone,
        orderNotes,
      });
    },
    onSuccess: (result) => {
      // Update sales store
      setActiveSession(result.sessionId, sessionType as SessionType);
      setCurrentOrder(result.orderId);
      setActivePanel('payment');

      // Clear local cart
      clearCart();

      // Notify success
      toast.success(t('orderCreated'), {
        description: `${t('orderNumber')}: ${result.orderNumber}`,
      });

      onCheckoutSuccess?.(result.orderId, result.orderNumber);
    },
    onError: (error: Error) => {
      toast.error(t('failedToCheckout'), {
        description: error.message,
      });
      onCheckoutError?.(error);
    },
  });

  /**
   * Add item to local cart
   */
  const handleAddItem = (params: AddItemParams) => {
    const item: Omit<DraftCartItem, 'localId' | 'addedAt'> = {
      menuItemId: params.menuItemId,
      menuItemName: params.menuItemName,
      menuItemImage: params.menuItemImage,
      basePrice: params.basePrice,
      quantity: params.quantity,
      customizations: params.customizations ?? [],
      notes: params.notes,
    };

    addItem(item);
    toast.success(t('itemAddedToCart'));
  };

  /**
   * Update item quantity
   */
  const handleUpdateQuantity = (localId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(localId);
      toast.success(t('itemRemoved'));
    } else {
      updateQuantity(localId, quantity);
    }
  };

  /**
   * Remove item from cart
   */
  const handleRemoveItem = (localId: string) => {
    removeItem(localId);
    toast.success(t('itemRemoved'));
  };

  return {
    // State
    items,
    sessionType,
    customerName,
    customerPhone,
    orderNotes,
    subtotal: getSubtotal(),
    itemCount: getItemCount(),
    isEmpty: items.length === 0,

    // Item actions
    addItem: handleAddItem,
    updateQuantity: handleUpdateQuantity,
    updateNotes,
    removeItem: handleRemoveItem,

    // Session/order actions
    setSessionType,
    setCustomerInfo,
    setOrderNotes,
    clearCart,

    // Checkout
    checkout: checkoutMutation.mutate,
    isCheckingOut: checkoutMutation.isPending,
    checkoutError: checkoutMutation.error,
  };
}

export type { AddItemParams, DraftCartCustomization };
