import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  selectedStoreId: number | null;
  isAuthenticated: boolean;
  setAuth: (token: string) => void;
  setSelectedStore: (storeId: number | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        accessToken: null,
        user: null,
        selectedStoreId: null,
        isAuthenticated: false,

        setAuth: (token) =>
          set(
            (state) => {
              if (state.accessToken === token) return {};
              return {
                accessToken: token,
                isAuthenticated: !!token,
              };
            },
            false,
            'setAuth'
          ),

        setSelectedStore: (storeId) =>
          set(
            () => ({
              selectedStoreId: storeId,
            }),
            false,
            'setSelectedStore'
          ),

        clearAuth: () =>
          set(
            () => ({
              accessToken: null,
              selectedStoreId: null,
              isAuthenticated: false,
            }),
            false,
            'clearAuth'
          ),
      }),
      {
        name: 'auth-storage',
      }
    )
  )
);

export const selectIsAuthenticated = (state: AuthState) =>
  state.isAuthenticated;
export const selectSelectedStoreId = (state: AuthState) =>
  state.selectedStoreId;
export const selectAccessToken = (state: AuthState) => state.accessToken;
