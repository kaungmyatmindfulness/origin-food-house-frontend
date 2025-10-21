import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface AuthState {
  selectedStoreId: string | null;
  /** Reflects the last known authentication status based on API responses (esp. 401). */
  isAuthenticated: boolean;
}

interface AuthActions {
  setSelectedStore: (storeId: string | null) => void;
  /** Explicitly sets the authenticated status (e.g., based on API errors). */
  setAuthenticated: (isAuthenticated: boolean) => void;
  /** Clears authentication state. */
  clearAuth: () => void;
}

const initialState: AuthState = {
  selectedStoreId: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    persist(
      immer((set) => ({
        ...initialState,

        setSelectedStore: (storeId) =>
          set((draft) => {
            draft.selectedStoreId = storeId;
          }),

        setAuthenticated: (isAuth) =>
          set((draft) => {
            draft.isAuthenticated = isAuth;

            if (!isAuth) {
              draft.selectedStoreId = null;
            }
          }),

        clearAuth: () =>
          set((draft) => {
            draft.selectedStoreId = null;
            draft.isAuthenticated = false;
          }),
      })),
      {
        name: 'auth-storage',

        partialize: (state) => ({
          selectedStoreId: state.selectedStoreId,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);

export const selectSelectedStoreId = (state: AuthState) =>
  state.selectedStoreId;
export const selectIsAuthenticated = (state: AuthState) =>
  state.isAuthenticated;
