import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import type { SalesPanel, SalesView, SessionType } from '../types/sales.types';

// Re-export types for convenience
export type { SalesPanel, SalesView, SessionType } from '../types/sales.types';

interface SalesState {
  // View mode
  activeView: SalesView;

  // Session state (auto-created when first item added)
  activeSessionId: string | null;
  sessionType: SessionType;
  selectedTableId: string | null;

  // Menu filters
  selectedCategoryId: string | null;
  searchQuery: string;

  // Panel state
  activePanel: SalesPanel;

  // Current order after checkout
  currentOrderId: string | null;
}

interface SalesActions {
  // View
  setActiveView: (view: SalesView) => void;

  // Session
  setActiveSession: (
    sessionId: string | null,
    sessionType?: SessionType
  ) => void;
  setSelectedTable: (tableId: string | null) => void;
  clearSession: () => void;

  // Filters
  setSelectedCategory: (categoryId: string | null) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;

  // Panel
  setActivePanel: (panel: SalesPanel) => void;

  // Order
  setCurrentOrder: (orderId: string | null) => void;

  // Reset all
  resetSalesState: () => void;
}

const initialState: SalesState = {
  activeView: 'quick-sale',
  activeSessionId: null,
  sessionType: 'COUNTER',
  selectedTableId: null,
  selectedCategoryId: null,
  searchQuery: '',
  activePanel: 'cart',
  currentOrderId: null,
};

export const useSalesStore = create<SalesState & SalesActions>()(
  devtools(
    persist(
      immer((set) => ({
        ...initialState,

        // View
        setActiveView: (view) =>
          set((draft) => {
            draft.activeView = view;
          }),

        // Session
        setActiveSession: (sessionId, sessionType) =>
          set((draft) => {
            draft.activeSessionId = sessionId;
            if (sessionType !== undefined) {
              draft.sessionType = sessionType;
            }
          }),

        setSelectedTable: (tableId) =>
          set((draft) => {
            draft.selectedTableId = tableId;
            if (tableId !== null) {
              draft.sessionType = 'TABLE';
            }
          }),

        clearSession: () =>
          set((draft) => {
            draft.activeSessionId = null;
            draft.sessionType = 'COUNTER';
            draft.selectedTableId = null;
            draft.activePanel = 'cart';
            draft.currentOrderId = null;
          }),

        // Filters
        setSelectedCategory: (categoryId) =>
          set((draft) => {
            draft.selectedCategoryId = categoryId;
          }),

        setSearchQuery: (query) =>
          set((draft) => {
            draft.searchQuery = query;
          }),

        clearFilters: () =>
          set((draft) => {
            draft.selectedCategoryId = null;
            draft.searchQuery = '';
          }),

        // Panel
        setActivePanel: (panel) =>
          set((draft) => {
            draft.activePanel = panel;
          }),

        // Order
        setCurrentOrder: (orderId) =>
          set((draft) => {
            draft.currentOrderId = orderId;
          }),

        // Reset all
        resetSalesState: () => set(() => initialState),
      })),
      {
        name: 'sales-storage',
        partialize: (state) => ({
          activeView: state.activeView,
          activeSessionId: state.activeSessionId,
          sessionType: state.sessionType,
          selectedTableId: state.selectedTableId,
        }),
      }
    ),
    {
      name: 'sales-store',
    }
  )
);

// Selectors
export const selectActiveView = (state: SalesState & SalesActions) =>
  state.activeView;

export const selectActiveSessionId = (state: SalesState & SalesActions) =>
  state.activeSessionId;

export const selectSessionType = (state: SalesState & SalesActions) =>
  state.sessionType;

export const selectSelectedTableId = (state: SalesState & SalesActions) =>
  state.selectedTableId;

export const selectSelectedCategoryId = (state: SalesState & SalesActions) =>
  state.selectedCategoryId;

export const selectSearchQuery = (state: SalesState & SalesActions) =>
  state.searchQuery;

export const selectActivePanel = (state: SalesState & SalesActions) =>
  state.activePanel;

export const selectCurrentOrderId = (state: SalesState & SalesActions) =>
  state.currentOrderId;
