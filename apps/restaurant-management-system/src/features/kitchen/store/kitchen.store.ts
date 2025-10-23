import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import type { Order, OrderStatus } from '../types/kitchen.types';

/**
 * Kitchen State
 * Manages real-time order state for the Kitchen Display System
 */
interface KitchenState {
  orders: Order[];
  selectedOrderId: string | null;
  soundEnabled: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
}

/**
 * Kitchen Actions
 * Actions for managing kitchen state
 */
interface KitchenActions {
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  removeOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  setSelectedOrder: (orderId: string | null) => void;
  toggleSound: () => void;
  toggleAutoRefresh: () => void;
  setRefreshInterval: (interval: number) => void;
  clearOrders: () => void;
}

/**
 * Initial kitchen state
 */
const initialState: KitchenState = {
  orders: [],
  selectedOrderId: null,
  soundEnabled: true,
  autoRefresh: true,
  refreshInterval: 30, // 30 seconds default
};

/**
 * Kitchen Zustand Store
 * Pattern: devtools → persist → immer
 */
export const useKitchenStore = create<KitchenState & KitchenActions>()(
  devtools(
    persist(
      immer((set) => ({
        ...initialState,

        setOrders: (orders) =>
          set((draft) => {
            draft.orders = orders;
          }),

        addOrder: (order) =>
          set((draft) => {
            // Add to beginning for newest first
            const exists = draft.orders.find((o) => o.id === order.id);
            if (!exists) {
              draft.orders.unshift(order);
            }
          }),

        updateOrder: (orderId, updates) =>
          set((draft) => {
            const index = draft.orders.findIndex((o) => o.id === orderId);
            if (index !== -1 && draft.orders[index]) {
              Object.assign(draft.orders[index], updates);
            }
          }),

        removeOrder: (orderId) =>
          set((draft) => {
            draft.orders = draft.orders.filter((o) => o.id !== orderId);
          }),

        updateOrderStatus: (orderId, status) =>
          set((draft) => {
            const order = draft.orders.find((o) => o.id === orderId);
            if (order) {
              order.status = status;
            }
          }),

        setSelectedOrder: (orderId) =>
          set((draft) => {
            draft.selectedOrderId = orderId;
          }),

        toggleSound: () =>
          set((draft) => {
            draft.soundEnabled = !draft.soundEnabled;
          }),

        toggleAutoRefresh: () =>
          set((draft) => {
            draft.autoRefresh = !draft.autoRefresh;
          }),

        setRefreshInterval: (interval) =>
          set((draft) => {
            draft.refreshInterval = interval;
          }),

        clearOrders: () =>
          set((draft) => {
            draft.orders = [];
            draft.selectedOrderId = null;
          }),
      })),
      {
        name: 'kitchen-storage',
        partialize: (state) => ({
          soundEnabled: state.soundEnabled,
          autoRefresh: state.autoRefresh,
          refreshInterval: state.refreshInterval,
          // Don't persist orders - always fetch fresh on load
        }),
      }
    ),
    { name: 'kitchen-store' }
  )
);

// Selectors
export const selectOrders = (state: KitchenState & KitchenActions) =>
  state.orders;

export const selectOrdersByStatus = (
  state: KitchenState & KitchenActions,
  status: OrderStatus
) => state.orders.filter((order) => order.status === status);

export const selectSelectedOrder = (state: KitchenState & KitchenActions) =>
  state.orders.find((order) => order.id === state.selectedOrderId) || null;

export const selectSoundEnabled = (state: KitchenState & KitchenActions) =>
  state.soundEnabled;

export const selectAutoRefresh = (state: KitchenState & KitchenActions) =>
  state.autoRefresh;

export const selectRefreshInterval = (state: KitchenState & KitchenActions) =>
  state.refreshInterval;

export const selectKitchenStats = (state: KitchenState & KitchenActions) => {
  const pending = state.orders.filter((o) => o.status === 'PENDING').length;
  const preparing = state.orders.filter((o) => o.status === 'PREPARING').length;
  const ready = state.orders.filter((o) => o.status === 'READY').length;

  return {
    pending,
    preparing,
    ready,
    totalActive: pending + preparing + ready,
  };
};
