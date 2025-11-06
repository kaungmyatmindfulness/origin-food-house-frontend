import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type StockFilter = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';

interface MenuState {
  editMenuItemId: string | null;
  searchQuery: string;
  categoryFilter: string | null;
  stockFilter: StockFilter;
}

interface MenuActions {
  setEditMenuItemId: (itemId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (categoryId: string | null) => void;
  setStockFilter: (filter: StockFilter) => void;
  clearFilters: () => void;
}

const initialState: MenuState = {
  editMenuItemId: null,
  searchQuery: '',
  categoryFilter: null,
  stockFilter: 'all',
};

export const useMenuStore = create<MenuState & MenuActions>()(
  devtools(
    persist(
      immer((set) => ({
        ...initialState,
        setEditMenuItemId: (itemId) =>
          set((draft) => {
            draft.editMenuItemId = itemId;
          }),
        setSearchQuery: (query) =>
          set((draft) => {
            draft.searchQuery = query;
          }),
        setCategoryFilter: (categoryId) =>
          set((draft) => {
            draft.categoryFilter = categoryId;
          }),
        setStockFilter: (filter) =>
          set((draft) => {
            draft.stockFilter = filter;
          }),
        clearFilters: () =>
          set((draft) => {
            draft.searchQuery = '';
            draft.categoryFilter = null;
            draft.stockFilter = 'all';
          }),
      })),
      {
        name: 'menu-filters-storage',
        partialize: (state) => ({
          searchQuery: state.searchQuery,
          categoryFilter: state.categoryFilter,
          stockFilter: state.stockFilter,
        }),
      }
    ),
    {
      name: 'menu-ui-store',
    }
  )
);

// Selectors
export const selectEditMenuItemId = (state: MenuState & MenuActions) =>
  state.editMenuItemId;
export const selectSearchQuery = (state: MenuState & MenuActions) =>
  state.searchQuery;
export const selectCategoryFilter = (state: MenuState & MenuActions) =>
  state.categoryFilter;
export const selectStockFilter = (state: MenuState & MenuActions) =>
  state.stockFilter;
